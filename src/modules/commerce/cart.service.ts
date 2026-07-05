import { ProductStatus } from '@prisma/client';
import { AppError } from '../../lib/app-error.js';
import {
  resolveProductTaxRate,
  resolveProductUnitPrice,
  toCartDto,
} from '../../lib/order.mapper.js';
import { prisma } from '../../lib/prisma.js';
import type { AddCartItemInput, UpdateCartItemInput } from './cart.schema.js';
import { refreshCartCoupon } from '../promotion/cart-coupon.service.js';

const cartItemInclude = {
  product: true,
  variant: {
    include: {
      options: {
        include: { attributeValue: true },
      },
    },
  },
} as const;

async function getOrCreateCart(sessionId: string) {
  let cart = await prisma.cart.findUnique({
    where: { sessionId },
    include: { items: { include: cartItemInclude } },
  });

  if (!cart) {
    cart = await prisma.cart.create({
      data: { sessionId },
      include: { items: { include: cartItemInclude } },
    });
  }

  return cart;
}

async function findMatchingCartItem(
  cartId: string,
  productId: string,
  variantId: string | null,
) {
  const items = await prisma.cartItem.findMany({
    where: { cartId, productId },
  });

  return items.find((item) => (item.variantId ?? null) === variantId) ?? null;
}

async function validateCartProduct(
  productId: string,
  variantId: string | null | undefined,
) {
  const product = await prisma.product.findFirst({
    where: { id: productId, status: ProductStatus.ACTIVE },
  });

  if (!product) {
    throw AppError.badRequest('Product is not available');
  }

  let variant = null;
  if (variantId) {
    variant = await prisma.productVariant.findFirst({
      where: { id: variantId, productId, isActive: true },
    });
    if (!variant) {
      throw AppError.badRequest('Variant is not available');
    }
  } else if (
    (await prisma.productVariant.count({
      where: { productId, isActive: true },
    })) > 0
  ) {
    throw AppError.badRequest('Please select a product variant');
  }

  const unitPrice = resolveProductUnitPrice(product, variant);
  if (unitPrice === null) {
    throw AppError.badRequest('Product has no price');
  }

  return { product, variant, unitPrice };
}

export async function getCart(sessionId: string) {
  const cart = await getOrCreateCart(sessionId);
  return toCartDto(cart);
}

export async function addCartItem(sessionId: string, input: AddCartItemInput) {
  const variantId = input.variantId ?? null;
  const quantity = input.quantity ?? 1;
  const { product, variant, unitPrice } = await validateCartProduct(
    input.productId,
    variantId,
  );

  const cart = await getOrCreateCart(sessionId);
  const existing = await findMatchingCartItem(
    cart.id,
    input.productId,
    variantId,
  );

  if (existing) {
    await prisma.cartItem.update({
      where: { id: existing.id },
      data: {
        quantity: existing.quantity + quantity,
        unitPrice,
        taxRate: resolveProductTaxRate(product),
      },
    });
  } else {
    await prisma.cartItem.create({
      data: {
        cartId: cart.id,
        productId: input.productId,
        variantId,
        quantity,
        unitPrice,
        taxRate: resolveProductTaxRate(product),
      },
    });
  }

  const updated = await prisma.cart.findUnique({
    where: { id: cart.id },
    include: { items: { include: cartItemInclude } },
  });

  await refreshCartCoupon(cart.id);

  const finalCart = await prisma.cart.findUnique({
    where: { id: cart.id },
    include: { items: { include: cartItemInclude } },
  });

  return toCartDto(finalCart!);
}

export async function updateCartItem(
  sessionId: string,
  itemId: string,
  input: UpdateCartItemInput,
) {
  const cart = await getOrCreateCart(sessionId);
  const item = await prisma.cartItem.findFirst({
    where: { id: itemId, cartId: cart.id },
  });

  if (!item) {
    throw AppError.notFound('Cart item not found');
  }

  await prisma.cartItem.update({
    where: { id: itemId },
    data: { quantity: input.quantity },
  });

  await refreshCartCoupon(cart.id);

  const updated = await prisma.cart.findUnique({
    where: { id: cart.id },
    include: { items: { include: cartItemInclude } },
  });

  return toCartDto(updated!);
}

export async function removeCartItem(sessionId: string, itemId: string) {
  const cart = await getOrCreateCart(sessionId);
  const item = await prisma.cartItem.findFirst({
    where: { id: itemId, cartId: cart.id },
  });

  if (!item) {
    throw AppError.notFound('Cart item not found');
  }

  await prisma.cartItem.delete({ where: { id: itemId } });

  await refreshCartCoupon(cart.id);

  const updated = await prisma.cart.findUnique({
    where: { id: cart.id },
    include: { items: { include: cartItemInclude } },
  });

  return toCartDto(updated!);
}

export async function getCartRecordBySession(sessionId: string) {
  return getOrCreateCart(sessionId);
}

export async function clearCart(cartId: string) {
  await prisma.cartItem.deleteMany({ where: { cartId } });
  await prisma.cart.update({
    where: { id: cartId },
    data: { couponId: null, couponCode: null, discountTotal: 0 },
  });
}
