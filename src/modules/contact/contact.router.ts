import { Router } from 'express';
import { requireAuth, requireRoles } from '../../middlewares/auth.middleware.js';
import { asyncHandler } from '../../utils/async-handler.js';
import * as contactController from './contact.controller.js';

export const contactPublicRouter = Router();
export const contactMessagesAdminRouter = Router();
export const formDefinitionsAdminRouter = Router();
export const formSubmissionsAdminRouter = Router();

const staffRoles = requireRoles(
  'SUPER_ADMIN',
  'ADMIN',
  'ADMIN',
  'STAFF',
);
const adminRoles = requireRoles('SUPER_ADMIN', 'ADMIN', 'EDITOR');

contactPublicRouter.post(
  '/',
  asyncHandler(contactController.submitContact),
);
contactPublicRouter.get(
  '/forms/:key',
  asyncHandler(contactController.getPublicForm),
);
contactPublicRouter.post(
  '/forms/:key/submit',
  asyncHandler(contactController.submitPublicForm),
);

contactMessagesAdminRouter.use(requireAuth, staffRoles);
contactMessagesAdminRouter.get(
  '/',
  asyncHandler(contactController.listContactMessages),
);
contactMessagesAdminRouter.get(
  '/:id',
  asyncHandler(contactController.getContactMessage),
);
contactMessagesAdminRouter.patch(
  '/:id/status',
  asyncHandler(contactController.updateContactMessageStatus),
);
contactMessagesAdminRouter.patch(
  '/:id/note',
  asyncHandler(contactController.updateContactMessageNote),
);
contactMessagesAdminRouter.post(
  '/:id/reply',
  asyncHandler(contactController.replyContactMessage),
);

formDefinitionsAdminRouter.use(requireAuth, adminRoles);
formDefinitionsAdminRouter.get(
  '/',
  asyncHandler(contactController.listFormDefinitions),
);
formDefinitionsAdminRouter.post(
  '/',
  asyncHandler(contactController.createFormDefinition),
);
formDefinitionsAdminRouter.get(
  '/:id',
  asyncHandler(contactController.getFormDefinition),
);
formDefinitionsAdminRouter.put(
  '/:id',
  asyncHandler(contactController.updateFormDefinition),
);
formDefinitionsAdminRouter.delete(
  '/:id',
  asyncHandler(contactController.deleteFormDefinition),
);

formSubmissionsAdminRouter.use(requireAuth, staffRoles);
formSubmissionsAdminRouter.get(
  '/',
  asyncHandler(contactController.listFormSubmissions),
);
formSubmissionsAdminRouter.patch(
  '/:id/status',
  asyncHandler(contactController.updateFormSubmissionStatus),
);
