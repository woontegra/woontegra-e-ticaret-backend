import type { Request, Response } from 'express';
import { sendCreated, sendSuccess } from '../../lib/response.js';
import {
  createFormDefinitionSchema,
  listContactMessagesQuerySchema,
  replyContactMessageSchema,
  submitContactSchema,
  submitFormSchema,
  updateContactMessageNoteSchema,
  updateContactMessageStatusSchema,
  updateFormDefinitionSchema,
  updateFormSubmissionStatusSchema,
} from './contact.schema.js';
import * as contactMessageService from './contact-message.service.js';
import * as formDefinitionService from './form-definition.service.js';

export async function submitContact(req: Request, res: Response) {
  const input = submitContactSchema.parse(req.body);
  const data = await contactMessageService.submitContactMessage(input);
  sendCreated(res, data);
}

export async function listContactMessages(req: Request, res: Response) {
  const query = listContactMessagesQuerySchema.parse(req.query);
  const data = await contactMessageService.listContactMessages(query);
  sendSuccess(res, data);
}

export async function getContactMessage(req: Request, res: Response) {
  const data = await contactMessageService.markContactMessageRead(req.params.id);
  sendSuccess(res, data);
}

export async function updateContactMessageStatus(req: Request, res: Response) {
  const input = updateContactMessageStatusSchema.parse(req.body);
  const data = await contactMessageService.updateContactMessageStatus(
    req.params.id,
    input.status,
  );
  sendSuccess(res, data);
}

export async function updateContactMessageNote(req: Request, res: Response) {
  const input = updateContactMessageNoteSchema.parse(req.body);
  const data = await contactMessageService.updateContactMessageNote(
    req.params.id,
    input.note,
  );
  sendSuccess(res, data);
}

export async function replyContactMessage(req: Request, res: Response) {
  const input = replyContactMessageSchema.parse(req.body);
  const data = await contactMessageService.replyToContactMessage(
    req.params.id,
    input.replyMessage,
  );
  sendSuccess(res, data);
}

export async function listFormDefinitions(_req: Request, res: Response) {
  const data = await formDefinitionService.listFormDefinitions();
  sendSuccess(res, data);
}

export async function getFormDefinition(req: Request, res: Response) {
  const data = await formDefinitionService.getFormDefinitionById(req.params.id);
  sendSuccess(res, data);
}

export async function createFormDefinition(req: Request, res: Response) {
  const input = createFormDefinitionSchema.parse(req.body);
  const data = await formDefinitionService.createFormDefinition(input);
  sendCreated(res, data);
}

export async function updateFormDefinition(req: Request, res: Response) {
  const input = updateFormDefinitionSchema.parse(req.body);
  const data = await formDefinitionService.updateFormDefinition(
    req.params.id,
    input,
  );
  sendSuccess(res, data);
}

export async function deleteFormDefinition(req: Request, res: Response) {
  await formDefinitionService.deleteFormDefinition(req.params.id);
  sendSuccess(res, { ok: true });
}

export async function getPublicForm(req: Request, res: Response) {
  const data = await formDefinitionService.getPublicFormByKey(req.params.key);
  sendSuccess(res, data);
}

export async function submitPublicForm(req: Request, res: Response) {
  const input = submitFormSchema.parse(req.body);
  const data = await formDefinitionService.submitFormByKey(
    req.params.key,
    input,
  );
  sendCreated(res, data);
}

export async function listFormSubmissions(req: Request, res: Response) {
  const formId =
    typeof req.query.formId === 'string' ? req.query.formId : undefined;
  const data = await formDefinitionService.listFormSubmissions(formId);
  sendSuccess(res, data);
}

export async function updateFormSubmissionStatus(req: Request, res: Response) {
  const input = updateFormSubmissionStatusSchema.parse(req.body);
  const data = await formDefinitionService.updateFormSubmissionStatus(
    req.params.id,
    input.status,
  );
  sendSuccess(res, data);
}
