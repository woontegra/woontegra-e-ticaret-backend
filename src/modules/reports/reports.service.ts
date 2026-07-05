import { ContactMessageStatus, OrderStatus, Prisma } from '@prisma/client';
import {
  resolveReportDateRange,
  toDateKey,
} from '../../lib/date-range.js';
import { toOrderSummaryDto } from '../../lib/order.mapper.js';
import { prisma } from '../../lib/prisma.js';
import type { ReportDateRangeQuery, TopProductsQuery } from './reports.schema.js';

const activeOrderFilter: Prisma.OrderWhereInput = {
  status: { not: OrderStatus.CANCELLED },
};

function roundMoney(value: number): number {
  return Math.round(value * 100) / 100;
}

function isLowStock(
  stockQuantity: number | null,
  lowStockThreshold: number | null,
): boolean {
  if (stockQuantity === null) return false;
  return stockQuantity <= (lowStockThreshold ?? 5);
}

async function loadLowStockProducts() {
  const products = await prisma.product.findMany({
    where: {
      stockTrackingEnabled: true,
      stockQuantity: { not: null },
      status: 'ACTIVE',
    },
    select: {
      id: true,
      name: true,
      slug: true,
      sku: true,
      stockQuantity: true,
      lowStockThreshold: true,
      isFeatured: true,
      isBestSeller: true,
    },
    orderBy: { stockQuantity: 'asc' },
  });

  return products.filter((product) =>
    isLowStock(product.stockQuantity, product.lowStockThreshold),
  );
}

function buildOrderDateFilter(dateFrom: Date, dateTo: Date): Prisma.OrderWhereInput {
  return {
    ...activeOrderFilter,
    createdAt: { gte: dateFrom, lte: dateTo },
  };
}

export async function getDashboardSummary(query: ReportDateRangeQuery) {
  const { dateFrom, dateTo } = resolveReportDateRange(query.dateFrom, query.dateTo);
  const orderWhere = buildOrderDateFilter(dateFrom, dateTo);

  const [
    orderAggregate,
    pendingOrders,
    newContactMessages,
    newFormSubmissions,
    recentOrdersRaw,
    lowStockProducts,
    topProducts,
    featuredProducts,
    newCustomerCount,
  ] = await Promise.all([
    prisma.order.aggregate({
      where: orderWhere,
      _sum: { grandTotal: true },
      _count: { _all: true },
    }),
    prisma.order.count({
      where: {
        status: { in: [OrderStatus.PENDING, OrderStatus.PROCESSING, OrderStatus.CONFIRMED] },
      },
    }),
    prisma.contactMessage.count({
      where: {
        status: ContactMessageStatus.NEW,
        createdAt: { gte: dateFrom, lte: dateTo },
      },
    }),
    prisma.formSubmission.count({
      where: {
        status: 'NEW',
        createdAt: { gte: dateFrom, lte: dateTo },
      },
    }),
    prisma.order.findMany({
      where: activeOrderFilter,
      include: { _count: { select: { items: true } } },
      orderBy: { createdAt: 'desc' },
      take: 8,
    }),
    loadLowStockProducts(),
    getTopProducts({ dateFrom: toDateKey(dateFrom), dateTo: toDateKey(dateTo), limit: 5 }),
    prisma.product.findMany({
      where: {
        status: 'ACTIVE',
        OR: [{ isFeatured: true }, { isBestSeller: true }],
      },
      select: {
        id: true,
        name: true,
        slug: true,
        isFeatured: true,
        isBestSeller: true,
        stockQuantity: true,
        stockTrackingEnabled: true,
        basePrice: true,
        salePrice: true,
      },
      orderBy: [{ isFeatured: 'desc' }, { isBestSeller: 'desc' }, { updatedAt: 'desc' }],
      take: 8,
    }),
    countNewCustomers(dateFrom, dateTo),
  ]);

  const orderCount = orderAggregate._count._all;
  const totalSales = roundMoney(Number(orderAggregate._sum.grandTotal ?? 0));
  const averageBasket =
    orderCount > 0 ? roundMoney(totalSales / orderCount) : 0;

  return {
    dateFrom: dateFrom.toISOString(),
    dateTo: dateTo.toISOString(),
    totalSales,
    orderCount,
    averageBasket,
    newCustomers: newCustomerCount,
    newLeads: newContactMessages + newFormSubmissions,
    pendingOrders,
    lowStockCount: lowStockProducts.length,
    newContactMessages,
    recentOrders: recentOrdersRaw.map((order) => ({
      ...toOrderSummaryDto(order),
      itemCount: order._count.items,
    })),
    topProducts: topProducts.items,
    featuredProducts: featuredProducts.map((product) => ({
      id: product.id,
      name: product.name,
      slug: product.slug,
      isFeatured: product.isFeatured,
      isBestSeller: product.isBestSeller,
      stockQuantity: product.stockTrackingEnabled ? product.stockQuantity : null,
      price:
        product.salePrice !== null
          ? Number(product.salePrice)
          : product.basePrice !== null
            ? Number(product.basePrice)
            : null,
    })),
  };
}

