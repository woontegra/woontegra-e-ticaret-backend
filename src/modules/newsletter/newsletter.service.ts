import { AppError } from '../../lib/app-error.js';
import { prisma } from '../../lib/prisma.js';
import type { SubscribeNewsletterInput } from './newsletter.schema.js';

export async function subscribeNewsletter(input: SubscribeNewsletterInput) {
  try {
    await prisma.newsletterSubscriber.create({
      data: {
        email: input.email.toLowerCase().trim(),
        source: input.source ?? null,
      },
    });
    return { ok: true as const };
  } catch {
    const existing = await prisma.newsletterSubscriber.findUnique({
      where: { email: input.email.toLowerCase().trim() },
    });

    if (existing) {
      return { ok: true as const, alreadySubscribed: true as const };
    }

    throw AppError.badRequest('Abonelik kaydedilemedi');
  }
}
