import type { Request, Response } from 'express';
import { MenuLocation } from '@prisma/client';
import { sendCreated, sendNoContent, sendSuccess } from '../../lib/response.js';
import {
  createMenuItemSchema,
  reorderMenuItemsSchema,
  updateMenuItemSchema,
} from './menu-item.schema.js';
import * as menuItemService from './menu-item.service.js';
import { createMenuSchema, updateMenuSchema } from './menu.schema.js';
import * as menuService from './menu.service.js';

export async function listMenus(_req: Request, res: Response) {
  const data = await menuService.listMenus();
  sendSuccess(res, data);
}

export async function getMenu(req: Request, res: Response) {
  const data = await menuService.getMenuById(req.params.id);
  sendSuccess(res, data);
}

export async function getMenuByLocation(req: Request, res: Response) {
  const location = req.params.location as MenuLocation;
  const data = await menuService.getOrCreateMenuByLocation(location);
  sendSuccess(res, data);
}

export async function createMenu(req: Request, res: Response) {
  const input = createMenuSchema.parse(req.body);
  const data = await menuService.createMenu(input);
  sendCreated(res, data);
}

export async function updateMenu(req: Request, res: Response) {
  const input = updateMenuSchema.parse(req.body);
  const data = await menuService.updateMenu(req.params.id, input);
  sendSuccess(res, data);
}

export async function deleteMenu(req: Request, res: Response) {
  await menuService.deleteMenu(req.params.id);
  sendNoContent(res);
}

export async function listMenuItems(req: Request, res: Response) {
  const data = await menuService.listMenuItems(req.params.menuId);
  sendSuccess(res, data);
}

export async function createMenuItem(req: Request, res: Response) {
  const input = createMenuItemSchema.parse(req.body);
  const data = await menuItemService.createMenuItem(req.params.menuId, input);
  sendCreated(res, data);
}

export async function updateMenuItem(req: Request, res: Response) {
  const input = updateMenuItemSchema.parse(req.body);
  const data = await menuItemService.updateMenuItem(req.params.id, input);
  sendSuccess(res, data);
}

export async function deleteMenuItem(req: Request, res: Response) {
  await menuItemService.deleteMenuItem(req.params.id);
  sendNoContent(res);
}

export async function reorderMenuItems(req: Request, res: Response) {
  const input = reorderMenuItemsSchema.parse(req.body);
  const data = await menuItemService.reorderMenuItems(
    req.params.menuId,
    input,
  );
  sendSuccess(res, data);
}

export async function getPublicMenus(_req: Request, res: Response) {
  const data = await menuService.getPublicMenus();
  sendSuccess(res, data);
}
