import { Router } from 'express';
import { authRouter } from '../modules/auth/index.js';
import {
  companySettingsAdminRouter,
  companySettingsPublicRouter,
} from '../modules/company-settings/index.js';
import { healthRouter } from '../modules/health/index.js';
import { mediaRouter } from '../modules/media/index.js';
import { pagesAdminRouter, pagesPublicRouter } from '../modules/pages/index.js';
import {
  blogCategoriesAdminRouter,
  blogPostsAdminRouter,
  blogPublicRouter,
} from '../modules/blog/index.js';
import {
  menuItemsAdminRouter,
  menusAdminRouter,
  menusPublicRouter,
} from '../modules/menus/index.js';
import {
  footerColumnsAdminRouter,
  footerLinksAdminRouter,
  footerPublicRouter,
  footerSettingsAdminRouter,
} from '../modules/footer/index.js';
import {
  headerSettingsAdminRouter,
  headerSettingsPublicRouter,
} from '../modules/header-settings/index.js';
import {
  themeSettingsAdminRouter,
  themeSettingsPublicRouter,
} from '../modules/theme-settings/index.js';
import {
  layoutsAdminRouter,
  layoutsPublicRouter,
} from '../modules/layouts/index.js';
import {
  brandsAdminRouter,
  catalogPublicRouter,
  productAttributesAdminRouter,
  productCategoriesAdminRouter,
  productsAdminRouter,
} from '../modules/catalog/index.js';
import {
  siteSettingsAdminRouter,
  siteSettingsPublicRouter,
} from '../modules/site-settings/index.js';
import {
  cartPublicRouter,
  checkoutPublicRouter,
  ordersAdminRouter,
  ordersPublicRouter,
} from '../modules/commerce/index.js';
import {
  shippingCarriersAdminRouter,
  shippingMethodsAdminRouter,
} from '../modules/shipping/index.js';
import {
  mailAdminRouter,
  mailSettingsAdminRouter,
  mailTemplatesAdminRouter,
} from '../modules/mail/index.js';
import {
  paymentMethodsAdminRouter,
  paymentMethodsPublicRouter,
} from '../modules/payment/index.js';
import {
  contactMessagesAdminRouter,
  contactPublicRouter,
  formDefinitionsAdminRouter,
  formSubmissionsAdminRouter,
} from '../modules/contact/index.js';
import {
  reviewsAdminRouter,
  reviewsPublicRouter,
} from '../modules/reviews/index.js';
import {
  redirectMiddleware,
  seoAdminRouter,
  seoPublicRouter,
  serveRobotsTxt,
  serveSitemapXml,
} from '../modules/seo/index.js';
import {
  campaignsAdminRouter,
  couponsAdminRouter,
  promotionPublicRouter,
} from '../modules/promotion/index.js';
import { notificationsAdminRouter } from '../modules/notifications/index.js';
import { auditAdminRouter } from '../modules/audit/index.js';
import {
  dashboardAdminRouter,
  reportsAdminRouter,
} from '../modules/reports/index.js';
import { usersRouter } from '../modules/users/index.js';

export const apiRouter = Router();

apiRouter.use('/health', healthRouter);
apiRouter.use('/auth', authRouter);
apiRouter.use('/users', usersRouter);

apiRouter.use('/admin/site-settings', siteSettingsAdminRouter);
apiRouter.use('/admin/company-settings', companySettingsAdminRouter);
apiRouter.use('/admin/media', mediaRouter);
apiRouter.use('/admin/pages', pagesAdminRouter);
apiRouter.use('/admin/blog/categories', blogCategoriesAdminRouter);
apiRouter.use('/admin/blog/posts', blogPostsAdminRouter);
apiRouter.use('/admin/menus', menusAdminRouter);
apiRouter.use('/admin/menu-items', menuItemsAdminRouter);
apiRouter.use('/admin/footer-settings', footerSettingsAdminRouter);
apiRouter.use('/admin/footer-columns', footerColumnsAdminRouter);
apiRouter.use('/admin/footer-links', footerLinksAdminRouter);
apiRouter.use('/admin/theme-settings', themeSettingsAdminRouter);
apiRouter.use('/admin/header-settings', headerSettingsAdminRouter);
apiRouter.use('/admin/layouts', layoutsAdminRouter);
apiRouter.use('/admin/product-categories', productCategoriesAdminRouter);
apiRouter.use('/admin/brands', brandsAdminRouter);
apiRouter.use('/admin/product-attributes', productAttributesAdminRouter);
apiRouter.use('/admin/products', productsAdminRouter);
apiRouter.use('/admin/orders', ordersAdminRouter);
apiRouter.use('/admin/shipping-carriers', shippingCarriersAdminRouter);
apiRouter.use('/admin/shipping-methods', shippingMethodsAdminRouter);
apiRouter.use('/admin/payment-methods', paymentMethodsAdminRouter);
apiRouter.use('/admin/mail-settings', mailSettingsAdminRouter);
apiRouter.use('/admin/mail-templates', mailTemplatesAdminRouter);
apiRouter.use('/admin/mail', mailAdminRouter);
apiRouter.use('/admin/contact-messages', contactMessagesAdminRouter);
apiRouter.use('/admin/form-definitions', formDefinitionsAdminRouter);
apiRouter.use('/admin/form-submissions', formSubmissionsAdminRouter);
apiRouter.use('/admin/product-reviews', reviewsAdminRouter);
apiRouter.use('/admin/seo', seoAdminRouter);
apiRouter.use('/admin/coupons', couponsAdminRouter);
apiRouter.use('/admin/campaigns', campaignsAdminRouter);
apiRouter.use('/admin/notifications', notificationsAdminRouter);
apiRouter.use('/admin/dashboard', dashboardAdminRouter);
apiRouter.use('/admin/reports', reportsAdminRouter);
apiRouter.use('/admin/audit-logs', auditAdminRouter);
apiRouter.use('/public/site-settings', siteSettingsPublicRouter);
apiRouter.use('/public/company-settings', companySettingsPublicRouter);
apiRouter.use('/public/pages', pagesPublicRouter);
apiRouter.use('/public/blog', blogPublicRouter);
apiRouter.use('/public/menus', menusPublicRouter);
apiRouter.use('/public/footer', footerPublicRouter);
apiRouter.use('/public/theme-settings', themeSettingsPublicRouter);
apiRouter.use('/public/header-settings', headerSettingsPublicRouter);
apiRouter.use('/public/layouts', layoutsPublicRouter);
apiRouter.use('/public/cart', cartPublicRouter);
apiRouter.use('/public/checkout', checkoutPublicRouter);
apiRouter.use('/public/payment-methods', paymentMethodsPublicRouter);
apiRouter.use('/public/contact', contactPublicRouter);
apiRouter.use('/public', reviewsPublicRouter);
apiRouter.use('/public', seoPublicRouter);
apiRouter.use('/public', promotionPublicRouter);
apiRouter.use('/public/orders', ordersPublicRouter);
apiRouter.use('/public', catalogPublicRouter);
