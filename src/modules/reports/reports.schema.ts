import { z } from 'zod';

export const reportDateRangeQuerySchema = z.object({
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
});

export const topProductsQuerySchema = reportDateRangeQuerySchema.extend({
  limit: z.coerce.number().int().min(1).max(50).optional(),
});

export type ReportDateRangeQuery = z.infer<typeof reportDateRangeQuerySchema>;
export type TopProductsQuery = z.infer<typeof topProductsQuerySchema>;
