import type { Request, Response } from 'express';
import { AUDIT_ACTIONS, auditFromRequest } from '../../lib/audit.js';
import { sendCreated, sendSuccess } from '../../lib/response.js';
import {
  createShippingCarrierSchema,
  createShippingMethodSchema,
  updateShippingCarrierSchema,
  updateShippingMethodSchema,
} from './shipping.schema.js';
import * as shippingCarrierService from './shipping-carrier.service.js';
import * as shippingMethodService from './shipping-method.service.js';

export async function listShippingCarriers(_req: Request, res: Response) {
  const data = await shippingCarrierService.listShippingCarriers();
  sendSuccess(res, data);
}

export async function getShippingCarrier(req: Request, res: Response) {
  const data = await shippingCarrierService.getShippingCarrierById(
    req.params.id,
  );
  sendSuccess(res, data);
}

export async function createShippingCarrier(req: Request, res: Response) {
  const input = createShippingCarrierSchema.parse(req.body);
  const data = await shippingCarrierService.createShippingCarrier(input);
  sendCreated(res, data);
}

export async function updateShippingCarrier(req: Request, res: Response) {
  const before = await shippingCarrierService.getShippingCarrierById(
    req.params.id,
  );
  const input = updateShippingCarrierSchema.parse(req.body);
  const data = await shippingCarrierService.updateShippingCarrier(
    req.params.id,
    input,
  );
  auditFromRequest(req, {
    action: AUDIT_ACTIONS.SHIPPING_SETTING_UPDATE,
    module: 'shipping',
    entityType: 'shipping_carrier',
    entityId: data.id,
    beforeData: { name: before.name, isActive: before.isActive },
    afterData: { name: data.name, isActive: data.isActive },
  });
  sendSuccess(res, data);
}

export async function deleteShippingCarrier(req: Request, res: Response) {
  await shippingCarrierService.deleteShippingCarrier(req.params.id);
  sendSuccess(res, { ok: true });
}

export async function listShippingMethods(_req: Request, res: Response) {
  const data = await shippingMethodService.listShippingMethods();
  sendSuccess(res, data);
}

export async function getShippingMethod(req: Request, res: Response) {
  const data = await shippingMethodService.getShippingMethodById(req.params.id);
  sendSuccess(res, data);
}

export async function createShippingMethod(req: Request, res: Response) {
  const input = createShippingMethodSchema.parse(req.body);
  const data = await shippingMethodService.createShippingMethod(input);
  sendCreated(res, data);
}

export async function updateShippingMethod(req: Request, res: Response) {
  const before = await shippingMethodService.getShippingMethodById(req.params.id);
  const input = updateShippingMethodSchema.parse(req.body);
  const data = await shippingMethodService.updateShippingMethod(
    req.params.id,
    input,
  );
  auditFromRequest(req, {
    action: AUDIT_ACTIONS.SHIPPING_SETTING_UPDATE,
    module: 'shipping',
    entityType: 'shipping_method',
    entityId: data.id,
    beforeData: { name: before.name, isActive: before.isActive, price: before.price },
    afterData: { name: data.name, isActive: data.isActive, price: data.price },
  });
  sendSuccess(res, data);
}

export async function deleteShippingMethod(req: Request, res: Response) {
  await shippingMethodService.deleteShippingMethod(req.params.id);
  sendSuccess(res, { ok: true });
}

export async function listActiveShippingCarriers(_req: Request, res: Response) {
  const data = await shippingCarrierService.listActiveShippingCarriers();
  sendSuccess(res, data);
}
