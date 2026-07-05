import type { Prisma } from '@prisma/client';
import { FormSubmissionStatus } from '@prisma/client';
import { AppError } from '../../lib/app-error.js';
import {
  toFormDefinitionDto,
  toFormDefinitionPublicDto,
  toFormSubmissionDto,
} from '../../lib/contact.mapper.js';
import { prisma } from '../../lib/prisma.js';
import type {
  CreateFormDefinitionInput,
  SubmitFormInput,
  UpdateFormDefinitionInput,
} from './contact.schema.js';
import { formFieldSchema } from './contact.schema.js';

async function ensureUniqueFormKey(key: string, excludeId?: string) {
  const existing = await prisma.formDefinition.findFirst({
    where: {
      key,
      ...(excludeId ? { NOT: { id: excludeId } } : {}),
    },
  });
  if (existing) throw AppError.badRequest('Form key already exists');
}

function validateFields(fields: unknown) {
  return formFieldSchema.array().parse(fields);
}

export async function listFormDefinitions() {
  const forms = await prisma.formDefinition.findMany({
    orderBy: { name: 'asc' },
  });
  return forms.map(toFormDefinitionDto);
}

export async function getFormDefinitionById(id: string) {
  const form = await prisma.formDefinition.findUnique({ where: { id } });
  if (!form) throw AppError.notFound('Form not found');
  return toFormDefinitionDto(form);
}

export async function getPublicFormByKey(key: string) {
  const form = await prisma.formDefinition.findFirst({
    where: { key, isActive: true },
  });
  if (!form) throw AppError.notFound('Form not found');
  return toFormDefinitionPublicDto(form);
}

export async function createFormDefinition(input: CreateFormDefinitionInput) {
  await ensureUniqueFormKey(input.key);
  const fields = validateFields(input.fields ?? []);

  const form = await prisma.formDefinition.create({
    data: {
      name: input.name,
      key: input.key,
      fields: fields as unknown as Prisma.InputJsonValue,
      isActive: input.isActive ?? true,
    },
  });

  return toFormDefinitionDto(form);
}

export async function updateFormDefinition(
  id: string,
  input: UpdateFormDefinitionInput,
) {
  const existing = await prisma.formDefinition.findUnique({ where: { id } });
  if (!existing) throw AppError.notFound('Form not found');

  if (input.key && input.key !== existing.key) {
    await ensureUniqueFormKey(input.key, id);
  }

  const fields =
    input.fields !== undefined ? validateFields(input.fields) : undefined;

  const form = await prisma.formDefinition.update({
    where: { id },
    data: {
      ...(input.name !== undefined ? { name: input.name } : {}),
      ...(input.key !== undefined ? { key: input.key } : {}),
      ...(fields !== undefined
        ? { fields: fields as unknown as Prisma.InputJsonValue }
        : {}),
      ...(input.isActive !== undefined ? { isActive: input.isActive } : {}),
    },
  });

  return toFormDefinitionDto(form);
}

export async function deleteFormDefinition(id: string) {
  const existing = await prisma.formDefinition.findUnique({ where: { id } });
  if (!existing) throw AppError.notFound('Form not found');
  await prisma.formDefinition.delete({ where: { id } });
}

export async function submitFormByKey(key: string, input: SubmitFormInput) {
  const form = await prisma.formDefinition.findFirst({
    where: { key, isActive: true },
  });
  if (!form) throw AppError.notFound('Form not found');

  const fields = validateFields(form.fields);
  const data: Record<string, string> = {};

  for (const field of fields) {
    const raw = input.data[field.name];
    const value =
      raw === null || raw === undefined ? '' : String(raw).trim();

    if (field.required && !value) {
      throw AppError.badRequest(`Field "${field.label}" is required`);
    }

    if (value) {
      if (field.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
        throw AppError.badRequest(`Field "${field.label}" must be a valid email`);
      }
      data[field.name] = value;
    }
  }

  const submission = await prisma.formSubmission.create({
    data: {
      formId: form.id,
      data,
      status: FormSubmissionStatus.NEW,
    },
    include: { form: true },
  });

  const name = data.name ?? data.fullName ?? data.ad ?? 'Ziyaretçi';
  const email = data.email ?? data.eposta ?? '';
  const phone = data.phone ?? data.telefon ?? null;
  const subject = data.subject ?? data.konu ?? form.name;
  const message =
    data.message ??
    data.mesaj ??
    Object.entries(data)
      .filter(([key]) => !['name', 'fullName', 'ad', 'email', 'eposta', 'phone', 'telefon', 'subject', 'konu'].includes(key))
      .map(([key, val]) => `${key}: ${val}`)
      .join('\n');

  if (email && message) {
    await prisma.contactMessage.create({
      data: {
        name: String(name),
        email: String(email),
        phone: phone ? String(phone) : null,
        subject: subject ? String(subject) : null,
        message: String(message),
        source: 'form_submission',
        formKey: form.key,
      },
    });
  }

  return toFormSubmissionDto(submission);
}

export async function listFormSubmissions(formId?: string) {
  const submissions = await prisma.formSubmission.findMany({
    where: formId ? { formId } : undefined,
    orderBy: { createdAt: 'desc' },
    take: 100,
    include: { form: true },
  });
  return submissions.map(toFormSubmissionDto);
}

export async function updateFormSubmissionStatus(
  id: string,
  status: FormSubmissionStatus,
) {
  const existing = await prisma.formSubmission.findUnique({ where: { id } });
  if (!existing) throw AppError.notFound('Form submission not found');

  const submission = await prisma.formSubmission.update({
    where: { id },
    data: { status },
    include: { form: true },
  });

  return toFormSubmissionDto(submission);
}
