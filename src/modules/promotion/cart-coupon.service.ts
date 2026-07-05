import { AppError } from '../../lib/app-error.js';
import { prisma } from '../../lib/prisma.js';
import {
  calculateCouponDiscount,
  findCouponByCode,
  validateCouponForCart,
} from './coupon-engine.service.js';

const cartItemInclude = {
  product: true,
  variant: {
    include: {
      options: { include: { attributeValue: true } },
    },
  },
} as const;

export async function applyCouponToCart(cartId: string, code: string) {
  const cart = await prisma.cart.findUnique({
    where: { id: cartId },
    include: { items: { include: cartItemInclude } },
  });

  if (!cart) throw AppError.notFound('Cart not found');
  if (cart.items.length === 0) {
    throw AppError.badRequest('Sepet boş');
  }

  const coupon = await findCouponByCode(code);
  const { eligibleSubtotal } = await validateCouponForCart(coupon, cart.items);
  const discountTotal = calculateCouponDiscount(coupon, eligibleSubtotal, 0);

  await prisma.cart.update({
    where: { id: cartId },
    data: {
      couponId: coupon.id,
      couponCode: coupon.code,
      discountTotal,
    },
  });
}

export async function removeCouponFromCart(cartId: string) {
  await prisma.cart.update({
    where: { id: cartId },
    data: {
      couponId: null,
      couponCode: null,
      discountTotal: 0,
    },
  });
}

export async function refreshCartCoupon(cartId: string) {
  const cart = await prisma.cart.findUnique({
    where: { id: cartId },
    include: { items: { include: cartItemInclude } },
  });

  if (!cart?.couponId) return;

  const coupon = await prisma.coupon.findUnique({ where: { id: cart.couponId } });
  if (!coupon) {
    await removeCouponFromCart(cartId);
    return;
  }

  try {
    if (cart.items.length === 0) {
      await removeCouponFromCart(cartId);
      return;
    }

    const { eligibleSubtotal } = await validateCouponForCart(coupon, cart.items);
    const discountTotal = calculateCouponDiscount(coupon, eligibleSubtotal, 0);
    await prisma.cart.update({
      where: { id: cartId },
      data: { discountTotal, couponCode: coupon.code },
    });
  } catch {
    await removeCouponFromCart(cartId);
  }
}

export async function validateCartCouponForCheckout(
  cartId: string,
  customerEmail: string,
) {
  const cart = await prisma.cart.findUnique({
    where: { id: cartId },
    include: { items: { include: cartItemInclude }, coupon: true },
  });

  if (!cart?.couponId || !cart.coupon) {
    return { discountTotal: 0, couponId: null as string | null, couponCode: null as string | null };
  }

  const { eligibleSubtotal } = await validateCouponForCart(
    cart.coupon,
    cart.items,
    customerEmail,
  );
  const discountTotal = calculateCouponDiscount(cart.coupon, eligibleSubtotal, 0);

  return {
    discountTotal,
    couponId: cart.coupon.id,
    couponCode: cart.coupon.code,
  };
}
