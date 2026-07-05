import type { Request, Response } from 'express';
import { getClientIp } from '../../lib/client-ip.js';
import { AppError } from '../../lib/app-error.js';
import { sendCreated, sendSuccess } from '../../lib/response.js';
import { updatePaymentMethodSchema, paytrStartSchema } from './payment.schema.js';
import * as paymentMethodService from './payment-method.service.js';
import { handlePaytrCallback, startPaytrPayment } from './paytr.service.js';
import { AUDIT_ACTIONS, auditFromRequest } from '../../lib/audit.js';

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

export async function startPaytrPaymentHandler(req: Request, res: Response) {
  const input = paytrStartSchema.parse(req.body);
  const data = await startPaytrPayment({
    orderNumber: input.orderNumber,
    customerEmail: input.email,
    clientIp: getClientIp(req),
  });
  sendCreated(res, data);
}

export async function paytrCallbackHandler(req: Request, res: Response) {
  const raw = req.body as Record<string, unknown>;
  const payload: Record<string, string> = {};
  for (const [key, value] of Object.entries(raw ?? {})) {
    payload[key] = value === undefined || value === null ? '' : String(value);
  }

  try {
    await handlePaytrCallback(payload);
    res.type('text/plain').send('OK');
  } catch (error) {
    const status = error instanceof AppError ? error.statusCode : 500;
    const message = error instanceof AppError ? error.message : 'Hata';
    res.status(status).type('text/plain').send(message);
  }
}