async function countNewCustomers(dateFrom: Date, dateTo: Date) {
  const ordersInRange = await prisma.order.findMany({
    where: buildOrderDateFilter(dateFrom, dateTo),
    select: { customerEmail: true },
    distinct: ['customerEmail'],
  });

  if (ordersInRange.length === 0) return 0;

  const emails = ordersInRange.map((order) => order.customerEmail.toLowerCase());

  const priorCustomers = await prisma.order.findMany({
    where: {
      ...activeOrderFilter,
      createdAt: { lt: dateFrom },
      customerEmail: {
        in: ordersInRange.map((order) => order.customerEmail),
        mode: 'insensitive',
      },
    },
    select: { customerEmail: true },
    distinct: ['customerEmail'],
  });

  const priorSet = new Set(
    priorCustomers.map((order) => order.customerEmail.toLowerCase()),
  );

  return emails.filter((email) => !priorSet.has(email)).length;
}

export async function getSalesByDay(query: ReportDateRangeQuery) {
  const { dateFrom, dateTo } = resolveReportDateRange(query.dateFrom, query.dateTo);

  const orders = await prisma.order.findMany({
    where: buildOrderDateFilter(dateFrom, dateTo),
    select: { createdAt: true, grandTotal: true },
    orderBy: { createdAt: 'asc' },
  });

  const bucketMap = new Map<string, { date: string; totalSales: number; orderCount: number }>();

  for (const order of orders) {
    const key = toDateKey(order.createdAt);
    const existing = bucketMap.get(key) ?? { date: key, totalSales: 0, orderCount: 0 };
    existing.totalSales = roundMoney(existing.totalSales + Number(order.grandTotal));
    existing.orderCount += 1;
    bucketMap.set(key, existing);
  }

  const items = Array.from(bucketMap.values()).sort((a, b) =>
    a.date.localeCompare(b.date),
  );

  return {
    dateFrom: dateFrom.toISOString(),
    dateTo: dateTo.toISOString(),
    items,
  };
}

export async function getOrdersByStatus(query: ReportDateRangeQuery) {
  const { dateFrom, dateTo } = resolveReportDateRange(query.dateFrom, query.dateTo);

  const grouped = await prisma.order.groupBy({
    by: ['status'],
    where: buildOrderDateFilter(dateFrom, dateTo),
    _count: { _all: true },
    _sum: { grandTotal: true },
  });

  return {
    dateFrom: dateFrom.toISOString(),
    dateTo: dateTo.toISOString(),
    items: grouped.map((row) => ({
      status: row.status,
      orderCount: row._count._all,
      totalSales: roundMoney(Number(row._sum.grandTotal ?? 0)),
    })),
  };
}

export async function getTopProducts(query: TopProductsQuery) {
  const { dateFrom, dateTo } = resolveReportDateRange(query.dateFrom, query.dateTo);
  const limit = query.limit ?? 10;

  const rows = await prisma.orderItem.groupBy({
    by: ['productId'],
    where: {
      order: buildOrderDateFilter(dateFrom, dateTo),
      productId: { not: null },
    },
    _sum: { quantity: true, total: true },
    orderBy: { _sum: { quantity: 'desc' } },
    take: limit,
  });

  const productIds = rows
    .map((row) => row.productId)
    .filter((id): id is string => Boolean(id));

  const products = productIds.length
    ? await prisma.product.findMany({
        where: { id: { in: productIds } },
        select: { id: true, name: true, slug: true, sku: true },
      })
    : [];

  const productMap = new Map(products.map((product) => [product.id, product]));

  return {
    dateFrom: dateFrom.toISOString(),
    dateTo: dateTo.toISOString(),
    items: rows
      .filter((row) => row.productId)
      .map((row) => {
        const product = productMap.get(row.productId!);
        return {
          productId: row.productId!,
          name: product?.name ?? 'Bilinmeyen ürün',
          slug: product?.slug ?? null,
          sku: product?.sku ?? null,
          quantitySold: row._sum.quantity ?? 0,
          revenue: roundMoney(Number(row._sum.total ?? 0)),
        };
      }),
  };
}

