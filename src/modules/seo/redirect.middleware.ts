import type { NextFunction, Request, Response } from 'express';
import { findActiveRedirect } from './redirect-rule.service.js';
import { normalizePath } from '../../lib/seo.mapper.js';

export async function redirectMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    next();
    return;
  }

  const path = normalizePath(req.path);
  if (
    path.startsWith('/api') ||
    path.startsWith('/media') ||
    path === '/health' ||
    path === '/robots.txt' ||
    path === '/sitemap.xml'
  ) {
    next();
    return;
  }

  try {
    const rule = await findActiveRedirect(path);
    if (rule) {
      res.redirect(rule.statusCode, rule.targetPath);
      return;
    }
  } catch {
    // Redirect lookup failure should not block the request
  }

  next();
}
