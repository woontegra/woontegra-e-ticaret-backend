import type { Request, Response } from 'express';
import { env } from '../../config/index.js';
import { prisma } from '../../lib/prisma.js';
import { sendSuccess } from '../../lib/response.js';

export async function getHealth(_req: Request, res: Response): Promise<void> {
  let database: 'connected' | 'disconnected' = 'disconnected';

  try {
    await prisma.$queryRaw`SELECT 1`;
    database = 'connected';
  } catch {
    database = 'disconnected';
  }

  sendSuccess(res, {
    status: 'ok',
    service: 'woontegra-commerce-api',
    version: '0.1.0',
    environment: env.NODE_ENV,
    database,
    timestamp: new Date().toISOString(),
  });
}
