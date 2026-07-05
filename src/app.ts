import fs from 'node:fs';
import path from 'node:path';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import express, { type Express } from 'express';
import helmet from 'helmet';
import { env } from './config/index.js';
import { assertMediaUrlConfig } from './lib/media-url.js';
import { logger } from './lib/logger.js';
import { errorHandler } from './middlewares/index.js';
import { globalRateLimiter } from './middlewares/rate-limit.middleware.js';
import { apiRouter } from './routes/index.js';
import {
  redirectMiddleware,
  serveRobotsTxt,
  serveSitemapXml,
} from './modules/seo/index.js';
import { asyncHandler } from './utils/async-handler.js';

export function createApp(): Express {
  const app = express();

  assertMediaUrlConfig();

  app.use(
    helmet({
      crossOriginResourcePolicy: { policy: 'cross-origin' },
    }),
  );
  const allowedOrigins = new Set(
    env.CORS_ORIGIN.split(',')
      .map((origin) => origin.trim())
      .filter(Boolean),
  );

  if (env.PUBLIC_SITE_URL) {
    allowedOrigins.add(env.PUBLIC_SITE_URL.replace(/\/$/, ''));
  }

  function isOriginAllowed(origin: string): boolean {
    if (allowedOrigins.has(origin)) return true;
    if (
      env.NODE_ENV !== 'production' &&
      /^http:\/\/(localhost|127\.0\.0\.1):\d+$/.test(origin)
    ) {
      return true;
    }
    return false;
  }

  app.use(globalRateLimiter);
  app.use(
    cors({
      origin(origin, callback) {
        if (!origin) {
          callback(null, env.NODE_ENV !== 'production');
          return;
        }
        const allowed = isOriginAllowed(origin);
        if (!allowed && env.NODE_ENV === 'production') {
          logger.warn('CORS blocked origin', { origin });
        }
        callback(null, allowed);
      },
      credentials: true,
    }),
  );
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true }));
  app.use(cookieParser());

  if (env.STORAGE_DRIVER === 'local') {
    const storagePath = path.resolve(env.STORAGE_LOCAL_PATH);
    fs.mkdirSync(storagePath, { recursive: true });
    logger.info('Local storage ready', { path: storagePath });
    app.use('/media', express.static(storagePath));
  }

  // Railway / load balancer probe fallback
  app.get('/', (_req, res) => {
    res.status(200).json({ status: 'ok', service: 'woontegra-commerce-api' });
  });

  app.get('/health', (_req, res) => {
    res.redirect(307, '/api/health');
  });

  app.get('/robots.txt', asyncHandler(serveRobotsTxt));
  app.get('/sitemap.xml', asyncHandler(serveSitemapXml));

  app.use(redirectMiddleware);

  app.use('/api', apiRouter);

  app.use(errorHandler);

  return app;
}
