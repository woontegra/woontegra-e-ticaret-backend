import { PrismaClient } from '@prisma/client';
import { seedDatabase } from '../src/db/seed-data.js';

const prisma = new PrismaClient();

seedDatabase(prisma)
  .catch((error) => {
    console.error('[seed] Failed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
