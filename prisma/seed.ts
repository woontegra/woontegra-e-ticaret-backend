import { PrismaClient, UserRole } from '@prisma/client';
import bcrypt from 'bcrypt';
import { SETTINGS_SINGLETON_ID } from '@woontegra/shared';

const prisma = new PrismaClient();

const DEMO_OWNER_PASSWORD = 'Demo@Woontegra2026!';
const SUPER_ADMIN_PASSWORD = 'SuperAdmin@Woontegra2026!';
const DEMO_STAFF_PASSWORD = 'Staff@Woontegra2026!';

async function main() {
  await prisma.siteSetting.upsert({
    where: { id: SETTINGS_SINGLETON_ID },
    update: {},
    create: {
      id: SETTINGS_SINGLETON_ID,
      siteName: '',
      siteDescription: '',
    },
  });

  await prisma.companySetting.upsert({
    where: { id: SETTINGS_SINGLETON_ID },
    update: {},
    create: {
      id: SETTINGS_SINGLETON_ID,
      companyName: '',
      currency: 'TRY',
      defaultTaxRate: 20,
      socialLinks: {},
    },
  });

  const tenant = await prisma.tenant.upsert({
    where: { slug: 'demo' },
    update: { isActive: true },
    create: {
      slug: 'demo',
      name: 'Demo Mağaza',
      isActive: true,
    },
  });

  await prisma.setting.upsert({
    where: {
      tenantId_key: {
        tenantId: tenant.id,
        key: 'store.name',
      },
    },
    update: {},
    create: {
      tenantId: tenant.id,
      key: 'store.name',
      value: '',
    },
  });

  const ownerHash = await bcrypt.hash(DEMO_OWNER_PASSWORD, 12);
  const owner = await prisma.user.upsert({
    where: { email: 'owner@demo.com' },
    update: {
      passwordHash: ownerHash,
      isActive: true,
      role: UserRole.OWNER,
      tenantId: tenant.id,
      username: 'demo_owner',
    },
    create: {
      username: 'demo_owner',
      email: 'owner@demo.com',
      passwordHash: ownerHash,
      firstName: 'Demo',
      lastName: 'Owner',
      role: UserRole.OWNER,
      tenantId: tenant.id,
      isActive: true,
    },
  });

  const superAdminHash = await bcrypt.hash(SUPER_ADMIN_PASSWORD, 12);
  const superAdmin = await prisma.user.upsert({
    where: { email: 'superadmin@woontegra.com' },
    update: {
      passwordHash: superAdminHash,
      isActive: true,
      role: UserRole.SUPER_ADMIN,
      tenantId: null,
      username: 'superadmin',
    },
    create: {
      username: 'superadmin',
      email: 'superadmin@woontegra.com',
      passwordHash: superAdminHash,
      firstName: 'Super',
      lastName: 'Admin',
      role: UserRole.SUPER_ADMIN,
      tenantId: null,
      isActive: true,
    },
  });

  const staffHash = await bcrypt.hash(DEMO_STAFF_PASSWORD, 12);
  const staff = await prisma.user.upsert({
    where: { email: 'staff@demo.com' },
    update: {
      passwordHash: staffHash,
      isActive: true,
      role: UserRole.STAFF,
      tenantId: tenant.id,
      username: 'demo_staff',
    },
    create: {
      username: 'demo_staff',
      email: 'staff@demo.com',
      passwordHash: staffHash,
      firstName: 'Demo',
      lastName: 'Staff',
      role: UserRole.STAFF,
      tenantId: tenant.id,
      isActive: true,
    },
  });

  console.log('[seed] Site & company settings initialized');
  console.log('[seed] Demo tenant:', tenant.slug);
  console.log('[seed] Owner user:', owner.email, '/', DEMO_OWNER_PASSWORD);
  console.log('[seed] Staff user:', staff.email, '/', DEMO_STAFF_PASSWORD);
  console.log('[seed] Super admin:', superAdmin.email, '/', SUPER_ADMIN_PASSWORD);
}

main()
  .catch((error) => {
    console.error('[seed] Failed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
