import type { Request, Response } from 'express';
import { AUDIT_ACTIONS, auditFromRequest } from '../../lib/audit.js';
import { sendSuccess } from '../../lib/response.js';
import { updatePaymentMethodSchema } from './payment.schema.js';
import * as paymentMethodService from './payment-method.service.js';

export async function listPaymentMethods(_req: Request, res: Response) {
  const data = await paymentMethodService.listPaymentMethods();
  sendSuccess(res, data);
}

export async function getPaymentMethod(req: Request, res: Response) {
  const data = await paymentMethodService.getPaymentMethodById(req.params.id);
  sendSuccess(res, data);
}

export async function updatePaymentMethod(req: Request, res: Response) {
  const before = await paymentMethodService.getPaymentMethodById(req.params.id);
  const input = updatePaymentMethodSchema.parse(req.body);
  const data = await paymentMethodService.updatePaymentMethod(
    req.params.id,
    input,
  );
  auditFromRequest(req, {
    action: AUDIT_ACTIONS.PAYMENT_SETTING_UPDATE,
    module: 'payment',
    entityType: 'payment_method',
    entityId: data.id,
    beforeData: { name: before.name, isActive: before.isActive, isTestMode: before.isTestMode },
    afterData: { name: data.name, isActive: data.isActive, isTestMode: data.isTestMode },
  });
  sendSuccess(res, data);
}

export async function listPublicPaymentMethods(_req: Request, res: Response) {
  const data = await paymentMethodService.listPublicPaymentMethods();
  sendSuccess(res, data);
}
