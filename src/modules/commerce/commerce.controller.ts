import type { Request, Response } from 'express';
import { AUDIT_ACTIONS, auditFromRequest } from '../../lib/audit.js';
import { resolveCartSessionId } from '../../lib/cart-session.js';
import { sendCreated, sendSuccess } from '../../lib/response.js';
import {
  addCartItemSchema,
  updateCartItemSchema,
} from './cart.schema.js';
import * as cartService from './cart.service.js';
import { checkoutSchema } from './checkout.schema.js';
import * as checkoutService from './checkout.service.js';
import {
  listOrdersQuerySchema,
  publicOrderQuerySchema,
  updateOrderAdminNoteSchema,
  updateOrderPaymentStatusSchema,
  updateOrderShippingStatusSchema,
  updateOrderStatusSchema,
} from './order.schema.js';
import * as orderService from './order.service.js';
import { updateOrderShipmentSchema } from '../shipping/shipping.schema.js';
import * as shipmentService from '../shipping/shipment.service.js';
import {
  applyCartCoupon,
  removeCartCoupon,
} from '../promotion/promotion.controller.js';

export async function getCart(req: Request, res: Response) {
  const sessionId = resolveCartSessionId(req, res);
  const data = await cartService.getCart(sessionId);
  sendSuccess(res, data);
}

export async function addCartItem(req: Request, res: Response) {
  const sessionId = resolveCartSessionId(req, res);
  const input = addCartItemSchema.parse(req.body);
  const data = await cartService.addCartItem(sessionId, input);
  sendCreated(res, data);
}

export async function updateCartItem(req: Request, res: Response) {
  const sessionId = resolveCartSessionId(req, res);
  const input = updateCartItemSchema.parse(req.body);
  const data = await cartService.updateCartItem(
    sessionId,
    req.params.id,
    input,
  );
  sendSuccess(res, data);
}

export async function removeCartItem(req: Request, res: Response) {
  const sessionId = resolveCartSessionId(req, res);
  const data = await cartService.removeCartItem(sessionId, req.params.id);
  sendSuccess(res, data);
}

export { applyCartCoupon, removeCartCoupon };

export async function checkout(req: Request, res: Response) {
  const sessionId = resolveCartSessionId(req, res);
  const input = checkoutSchema.parse(req.body);
  const data = await checkoutService.checkout(sessionId, input);
  sendCreated(res, data);
}

export async function getPublicOrder(req: Request, res: Response) {
  const query = publicOrderQuerySchema.parse(req.query);
  const data = await checkoutService.getPublicOrderByNumber(
    req.params.orderNumber,
    query.email,
  );
  sendSuccess(res, data);
}

export async function getPublicOrderDownloads(req: Request, res: Response) {
  const query = publicOrderQuerySchema.parse(req.query);
  const data = await checkoutService.getPublicOrderDownloads(
    req.params.orderNumber,
    query.email,
  );
  sendSuccess(res, data);
}

export async function listOrders(req: Request, res: Response) {
  const query = listOrdersQuerySchema.parse(req.query);
  const data = await orderService.listOrders(query);
  sendSuccess(res, data);
}

export async function getOrder(req: Request, res: Response) {
  const data = await orderService.getOrderById(req.params.id);
  sendSuccess(res, data);
}

export async function updateOrderStatus(req: Request, res: Response) {
  const before = await orderService.getOrderById(req.params.id);
  const input = updateOrderStatusSchema.parse(req.body);
  const data = await orderService.updateOrderStatus(req.params.id, input.status);
  auditFromRequest(req, {
    action: AUDIT_ACTIONS.ORDER_STATUS_UPDATE,
    module: 'commerce',
    entityType: 'order',
    entityId: data.id,
    beforeData: { status: before.status, orderNumber: before.orderNumber },
    afterData: { status: data.status, orderNumber: data.orderNumber },
  });
  sendSuccess(res, data);
}

export async function updateOrderPaymentStatus(req: Request, res: Response) {
  const input = updateOrderPaymentStatusSchema.parse(req.body);
  const data = await orderService.updateOrderPaymentStatus(
    req.params.id,
    input.paymentStatus,
  );
  sendSuccess(res, data);
}

export async function updateOrderShippingStatus(req: Request, res: Response) {
  const input = updateOrderShippingStatusSchema.parse(req.body);
  const data = await orderService.updateOrderShippingStatus(
    req.params.id,
    input.shippingStatus,
  );
  sendSuccess(res, data);
}

export async function updateOrderAdminNote(req: Request, res: Response) {
  const input = updateOrderAdminNoteSchema.parse(req.body);
  const data = await orderService.updateOrderAdminNote(
    req.params.id,
    input.note,
  );
  sendSuccess(res, data);
}

export async function updateOrderShipment(req: Request, res: Response) {
  const input = updateOrderShipmentSchema.parse(req.body);
  const data = await shipmentService.upsertOrderShipment(
    req.params.id,
    input,
  );
  sendSuccess(res, data);
}

export async function retryOrderDigitalDelivery(req: Request, res: Response) {
  const data = await orderService.retryOrderDigitalDelivery(req.params.id);
  sendSuccess(res, data);
}
