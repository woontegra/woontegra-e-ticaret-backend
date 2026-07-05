import type {
  Cart,
  CartItem,
  Order,
  OrderItem,
  PaymentTransaction,
  Prisma,
  Product,
  ProductVariant,
  Shipment,
  ShippingCarrier,
  PaymentMethod,
} from '@prisma/client';
import type {
  CartDto,
  CartItemDto,
  CartSummaryDto,
  OrderDto,
  OrderItemDto,
  OrderSummaryDto,
  PaymentTransactionDto,
  PublicOrderDto,
} from '../types/api.js';
import { resolveMediaUrlMap } from './media-url.js';
import { toShipmentDto } from './shipping.mapper.js';
import { cartRequiresCustomerLogin } from './cart-product-rules.js';

function decimalToNumber(value: Prisma.Decimal | null | undefined): number | null {
  if (value === null || value === undefined) return null;
  return Number(value);
}

type CartItemWithRelations = CartItem & {
  product: Product;
  variant?: ProductVariant | null;
};

type OrderWithItems = Order & {
  items: OrderItem[];
  shipment?: (Shipment & { carrier?: ShippingCarrier | null }) | null;
  paymentMethod?: PaymentMethod | null;
  paymentTransactions?: PaymentTransaction[];
};

function toPaymentTransactionDto(tx: PaymentTransaction): PaymentTransactionDto {
  return {
    id: tx.id,
    orderId: tx.orderId,
    provider: tx.provider,
    status: tx.status,
    amount: decimalToNumber(tx.amount)!,
    currency: tx.currency,
    providerReference: tx.providerReference,
    createdAt: tx.createdAt.toISOString(),
    updatedAt: tx.updatedAt.toISOString(),
  };
}

export function buildLineLabel(
  product: Product,
  variant?: (ProductVariant & {
    options?: Array<{ attributeValue: { value: string } }>;
  }) | null,
): string {
  if (!variant?.options?.length) return product.name;
  const suffix = variant.options.map((o) => o.attributeValue.value).join(' / ');
  return `${product.name} — ${suffix}`;
}

export async function toCartItemDto(
  item: CartItemWithRelations,
  imageUrl: string | null,
  lineLabel: string,
): Promise<CartItemDto> {
  return {
    id: item.id,
    cartId: item.cartId,
    productId: item.productId,
    variantId: item.variantId,
    quantity: item.quantity,
    unitPrice: decimalToNumber(item.unitPrice)!,
    taxRate: decimalToNumber(item.taxRate),
    lineTotal: Number(item.unitPrice) * item.quantity,
    productName: item.product.name,
    productSlug: item.product.slug,
    productKind: item.product.productKind,
    lineLabel,
    imageUrl,
  };
}

export async function toCartDto(
  cart: Cart & { items: CartItemWithRelations[] },
): Promise<CartDto> {
  const imageIds = cart.items.map(
    (item) => item.variant?.imageId ?? item.product.mainImageId,
  );
  const urlMap = await resolveMediaUrlMap(imageIds);

  const items = await Promise.all(
    cart.items.map(async (item) => {
      const imageId = item.variant?.imageId ?? item.product.mainImageId;
      const imageUrl = imageId ? (urlMap.get(imageId) ?? null) : null;
      const lineLabel = buildLineLabel(item.product, item.variant);
      return toCartItemDto(item, imageUrl, lineLabel);
    }),
  );

  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = items.reduce((sum, item) => sum + item.lineTotal, 0);
  const taxTotal = items.reduce((sum, item) => {
    const rate = item.taxRate ?? 0;
    return sum + item.lineTotal * (rate / 100);
  }, 0);

  return {
    id: cart.id,
    items,
    itemCount,
    subtotal: roundMoney(subtotal),
    taxTotal: roundMoney(taxTotal),
    discountTotal: roundMoney(Number(cart.discountTotal ?? 0)),
    couponCode: cart.couponCode ?? null,
    grandTotal: roundMoney(
      subtotal + taxTotal - Number(cart.discountTotal ?? 0),
    ),
    requiresCustomerLogin: cartRequiresCustomerLogin(
      cart.items.map((item) => item.product),
    ),
  };
}

export function toCartSummaryDto(cart: CartDto): CartSummaryDto {
  return {
    itemCount: cart.itemCount,
    grandTotal: cart.grandTotal,
  };
}

export function toOrderItemDto(item: OrderItem): OrderItemDto {
  return {
    id: item.id,
    orderId: item.orderId,
    productId: item.productId,
    variantId: item.variantId,
    nameSnapshot: item.nameSnapshot,
    skuSnapshot: item.skuSnapshot,
    quantity: item.quantity,
    unitPrice: decimalToNumber(item.unitPrice)!,
    taxRate: decimalToNumber(item.taxRate),
    total: decimalToNumber(item.total)!,
  };
}

export function toOrderDto(order: OrderWithItems): OrderDto {
  return {
    id: order.id,
    orderNumber: order.orderNumber,
    customerId: order.customerId,
    status: order.status,
    paymentStatus: order.paymentStatus,
    shippingStatus: order.shippingStatus,
    subtotal: decimalToNumber(order.subtotal)!,
    taxTotal: decimalToNumber(order.taxTotal)!,
    shippingTotal: decimalToNumber(order.shippingTotal)!,
    discountTotal: decimalToNumber(order.discountTotal)!,
    grandTotal: decimalToNumber(order.grandTotal)!,
    customerName: order.customerName,
    customerEmail: order.customerEmail,
    customerPhone: order.customerPhone,
    note: order.note,
    adminNote: order.adminNote,
    paymentMethodId: order.paymentMethodId,
    paymentMethodType: order.paymentMethod?.type ?? null,
    paymentMethodName: order.paymentMethod?.name ?? null,
    shipment: order.shipment ? toShipmentDto(order.shipment) : null,
    items: order.items.map(toOrderItemDto),
    paymentTransactions: order.paymentTransactions?.map(toPaymentTransactionDto),
    createdAt: order.createdAt.toISOString(),
    updatedAt: order.updatedAt.toISOString(),
  };
}

export function toPublicOrderDto(order: OrderWithItems): PublicOrderDto {
  const dto = toOrderDto(order);
  const { adminNote: _adminNote, ...publicDto } = dto;
  return publicDto;
}

export function toOrderSummaryDto(order: Order): OrderSummaryDto {
  return {
    id: order.id,
    orderNumber: order.orderNumber,
    status: order.status,
    paymentStatus: order.paymentStatus,
    shippingStatus: order.shippingStatus,
    grandTotal: decimalToNumber(order.grandTotal)!,
    customerName: order.customerName,
    customerEmail: order.customerEmail,
    itemCount: 0,
    createdAt: order.createdAt.toISOString(),
  };
}

export function roundMoney(value: number): number {
  return Math.round(value * 100) / 100;
}

export function resolveProductUnitPrice(
  product: Product,
  variant?: ProductVariant | null,
): number | null {
  if (variant) {
    const variantPrice =
      variant.salePrice !== null
        ? Number(variant.salePrice)
        : variant.price !== null
          ? Number(variant.price)
          : null;
    if (variantPrice !== null) return variantPrice;
  }

  if (product.salePrice !== null) return Number(product.salePrice);
  if (product.basePrice !== null) return Number(product.basePrice);
  return null;
}

export function resolveProductTaxRate(product: Product): number | null {
  return product.taxRate !== null ? Number(product.taxRate) : null;
}
