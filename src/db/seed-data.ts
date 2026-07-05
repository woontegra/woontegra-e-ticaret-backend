import { LayoutType, MenuLocation, PageStatus, PageType, PrismaClient, UserRole } from '@prisma/client';
import bcrypt from 'bcrypt';
import { SETTINGS_SINGLETON_ID } from '../types/api.js';
import { DEFAULT_HEADER_SETTINGS } from '../lib/default-header.js';
import { DEFAULT_THEME_SETTINGS } from '../lib/default-theme.js';
import { toInputJson } from '../lib/json.js';

export const DEMO_ADMIN_PASSWORD = 'Demo@Woontegra2026!';
export const SUPER_ADMIN_PASSWORD = 'SuperAdmin@Woontegra2026!';
export const DEMO_EDITOR_PASSWORD = 'Editor@Woontegra2026!';
export const DEMO_STAFF_PASSWORD = 'Staff@Woontegra2026!';

const LEGAL_PAGES = [
  { title: 'Mesafeli Satış Sözleşmesi', slug: 'mesafeli-satis-sozlesmesi' },
  { title: 'Ön Bilgilendirme Formu', slug: 'on-bilgilendirme-formu' },
  { title: 'İade ve İptal Koşulları', slug: 'iade-ve-iptal-kosullari' },
  { title: 'Gizlilik Politikası', slug: 'gizlilik-politikasi' },
  { title: 'KVKK Aydınlatma Metni', slug: 'kvkk-aydinlatma-metni' },
  { title: 'Çerez Politikası', slug: 'cerez-politikasi' },
  { title: 'Kullanım Koşulları', slug: 'kullanim-kosullari' },
] as const;

const PLACEHOLDER_HTML =
  '<p>Bu sayfa içeriği yönetim panelinden düzenlenebilir.</p>';

export async function seedLegalPages(prisma: PrismaClient): Promise<void> {
  for (const page of LEGAL_PAGES) {
    await prisma.page.upsert({
      where: { slug: page.slug },
      update: {},
      create: {
        title: page.title,
        slug: page.slug,
        status: PageStatus.PUBLISHED,
        pageType: PageType.LEGAL,
        contentHtml: PLACEHOLDER_HTML,
        excerpt: null,
        publishedAt: new Date(),
        robotsIndex: true,
      },
    });
  }

  console.log('[seed] Legal pages:', LEGAL_PAGES.length);
}

export async function seedDefaultMenus(prisma: PrismaClient): Promise<void> {
  const menus: Array<{ name: string; location: MenuLocation }> = [
    { name: 'Header Menüsü', location: MenuLocation.HEADER },
    { name: 'Footer Menüsü', location: MenuLocation.FOOTER },
    { name: 'Mobil Menü', location: MenuLocation.MOBILE },
  ];

  for (const menu of menus) {
    await prisma.menu.upsert({
      where: { location: menu.location },
      update: {},
      create: menu,
    });
  }

  console.log('[seed] Default menus:', menus.length);
}

export async function seedDefaultFooter(prisma: PrismaClient): Promise<void> {
  await prisma.footerSetting.upsert({
    where: { id: SETTINGS_SINGLETON_ID },
    update: {},
    create: { id: SETTINGS_SINGLETON_ID },
  });

  console.log('[seed] Default footer setting initialized');
}

