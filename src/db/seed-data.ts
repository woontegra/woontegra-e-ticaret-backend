import {
  LayoutType,
  MenuLocation,
  PageBlockType,
  PageStatus,
  PageType,
  PrismaClient,
  DeliveryMode,
  ProductKind,
  ProductStatus,
  UserRole,
} from '@prisma/client';
import bcrypt from 'bcrypt';
import { DEFAULT_STOREFRONT_UI } from '../lib/default-storefront-ui.js';
import { publishLayout } from '../modules/layouts/layout.service.js';
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

const STOREFRONT_CMS_SLUGS = [
  'urunler',
  'yazilimlar',
  'sepet',
  'odeme',
  'iletisim',
  'blog',
  'arama',
  '404',
  'siparis-takip',
  'siparis-basarili',
] as const;

const STARTER_HOME_BLOCKS: Array<{
  type: PageBlockType;
  sortOrder: number;
  settings: Record<string, unknown>;
  content: Record<string, unknown>;
}> = [
  {
    type: PageBlockType.HERO,
    sortOrder: 0,
    settings: { paddingTop: '2rem', paddingBottom: '2rem', desktopHeight: '420px' },
    content: { headline: '', subheadline: '', ctaLabel: '', ctaUrl: '' },
  },
  {
    type: PageBlockType.PRODUCT_GRID,
    sortOrder: 1,
    settings: { itemCount: 8, columns: 4 },
    content: { headline: '', description: '' },
  },
  {
    type: PageBlockType.BLOG_GRID,
    sortOrder: 2,
    settings: { itemCount: 3, columns: 3 },
    content: { headline: '', description: '' },
  },
];

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

export async function seedStorefrontCmsPages(prisma: PrismaClient): Promise<void> {
  for (const slug of STOREFRONT_CMS_SLUGS) {
    await prisma.page.upsert({
      where: { slug },
      update: {},
      create: {
        title: '',
        slug,
        status: PageStatus.PUBLISHED,
        pageType: PageType.LANDING,
        contentHtml: '',
        excerpt: null,
        publishedAt: new Date(),
        robotsIndex: slug !== '404',
      },
    });
  }

  console.log('[seed] Storefront CMS pages:', STOREFRONT_CMS_SLUGS.length);
}

export async function seedDefaultFooterColumns(prisma: PrismaClient): Promise<void> {
  const existing = await prisma.footerColumn.count();
  if (existing > 0) return;

  const column = await prisma.footerColumn.create({
    data: { title: 'Yasal', sortOrder: 0, isActive: true },
  });

  const legalPages = await prisma.page.findMany({
    where: { pageType: PageType.LEGAL, status: PageStatus.PUBLISHED },
    orderBy: { title: 'asc' },
    take: 5,
  });

  for (let i = 0; i < legalPages.length; i++) {
    const page = legalPages[i]!;
    await prisma.footerLink.create({
      data: {
        columnId: column.id,
        label: page.title,
        type: 'PAGE',
        targetId: page.id,
        sortOrder: i,
        isActive: true,
      },
    });
  }

  console.log('[seed] Footer columns initialized');
}

