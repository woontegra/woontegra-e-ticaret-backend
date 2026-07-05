/** API response envelope */
export interface ApiResponse<T> {
  data: T;
  meta?: Record<string, unknown>;
}

export interface ApiErrorItem {
  code: string;
  message: string;
  field?: string;
}

export interface ApiErrorResponse {
  errors: ApiErrorItem[];
}

export const SETTINGS_SINGLETON_ID = 'default';

export interface SocialLinks {
  facebook?: string;
  instagram?: string;
  twitter?: string;
  linkedin?: string;
  youtube?: string;
  tiktok?: string;
}

export interface StorefrontUiLabels {
  productBadgeNew?: string;
  productBadgeFeatured?: string;
  productBadgeBestSeller?: string;
  productActionDetail?: string;
  productActionDemo?: string;
  productActionBuy?: string;
  productActionDownload?: string;
  emptyProducts?: string;
  emptyCategories?: string;
  emptyBlog?: string;
  notFoundMessage?: string;
  notFoundHomeLink?: string;
  pageNotFoundMessage?: string;
  pageNotFoundHomeLink?: string;
  pageNotFoundTitle?: string;
  blogNotFoundMessage?: string;
  blogNotFoundBackLink?: string;
  blogPostNotFoundMessage?: string;
  blogPostNotFoundBackLink?: string;
  blogIndexEmpty?: string;
  readingTimeSuffix?: string;
  contactFormLoading?: string;
  contactFormError?: string;
  contactFormSubmitting?: string;
  contactFormNotFound?: string;
  contactBackLink?: string;
  formSelectPlaceholder?: string;
  productNotFound?: string;
  brandNotFound?: string;
  categoryNotFound?: string;
  productListBackLink?: string;
  productBackLink?: string;
  productAddToCart?: string;
  productAddToCartPending?: string;
  productAddToCartError?: string;
  productQuantityLabel?: string;
  blogBackLink?: string;
  cartEmpty?: string;
  cartBackLink?: string;
  cartCheckoutButton?: string;
  checkoutBackLink?: string;
  orderNotFound?: string;
  orderSuccessHomeLink?: string;
  orderTrackingNotFound?: string;
  orderTrackingNoShipment?: string;
  orderTrackingBackLink?: string;
  catalogSortFeatured?: string;
  catalogSortNewest?: string;
  catalogSortPriceAsc?: string;
  catalogSortPriceDesc?: string;
  catalogEmpty?: string;
  catalogLoading?: string;
  catalogResultsSuffix?: string;
  cartQuantityLabel?: string;
  cartRemoveLabel?: string;
  cartSummaryTitle?: string;
  cartSubtotal?: string;
  cartTax?: string;
  cartTotal?: string;
  checkoutContactTitle?: string;
  checkoutNameLabel?: string;
  checkoutEmailLabel?: string;
  checkoutPhoneLabel?: string;
  checkoutNoteLabel?: string;
  checkoutPaymentTitle?: string;
  checkoutNoPaymentMethods?: string;
  checkoutTestMode?: string;
  checkoutBankAccountsTitle?: string;
  checkoutSubmitPending?: string;
  checkoutSubmit?: string;
  checkoutOrderSummary?: string;
  checkoutCouponLabel?: string;
  checkoutCouponRemove?: string;
  checkoutCouponPlaceholder?: string;
  checkoutCouponApplied?: string;
  checkoutCouponError?: string;
  checkoutCouponApply?: string;
  checkoutSubtotal?: string;
  checkoutTax?: string;
  checkoutDiscount?: string;
  checkoutTotal?: string;
  checkoutErrorGeneric?: string;
  checkoutPaymentRequired?: string;
  checkoutBankAccountCount?: string;
  orderNumberLabel?: string;
  orderBankTransferTitle?: string;
  orderBankTransferHint?: string;
  orderBranchLabel?: string;
  orderTrackingTitle?: string;
  orderTrackingNumberLabel?: string;
  orderTrackShipment?: string;
  orderSummaryTitle?: string;
  orderTotalLabel?: string;
  orderTrackLink?: string;
  orderContinueShopping?: string;
  orderTrackingFormNumberLabel?: string;
  orderTrackingFormNumberPlaceholder?: string;
  orderTrackingFormEmailLabel?: string;
  orderTrackingFormEmailPlaceholder?: string;
  orderTrackingFormSubmit?: string;
  orderTrackingShipmentTitle?: string;
  orderTrackingCarrierLabel?: string;
  orderTrackingNumberFieldLabel?: string;
  catalogFiltersTitle?: string;
  catalogFilterButton?: string;
  catalogGridView?: string;
  catalogListView?: string;
  catalogPrev?: string;
  catalogNext?: string;
  catalogCloseFilters?: string;
  catalogShowResults?: string;
  catalogSearchLabel?: string;
  catalogSearchPlaceholder?: string;
  catalogCategoryLabel?: string;
  catalogAllOption?: string;
  catalogBrandLabel?: string;
  catalogPriceRangeLabel?: string;
  catalogPriceMin?: string;
  catalogPriceMax?: string;
  catalogProductCountSuffix?: string;
  productAttributesTitle?: string;
  productVariantOutOfStock?: string;
  productVariantStock?: string;
  productVariantUnavailable?: string;
  cartAddedTitle?: string;
  cartAddedQuantity?: string;
  cartAddedTotal?: string;
  cartAddedGoToCart?: string;
  cartAddedContinue?: string;
  reviewsTitle?: string;
  reviewsCount?: string;
  reviewsEmpty?: string;
  reviewsLoading?: string;
  reviewsStoreReply?: string;
  reviewsPrev?: string;
  reviewsNext?: string;
  reviewsWriteTitle?: string;
  reviewsModerationNote?: string;
  reviewsThankYou?: string;
  reviewsRatingLabel?: string;
  reviewsNameLabel?: string;
  reviewsEmailLabel?: string;
  reviewsTitleLabel?: string;
  reviewsCommentLabel?: string;
  reviewsSubmitPending?: string;
  reviewsSubmit?: string;
  reviewsSubmitError?: string;
}

