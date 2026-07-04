import 'dotenv/config';
import { createApp } from './app.js';
import { env } from './config/index.js';
import { prisma } from './lib/prisma.js';

const app = createApp();

async function start() {
  try {
    await prisma.$connect();
    console.log('[api] Database connected');
  } catch (error) {
    console.warn('[api] Database unavailable — starting without DB connection');
    if (env.NODE_ENV === 'production') {
      console.error('[api] Database required in production:', error);
      process.exit(1);
    }
  }

  app.listen(env.PORT, () => {
    console.log(
      `[api] Woontegra Commerce API listening on http://localhost:${env.PORT}`,
    );
  });
}

start();
