import 'dotenv/config';
import { execSync } from 'node:child_process';
import { createApp } from './app.js';
import { env } from './config/index.js';
import { prisma } from './lib/prisma.js';

const app = createApp();

function runMigrations() {
  if (env.NODE_ENV !== 'production') return;

  console.log('[api] Running prisma migrate deploy...');
  execSync('npx prisma migrate deploy', { stdio: 'inherit' });
  console.log('[api] Migrations applied');
}

async function start() {
  console.log('[api] Booting...', {
    nodeEnv: env.NODE_ENV,
    port: env.PORT,
    hasDatabaseUrl: Boolean(process.env.DATABASE_URL),
    hasJwtSecret: Boolean(process.env.JWT_SECRET),
  });

  try {
    runMigrations();
  } catch (error) {
    console.error('[api] Migration failed — verify DATABASE_URL and PostgreSQL plugin');
    console.error(error);
    process.exit(1);
  }

  try {
    await prisma.$connect();
    console.log('[api] Database connected');
  } catch (error) {
    console.warn('[api] Database unavailable — API will start, health shows disconnected');
    console.warn(error);
  }

  app.listen(env.PORT, '0.0.0.0', () => {
    console.log(`[api] Listening on 0.0.0.0:${env.PORT}`);
    console.log(`[api] Health: http://0.0.0.0:${env.PORT}/api/health`);
  });
}

start().catch((error) => {
  console.error('[api] Fatal startup error:', error);
  process.exit(1);
});
