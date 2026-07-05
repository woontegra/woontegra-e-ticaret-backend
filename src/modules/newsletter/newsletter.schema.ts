import { z } from 'zod';

export const subscribeNewsletterSchema = z.object({
  email: z.string().email().max(200),
  source: z.string().max(80).optional(),
});

export type SubscribeNewsletterInput = z.infer<typeof subscribeNewsletterSchema>;
