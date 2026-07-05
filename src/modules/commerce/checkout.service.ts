import { OrderStatus, PaymentStatus, ShippingStatus } from '@prisma/client';
import { AppError } from '../../lib/app-error.js';
import {
  buildLineLabel,
  roundMoney,
  toPublicOrderDto,
} from '../../lib/order.mapper.js';
import {
  isOnlinePaymentMethod,
  resolvePaymentStatusForMethod,
  toPublicPaymentMethodDto,
} from '../../lib/payment.mapper.js';
import { prisma } from '../../lib/prisma.js';
import { initiateOnlinePayment } from '../payment/payment-provider.service.js';
import { validatePaymentMethodForCheckout } from '../payment/payment-method.service.js';
import type {
  BankTransferPublicConfig,
  CashOnDeliveryConfig,
  CheckoutResultDto,
  ExternalLinkConfig,
} from '../../types/api.js';
import {
  buildFulfillmentMessages,
  collectDeliveryModes,
  assertSaasCheckoutAllowed,
} from '../../lib/cart-product-rules.js';
import { getPublicOrderDownloadLinks } from './digitalDelivery.service.js';
import { getPublicOrderSaasMemberships } from '../saas/saas-fulfillment.service.js';
import { getCartRecordBySession } from './cart.service.js';
import type { CheckoutInput } from './checkout.schema.js';
import { sendOrderCreatedEmail, sendBankTransferWaitingEmail, buildBankTransferInfo } from '../mail/mail-order.service.js';
import { validateCartCouponForCheckout } from '../promotion/cart-coupon.service.js';
import {
  maybeNotifyPaymentWaiting,
  notifyNewOrder,
} from '../notifications/notification.service.js';

async function generateOrderNumber(): Promise<string> {
  const datePart = new Date().toISOString().slice(0, 10).replace(/-/g, '');

  for (let attempt = 0; attempt < 10; attempt += 1) {
    const suffix = Math.floor(Math.random() * 9000 + 1000);
    const orderNumber = `W${datePart}-${suffix}`;
    const existing = await prisma.order.findUnique({ where: { orderNumber } });
    if (!existing) return orderNumber;
  }

  throw AppError.internal('Could not generate order number');
}

