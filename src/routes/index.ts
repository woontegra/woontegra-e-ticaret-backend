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
  siteSettingsAdminRouter,
  siteSettingsPublicRouter,
} from '../modules/site-settings/index.js';
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
apiRouter.use('/public/site-settings', siteSettingsPublicRouter);
apiRouter.use('/public/company-settings', companySettingsPublicRouter);
apiRouter.use('/public/pages', pagesPublicRouter);
apiRouter.use('/public/blog', blogPublicRouter);
apiRouter.use('/public/menus', menusPublicRouter);
apiRouter.use('/public/footer', footerPublicRouter);
apiRouter.use('/public/theme-settings', themeSettingsPublicRouter);
apiRouter.use('/public/header-settings', headerSettingsPublicRouter);
