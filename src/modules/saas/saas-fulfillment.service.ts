import {
  DeliveryMode,
  PaymentStatus,
  SaasMembershipStatus,
  SaasProvisionStatus,
} from '@prisma/client';
import { AppError } from '../../lib/app-error.js';
import { prisma } from '../../lib/prisma.js';
import { env } from '../../config/index.js';
import type {
  OrderSaasDeliveryItemDto,
  PublicSaasMembershipDto,
} from '../../types/api.js';
import {
  isMuvekkilKasaSaasConfigured,
  provisionMuvekkilKasaSaasTenant,
  resolveSaasLoginUrl,
} from './saas-provision.client.js';

function resolveSaasLicenseDays(product: {
  licenseDays: number | null;
  licenseMonths: number | null;
  saasTrialDays: number | null;
}): { licenseDays?: number; licenseMonths?: number } {
  if (product.licenseDays && product.licenseDays > 0) {
    return { licenseDays: product.licenseDays };
  }
  if (product.licenseMonths && product.licenseMonths > 0) {
    return { licenseMonths: product.licenseMonths };
  }
  if (product.saasTrialDays && product.saasTrialDays > 0) {
    return { licenseDays: product.saasTrialDays };
  }
  return { licenseMonths: 12 };
}

async function loadSaasOrderItem(orderItemId: string) {
  const item = await prisma.orderItem.findUnique({
    where: { id: orderItemId },
    include: {
      order: true,
      product: true,
      saasMembership: true,
    },
  });

  if (!item) {
    throw AppError.notFound('Order item not found');
  }

  return item;
}

export async function fulfillSaasForOrderItem(orderItemId: string) {
  const item = await loadSaasOrderItem(orderItemId);

  if (item.order.paymentStatus !== PaymentStatus.PAID) {
    return { created: false, reason: 'Payment not completed' };
  }

  if (!item.product || item.product.deliveryMode !== DeliveryMode.SAAS) {
    return { created: false, reason: 'Not a SaaS product' };
  }

  if (!item.product.saasAppCode?.trim()) {
    await prisma.orderItem.update({
      where: { id: item.id },
      data: {
        saasProvisionStatus: SaasProvisionStatus.FAILED,
        saasProvisionLastError: 'saasAppCode tanımlı değil',
      },
    });
    return { created: false, reason: 'Missing saasAppCode' };
  }

  if (item.saasProvisionStatus === SaasProvisionStatus.CREATED && item.saasMembershipId) {
    return { created: false, reason: 'Already provisioned' };
  }

  if (!env.SAAS_PROVISIONING_ENABLED || !env.MUVEKKIL_KASA_SAAS_ENABLED) {
    await prisma.orderItem.update({
      where: { id: item.id },
      data: {
        saasProvisionStatus: SaasProvisionStatus.SKIPPED,
        saasProvisionLastError: 'SaaS provisioning devre dışı',
      },
    });
    return { created: false, reason: 'SaaS disabled' };
  }

  if (!isMuvekkilKasaSaasConfigured()) {
    await prisma.orderItem.update({
      where: { id: item.id },
      data: {
        saasProvisionStatus: SaasProvisionStatus.FAILED,
        saasProvisionLastError:
          'SaaS API yapılandırılmamış (MUVEKKIL_KASA_SAAS_API_URL / MUVEKKIL_KASA_SAAS_PROVISION_SECRET)',
      },
    });
    return { created: false, reason: 'SaaS not configured' };
  }

  const existingMembership = await prisma.customerSaasMembership.findFirst({
    where: {
      orderItemId: item.id,
      status: { in: [SaasMembershipStatus.ACTIVE, SaasMembershipStatus.PENDING] },
    },
  });

  if (existingMembership?.externalTenantId) {
    await prisma.orderItem.update({
      where: { id: item.id },
      data: {
        saasMembershipId: existingMembership.id,
        saasProvisionStatus: SaasProvisionStatus.CREATED,
        saasProvisionedAt: existingMembership.provisionedAt ?? new Date(),
        saasProvisionLastError: null,
      },
    });
    return { created: false, reason: 'Membership exists', membershipId: existingMembership.id };
  }

  const licenseTerms = resolveSaasLicenseDays(item.product);
  const response = await provisionMuvekkilKasaSaasTenant({
    externalOrderNo: item.order.orderNumber,
    externalOrderItemId: item.id,
    customerName: item.order.customerName,
    customerEmail: item.order.customerEmail,
    customerPhone: item.order.customerPhone,
    companyName: item.order.customerName,
    productName: item.nameSnapshot,
    saasAppCode: item.product.saasAppCode.trim(),
    saasPlanCode: item.product.saasPlanCode,
    licenseDays: licenseTerms.licenseDays ?? null,
    licenseMonths: licenseTerms.licenseMonths ?? null,
    demo: false,
  });

  if (!response.ok || !response.tenantId) {
    const errorMessage = response.error ?? 'SaaS hesabı oluşturulamadı';
    await prisma.orderItem.update({
      where: { id: item.id },
      data: {
        saasProvisionStatus: SaasProvisionStatus.FAILED,
        saasProvisionLastError: errorMessage,
      },
    });

    if (item.saasMembershipId) {
      await prisma.customerSaasMembership.update({
        where: { id: item.saasMembershipId },
        data: {
          status: SaasMembershipStatus.FAILED,
          lastError: errorMessage,
        },
      });
    }

    return { created: false, reason: errorMessage };
  }

  const loginUrl = resolveSaasLoginUrl(response.loginUrl);
  const now = new Date();

  const membership = await prisma.customerSaasMembership.create({
    data: {
      customerId: item.order.customerId,
      orderId: item.order.id,
      orderItemId: item.id,
      productId: item.product.id,
      saasAppCode: item.product.saasAppCode.trim(),
      saasPlanCode: item.product.saasPlanCode,
      externalTenantId: response.tenantId,
      externalTenantSlug: response.tenantSlug ?? null,
      externalLicenseKey: response.licenseKey ?? null,
      loginEmail: response.loginEmail ?? item.order.customerEmail,
      loginUrl,
      temporaryPassword: response.temporaryPassword ?? null,
      status: SaasMembershipStatus.ACTIVE,
      startsAt: response.startsAt ? new Date(response.startsAt) : now,
      endsAt: response.endsAt ? new Date(response.endsAt) : null,
      provisionedAt: now,
      lastError: null,
      rawResponse: {
        message: response.message ?? null,
        mailSentBySaas: response.mailSentBySaas ?? false,
      },
    },
  });

  await prisma.orderItem.update({
    where: { id: item.id },
    data: {
      saasMembershipId: membership.id,
      saasProvisionStatus: SaasProvisionStatus.CREATED,
      saasProvisionLastError: null,
      saasProvisionedAt: now,
      saasRenewalDays: licenseTerms.licenseDays ?? null,
    },
  });

  return {
    created: true,
    membershipId: membership.id,
    mailSentBySaas: response.mailSentBySaas ?? false,
  };
}

