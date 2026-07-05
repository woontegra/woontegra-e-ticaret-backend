import { z } from 'zod';

export const checkoutSchema = z.object({
  customerName: z.string().min(2).max(120),
  customerEmail: z.string().email().max(200),
  customerPhone: z.string().min(7).max(30),
  note: z.string().max(1000).nullable().optional(),
});

export type CheckoutInput = z.infer<typeof checkoutSchema>;
