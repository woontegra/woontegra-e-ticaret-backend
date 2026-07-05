import { z } from 'zod';
import { Router } from 'express';
import { SaasMembershipStatus } from '@prisma/client';
import { requireAuth, requireRoles } from '../../middlewares/auth.middleware.js';
import { asyncHandler } from '../../utils/async-handler.js';
import { sendSuccess } from '../../lib/response.js';
import { listSaasMemberships } from './saas-fulfillment.service.js';

export const saasAdminRouter = Router();

const saasAdminRoles = requireRoles(
  'SUPER_ADMIN',
  'ADMIN',
  'EDITOR',
  'STAFF',
);

const listSaasMembershipsQuerySchema = z.object({
  status: z.nativeEnum(SaasMembershipStatus).optional(),
  saasAppCode: z.string().optional(),
  customer: z.string().optional(),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().max(100).optional(),
});

saasAdminRouter.use(requireAuth, saasAdminRoles);

saasAdminRouter.get(
  '/saas-memberships',
  asyncHandler(async (req, res) => {
    const query = listSaasMembershipsQuerySchema.parse(req.query);
    const data = await listSaasMemberships(query);
    sendSuccess(res, data);
  }),
);
