import type { Prisma } from '@prisma/client';
import { ContactMessageStatus } from '@prisma/client';
import { AppError } from '../../lib/app-error.js';
import {
  toContactMessageDto,
  toContactMessageSummaryDto,
} from '../../lib/contact.mapper.js';
import { prisma } from '../../lib/prisma.js';
import { SETTINGS_SINGLETON_ID } from '../../types/api.js';
import { sendTemplateMail } from '../mail/mail.service.js';
import { notifyNewContactMessage } from '../notifications/notification.service.js';
import type {
  ListContactMessagesQuery,
  SubmitContactInput,
} from './contact.schema.js';

function buildWhere(query: ListContactMessagesQuery): Prisma.ContactMessageWhereInput {
  return {
    ...(query.status ? { status: query.status } : {}),
    ...(query.search
      ? {
          OR: [
            { name: { contains: query.search, mode: 'insensitive' } },
            { email: { contains: query.search, mode: 'insensitive' } },
            { subject: { contains: query.search, mode: 'insensitive' } },
          ],
        }
      : {}),
  };
}

export async function submitContactMessage(input: SubmitContactInput) {
  const message = await prisma.contactMessage.create({
    data: {
      name: input.name,
      email: input.email,
      phone: input.phone ?? null,
      subject: input.subject ?? null,
      message: input.message,
      source: input.source ?? 'contact_page',
    },
  });

  notifyNewContactMessage(message);

  return toContactMessageDto(message);
}

export async function listContactMessages(query: ListContactMessagesQuery) {
  const where = buildWhere(query);
  const page = query.page ?? 1;
  const limit = query.limit ?? 20;
  const skip = (page - 1) * limit;

  const [items, total] = await Promise.all([
    prisma.contactMessage.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    }),
    prisma.contactMessage.count({ where }),
  ]);

  return {
    items: items.map(toContactMessageSummaryDto),
    total,
  };
}

export async function getContactMessageById(id: string) {
  const message = await prisma.contactMessage.findUnique({ where: { id } });
  if (!message) throw AppError.notFound('Contact message not found');
  return toContactMessageDto(message);
}

export async function updateContactMessageStatus(
  id: string,
  status: ContactMessageStatus,
) {
  const existing = await prisma.contactMessage.findUnique({ where: { id } });
  if (!existing) throw AppError.notFound('Contact message not found');

  const message = await prisma.contactMessage.update({
    where: { id },
    data: {
      status,
      ...(status === 'READ' && existing.status === 'NEW' ? {} : {}),
    },
  });

  return toContactMessageDto(message);
}

export async function updateContactMessageNote(
  id: string,
  adminNote: string | null,
) {
  const existing = await prisma.contactMessage.findUnique({ where: { id } });
  if (!existing) throw AppError.notFound('Contact message not found');

  const message = await prisma.contactMessage.update({
    where: { id },
    data: { adminNote },
  });

  return toContactMessageDto(message);
}

export async function replyToContactMessage(
  id: string,
  replyMessage: string,
) {
  const existing = await prisma.contactMessage.findUnique({ where: { id } });
  if (!existing) throw AppError.notFound('Contact message not found');

  const site = await prisma.siteSetting.findUnique({
    where: { id: SETTINGS_SINGLETON_ID },
  });

  const mailResult = await sendTemplateMail('CONTACT_REPLY', existing.email, {
    name: existing.name,
    message: existing.message,
    replyMessage,
    siteName: site?.siteName || 'Woontegra',
  });

  const message = await prisma.contactMessage.update({
    where: { id },
    data: {
      status: ContactMessageStatus.REPLIED,
      repliedAt: new Date(),
    },
  });

  return {
    message: toContactMessageDto(message),
    mail: mailResult,
  };
}

export async function markContactMessageRead(id: string) {
  const message = await prisma.contactMessage.findUnique({ where: { id } });
  if (!message) throw AppError.notFound('Contact message not found');

  if (message.status === ContactMessageStatus.NEW) {
    const updated = await prisma.contactMessage.update({
      where: { id },
      data: { status: ContactMessageStatus.READ },
    });
    return toContactMessageDto(updated);
  }

  return toContactMessageDto(message);
}