export async function seedDemoCatalog(prisma: PrismaClient): Promise<void> {
  const productCount = await prisma.product.count();
  if (productCount > 0) return;

  const category = await prisma.productCategory.upsert({
    where: { slug: 'yazilimlar' },
    update: {},
    create: {
      name: 'Yazılımlar',
      slug: 'yazilimlar',
      isActive: true,
    },
  });

  const brand = await prisma.brand.upsert({
    where: { slug: 'woontegra' },
    update: {},
    create: {
      name: 'Woontegra',
      slug: 'woontegra',
      isActive: true,
    },
  });

  const downloadFilesTemplate = {
    version: '1.0.0',
    publicFreeDownload: false,
    showAfterPaymentOnly: true,
    files: [
      {
        label: 'Setup',
        url: '',
        type: 'setup',
        version: '1.0.0',
        buttonLabel: 'Kurulum Dosyasını İndir',
      },
      {
        label: 'Portable',
        url: '',
        type: 'portable',
        version: '1.0.0',
        buttonLabel: 'Portable Sürümü İndir',
      },
    ],
  };

  await prisma.product.create({
    data: {
      name: 'Müvekkil Kasa Defteri Masaüstü',
      slug: 'muvekkil-kasa-defteri-masaustu',
      sku: 'MK-DESKTOP-001',
      productKind: ProductKind.SOFTWARE,
      deliveryMode: DeliveryMode.LICENSED_DOWNLOAD,
      purchaseEnabled: true,
      licenseRequired: true,
      licenseAppCode: 'MUVEKKIL_KASA_DESKTOP',
      licenseDays: 365,
      licenseMaxDevices: 1,
      status: ProductStatus.ACTIVE,
      categoryId: category.id,
      brandId: brand.id,
      basePrice: 4990,
      salePrice: 4490,
      compareAtPrice: 5490,
      currency: 'TRY',
      taxRate: 20,
      downloadFiles: downloadFilesTemplate,
      featureBullets: ['Merkezi lisans', 'Kurulum ve portable sürüm', '365 gün lisans'],
      descriptionHtml: PLACEHOLDER_HTML,
      shortDescription: 'Masaüstü avukatlık ofis yönetim yazılımı',
      isFeatured: true,
    },
  });

  await prisma.product.create({
    data: {
      name: 'Müvekkil Kasa Web Tabanlı',
      slug: 'muvekkil-kasa-web-tabanli',
      sku: 'MK-SAAS-001',
      productKind: ProductKind.SOFTWARE,
      deliveryMode: DeliveryMode.SAAS,
      purchaseEnabled: true,
      saasAppCode: 'MUVEKKIL_KASA_SAAS',
      saasRequiresLogin: true,
      licenseMonths: 12,
      status: ProductStatus.ACTIVE,
      categoryId: category.id,
      brandId: brand.id,
      basePrice: 5990,
      salePrice: 5990,
      currency: 'TRY',
      taxRate: 20,
      descriptionHtml: PLACEHOLDER_HTML,
      shortDescription: 'Web tabanlı SaaS avukatlık ofis yönetimi',
      isFeatured: true,
    },
  });

  await prisma.product.create({
    data: {
      name: 'Woontegra Şifre Kasası',
      slug: 'woontegra-sifre-kasasi',
      sku: 'FREE-SK-001',
      productKind: ProductKind.SOFTWARE,
      deliveryMode: DeliveryMode.FREE_DOWNLOAD,
      purchaseEnabled: false,
      basePrice: 0,
      salePrice: 0,
      currency: 'TRY',
      status: ProductStatus.ACTIVE,
      categoryId: category.id,
      brandId: brand.id,
      downloadFiles: {
        ...downloadFilesTemplate,
        publicFreeDownload: true,
        showAfterPaymentOnly: false,
      },
      descriptionHtml: PLACEHOLDER_HTML,
      shortDescription: 'Ücretsiz şifre yönetim aracı',
      isNew: true,
    },
  });

  await prisma.product.create({
    data: {
      name: 'Özel Yazılım Geliştirme Hizmeti',
      slug: 'ozel-yazilim-gelistirme',
      productKind: ProductKind.SERVICE,
      deliveryMode: DeliveryMode.QUOTE_ONLY,
      purchaseEnabled: false,
      status: ProductStatus.ACTIVE,
      categoryId: category.id,
      brandId: brand.id,
      descriptionHtml: PLACEHOLDER_HTML,
      shortDescription: 'Kurumsal yazılım projeleri için teklif alın',
    },
  });

  console.log('[seed] Demo catalog: category, brand, 4 software/service products');
}

export async function seedDefaultPaymentMethods(
  prisma: PrismaClient,
): Promise<void> {
  const activeCount = await prisma.paymentMethod.count({
    where: { isActive: true },
  });
  if (activeCount > 0) return;

  await prisma.paymentMethod.update({
    where: { id: 'pm_bank_transfer' },
    data: {
      isActive: true,
      config: toInputJson({
        accounts: [
          {
            bankName: 'Demo Bank',
            accountHolder: 'Demo Hesap',
            iban: 'TR00 0000 0000 0000 0000 0000 00',
            branch: null,
          },
        ],
        instructions: null,
      }),
    },
  });

  await prisma.paymentMethod.update({
    where: { id: 'pm_cod' },
    data: { isActive: true },
  });

  console.log('[seed] Default payment methods activated (Havale, Kapıda ödeme)');
}

export async function seedDefaultShippingCarrier(
  prisma: PrismaClient,
): Promise<void> {
  const existing = await prisma.shippingCarrier.count();
  if (existing > 0) return;

  await prisma.shippingCarrier.create({
    data: {
      name: 'Demo Kargo',
      trackingUrlTemplate: 'https://kargo.example.com/takip/{trackingNumber}',
      isActive: true,
    },
  });

  console.log('[seed] Default shipping carrier initialized');
}

