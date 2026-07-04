import cors from 'cors';
import express, { type Express } from 'express';
import helmet from 'helmet';
import { env } from './config/index.js';
import { errorHandler } from './middlewares/index.js';
import { apiRouter } from './routes/index.js';

export function createApp(): Express {
  const app = express();

  app.use(helmet());
  app.use(
    cors({
      origin: env.CORS_ORIGIN,
      credentials: true,
    }),
  );
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true }));

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
