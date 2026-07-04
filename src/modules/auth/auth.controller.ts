import type { Request, Response } from 'express';
import { sendSuccess } from '../../lib/response.js';
import { loginSchema } from './auth.schema.js';
import * as authService from './auth.service.js';

export async function login(req: Request, res: Response) {
  const input = loginSchema.parse(req.body);
  const result = await authService.login(input);
  sendSuccess(res, result);
}

export async function me(req: Request, res: Response) {
  const result = await authService.getMe(req.user!.id);
  sendSuccess(res, result);
}

export async function logout(_req: Request, res: Response) {
  const result = await authService.logout();
  sendSuccess(res, result);
}
