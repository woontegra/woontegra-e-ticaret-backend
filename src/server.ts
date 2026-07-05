import 'dotenv/config';
import { execSync } from 'node:child_process';
import { createApp } from './app.js';
import { env } from './config/index.js';
import { seedDatabase, seedDefaultFooter, seedDefaultHeader, seedDefaultMenus, seedDefaultTheme, seedLegalPages } from './db/seed-data.js';
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

    if (env.NODE_ENV === 'production') {
      const userCount = await prisma.user.count();
      if (userCount === 0) {
        console.log('[api] User table empty — seeding demo users...');
        await seedDatabase(prisma);
        console.log('[api] Demo users created');
      } else {
        const pageCount = await prisma.page.count();
        if (pageCount === 0) {
          console.log('[api] No pages — seeding legal pages...');
          await seedLegalPages(prisma);
        }
        const menuCount = await prisma.menu.count();
        if (menuCount === 0) {
          console.log('[api] No menus — seeding default menus...');
          await seedDefaultMenus(prisma);
        }
        const footerCount = await prisma.footerSetting.count();
        if (footerCount === 0) {
          console.log('[api] No footer settings — seeding default footer...');
          await seedDefaultFooter(prisma);
        }
        const themeCount = await prisma.themeSetting.count();
        if (themeCount === 0) {
          console.log('[api] No theme settings — seeding default theme...');
          await seedDefaultTheme(prisma);
        }
        const headerCount = await prisma.headerSetting.count();
        if (headerCount === 0) {
          console.log('[api] No header settings — seeding default header...');
          await seedDefaultHeader(prisma);
        }
      }
    }
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
