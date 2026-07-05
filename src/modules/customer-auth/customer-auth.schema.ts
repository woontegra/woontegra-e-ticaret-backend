import { z } from 'zod';

export const customerRegisterSchema = z.object({
  name: z.string().min(2).max(120),
  email: z.string().email().max(200),
  password: z.string().min(8).max(128),
  phone: z.string().min(7).max(30).optional(),
});

export const customerLoginSchema = z.object({
  email: z.string().email().max(200),
  password: z.string().min(1).max(128),
});

export type CustomerRegisterInput = z.infer<typeof customerRegisterSchema>;
export type CustomerLoginInput = z.infer<typeof customerLoginSchema>;
