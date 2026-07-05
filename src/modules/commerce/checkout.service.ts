import { OrderStatus, PaymentStatus, ShippingStatus } from '@prisma/client';
import { AppError } from '../../lib/app-error.js';
import {
  buildLineLabel,
  roundMoney,
  toOrderDto,
} from '../../lib/order.mapper.js';
import { prisma } from '../../lib/prisma.js';
import { getCartRecordBySession } from './cart.service.js';
import type { CheckoutInput } from './checkout.schema.js';

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

export async function checkout(sessionId: string, input: CheckoutInput) {
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
  const discountTotal = 0;
  const grandTotal = roundMoney(subtotal + taxTotal + shippingTotal - discountTotal);
  const orderNumber = await generateOrderNumber();

  const order = await prisma.$transaction(async (tx) => {
    const created = await tx.order.create({
      data: {
        orderNumber,
        status: OrderStatus.PENDING,
        paymentStatus: PaymentStatus.PENDING,
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
        items: {
          create: orderItemsData,
        },
      },
      include: { items: true },
    });

    await tx.cartItem.deleteMany({ where: { cartId: cart.id } });
    return created;
  });

  return toOrderDto(order);
}

export async function getPublicOrderByNumber(orderNumber: string) {
  const order = await prisma.order.findUnique({
    where: { orderNumber },
    include: { items: true },
  });

  if (!order) {
    throw AppError.notFound('Order not found');
  }

  return toOrderDto(order);
}
