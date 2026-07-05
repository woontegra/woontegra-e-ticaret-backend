import { z } from 'zod';

export const DEFAULT_PAGE = 1;
export const DEFAULT_PAGE_SIZE = 20;
export const MAX_ADMIN_PAGE_SIZE = 100;
export const MAX_PUBLIC_PAGE_SIZE = 50;

export const paginationQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().optional(),
});

export type PaginationQuery = z.infer<typeof paginationQuerySchema>;

export function resolvePagination(
  query: PaginationQuery,
  options: { defaultLimit?: number; maxLimit?: number } = {},
) {
  const defaultLimit = options.defaultLimit ?? DEFAULT_PAGE_SIZE;
  const maxLimit = options.maxLimit ?? MAX_ADMIN_PAGE_SIZE;
  const page = Math.max(DEFAULT_PAGE, query.page ?? DEFAULT_PAGE);
  const limit = Math.min(
    maxLimit,
    Math.max(1, query.limit ?? defaultLimit),
  );

  return {
    page,
    limit,
    skip: (page - 1) * limit,
  };
}

export function paginatedSchema<T extends z.ZodRawShape>(fields: T) {
  return z.object({ ...fields, ...paginationQuerySchema.shape });
}