export async function seedDefaultTheme(prisma: PrismaClient): Promise<void> {
  await prisma.themeSetting.upsert({
    where: { id: SETTINGS_SINGLETON_ID },
    update: {},
    create: {
      id: SETTINGS_SINGLETON_ID,
      activeThemeKey: DEFAULT_THEME_SETTINGS.activeThemeKey,
      colorPalette: toInputJson(DEFAULT_THEME_SETTINGS.colorPalette),
      typography: toInputJson(DEFAULT_THEME_SETTINGS.typography),
      layout: toInputJson(DEFAULT_THEME_SETTINGS.layout),
      buttonStyle: toInputJson(DEFAULT_THEME_SETTINGS.buttonStyle),
      cardStyle: toInputJson(DEFAULT_THEME_SETTINGS.cardStyle),
      headerStyle: toInputJson(DEFAULT_THEME_SETTINGS.headerStyle),
      productCardStyle: toInputJson(DEFAULT_THEME_SETTINGS.productCardStyle),
      borderRadius: DEFAULT_THEME_SETTINGS.borderRadius,
      shadowLevel: DEFAULT_THEME_SETTINGS.shadowLevel,
      containerWidth: DEFAULT_THEME_SETTINGS.containerWidth,
      customCss: DEFAULT_THEME_SETTINGS.customCss,
    },
  });

  console.log('[seed] Default theme settings initialized');
}

export async function seedDefaultHeader(prisma: PrismaClient): Promise<void> {
  await prisma.headerSetting.upsert({
    where: { id: SETTINGS_SINGLETON_ID },
    update: {},
    create: {
      id: SETTINGS_SINGLETON_ID,
      ...DEFAULT_HEADER_SETTINGS,
    },
  });

  console.log('[seed] Default header settings initialized');
}

export async function seedDefaultHomeLayout(prisma: PrismaClient): Promise<void> {
  const existing = await prisma.pageLayout.findFirst({
    where: {
      layoutType: LayoutType.HOME,
      status: PageStatus.DRAFT,
      pageId: null,
    },
  });

  if (!existing) {
    await prisma.pageLayout.create({
      data: {
        layoutType: LayoutType.HOME,
        status: PageStatus.DRAFT,
        pageId: null,
        name: 'Ana Sayfa (Taslak)',
      },
    });
  }

  console.log('[seed] Home draft layout initialized');
}

export async function seedDatabase(prisma: PrismaClient): Promise<void> {
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

  const adminHash = await bcrypt.hash(DEMO_ADMIN_PASSWORD, 12);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@demo.com' },
    update: {
      passwordHash: adminHash,
      isActive: true,
      role: UserRole.ADMIN,
      name: 'Demo Admin',
    },
    create: {
      name: 'Demo Admin',
      email: 'admin@demo.com',
      passwordHash: adminHash,
      role: UserRole.ADMIN,
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
      name: 'Super Admin',
    },
    create: {
      name: 'Super Admin',
      email: 'superadmin@woontegra.com',
      passwordHash: superAdminHash,
      role: UserRole.SUPER_ADMIN,
      isActive: true,
    },
  });

  const editorHash = await bcrypt.hash(DEMO_EDITOR_PASSWORD, 12);
  const editor = await prisma.user.upsert({
    where: { email: 'editor@demo.com' },
    update: {
      passwordHash: editorHash,
      isActive: true,
      role: UserRole.EDITOR,
      name: 'Demo Editor',
    },
    create: {
      name: 'Demo Editor',
      email: 'editor@demo.com',
      passwordHash: editorHash,
      role: UserRole.EDITOR,
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
      name: 'Demo Staff',
    },
    create: {
      name: 'Demo Staff',
      email: 'staff@demo.com',
      passwordHash: staffHash,
      role: UserRole.STAFF,
      isActive: true,
    },
  });

  await seedLegalPages(prisma);
  await seedDefaultMenus(prisma);
  await seedDefaultFooter(prisma);
  await seedDefaultTheme(prisma);
  await seedDefaultHeader(prisma);
  await seedDefaultHomeLayout(prisma);

  console.log('[seed] Site & company settings initialized');
  console.log('[seed] Admin user:', admin.email, '/', DEMO_ADMIN_PASSWORD);
  console.log('[seed] Editor user:', editor.email, '/', DEMO_EDITOR_PASSWORD);
  console.log('[seed] Staff user:', staff.email, '/', DEMO_STAFF_PASSWORD);
  console.log('[seed] Super admin:', superAdmin.email, '/', SUPER_ADMIN_PASSWORD);
}
