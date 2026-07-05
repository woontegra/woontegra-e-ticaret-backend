import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import {
  enrichStarterHomeLayout,
  passivateDemoProducts,
  seedDefaultHeader,
  seedDefaultMenuItems,
} from '../db/seed-data.js';

const prisma = new PrismaClient();

await passivateDemoProducts(prisma);
await seedDefaultMenuItems(prisma);
await seedDefaultHeader(prisma);
await enrichStarterHomeLayout(prisma);

await prisma.$disconnect();
console.log('[faz8] Demo cleanup and storefront defaults applied');
