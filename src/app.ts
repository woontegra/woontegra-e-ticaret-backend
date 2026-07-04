import fs from 'node:fs';
import path from 'node:path';
import cors from 'cors';
import express, { type Express } from 'express';
import helmet from 'helmet';
import { env } from './config/index.js';
import { errorHandler } from './middlewares/index.js';
import { apiRouter } from './routes/index.js';

export function createApp(): Express {
  const app = express();

  app.use(
    helmet({
      crossOriginResourcePolicy: { policy: 'cross-origin' },
    }),
  );
  const allowedOrigins = env.CORS_ORIGIN.split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

  function isOriginAllowed(origin: string): boolean {
    if (allowedOrigins.includes(origin)) return true;
    // Vite bazen 5174, 5175 gibi portlara geçer — lokal geliştirme için izin ver
    return /^http:\/\/(localhost|127\.0\.0\.1):\d+$/.test(origin);
  }

  app.use(
    cors({
      origin(origin, callback) {
        if (!origin || isOriginAllowed(origin)) {
          callback(null, true);
          return;
        }
        callback(null, false);
      },
      credentials: true,
    }),
  );
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true }));

  if (env.STORAGE_DRIVER === 'local') {
    const storagePath = path.resolve(env.STORAGE_LOCAL_PATH);
    fs.mkdirSync(storagePath, { recursive: true });
    app.use('/media', express.static(storagePath));
  }

  // Railway / load balancer probe fallback
  app.get('/', (_req, res) => {
    res.status(200).json({ status: 'ok', service: 'woontegra-commerce-api' });
  });

  app.get('/health', (_req, res) => {
    res.redirect(307, '/api/health');
  });

  app.use('/api', apiRouter);

  app.use(errorHandler);

  return app;
}