export async function checkout(
  sessionId: string,
  input: CheckoutInput,
  storeCustomerId?: string | null,
  clientIp?: string,
): Promise<CheckoutResultDto> {
  const paymentMethod = await validatePaymentMethodForCheckout(
    input.paymentMethodId,
  );

  const cart = await getCartRecordBySession(sessionId);

  if (cart.items.length === 0) {
    throw AppError.badRequest('Cart is empty');
  }

  const cartWithItems = await prisma.cart.findUnique({
    where: { id: cart.id },
    include: {
      items: {
        include: {
          product: true,
          variant: {
            include: {
              options: { include: { attributeValue: true } },
            },
          },
        },
      },
    },
  });

  if (!cartWithItems || cartWithItems.items.length === 0) {
    throw AppError.badRequest('Cart is empty');
  }

  assertSaasCheckoutAllowed(
    cartWithItems.items.map((item) => item.product),
    storeCustomerId,
  );

  let subtotal = 0;
  let taxTotal = 0;

  const orderItemsData = cartWithItems.items.map((item) => {
    const lineSubtotal = Number(item.unitPrice) * item.quantity;
    const taxRate = item.taxRate !== null ? Number(item.taxRate) : 0;
    const lineTax = lineSubtotal * (taxRate / 100);
    subtotal += lineSubtotal;
    taxTotal += lineTax;

    const nameSnapshot = buildLineLabel(item.product, item.variant);
    const skuSnapshot = item.variant?.sku ?? item.product.sku;

    return {
      productId: item.productId,
      variantId: item.variantId,
      nameSnapshot,
      skuSnapshot,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      taxRate: item.taxRate,
      total: roundMoney(lineSubtotal + lineTax),
    };
  });

  const shippingTotal = 0;
  const couponResult = await validateCartCouponForCheckout(
    cart.id,
    input.customerEmail,
  );
  const discountTotal = couponResult.discountTotal;
  const grandTotal = roundMoney(subtotal + taxTotal + shippingTotal - discountTotal);
  const orderNumber = await generateOrderNumber();
  const paymentStatus = resolvePaymentStatusForMethod(
    paymentMethod.type,
  ) as PaymentStatus;

  const order = await prisma.$transaction(async (tx) => {
    const created = await tx.order.create({
      data: {
        orderNumber,
        customerId: storeCustomerId ?? null,
        status: OrderStatus.PENDING,
        paymentStatus,
        paymentMethodId: paymentMethod.id,
        shippingStatus: ShippingStatus.PENDING,
        subtotal: roundMoney(subtotal),
        taxTotal: roundMoney(taxTotal),
        shippingTotal,
        discountTotal,
        grandTotal,
        customerName: input.customerName,
        customerEmail: input.customerEmail,
        customerPhone: input.customerPhone,
        note: input.note ?? null,
        couponId: couponResult.couponId,
        couponCode: couponResult.couponCode,
        items: {
          create: orderItemsData,
        },
      },
      include: {
        items: true,
        paymentMethod: true,
        shipment: { include: { carrier: true } },
      },
    });

    await tx.cartItem.deleteMany({ where: { cartId: cart.id } });
    await tx.cart.update({
      where: { id: cart.id },
      data: { couponId: null, couponCode: null, discountTotal: 0 },
    });
    return created;
  });

  const publicMethod = toPublicPaymentMethodDto(paymentMethod);
  let redirectUrl: string | null = null;
  let message: string | null = null;

  if (isOnlinePaymentMethod(paymentMethod.type)) {
    const initResult = await initiateOnlinePayment({
      order,
      method: paymentMethod,
      isTestMode: paymentMethod.isTestMode,
      clientIp: clientIp ?? '127.0.0.1',
    });
    redirectUrl = initResult?.redirectUrl ?? null;
    message = initResult?.message ?? null;
  }

  const publicOrder = toPublicOrderDto(order);

  let bankAccounts: CheckoutResultDto['payment']['bankAccounts'];
  let instructions: string | null = null;
  let description: string | null = null;

  switch (paymentMethod.type) {
    case 'BANK_TRANSFER': {
      const config = publicMethod.config as BankTransferPublicConfig;
      bankAccounts = config.accounts;
      instructions = config.instructions ?? null;
      break;
    }
    case 'EXTERNAL_LINK': {
      const config = publicMethod.config as ExternalLinkConfig;
      instructions = config.instructions ?? null;
      break;
    }
    case 'CASH_ON_DELIVERY': {
      const config = publicMethod.config as CashOnDeliveryConfig;
      description = config.description ?? null;
      break;
    }
    default:
      break;
  }

  void sendOrderCreatedEmail(order).catch((error) => {
    console.error('[mail] ORDER_CREATED failed', error);
  });

  if (paymentMethod.type === 'BANK_TRANSFER' && bankAccounts?.length) {
    const bankInfo = buildBankTransferInfo(bankAccounts);
    void sendBankTransferWaitingEmail(order, bankInfo.html, bankInfo.text).catch(
      (error) => {
        console.error('[mail] BANK_TRANSFER_WAITING failed', error);
      },
    );
  }

  notifyNewOrder(order);
  maybeNotifyPaymentWaiting(order, order.paymentStatus);

  const deliveryModes = collectDeliveryModes(
    cartWithItems.items.map((item) => item.product),
  );

  return {
    order: publicOrder,
    payment: {
      methodType: paymentMethod.type,
      methodName: paymentMethod.name,
      bankAccounts,
      instructions,
      description,
      redirectUrl,
      message,
    },
    fulfillment: {
      deliveryModes,
      messages: buildFulfillmentMessages(
        deliveryModes,
        paymentMethod.type,
        order.paymentStatus,
      ),
    },
  };
}

export async function getPublicOrderByNumber(
  orderNumber: string,
  customerEmail: string,
) {
  const order = await prisma.order.findUnique({
    where: { orderNumber },
    include: {
      items: true,
      paymentMethod: true,
      shipment: { include: { carrier: true } },
    },
  });

  if (!order) {
    throw AppError.notFound('Order not found');
  }

  if (
    order.customerEmail.trim().toLowerCase() !==
    customerEmail.trim().toLowerCase()
  ) {
    throw AppError.notFound('Order not found');
  }

  const productIds = order.items
    .map((item) => item.productId)
    .filter((id): id is string => Boolean(id));

  const products =
    productIds.length > 0
      ? await prisma.product.findMany({
          where: { id: { in: productIds } },
          select: { deliveryMode: true },
        })
      : [];

  const deliveryModes = collectDeliveryModes(products);
  const publicOrder = toPublicOrderDto(order);

  const downloadLinks =
    order.paymentStatus === PaymentStatus.PAID
      ? await getPublicOrderDownloadLinks(orderNumber, customerEmail)
      : [];

  const saasMemberships =
    order.paymentStatus === PaymentStatus.PAID
      ? await getPublicOrderSaasMemberships(orderNumber, customerEmail)
      : [];

  return {
    ...publicOrder,
    fulfillment: {
      deliveryModes,
      messages: buildFulfillmentMessages(
        deliveryModes,
        order.paymentMethod?.type ?? null,
        order.paymentStatus,
      ),
      downloadLinks,
      saasMemberships,
    },
  };
}

export async function getPublicOrderSaasMembershipsByNumber(
  orderNumber: string,
  customerEmail: string,
) {
  const memberships = await getPublicOrderSaasMemberships(orderNumber, customerEmail);
  return { memberships };
}

export async function getPublicOrderDownloads(
  orderNumber: string,
  customerEmail: string,
) {
  const links = await getPublicOrderDownloadLinks(orderNumber, customerEmail);
  return { links };
}