export async function getLowStockProductsReport() {
  const items = await loadLowStockProducts();

  return {
    items: items.map((product) => ({
      id: product.id,
      name: product.name,
      slug: product.slug,
      sku: product.sku,
      stockQuantity: product.stockQuantity!,
      lowStockThreshold: product.lowStockThreshold ?? 5,
    })),
    total: items.length,
  };
}

export async function getNewCustomersReport(query: ReportDateRangeQuery) {
  const { dateFrom, dateTo } = resolveReportDateRange(query.dateFrom, query.dateTo);

  const ordersInRange = await prisma.order.findMany({
    where: buildOrderDateFilter(dateFrom, dateTo),
    select: {
      customerEmail: true,
      customerName: true,
      createdAt: true,
    },
    orderBy: { createdAt: 'asc' },
  });

  const firstOrderByEmail = new Map<
    string,
    { email: string; name: string; firstOrderAt: Date }
  >();

  for (const order of ordersInRange) {
    const key = order.customerEmail.toLowerCase();
    if (!firstOrderByEmail.has(key)) {
      firstOrderByEmail.set(key, {
        email: order.customerEmail,
        name: order.customerName,
        firstOrderAt: order.createdAt,
      });
    }
  }

  const emails = Array.from(firstOrderByEmail.keys());
  if (emails.length === 0) {
    return {
      dateFrom: dateFrom.toISOString(),
      dateTo: dateTo.toISOString(),
      items: [],
      total: 0,
    };
  }

  const priorCustomers = await prisma.order.findMany({
    where: {
      ...activeOrderFilter,
      createdAt: { lt: dateFrom },
    },
    select: { customerEmail: true },
    distinct: ['customerEmail'],
  });

  const priorSet = new Set(
    priorCustomers.map((order) => order.customerEmail.toLowerCase()),
  );

  const [contactLeads, formLeads] = await Promise.all([
    prisma.contactMessage.findMany({
      where: { createdAt: { gte: dateFrom, lte: dateTo } },
      select: {
        id: true,
        name: true,
        email: true,
        subject: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.formSubmission.findMany({
      where: { createdAt: { gte: dateFrom, lte: dateTo } },
      include: { form: { select: { name: true } } },
      orderBy: { createdAt: 'desc' },
    }),
  ]);

  const customerItems = Array.from(firstOrderByEmail.values())
    .filter((entry) => !priorSet.has(entry.email.toLowerCase()))
    .map((entry) => ({
      type: 'customer' as const,
      id: entry.email,
      name: entry.name,
      email: entry.email,
      detail: 'İlk sipariş',
      createdAt: entry.firstOrderAt.toISOString(),
    }));

  const leadItems = [
    ...contactLeads.map((lead) => ({
      type: 'contact' as const,
      id: lead.id,
      name: lead.name,
      email: lead.email,
      detail: lead.subject ?? 'İletişim formu',
      createdAt: lead.createdAt.toISOString(),
    })),
    ...formLeads.map((lead) => ({
      type: 'form' as const,
      id: lead.id,
      name: lead.form.name,
      email: null as string | null,
      detail: 'Form gönderimi',
      createdAt: lead.createdAt.toISOString(),
    })),
  ];

  const items = [...customerItems, ...leadItems].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );

  return {
    dateFrom: dateFrom.toISOString(),
    dateTo: dateTo.toISOString(),
    items,
    total: items.length,
  };
}

export async function getPaymentMethodSummary(query: ReportDateRangeQuery) {
  const { dateFrom, dateTo } = resolveReportDateRange(query.dateFrom, query.dateTo);

  const grouped = await prisma.order.groupBy({
    by: ['paymentMethodId'],
    where: buildOrderDateFilter(dateFrom, dateTo),
    _count: { _all: true },
    _sum: { grandTotal: true },
  });

  const methodIds = grouped
    .map((row) => row.paymentMethodId)
    .filter((id): id is string => Boolean(id));

  const methods = methodIds.length
    ? await prisma.paymentMethod.findMany({
        where: { id: { in: methodIds } },
        select: { id: true, name: true, type: true },
      })
    : [];

  const methodMap = new Map(methods.map((method) => [method.id, method]));

  return {
    dateFrom: dateFrom.toISOString(),
    dateTo: dateTo.toISOString(),
    items: grouped.map((row) => {
      const method = row.paymentMethodId
        ? methodMap.get(row.paymentMethodId)
        : null;
      return {
        paymentMethodId: row.paymentMethodId,
        methodName: method?.name ?? 'Bilinmiyor',
        methodType: method?.type ?? null,
        orderCount: row._count._all,
        totalSales: roundMoney(Number(row._sum.grandTotal ?? 0)),
      };
    }),
  };
}
