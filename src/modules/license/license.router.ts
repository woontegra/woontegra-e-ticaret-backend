import { Router } from 'express';
import { requireAuth, requireRoles } from '../../middlewares/auth.middleware.js';
import { asyncHandler } from '../../utils/async-handler.js';
import { sendSuccess } from '../../lib/response.js';
import { fetchLicensePrograms, isLicenseServerConfigured } from './license-server.client.js';

export const licenseAdminRouter = Router();

const licenseAdminRoles = requireRoles(
  'SUPER_ADMIN',
  'ADMIN',
  'EDITOR',
  'STAFF',
);

licenseAdminRouter.use(requireAuth, licenseAdminRoles);

licenseAdminRouter.get(
  '/license-programs',
  asyncHandler(async (_req, res) => {
    if (!isLicenseServerConfigured()) {
      sendSuccess(res, { programs: [], error: null, configured: false });
      return;
    }

    const result = await fetchLicensePrograms(true);
    sendSuccess(res, {
      programs: result.programs,
      error: result.error ?? null,
      configured: true,
    });
  }),
);
