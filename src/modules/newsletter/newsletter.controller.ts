import type { Request, Response } from 'express';
import { sendCreated } from '../../lib/response.js';
import { subscribeNewsletterSchema } from './newsletter.schema.js';
import * as newsletterService from './newsletter.service.js';

export async function subscribe(req: Request, res: Response) {
  const input = subscribeNewsletterSchema.parse(req.body);
  const data = await newsletterService.subscribeNewsletter(input);
  sendCreated(res, data);
}
