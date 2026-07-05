import { ContactMessageStatus, FormSubmissionStatus } from '@prisma/client';
import { z } from 'zod';

const formFieldSchema = z.object({
  name: z
    .string()
    .min(1)
    .max(80)
    .regex(/^[a-zA-Z][a-zA-Z0-9_]*$/),
  label: z.string().min(1).max(120),
  type: z.enum(['text', 'email', 'tel', 'textarea', 'select']),
  required: z.boolean().optional(),
  options: z.array(z.string().min(1)).optional(),
});

export const submitContactSchema = z.object({
  name: z.string().min(2).max(120),
  email: z.string().email().max(200),
  phone: z.string().max(30).nullable().optional(),
  subject: z.string().max(200).nullable().optional(),
  message: z.string().min(5).max(5000),
  source: z.string().max(80).optional(),
});

export const listContactMessagesQuerySchema = z.object({
  status: z.nativeEnum(ContactMessageStatus).optional(),
  search: z.string().optional(),
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().max(100).optional(),
});

export const updateContactMessageStatusSchema = z.object({
  status: z.nativeEnum(ContactMessageStatus),
});

export const updateContactMessageNoteSchema = z.object({
  note: z.string().max(2000).nullable(),
});

export const replyContactMessageSchema = z.object({
  replyMessage: z.string().min(1).max(5000),
});

export const createFormDefinitionSchema = z.object({
  name: z.string().min(1).max(120),
  key: z
    .string()
    .min(2)
    .max(80)
    .regex(/^[a-z0-9-]+$/),
  fields: z.array(formFieldSchema).default([]),
  successMessage: z.string().max(500).nullable().optional(),
  submitButtonLabel: z.string().max(80).nullable().optional(),
  isActive: z.boolean().optional(),
});

export const updateFormDefinitionSchema = createFormDefinitionSchema.partial();

export const submitFormSchema = z.object({
  data: z.record(z.string(), z.unknown()),
});

export const updateFormSubmissionStatusSchema = z.object({
  status: z.nativeEnum(FormSubmissionStatus),
});

export type SubmitContactInput = z.infer<typeof submitContactSchema>;
export type ListContactMessagesQuery = z.infer<
  typeof listContactMessagesQuerySchema
>;
export type CreateFormDefinitionInput = z.infer<
  typeof createFormDefinitionSchema
>;
export type UpdateFormDefinitionInput = z.infer<
  typeof updateFormDefinitionSchema
>;
export type SubmitFormInput = z.infer<typeof submitFormSchema>;

export { formFieldSchema };
