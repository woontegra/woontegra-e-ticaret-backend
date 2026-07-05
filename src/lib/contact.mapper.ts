import type { ContactMessage, FormDefinition, FormSubmission } from '@prisma/client';
import type {
  ContactMessageDto,
  ContactMessageSummaryDto,
  FormDefinitionDto,
  FormDefinitionPublicDto,
  FormFieldDefinitionDto,
  FormSubmissionDto,
} from '../types/api.js';

export function toContactMessageDto(message: ContactMessage): ContactMessageDto {
  return {
    id: message.id,
    name: message.name,
    email: message.email,
    phone: message.phone,
    subject: message.subject,
    message: message.message,
    status: message.status,
    adminNote: message.adminNote,
    repliedAt: message.repliedAt?.toISOString() ?? null,
    source: message.source,
    formKey: message.formKey,
    createdAt: message.createdAt.toISOString(),
    updatedAt: message.updatedAt.toISOString(),
  };
}

export function toContactMessageSummaryDto(
  message: ContactMessage,
): ContactMessageSummaryDto {
  return {
    id: message.id,
    name: message.name,
    email: message.email,
    subject: message.subject,
    status: message.status,
    source: message.source,
    createdAt: message.createdAt.toISOString(),
  };
}

function parseFormFields(value: unknown): FormFieldDefinitionDto[] {
  if (!Array.isArray(value)) return [];
  const fields: FormFieldDefinitionDto[] = [];
  for (const item of value) {
    if (typeof item !== 'object' || item === null || !('name' in item)) continue;
    const record = item as Record<string, unknown>;
    if (typeof record.name !== 'string' || typeof record.label !== 'string') {
      continue;
    }
    const type = record.type;
    if (
      type !== 'text' &&
      type !== 'email' &&
      type !== 'tel' &&
      type !== 'textarea' &&
      type !== 'select'
    ) {
      continue;
    }
    fields.push({
      name: record.name,
      label: record.label,
      type,
      required: Boolean(record.required),
      options: Array.isArray(record.options)
        ? record.options.filter((o): o is string => typeof o === 'string')
        : undefined,
    });
  }
  return fields;
}

export function toFormDefinitionDto(form: FormDefinition): FormDefinitionDto {
  return {
    id: form.id,
    name: form.name,
    key: form.key,
    fields: parseFormFields(form.fields),
    successMessage: form.successMessage,
    submitButtonLabel: form.submitButtonLabel,
    isActive: form.isActive,
    createdAt: form.createdAt.toISOString(),
    updatedAt: form.updatedAt.toISOString(),
  };
}

export function toFormDefinitionPublicDto(
  form: FormDefinition,
): FormDefinitionPublicDto {
  const dto = toFormDefinitionDto(form);
  return {
    id: dto.id,
    name: dto.name,
    key: dto.key,
    fields: dto.fields,
    successMessage: dto.successMessage,
    submitButtonLabel: dto.submitButtonLabel,
  };
}

export function toFormSubmissionDto(
  submission: FormSubmission & { form?: FormDefinition | null },
): FormSubmissionDto {
  return {
    id: submission.id,
    formId: submission.formId,
    formName: submission.form?.name ?? null,
    formKey: submission.form?.key ?? null,
    data: submission.data as Record<string, unknown>,
    status: submission.status,
    createdAt: submission.createdAt.toISOString(),
    updatedAt: submission.updatedAt.toISOString(),
  };
}