export async function fulfillSaasForPaidOrder(orderId: string) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      items: { include: { product: true } },
    },
  });

  if (!order) {
    throw AppError.notFound('Order not found');
  }

  if (order.paymentStatus !== PaymentStatus.PAID) {
    return { fulfilled: false, provisionedCount: 0, mailSentBySaas: false };
  }

  let provisionedCount = 0;
  let mailSentBySaas = false;

  for (const item of order.items) {
    if (item.product?.deliveryMode !== DeliveryMode.SAAS) continue;

    const result = await fulfillSaasForOrderItem(item.id);
    if (result.created) {
      provisionedCount += 1;
      if (result.mailSentBySaas) {
        mailSentBySaas = true;
      }
    }
  }

  return { fulfilled: provisionedCount > 0, provisionedCount, mailSentBySaas };
}

export async function retrySaasProvisionForOrderItem(orderItemId: string) {
  const item = await loadSaasOrderItem(orderItemId);

  if (item.order.paymentStatus !== PaymentStatus.PAID) {
    throw AppError.badRequest('Ödeme tamamlanmadan SaaS hesabı oluşturulmaz');
  }

  if (item.saasProvisionStatus === SaasProvisionStatus.CREATED && item.saasMembershipId) {
    throw AppError.badRequest(
      'SaaS hesabı zaten oluşturulmuş. Yeniden üretim desteklenmiyor.',
    );
  }

  if (item.saasProvisionStatus !== SaasProvisionStatus.FAILED) {
    await prisma.orderItem.update({
      where: { id: item.id },
      data: {
        saasProvisionStatus: SaasProvisionStatus.PENDING,
        saasProvisionLastError: null,
      },
    });
  }

  return fulfillSaasForOrderItem(orderItemId);
}

