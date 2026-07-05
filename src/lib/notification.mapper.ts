import type { Notification } from '@prisma/client';
import type { NotificationDto } from '../types/api.js';

export function toNotificationDto(notification: Notification): NotificationDto {
  return {
    id: notification.id,
    type: notification.type,
    title: notification.title,
    message: notification.message,
    entityType: notification.entityType,
    entityId: notification.entityId,
    isRead: notification.isRead,
    createdAt: notification.createdAt.toISOString(),
  };
}