export async function seedDefaultHomeLayout(prisma: PrismaClient): Promise<void> {
  let draft = await prisma.pageLayout.findFirst({
    where: {
      layoutType: LayoutType.HOME,
      status: PageStatus.DRAFT,
      pageId: null,
    },
  });

  if (!draft) {
    draft = await prisma.pageLayout.create({
      data: {
        layoutType: LayoutType.HOME,
        status: PageStatus.DRAFT,
        pageId: null,
        name: 'Ana Sayfa (Taslak)',
      },
    });
  }

  const blockCount = await prisma.pageBlock.count({
    where: { layoutId: draft.id },
  });

  if (blockCount === 0) {
    await prisma.pageBlock.createMany({
      data: STARTER_HOME_BLOCKS.map((block) => ({
        layoutId: draft!.id,
        type: block.type,
        title: '',
        settings: toInputJson(block.settings),
        content: toInputJson(block.content),
        sortOrder: block.sortOrder,
        isActive: true,
      })),
    });
  }

  const published = await prisma.pageLayout.findFirst({
    where: {
      layoutType: LayoutType.HOME,
      status: PageStatus.PUBLISHED,
      pageId: null,
    },
  });

  if (!published) {
    await publishLayout(draft.id);
    console.log('[seed] Home layout published with starter blocks');
  } else {
    console.log('[seed] Home draft layout initialized');
  }
}

export async function seedDefaultContactForm(prisma: PrismaClient): Promise<void> {
  await prisma.formDefinition.upsert({
    where: { key: 'CONTACT_FORM' },
    update: {},
    create: {
      name: 'İletişim Formu',
      key: 'CONTACT_FORM',
      isActive: true,
      submitButtonLabel: 'Gönder',
      successMessage: 'Mesajınız alındı. En kısa sürede size dönüş yapılacaktır.',
      fields: toInputJson([
        { name: 'name', label: 'Ad Soyad', type: 'text', required: true },
        { name: 'email', label: 'E-posta', type: 'email', required: true },
        { name: 'phone', label: 'Telefon', type: 'tel', required: false },
        { name: 'subject', label: 'Konu', type: 'text', required: false },
        { name: 'message', label: 'Mesaj', type: 'textarea', required: true },
      ]),
    },
  });

  await prisma.companySetting.updateMany({
    where: { id: SETTINGS_SINGLETON_ID, contactFormKey: null },
    data: {
      contactFormKey: 'CONTACT_FORM',
      contactLabels: toInputJson({
        company: 'Firma',
        phone: 'Telefon',
        email: 'E-posta',
        support: 'Destek',
        workingHours: 'Çalışma saatleri',
      }),
    },
  });

  await prisma.headerSetting.updateMany({
    where: { id: SETTINGS_SINGLETON_ID, cartUrl: null },
    data: {
      cartUrl: '/sepet',
      searchPlaceholder: 'Ara…',
    },
  });

  console.log('[seed] Default contact form initialized');
}

export async function seedDefaultStorefrontUi(
  prisma: PrismaClient,
): Promise<void> {
  const setting = await prisma.siteSetting.findUnique({
    where: { id: SETTINGS_SINGLETON_ID },
    select: { storefrontUi: true },
  });
  const ui = setting?.storefrontUi;
  const empty =
    !ui ||
    (typeof ui === 'object' &&
      !Array.isArray(ui) &&
      Object.keys(ui as Record<string, unknown>).length === 0);

  if (empty) {
    await prisma.siteSetting.update({
      where: { id: SETTINGS_SINGLETON_ID },
      data: { storefrontUi: toInputJson(DEFAULT_STOREFRONT_UI) },
    });
    console.log('[seed] Default storefront UI labels initialized');
  }
}

export async function seedDatabase(prisma: PrismaClient): Promise<void> {
  await prisma.siteSetting.upsert({
    where: { id: SETTINGS_SINGLETON_ID },
    update: {},
    create: {
      id: SETTINGS_SINGLETON_ID,
      siteName: '',
      siteDescription: '',
      storefrontUi: toInputJson(DEFAULT_STOREFRONT_UI),
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
  await seedStorefrontCmsPages(prisma);
  await seedDefaultMenus(prisma);
  await seedDefaultFooter(prisma);
  await seedDefaultFooterColumns(prisma);
  await seedDefaultTheme(prisma);
  await seedDefaultHeader(prisma);
  await seedDefaultHomeLayout(prisma);
  await seedDemoCatalog(prisma);
  await seedDefaultShippingCarrier(prisma);
  await seedDefaultPaymentMethods(prisma);
  await seedDefaultContactForm(prisma);
  await seedDefaultStorefrontUi(prisma);

  console.log('[seed] Site & company settings initialized');
  console.log('[seed] Admin user:', admin.email, '/', DEMO_ADMIN_PASSWORD);
  console.log('[seed] Editor user:', editor.email, '/', DEMO_EDITOR_PASSWORD);
  console.log('[seed] Staff user:', staff.email, '/', DEMO_STAFF_PASSWORD);
  console.log('[seed] Super admin:', superAdmin.email, '/', SUPER_ADMIN_PASSWORD);
}
