export interface LegacySnapshot {
  meta?: { version?: number; source?: string; exportedAt?: string };
  categories?: LegacyCategory[];
  blogCategories?: LegacyBlogCategory[];
  products?: LegacyProduct[];
  blogPosts?: LegacyBlogPost[];
  pages?: LegacyPage[];
  redirects?: LegacyRedirect[];
}

export interface LegacyCategory {
  slug: string;
  name: string;
  description?: string | null;
  sortOrder?: number;
}

export interface LegacyBlogCategory {
  slug: string;
  name: string;
  description?: string | null;
}

export interface LegacyProduct {
  slug: string;
  name: string;
  legacyProductType?: 'DOWNLOAD' | 'SAAS' | 'SERVICE';
  shortDescription?: string | null;
  descriptionHtml?: string | null;
  price?: number | null;
  compareAtPrice?: number | null;
  currency?: string;
  purchaseEnabled?: boolean;
  licenseRequired?: boolean;
  licenseAppCode?: string | null;
  licenseMonths?: number | null;
  licenseDays?: number | null;
  licenseMaxDevices?: number | null;
  saasAppCode?: string | null;
  saasPlanCode?: string | null;
  saasTrialDays?: number | null;
  saasRequiresLogin?: boolean;
  featureBullets?: string[];
  version?: string | null;
  isFeatured?: boolean;
  sortOrder?: number;
  categorySlug?: string | null;
  coverImageUrl?: string | null;
  coverImageLocalPath?: string | null;
  galleryImageUrls?: string[];
  seoTitle?: string | null;
  seoDescription?: string | null;
  downloadFiles?: LegacyDownloadFiles | null;
  redirectToSlug?: string | null;
}

export interface LegacyDownloadFile {
  label: string;
  type?: string;
  version?: string;
  size?: string;
  buttonLabel?: string;
  storageKey?: string;
  storageProvider?: 'R2' | 'VERCEL_BLOB' | 'LOCAL';
  mediaAssetId?: string;
  url?: string;
  needsR2Mapping?: boolean;
  legacyPublicUrlPattern?: string;
}

export interface LegacyDownloadFiles {
  version?: string;
  publicFreeDownload?: boolean;
  showAfterPaymentOnly?: boolean;
  files: LegacyDownloadFile[];
}

export interface LegacyBlogPost {
  slug: string;
  title: string;
  excerpt?: string | null;
  contentHtml?: string | null;
  categorySlug?: string | null;
  status?: 'published' | 'draft' | string;
  publishedAt?: string | null;
  authorName?: string | null;
  tags?: string[];
  coverImageUrl?: string | null;
  coverImageLocalPath?: string | null;
  seoTitle?: string | null;
  seoDescription?: string | null;
}

export interface LegacyPage {
  slug: string;
  title: string;
  pageType?: 'STANDARD' | 'LEGAL' | 'LANDING' | string;
  status?: 'published' | 'draft' | string;
  contentHtml?: string | null;
  seoTitle?: string | null;
  seoDescription?: string | null;
  robotsIndex?: boolean;
}

export interface LegacyRedirect {
  sourcePath: string;
  targetPath: string;
  statusCode?: number;
}

export interface ImportReport {
  importedAt: string;
  source: string;
  products: {
    imported: string[];
    updated: string[];
    skipped: string[];
    weakDescription: string[];
    missingImage: string[];
    missingLicenseAppCode: string[];
    missingDownloadFiles: string[];
    missingSeo: string[];
    r2MappingNeeded: string[];
  };
  blog: {
    imported: string[];
    updated: string[];
    under500Words: string[];
    missingCover: string[];
    missingSeoDescription: string[];
    weakContent: string[];
  };
  pages: {
    imported: string[];
    updated: string[];
    missingSeo: string[];
    missingContent: string[];
  };
  media: {
    blobLinked: string[];
    r2Linked: string[];
    localPathNeedsManualUpload: string[];
  };
  redirects: {
    imported: string[];
    updated: string[];
  };
  preservedSlugs: {
    products: string[];
    blog: string[];
    pages: string[];
  };
}
