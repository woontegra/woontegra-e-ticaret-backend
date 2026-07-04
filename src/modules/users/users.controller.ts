import type { Request, Response } from 'express';
import { AppError } from '../../lib/app-error.js';
import { canViewUsers } from '../../lib/roles.js';
import { sendCreated, sendNoContent, sendSuccess } from '../../lib/response.js';
import {
  createUserSchema,
  listUsersQuerySchema,
  updateUserSchema,
} from './users.schema.js';
import * as usersService from './users.service.js';

function getActor(req: Request) {
  if (!req.user) {
    throw AppError.unauthorized();
  }
  return req.user;
}

export async function listUsers(req: Request, res: Response) {
  const actor = getActor(req);

  if (!canViewUsers(actor.role)) {
    throw AppError.forbidden('Access denied');
  }

  const query = listUsersQuerySchema.parse(req.query);
  const users = await usersService.listUsers(actor, query);
  sendSuccess(res, users);
}

export async function getUser(req: Request, res: Response) {
  const actor = getActor(req);

  if (!canViewUsers(actor.role)) {
    throw AppError.forbidden('Access denied');
  }

  const user = await usersService.getUserById(actor, req.params.id!);
  sendSuccess(res, user);
}

export async function createUser(req: Request, res: Response) {
  const actor = getActor(req);
  const input = createUserSchema.parse(req.body);
  const user = await usersService.createUser(actor, input);
  sendCreated(res, user);
}

export async function updateUser(req: Request, res: Response) {
  const actor = getActor(req);
  const input = updateUserSchema.parse(req.body);
  const user = await usersService.updateUser(actor, req.params.id!, input);
  sendSuccess(res, user);
}

export async function deleteUser(req: Request, res: Response) {
  const actor = getActor(req);
  await usersService.deleteUser(actor, req.params.id!);
  sendNoContent(res);
}
