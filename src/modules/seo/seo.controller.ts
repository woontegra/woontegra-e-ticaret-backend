import type { Request, Response } from 'express';
import { sendCreated, sendSuccess } from '../../lib/response.js';
import {
  createRedirectRuleSchema,
  updateRedirectRuleSchema,
  updateSeoSettingSchema,
} from './seo.schema.js';
import * as redirectRuleService from './redirect-rule.service.js';
import * as seoSettingService from './seo-setting.service.js';
import { generateRobotsTxt, generateSitemapXml } from './sitemap.service.js';

export async function getSeoSettings(_req: Request, res: Response) {
  const data = await seoSettingService.getSeoSettings();
  sendSuccess(res, data);
}

export async function updateSeoSettings(req: Request, res: Response) {
  const input = updateSeoSettingSchema.parse(req.body);
  const data = await seoSettingService.updateSeoSettings(input);
  sendSuccess(res, data);
}

export async function getPublicSeoSettings(_req: Request, res: Response) {
  const data = await seoSettingService.getPublicSeoSettings();
  sendSuccess(res, data);
}

export async function listRedirectRules(_req: Request, res: Response) {
  const data = await redirectRuleService.listRedirectRules();
  sendSuccess(res, data);
}

export async function createRedirectRule(req: Request, res: Response) {
  const input = createRedirectRuleSchema.parse(req.body);
  const data = await redirectRuleService.createRedirectRule(input);
  sendCreated(res, data);
}

export async function updateRedirectRule(req: Request, res: Response) {
  const input = updateRedirectRuleSchema.parse(req.body);
  const data = await redirectRuleService.updateRedirectRule(
    req.params.id,
    input,
  );
  sendSuccess(res, data);
}

export async function deleteRedirectRule(req: Request, res: Response) {
  await redirectRuleService.deleteRedirectRule(req.params.id);
  sendSuccess(res, { ok: true });
}

export async function serveRobotsTxt(_req: Request, res: Response) {
  const content = await generateRobotsTxt();
  res.type('text/plain').send(content);
}

export async function serveSitemapXml(_req: Request, res: Response) {
  const content = await generateSitemapXml();
  res.type('application/xml').send(content);
}
