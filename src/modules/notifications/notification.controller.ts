import type { Request, Response } from 'express';
import { sendSuccess } from '../../lib/response.js';
import { listNotificationsQuerySchema } from './notification.schema.js';
import * as notificationService from './notification.service.js';

export async function listNotifications(req: Request, res: Response) {
  const query = listNotificationsQuerySchema.parse(req.query);
  const data = await notificationService.listNotifications(query);
  sendSuccess(res, data);
}

export async function getUnreadCount(_req: Request, res: Response) {
  const data = await notificationService.getUnreadNotificationCount();
  sendSuccess(res, data);
}

export async function markNotificationRead(req: Request, res: Response) {
  const data = await notificationService.markNotificationRead(req.params.id);
  sendSuccess(res, data);
}

export async function markAllNotificationsRead(_req: Request, res: Response) {
  const data = await notificationService.markAllNotificationsRead();
  sendSuccess(res, data);
}
