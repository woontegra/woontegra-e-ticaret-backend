import type { Request, Response } from 'express';
import { sendCreated, sendSuccess } from '../../lib/response.js';
import {
  customerLoginSchema,
  customerRegisterSchema,
} from './customer-auth.schema.js';
import * as customerAuthService from './customer-auth.service.js';

export async function register(req: Request, res: Response) {
  const input = customerRegisterSchema.parse(req.body);
  const data = await customerAuthService.registerCustomer(input);
  sendCreated(res, data);
}

export async function login(req: Request, res: Response) {
  const input = customerLoginSchema.parse(req.body);
  const data = await customerAuthService.loginCustomer(input);
  sendSuccess(res, data);
}

export async function me(req: Request, res: Response) {
  const data = await customerAuthService.getCustomerMe(req.customer!.id);
  sendSuccess(res, data);
}

export async function logout(_req: Request, res: Response) {
  sendSuccess(res, { success: true });
}
