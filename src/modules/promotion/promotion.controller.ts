import type { Request, Response } from 'express';
import { sendCreated, sendSuccess } from '../../lib/response.js';
import { resolveCartSessionId } from '../../lib/cart-session.js';
import * as cartService from '../commerce/cart.service.js';
import {
  applyCouponSchema,
  createCampaignSchema,
  createCouponSchema,
  updateCampaignSchema,
  updateCouponSchema,
} from './promotion.schema.js';
import * as campaignService from './campaign.service.js';
import * as couponService from './coupon.service.js';
import * as cartCouponService from './cart-coupon.service.js';

export async function listCoupons(_req: Request, res: Response) {
  const data = await couponService.listCoupons();
  sendSuccess(res, data);
}

export async function createCoupon(req: Request, res: Response) {
  const input = createCouponSchema.parse(req.body);
  const data = await couponService.createCoupon(input);
  sendCreated(res, data);
}

export async function updateCoupon(req: Request, res: Response) {
  const input = updateCouponSchema.parse(req.body);
  const data = await couponService.updateCoupon(req.params.id, input);
  sendSuccess(res, data);
}

export async function deleteCoupon(req: Request, res: Response) {
  await couponService.deleteCoupon(req.params.id);
  sendSuccess(res, { ok: true });
}

export async function listCampaigns(_req: Request, res: Response) {
  const data = await campaignService.listCampaigns();
  sendSuccess(res, data);
}

export async function createCampaign(req: Request, res: Response) {
  const input = createCampaignSchema.parse(req.body);
  const data = await campaignService.createCampaign(input);
  sendCreated(res, data);
}

export async function updateCampaign(req: Request, res: Response) {
  const input = updateCampaignSchema.parse(req.body);
  const data = await campaignService.updateCampaign(req.params.id, input);
  sendSuccess(res, data);
}

export async function deleteCampaign(req: Request, res: Response) {
  await campaignService.deleteCampaign(req.params.id);
  sendSuccess(res, { ok: true });
}

export async function listPublicCampaigns(_req: Request, res: Response) {
  const data = await campaignService.listActiveCampaigns();
  sendSuccess(res, data);
}

export async function getPublicCampaign(req: Request, res: Response) {
  const data = await campaignService.getPublicCampaignById(req.params.id);
  sendSuccess(res, data);
}

export async function applyCartCoupon(req: Request, res: Response) {
  const sessionId = resolveCartSessionId(req, res);
  const input = applyCouponSchema.parse(req.body);
  const cart = await cartService.getCartRecordBySession(sessionId);
  await cartCouponService.applyCouponToCart(cart.id, input.code);
  const data = await cartService.getCart(sessionId);
  sendSuccess(res, data);
}

export async function removeCartCoupon(req: Request, res: Response) {
  const sessionId = resolveCartSessionId(req, res);
  const cart = await cartService.getCartRecordBySession(sessionId);
  await cartCouponService.removeCouponFromCart(cart.id);
  const data = await cartService.getCart(sessionId);
  sendSuccess(res, data);
}