export interface ContactLabels {
  company?: string;
  phone?: string;
  email?: string;
  support?: string;
  workingHours?: string;
}

export interface SiteSettingDto {
  id: string;
  siteName: string;
  siteDescription: string;
  defaultSeoTitle: string;
  defaultSeoDescription: string;
  domain: string;
  maintenanceMode: boolean;
  logoMediaId: string | null;
  faviconMediaId: string | null;
  ogImageMediaId: string | null;
  logoUrl: string | null;
  faviconUrl: string | null;
  ogImageUrl: string | null;
  storefrontUi: StorefrontUiLabels;
  createdAt: string;
  updatedAt: string;
}

export interface CompanySettingDto {
  id: string;
  companyName: string;
  tradeName: string;
  taxNumber: string;
  taxOffice: string;
  mersisNumber: string | null;
  address: string;
  city: string;
  district: string;
  phone: string;
  whatsapp: string;
  email: string;
  supportEmail: string;
  workingHours: string;
  contactFormKey: string | null;
  contactLabels: ContactLabels;
  currency: string;
  defaultTaxRate: number;
  socialLinks: SocialLinks;
  createdAt: string;
  updatedAt: string;
}

export interface MediaAssetDto {
  id: string;
  fileName: string;
  originalName: string;
  mimeType: string;
  size: number;
  width: number | null;
  height: number | null;
  storageProvider: 'LOCAL' | 'VERCEL_BLOB' | 'R2';
  usageType:
    | 'IMAGE'
    | 'LOGO'
    | 'FAVICON'
    | 'HERO_IMAGE'
    | 'PRODUCT_IMAGE'
    | 'BLOG_IMAGE'
    | 'BUILDER_IMAGE'
    | 'CAMPAIGN_IMAGE'
    | 'DOCUMENT'
    | 'DOWNLOAD_BINARY'
    | null;
  bucket: string | null;
  storageKey: string;
  url: string;
  publicUrl: string | null;
  folder: string;
  altText: string | null;
  title: string | null;
  createdById: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface MediaListResult {
  items: MediaAssetDto[];
  total: number;
}

export type PageStatus = 'DRAFT' | 'PUBLISHED';
export type PageType = 'STANDARD' | 'LEGAL' | 'LANDING';

export interface PageDto {
  id: string;
  title: string;
  slug: string;
  status: PageStatus;
  pageType: PageType;
  excerpt: string | null;
  contentHtml: string;
  blocksJson: unknown | null;
  featuredImageId: string | null;
  featuredImageUrl: string | null;
  seoTitle: string | null;
  seoDescription: string | null;
  ogImageId: string | null;
  ogImageUrl: string | null;
  canonicalUrl: string | null;
  robotsIndex: boolean;
  publishedAt: string | null;
  createdById: string | null;
  updatedById: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface PageListResult {
  items: PageDto[];
  total: number;
}

export interface BlogCategoryDto {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  seoTitle: string | null;
  seoDescription: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface BlogPostDto {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  contentHtml: string;
  coverImageId: string | null;
  coverImageUrl: string | null;
  categoryId: string | null;
  category: BlogCategoryDto | null;
  status: PageStatus;
  authorName: string | null;
  readingTime: number | null;
  tags: string[];
  seoTitle: string | null;
  seoDescription: string | null;
  ogImageId: string | null;
  ogImageUrl: string | null;
  robotsIndex: boolean;
  publishedAt: string | null;
  createdById: string | null;
  updatedById: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface BlogPostListResult {
  items: BlogPostDto[];
  total: number;
  page?: number;
  limit?: number;
}

export type MenuLocation = 'HEADER' | 'FOOTER' | 'MOBILE';
export type MenuItemType =
  | 'PAGE'
  | 'CATEGORY'
  | 'PRODUCT_CATEGORY'
  | 'PRODUCT'
  | 'BLOG'
  | 'CUSTOM_URL';

export interface MenuDto {
  id: string;
  name: string;
  location: MenuLocation;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface MenuItemDto {
  id: string;
  menuId: string;
  parentId: string | null;
  label: string;
  type: MenuItemType;
  targetId: string | null;
  url: string | null;
  href: string | null;
  openInNewTab: boolean;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  children?: MenuItemDto[];
}

export interface PublicMenuItemDto {
  id: string;
  label: string;
  href: string;
  openInNewTab: boolean;
  children: PublicMenuItemDto[];
}

export interface PublicMenuDto {
  id: string;
  name: string;
  location: MenuLocation;
  items: PublicMenuItemDto[];
}

export interface PublicMenusDto {
  header: PublicMenuDto | null;
  footer: PublicMenuDto | null;
  mobile: PublicMenuDto | null;
}

export interface ReorderMenuItemsInput {
  items: Array<{
    id: string;
    sortOrder: number;
    parentId?: string | null;
  }>;
}

export interface FooterMediaIconDto {
  id: string;
  url: string;
  altText: string | null;
}

export interface FooterSettingDto {
  id: string;
  logoMediaId: string | null;
  logoUrl: string | null;
  description: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  showNewsletter: boolean;
  newsletterTitle: string | null;
  newsletterDescription: string | null;
  newsletterPlaceholder: string | null;
  newsletterButtonLabel: string | null;
  newsletterSuccessMessage: string | null;
  copyrightText: string | null;
  socialLinks: SocialLinks;
  paymentIconIds: string[];
  shippingIconIds: string[];
  paymentIcons: FooterMediaIconDto[];
  shippingIcons: FooterMediaIconDto[];
  createdAt: string;
  updatedAt: string;
}

export interface FooterColumnDto {
  id: string;
  title: string;
  sortOrder: number;
  isActive: boolean;
  links?: FooterLinkDto[];
  createdAt: string;
  updatedAt: string;
}

export interface FooterLinkDto {
  id: string;
  columnId: string;
  label: string;
  type: MenuItemType;
  targetId: string | null;
  url: string | null;
  href: string | null;
  sortOrder: number;
  isActive: boolean;
  openInNewTab: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PublicFooterLinkDto {
  id: string;
  label: string;
  href: string;
  openInNewTab: boolean;
}

export interface PublicFooterColumnDto {
  id: string;
  title: string;
  links: PublicFooterLinkDto[];
}

export interface PublicFooterDto {
  logoUrl: string | null;
  description: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  showNewsletter: boolean;
  newsletterTitle: string | null;
  newsletterDescription: string | null;
  newsletterPlaceholder: string | null;
  newsletterButtonLabel: string | null;
  newsletterSuccessMessage: string | null;
  copyrightText: string | null;
  socialLinks: SocialLinks;
  paymentIcons: FooterMediaIconDto[];
  shippingIcons: FooterMediaIconDto[];
  columns: PublicFooterColumnDto[];
}

export interface ThemeColorPalette {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  surface: string;
  text: string;
  textMuted: string;
  border: string;
}

export interface ThemeTypography {
  fontFamily: string;
  headingFontFamily: string;
  baseFontSize: number;
  headingWeight: number;
  lineHeight: number;
}

export interface ThemeLayoutSettings {
  mobilePadding: string;
  sectionSpacing: string;
  compactNav: boolean;
  mobileFontSize: number;
  mobileHeaderHeight: string;
}

export interface ThemeButtonStyle {
  borderRadius: string;
  paddingX: string;
  paddingY: string;
  fontWeight: number;
  primaryBg: string;
  primaryText: string;
  primaryHoverBg: string;
}

export interface ThemeCardStyle {
  borderRadius: string;
  borderColor: string;
  background: string;
  shadow: string;
  padding: string;
}

export interface ThemeHeaderStyle {
  background: string;
  textColor: string;
  textHoverColor: string;
  borderColor: string;
  height: string;
  sticky: boolean;
}

export interface ThemeProductCardStyle {
  borderRadius: string;
  imageRatio: string;
  showBadge: boolean;
  priceColor: string;
  titleSize: string;
}

export interface ThemeSettingDto {
  id: string;
  activeThemeKey: string;
  colorPalette: ThemeColorPalette;
  typography: ThemeTypography;
  layout: ThemeLayoutSettings;
  buttonStyle: ThemeButtonStyle;
  cardStyle: ThemeCardStyle;
  headerStyle: ThemeHeaderStyle;
  productCardStyle: ThemeProductCardStyle;
  borderRadius: string;
  shadowLevel: string;
  containerWidth: string;
  customCss: string | null;
  createdAt: string;
  updatedAt: string;
}

export type PublicThemeSettingDto = ThemeSettingDto;

export type HeaderLogoPosition = 'LEFT' | 'CENTER';
export type HeaderMenuPosition = 'LEFT' | 'CENTER' | 'RIGHT';

export interface HeaderSettingDto {
  id: string;
  logoPosition: HeaderLogoPosition;
  menuPosition: HeaderMenuPosition;
  headerHeight: string;
  stickyHeader: boolean;
  showSearch: boolean;
  showAccountIcon: boolean;
  showFavoritesIcon: boolean;
  showCartIcon: boolean;
  topBarEnabled: boolean;
  topBarText: string | null;
  topBarBackground: string | null;
  topBarTextColor: string | null;
  announcementEnabled: boolean;
  announcementText: string | null;
  announcementLink: string | null;
  accountUrl: string | null;
  searchPlaceholder: string | null;
  cartUrl: string | null;
  favoritesUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

export type LayoutType = 'HOME' | 'PAGE' | 'LANDING';
export type PageBlockType =
  | 'HERO'
  | 'HERO_SLIDER'
  | 'TEXT'
  | 'TEXT_IMAGE'
  | 'IMAGE_BANNER'
  | 'PRODUCT_GRID'
  | 'PRODUCT_CAROUSEL'
  | 'CATEGORY_GRID'
  | 'BLOG_GRID'
  | 'TRUST_BADGES'
  | 'FAQ'
  | 'CONTACT_FORM'
  | 'BRAND_LOGOS'
  | 'TESTIMONIALS'
  | 'NEWSLETTER'
  | 'CUSTOM_SPACER'
  | 'CAMPAIGN';

export interface PageBlockDto {
  id: string;
  layoutId: string;
  type: PageBlockType;
  title: string | null;
  settings: Record<string, unknown>;
  content: Record<string, unknown>;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PageLayoutDto {
  id: string;
  pageId: string | null;
  layoutType: LayoutType;
  name: string;
  status: PageStatus;
  publishedAt: string | null;
  blocks?: PageBlockDto[];
  createdAt: string;
  updatedAt: string;
}

export interface PublicPageBlockDto {
  id: string;
  type: PageBlockType;
  title: string | null;
  settings: Record<string, unknown>;
  content: Record<string, unknown>;
}

export interface PublicHomeLayoutDto {
  id: string;
  name: string;
  layoutType: LayoutType;
  publishedAt: string | null;
  blocks: PublicPageBlockDto[];
}

export interface ReorderLayoutBlocksInput {
  items: Array<{
    id: string;
    sortOrder: number;
  }>;
}

export type ProductKind = 'SOFTWARE' | 'PHYSICAL' | 'SERVICE';
export type ProductStatus = 'DRAFT' | 'ACTIVE' | 'PASSIVE';

export type DeliveryMode =
  | 'NONE'
  | 'FREE_DOWNLOAD'
  | 'PAID_DOWNLOAD'
  | 'LICENSED_DOWNLOAD'
  | 'SAAS'
  | 'QUOTE_ONLY';

export interface ProductDownloadFile {
  label: string;
  url?: string;
  type?: 'setup' | 'portable' | 'other';
  mediaAssetId?: string;
  storageProvider?: 'LOCAL' | 'VERCEL_BLOB' | 'R2';
  storageKey?: string;
  fileName?: string;
  originalName?: string;
  mimeType?: string;
  version?: string;
  size?: string;
  sha256?: string;
  buttonLabel?: string;
}

export interface ProductDownloadFilesConfig {
  version?: string;
  publicFreeDownload?: boolean;
  showAfterPaymentOnly?: boolean;
  files?: ProductDownloadFile[];
}

export interface ProductCategoryDto {
  id: string;
  parentId: string | null;
  name: string;
  slug: string;
  description: string | null;
  imageId: string | null;
  bannerImageId: string | null;
  imageUrl?: string | null;
  bannerImageUrl?: string | null;
  seoTitle: string | null;
  seoDescription: string | null;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface BrandDto {
  id: string;
  name: string;
  slug: string;
  logoId: string | null;
  logoUrl?: string | null;
  description: string | null;
  seoTitle: string | null;
  seoDescription: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ProductCategorySummaryDto {
  id: string;
  name: string;
  slug: string;
  imageUrl?: string | null;
}

export interface BrandSummaryDto {
  id: string;
  name: string;
  slug: string;
  logoUrl?: string | null;
}

export interface ProductDto {
  id: string;
  name: string;
  slug: string;
  sku: string | null;
  barcode: string | null;
  productKind: ProductKind;
  deliveryMode: DeliveryMode;
  purchaseEnabled: boolean;
  currency: string;
  compareAtPrice: number | null;
  version: string | null;
  featureBullets: string[];
  sortOrder: number;
  licenseRequired: boolean;
  licenseAppCode: string | null;
  licenseDays: number | null;
  licenseMonths: number | null;
  licenseMaxDevices: number | null;
  saasAppCode: string | null;
  saasPlanCode: string | null;
  saasTrialDays: number | null;
  saasRequiresLogin: boolean;
  downloadFiles: ProductDownloadFilesConfig | null;
  shortDescription: string | null;
  descriptionHtml: string;
  categoryId: string | null;
  category: ProductCategorySummaryDto | null;
  brandId: string | null;
  brand: BrandSummaryDto | null;
  status: ProductStatus;
  basePrice: number | null;
  salePrice: number | null;
  taxRate: number | null;
  stockTrackingEnabled: boolean;
  stockQuantity: number | null;
  lowStockThreshold: number | null;
  mainImageId: string | null;
  mainImageUrl: string | null;
  galleryImageIds: string[];
  galleryImageUrls: string[];
  tags: string[];
  isFeatured: boolean;
  isNew: boolean;
  isBestSeller: boolean;
  demoUrl: string | null;
  purchaseUrl: string | null;
  downloadUrl: string | null;
  seoTitle: string | null;
  seoDescription: string | null;
  ogImageId: string | null;
  ogImageUrl: string | null;
  canonicalUrl: string | null;
  robotsIndex: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ProductListResult {
  items: ProductDto[];
  total: number;
}

export interface PublicProductCategoryDto {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  imageUrl: string | null;
  bannerImageUrl?: string | null;
  productCount?: number;
}

export interface PublicProductCategoryDetailDto extends PublicProductCategoryDto {
  seoTitle: string | null;
  seoDescription: string | null;
}

export interface PublicBrandSummaryDto {
  id: string;
  name: string;
  slug: string;
  logoUrl: string | null;
  description: string | null;
  productCount?: number;
}

export interface PublicBrandDetailDto extends PublicBrandSummaryDto {
  seoTitle: string | null;
  seoDescription: string | null;
  productCount: number;
}

export interface PublicProductDto {
  id: string;
  name: string;
  slug: string;
  shortDescription: string | null;
  productKind: ProductKind;
  deliveryMode: DeliveryMode;
  purchaseEnabled: boolean;
  price: number | null;
  basePrice: number | null;
  salePrice: number | null;
  compareAtPrice: number | null;
  currency: string;
  taxRate: number | null;
  version: string | null;
  featureBullets: string[];
  licenseRequired: boolean;
  saasRequiresLogin: boolean;
  seoTitle: string | null;
  seoDescription: string | null;
  imageUrl: string | null;
  isFeatured: boolean;
  isNew: boolean;
  isBestSeller: boolean;
  demoUrl: string | null;
  purchaseUrl: string | null;
  category: { id: string; name: string; slug: string } | null;
  brand: PublicBrandSummaryDto | null;
}

export type PublicProductSort =
  | 'featured'
  | 'newest'
  | 'price_asc'
  | 'price_desc';

export interface PublicCatalogListResult<T> {
  items: T[];
  total: number;
}

export interface PublicDownloadFileDto {
  label: string;
  type?: 'setup' | 'portable' | 'other';
  buttonLabel?: string;
  version?: string;
  size?: string;
  available?: boolean;
}

export interface PublicDownloadFilesDto {
  version?: string;
  publicFreeDownload?: boolean;
  files?: PublicDownloadFileDto[];
}

export interface PublicProductDetailDto extends PublicProductDto {
  descriptionHtml: string;
  galleryImageUrls: string[];
  tags: string[];
  demoUrl: string | null;
  purchaseUrl: string | null;
  downloadFiles: PublicDownloadFilesDto | null;
  seoTitle: string | null;
  seoDescription: string | null;
  ogImageUrl: string | null;
  canonicalUrl: string | null;
  robotsIndex: boolean;
  attributes: PublicProductAttributeRowDto[];
  variantAttributes: PublicVariantAttributeDto[];
  variants: PublicProductVariantDto[];
}

export type ProductAttributeType =
  | 'TEXT'
  | 'NUMBER'
  | 'SELECT'
  | 'COLOR'
  | 'BOOLEAN';

export interface ProductAttributeValueDto {
  id: string;
  attributeId: string;
  value: string;
  colorHex: string | null;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface ProductAttributeDto {
  id: string;
  name: string;
  code: string;
  type: ProductAttributeType;
  isFilterable: boolean;
  isVariantOption: boolean;
  sortOrder: number;
  values: ProductAttributeValueDto[];
  createdAt: string;
  updatedAt: string;
}

export interface ProductAttributeSummaryDto {
  id: string;
  name: string;
  code: string;
  type: ProductAttributeType;
  isFilterable: boolean;
  isVariantOption: boolean;
}

export interface ProductAttributeAssignmentDto {
  id: string;
  productId: string;
  attributeId: string;
  attribute: ProductAttributeSummaryDto;
  valueText: string | null;
  valueNumber: number | null;
  valueBoolean: boolean | null;
  attributeValueId: string | null;
  attributeValue: ProductAttributeValueDto | null;
}

export interface ProductVariantOptionDto {
  id: string;
  variantId: string;
  attributeId: string;
  attributeValueId: string;
  attribute: {
    id: string;
    name: string;
    code: string;
    type: ProductAttributeType;
  };
  attributeValue: ProductAttributeValueDto;
}

export interface ProductVariantDto {
  id: string;
  productId: string;
  sku: string | null;
  barcode: string | null;
  price: number | null;
  salePrice: number | null;
  stockQuantity: number | null;
  imageId: string | null;
  imageUrl: string | null;
  isActive: boolean;
  options: ProductVariantOptionDto[];
  createdAt: string;
  updatedAt: string;
}

export interface GenerateVariantsResultDto {
  created: ProductVariantDto[];
  variants: ProductVariantDto[];
}

export interface FilterableAttributeDto {
  id: string;
  name: string;
  code: string;
  type: ProductAttributeType;
  values: ProductAttributeValueDto[];
}

export interface PublicProductAttributeRowDto {
  name: string;
  code: string;
  type: ProductAttributeType;
  value: string;
  isFilterable: boolean;
  colorHex: string | null;
}

export interface PublicVariantAttributeDto {
  attributeId: string;
  name: string;
  code: string;
  type: ProductAttributeType;
  values: Array<{
    id: string;
    value: string;
    colorHex: string | null;
  }>;
}

export interface PublicProductVariantDto {
  id: string;
  sku: string | null;
  price: number | null;
  salePrice: number | null;
  stockQuantity: number | null;
  imageUrl: string | null;
  isActive: boolean;
  options: Array<{
    attributeId: string;
    attributeCode: string;
    attributeValueId: string;
    value: string;
    colorHex: string | null;
  }>;
}

export type OrderStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'PROCESSING'
  | 'COMPLETED'
  | 'CANCELLED';

export type PaymentStatus =
  | 'PENDING'
  | 'PAID'
  | 'FAILED'
  | 'REFUNDED'
  | 'WAITING_BANK_TRANSFER'
  | 'CASH_ON_DELIVERY';

export type PaymentMethodType =
  | 'BANK_TRANSFER'
  | 'CASH_ON_DELIVERY'
  | 'PAYTR'
  | 'IYZICO'
  | 'EXTERNAL_LINK';

export interface BankAccountConfig {
  bankName: string;
  accountHolder: string;
  iban: string;
  branch?: string | null;
}

export interface BankTransferConfig {
  accounts: BankAccountConfig[];
  instructions?: string | null;
}

export interface CashOnDeliveryConfig {
  description?: string | null;
}

export interface PaytrConfig {
  merchantId: string;
  merchantKey: string;
  merchantSalt: string;
  hasMerchantKey?: boolean;
  hasMerchantSalt?: boolean;
  successUrl?: string | null;
  failUrl?: string | null;
  callbackUrl?: string | null;
}

export interface IyzicoConfig {
  apiKey: string;
  secretKey: string;
  baseUrl?: string;
  hasApiKey?: boolean;
  hasSecretKey?: boolean;
}

export interface ExternalLinkConfig {
  instructions?: string | null;
}

export type PaymentMethodConfig =
  | BankTransferConfig
  | CashOnDeliveryConfig
  | PaytrConfig
  | IyzicoConfig
  | ExternalLinkConfig;

export interface PaymentMethodDto {
  id: string;
  type: PaymentMethodType;
  name: string;
  isActive: boolean;
  isTestMode: boolean;
  config: PaymentMethodConfig;
  createdAt: string;
  updatedAt: string;
}

export interface BankTransferPublicConfig {
  accounts: BankAccountConfig[];
  instructions?: string | null;
}

export interface PaymentMethodPublicDto {
  id: string;
  type: PaymentMethodType;
  name: string;
  isTestMode: boolean;
  config:
    | BankTransferPublicConfig
    | CashOnDeliveryConfig
    | ExternalLinkConfig
    | Record<string, never>;
}

export interface CheckoutPaymentInfoDto {
  methodType: PaymentMethodType;
  methodName: string;
  bankAccounts?: BankAccountConfig[];
  instructions?: string | null;
  description?: string | null;
  redirectUrl?: string | null;
  message?: string | null;
}

export interface OrderFulfillmentDto {
  deliveryModes: DeliveryMode[];
  messages: string[];
  downloadLinks?: PublicDownloadLinkDto[];
  saasMemberships?: PublicSaasMembershipDto[];
}

export interface PublicDownloadLinkDto {
  productName: string;
  fileType: string | null;
  label: string;
  downloadUrl?: string;
  expiresAt?: string;
  note?: string;
}

export interface OrderDigitalDeliveryItemDto {
  orderItemId: string;
  productName: string;
  deliveryMode: DeliveryMode;
  deliveryStatus: OrderItemDeliveryStatus | null;
  deliveryError: string | null;
  downloadTokenCreatedAt: string | null;
  downloadEmailSentAt: string | null;
  tokenCount: number;
  canFulfill: boolean;
}

export type OrderItemDeliveryStatus =
  | 'PENDING'
  | 'READY'
  | 'SENT'
  | 'FAILED';

export type LicenseServerStatus =
  | 'PENDING'
  | 'CREATED'
  | 'FAILED'
  | 'SKIPPED';

export interface OrderLicenseDeliveryItemDto {
  orderItemId: string;
  productName: string;
  licenseAppCode: string | null;
  licenseServerStatus: LicenseServerStatus | null;
  licenseServerLicenseKey: string | null;
  licenseServerActivationPassword: string | null;
  licenseServerExpiresAt: string | null;
  licenseServerLastError: string | null;
  licenseServerUnitsNotified: number;
  quantity: number;
  canRetry: boolean;
  canFulfill: boolean;
}

export type SaasProvisionStatus = 'PENDING' | 'CREATED' | 'FAILED' | 'SKIPPED';

export type SaasMembershipStatus =
  | 'PENDING'
  | 'ACTIVE'
  | 'FAILED'
  | 'EXPIRED'
  | 'CANCELLED';

export interface OrderSaasDeliveryItemDto {
  orderItemId: string;
  productName: string;
  saasAppCode: string | null;
  saasPlanCode: string | null;
  saasProvisionStatus: SaasProvisionStatus | null;
  saasProvisionLastError: string | null;
  saasProvisionedAt: string | null;
  externalTenantId: string | null;
  externalTenantSlug: string | null;
  loginUrl: string | null;
  loginEmail: string | null;
  temporaryPassword: string | null;
  externalLicenseKey: string | null;
  startsAt: string | null;
  endsAt: string | null;
  canRetry: boolean;
  canFulfill: boolean;
}

export interface PublicSaasMembershipDto {
  productName: string;
  saasAppCode: string;
  loginUrl: string | null;
  loginEmail: string | null;
  tenantSlug: string | null;
  startsAt: string | null;
  endsAt: string | null;
  note?: string;
}

export interface SaasMembershipListItemDto {
  id: string;
  customerEmail: string | null;
  customerName: string | null;
  productName: string;
  saasAppCode: string;
  saasPlanCode: string | null;
  tenantSlug: string | null;
  status: SaasMembershipStatus;
  startsAt: string | null;
  endsAt: string | null;
  orderNumber: string | null;
  loginUrl: string | null;
  lastError: string | null;
  createdAt: string;
}

export interface SaasMembershipListResult {
  items: SaasMembershipListItemDto[];
  total: number;
}

export interface StoreCustomerDto {
  id: string;
  email: string;
  name: string;
  phone: string | null;
}

export interface CustomerAuthResultDto {
  accessToken: string;
  customer: StoreCustomerDto;
}

export interface CheckoutResultDto {
  order: PublicOrderDto;
  payment: CheckoutPaymentInfoDto;
  fulfillment?: OrderFulfillmentDto;
}

export type ShippingStatus =
  | 'PENDING'
  | 'PREPARING'
  | 'SHIPPED'
  | 'DELIVERED'
  | 'RETURNED';

export type ShippingMethodType = 'FIXED' | 'FREE_OVER_AMOUNT';

export interface ShippingCarrierDto {
  id: string;
  name: string;
  trackingUrlTemplate: string;
  logoId: string | null;
  logoUrl: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ShippingMethodDto {
  id: string;
  name: string;
  type: ShippingMethodType;
  price: number;
  freeShippingThreshold: number | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ShipmentDto {
  id: string;
  orderId: string;
  carrierId: string | null;
  carrierName: string | null;
  trackingNumber: string | null;
  trackingUrl: string | null;
  status: ShippingStatus;
  shippedAt: string | null;
  deliveredAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CartItemDto {
  id: string;
  cartId: string;
  productId: string;
  variantId: string | null;
  quantity: number;
  unitPrice: number;
  taxRate: number | null;
  lineTotal: number;
  productName: string;
  productSlug: string;
  productKind: ProductKind;
  lineLabel: string;
  imageUrl: string | null;
}

export interface CartDto {
  id: string;
  items: CartItemDto[];
  itemCount: number;
  subtotal: number;
  taxTotal: number;
  discountTotal: number;
  couponCode: string | null;
  grandTotal: number;
  requiresCustomerLogin?: boolean;
}

export interface CartSummaryDto {
  itemCount: number;
  grandTotal: number;
}

export interface OrderItemDto {
  id: string;
  orderId: string;
  productId: string | null;
  variantId: string | null;
  nameSnapshot: string;
  skuSnapshot: string | null;
  quantity: number;
  unitPrice: number;
  taxRate: number | null;
  total: number;
}

export type PaymentTransactionStatus =
  | 'PENDING'
  | 'PROCESSING'
  | 'SUCCESS'
  | 'FAILED'
  | 'CANCELLED';

export interface PaymentTransactionDto {
  id: string;
  orderId: string;
  provider: PaymentMethodType;
  status: PaymentTransactionStatus;
  amount: number;
  currency: string;
  providerReference: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface OrderDto {
  id: string;
  orderNumber: string;
  customerId: string | null;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  shippingStatus: ShippingStatus | null;
  subtotal: number;
  taxTotal: number;
  shippingTotal: number;
  discountTotal: number;
  grandTotal: number;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  note: string | null;
  adminNote: string | null;
  paymentMethodId: string | null;
  paymentMethodType: PaymentMethodType | null;
  paymentMethodName: string | null;
  shipment: ShipmentDto | null;
  items: OrderItemDto[];
  paymentTransactions?: PaymentTransactionDto[];
  createdAt: string;
  updatedAt: string;
  digitalDelivery?: OrderDigitalDeliveryItemDto[];
  licenseDelivery?: OrderLicenseDeliveryItemDto[];
  saasDelivery?: OrderSaasDeliveryItemDto[];
}

export type PublicOrderDto = Omit<OrderDto, 'adminNote'> & {
  fulfillment?: OrderFulfillmentDto;
};

export interface OrderSummaryDto {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  shippingStatus: ShippingStatus | null;
  grandTotal: number;
  customerName: string;
  customerEmail: string;
  itemCount: number;
  createdAt: string;
}

export interface OrderListResult {
  items: OrderSummaryDto[];
  total: number;
}

export interface CheckoutInput {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  note?: string | null;
  paymentMethodId: string;
}

export type MailLogStatus = 'PENDING' | 'SENT' | 'FAILED' | 'SKIPPED';

export interface MailSettingDto {
  id: string;
  smtpHost: string;
  smtpPort: number;
  smtpUser: string;
  hasSmtpPass: boolean;
  smtpPass?: string;
  fromName: string;
  fromEmail: string;
  replyTo: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface MailTemplateVariableDto {
  name: string;
  description: string;
}

export interface MailTemplateDto {
  id: string;
  key: string;
  name: string;
  subject: string;
  htmlContent: string;
  textContent: string | null;
  variables: MailTemplateVariableDto[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface MailLogDto {
  id: string;
  toEmail: string;
  subject: string;
  templateKey: string | null;
  status: MailLogStatus;
  errorMessage: string | null;
  createdAt: string;
}

export interface SendTestMailResult {
  sent: boolean;
  skipped?: boolean;
  logId?: string;
  error?: string;
}

export type ContactMessageStatus = 'NEW' | 'READ' | 'REPLIED' | 'CLOSED';

export type FormSubmissionStatus = 'NEW' | 'READ' | 'CLOSED';

export type FormFieldType = 'text' | 'email' | 'tel' | 'textarea' | 'select';

export interface FormFieldDefinitionDto {
  name: string;
  label: string;
  type: FormFieldType;
  required?: boolean;
  options?: string[];
}

export interface ContactMessageDto {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  subject: string | null;
  message: string;
  status: ContactMessageStatus;
  adminNote: string | null;
  repliedAt: string | null;
  source: string | null;
  formKey: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ContactMessageSummaryDto {
  id: string;
  name: string;
  email: string;
  subject: string | null;
  status: ContactMessageStatus;
  source: string | null;
  createdAt: string;
}

export interface ContactMessageListResult {
  items: ContactMessageSummaryDto[];
  total: number;
}

export interface FormDefinitionDto {
  id: string;
  name: string;
  key: string;
  fields: FormFieldDefinitionDto[];
  successMessage: string | null;
  submitButtonLabel: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface FormDefinitionPublicDto {
  id: string;
  name: string;
  key: string;
  fields: FormFieldDefinitionDto[];
  successMessage: string | null;
  submitButtonLabel: string | null;
}

export interface FormSubmissionDto {
  id: string;
  formId: string;
  formName: string | null;
  formKey: string | null;
  data: Record<string, unknown>;
  status: FormSubmissionStatus;
  createdAt: string;
  updatedAt: string;
}

export interface SubmitContactInput {
  name: string;
  email: string;
  phone?: string | null;
  subject?: string | null;
  message: string;
  source?: string;
}

export type ProductReviewStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface ProductReviewPublicDto {
  id: string;
  name: string;
  rating: number;
  title: string | null;
  comment: string;
  adminReply: string | null;
  approvedAt: string | null;
  createdAt: string;
}

export interface ProductReviewsPublicResult {
  items: ProductReviewPublicDto[];
  total: number;
  averageRating: number | null;
}

export interface ProductReviewDto {
  id: string;
  productId: string;
  productName: string | null;
  productSlug: string | null;
  productKind: ProductKind | null;
  customerId: string | null;
  orderId: string | null;
  name: string;
  email: string;
  rating: number;
  title: string | null;
  comment: string;
  status: ProductReviewStatus;
  adminReply: string | null;
  approvedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ProductReviewSummaryDto {
  id: string;
  productId: string;
  productName: string | null;
  productSlug: string | null;
  productKind: ProductKind | null;
  name: string;
  rating: number;
  title: string | null;
  status: ProductReviewStatus;
  createdAt: string;
}

export interface ProductReviewListResult {
  items: ProductReviewSummaryDto[];
  total: number;
}

export interface SubmitProductReviewInput {
  name: string;
  email: string;
  rating: number;
  title?: string | null;
  comment: string;
  customerId?: string | null;
  orderId?: string | null;
}

export interface SeoSettingDto {
  id: string;
  defaultTitle: string;
  defaultDescription: string;
  defaultOgImageId: string | null;
  defaultOgImageUrl: string | null;
  robotsTxt: string;
  googleAnalyticsId: string | null;
  metaPixelId: string | null;
  canonicalBaseUrl: string | null;
  sitemapIncludeProducts: boolean;
  sitemapIncludeCategories: boolean;
  sitemapIncludePages: boolean;
  sitemapIncludeBlogPosts: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SeoSettingPublicDto {
  defaultTitle: string;
  defaultDescription: string;
  defaultOgImageUrl: string | null;
  googleAnalyticsId: string | null;
  metaPixelId: string | null;
  canonicalBaseUrl: string | null;
}

export interface RedirectRuleDto {
  id: string;
  sourcePath: string;
  targetPath: string;
  statusCode: 301 | 302;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export type CouponType = 'PERCENTAGE' | 'FIXED_AMOUNT' | 'FREE_SHIPPING';

export type CampaignType =
  | 'BANNER'
  | 'HERO'
  | 'PRODUCT_PROMO'
  | 'CATEGORY_PROMO';

export interface CouponDto {
  id: string;
  code: string;
  type: CouponType;
  value: number;
  minOrderAmount: number | null;
  usageLimit: number | null;
  usageLimitPerCustomer: number | null;
  startsAt: string | null;
  endsAt: string | null;
  isActive: boolean;
  applicableProductIds: string[];
  applicableCategoryIds: string[];
  createdAt: string;
  updatedAt: string;
}

export interface CampaignDto {
  id: string;
  name: string;
  type: CampaignType;
  bannerImageId: string | null;
  bannerImageUrl: string | null;
  title: string;
  description: string | null;
  buttonText: string | null;
  buttonUrl: string | null;
  startsAt: string | null;
  endsAt: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CampaignPublicDto {
  id: string;
  type: CampaignType;
  bannerImageUrl: string | null;
  title: string;
  description: string | null;
  buttonText: string | null;
  buttonUrl: string | null;
}

export type NotificationType =
  | 'NEW_ORDER'
  | 'NEW_CONTACT_MESSAGE'
  | 'NEW_REVIEW'
  | 'LOW_STOCK'
  | 'PAYMENT_WAITING'
  | 'SHIPPING_TRACKING_ENTERED';

export interface NotificationDto {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  entityType: string | null;
  entityId: string | null;
  isRead: boolean;
  createdAt: string;
}

export interface NotificationListResult {
  items: NotificationDto[];
  total: number;
}

export interface NotificationUnreadCountResult {
  count: number;
}

export interface DashboardSummaryDto {
  dateFrom: string;
  dateTo: string;
  totalSales: number;
  orderCount: number;
  averageBasket: number;
  newCustomers: number;
  newLeads: number;
  pendingOrders: number;
  lowStockCount: number;
  newContactMessages: number;
  recentOrders: OrderSummaryDto[];
  topProducts: ReportTopProductDto[];
  featuredProducts: ReportFeaturedProductDto[];
}

export interface ReportSalesByDayItemDto {
  date: string;
  totalSales: number;
  orderCount: number;
}

export interface ReportSalesByDayResult {
  dateFrom: string;
  dateTo: string;
  items: ReportSalesByDayItemDto[];
}

export interface ReportOrdersByStatusItemDto {
  status: OrderStatus;
  orderCount: number;
  totalSales: number;
}

export interface ReportOrdersByStatusResult {
  dateFrom: string;
  dateTo: string;
  items: ReportOrdersByStatusItemDto[];
}

export interface ReportTopProductDto {
  productId: string;
  name: string;
  slug: string | null;
  sku: string | null;
  quantitySold: number;
  revenue: number;
}

export interface ReportTopProductsResult {
  dateFrom: string;
  dateTo: string;
  items: ReportTopProductDto[];
}

export interface ReportLowStockProductDto {
  id: string;
  name: string;
  slug: string;
  sku: string | null;
  stockQuantity: number;
  lowStockThreshold: number;
}

export interface ReportLowStockProductsResult {
  items: ReportLowStockProductDto[];
  total: number;
}

export interface ReportNewCustomerItemDto {
  type: 'customer' | 'contact' | 'form';
  id: string;
  name: string;
  email: string | null;
  detail: string;
  createdAt: string;
}

export interface ReportNewCustomersResult {
  dateFrom: string;
  dateTo: string;
  items: ReportNewCustomerItemDto[];
  total: number;
}

export interface ReportPaymentMethodSummaryItemDto {
  paymentMethodId: string | null;
  methodName: string;
  methodType: PaymentMethodType | null;
  orderCount: number;
  totalSales: number;
}

export interface ReportPaymentMethodSummaryResult {
  dateFrom: string;
  dateTo: string;
  items: ReportPaymentMethodSummaryItemDto[];
}

export interface ReportFeaturedProductDto {
  id: string;
  name: string;
  slug: string;
  isFeatured: boolean;
  isBestSeller: boolean;
  stockQuantity: number | null;
  price: number | null;
}

export type AdminUserRole = 'SUPER_ADMIN' | 'ADMIN' | 'EDITOR' | 'STAFF';

export interface AdminUserDto {
  id: string;
  name: string;
  email: string;
  role: AdminUserRole;
  isActive: boolean;
  lastLoginAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AuditLogDto {
  id: string;
  userId: string | null;
  userName: string | null;
  userEmail: string | null;
  action: string;
  module: string;
  entityType: string | null;
  entityId: string | null;
  beforeData: unknown;
  afterData: unknown;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: string;
}

export interface AuditLogListResult {
  items: AuditLogDto[];
  total: number;
}