export async function getAdminOrderSaasDelivery(
  orderId: string,
): Promise<OrderSaasDeliveryItemDto[]> {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      items: {
        include: {
          product: { select: { deliveryMode: true, saasAppCode: true, saasPlanCode: true } },
          saasMembership: true,
        },
      },
    },
  });

  if (!order) throw AppError.notFound('Order not found');

  return order.items
    .filter((item) => item.product?.deliveryMode === DeliveryMode.SAAS)
    .map((item) => ({
      orderItemId: item.id,
      productName: item.nameSnapshot,
      saasAppCode: item.product?.saasAppCode ?? null,
      saasPlanCode: item.product?.saasPlanCode ?? null,
      saasProvisionStatus: item.saasProvisionStatus,
      saasProvisionLastError: item.saasProvisionLastError,
      saasProvisionedAt: item.saasProvisionedAt?.toISOString() ?? null,
      externalTenantId: item.saasMembership?.externalTenantId ?? null,
      externalTenantSlug: item.saasMembership?.externalTenantSlug ?? null,
      loginUrl: item.saasMembership?.loginUrl ?? null,
      loginEmail: item.saasMembership?.loginEmail ?? null,
      temporaryPassword: item.saasMembership?.temporaryPassword ?? null,
      externalLicenseKey: item.saasMembership?.externalLicenseKey ?? null,
      startsAt: item.saasMembership?.startsAt?.toISOString() ?? null,
      endsAt: item.saasMembership?.endsAt?.toISOString() ?? null,
      canRetry:
        order.paymentStatus === PaymentStatus.PAID &&
        item.saasProvisionStatus === SaasProvisionStatus.FAILED,
      canFulfill: order.paymentStatus === PaymentStatus.PAID,
    }));
}

export async function getPublicOrderSaasMemberships(
  orderNumber: string,
  customerEmail: string,
): Promise<PublicSaasMembershipDto[]> {
  const order = await prisma.order.findUnique({
    where: { orderNumber },
    include: {
      saasMemberships: true,
      items: { include: { product: { select: { name: true, deliveryMode: true } } } },
    },
  });

  if (!order) {
    throw AppError.notFound('Order not found');
  }

  if (
    order.customerEmail.trim().toLowerCase() !== customerEmail.trim().toLowerCase()
  ) {
    throw AppError.notFound('Order not found');
  }

  if (order.paymentStatus !== PaymentStatus.PAID) {
    return [];
  }

  return order.saasMemberships
    .filter((membership) => membership.status === SaasMembershipStatus.ACTIVE)
    .map((membership) => {
      const item = order.items.find((row) => row.id === membership.orderItemId);
      return {
        productName: item?.nameSnapshot ?? item?.product?.name ?? 'SaaS Ürün',
        saasAppCode: membership.saasAppCode,
        loginUrl: membership.loginUrl,
        loginEmail: membership.loginEmail,
        tenantSlug: membership.externalTenantSlug,
        startsAt: membership.startsAt?.toISOString() ?? null,
        endsAt: membership.endsAt?.toISOString() ?? null,
        note: 'Giriş bilgileriniz e-posta ile gönderildi',
      };
    });
}

export async function listSaasMemberships(query: {
  status?: SaasMembershipStatus;
  saasAppCode?: string;
  customer?: string;
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  limit?: number;
}) {
  const page = query.page ?? 1;
  const limit = query.limit ?? 20;
  const skip = (page - 1) * limit;

  const where = {
    ...(query.status ? { status: query.status } : {}),
    ...(query.saasAppCode
      ? { saasAppCode: { contains: query.saasAppCode, mode: 'insensitive' as const } }
      : {}),
    ...(query.customer
      ? {
          OR: [
            { loginEmail: { contains: query.customer, mode: 'insensitive' as const } },
            { externalTenantSlug: { contains: query.customer, mode: 'insensitive' as const } },
            { order: { orderNumber: { contains: query.customer, mode: 'insensitive' as const } } },
            { order: { customerName: { contains: query.customer, mode: 'insensitive' as const } } },
          ],
        }
      : {}),
    ...(query.dateFrom || query.dateTo
      ? {
          createdAt: {
            ...(query.dateFrom ? { gte: new Date(query.dateFrom) } : {}),
            ...(query.dateTo ? { lte: new Date(`${query.dateTo}T23:59:59.999Z`) } : {}),
          },
        }
      : {}),
  };

  const [items, total] = await Promise.all([
    prisma.customerSaasMembership.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
      include: {
        order: { select: { orderNumber: true, customerName: true, customerEmail: true } },
        product: { select: { name: true } },
      },
    }),
    prisma.customerSaasMembership.count({ where }),
  ]);

  return {
    items: items.map((membership) => ({
      id: membership.id,
      customerEmail: membership.loginEmail ?? membership.order?.customerEmail ?? null,
      customerName: membership.order?.customerName ?? null,
      productName: membership.product.name,
      saasAppCode: membership.saasAppCode,
      saasPlanCode: membership.saasPlanCode,
      tenantSlug: membership.externalTenantSlug,
      status: membership.status,
      startsAt: membership.startsAt?.toISOString() ?? null,
      endsAt: membership.endsAt?.toISOString() ?? null,
      orderNumber: membership.order?.orderNumber ?? null,
      loginUrl: membership.loginUrl,
      lastError: membership.lastError,
      createdAt: membership.createdAt.toISOString(),
    })),
    total,
  };
}
