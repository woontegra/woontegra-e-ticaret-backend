import fs from 'node:fs';
import path from 'node:path';
import multer from 'multer';
import { Router } from 'express';
import { env } from '../../config/index.js';
import { requireAuth } from '../../middlewares/auth.middleware.js';
import { requireRoles } from '../../middlewares/authorize.middleware.js';
import {
  ensureStorageRoot,
  sanitizeFileName,
  sanitizeFolder,
} from '../../services/storage/local-storage.driver.js';
import { asyncHandler } from '../../utils/async-handler.js';
import * as mediaController from './media.controller.js';

const storageRoot = path.resolve(env.STORAGE_LOCAL_PATH);
fs.mkdirSync(storageRoot, { recursive: true });

const upload = multer({
  storage: multer.diskStorage({
    destination: (req, _file, cb) => {
      const folder = sanitizeFolder(String(req.body?.folder ?? 'general'));
      const dir = path.join(storageRoot, folder);
      fs.mkdirSync(dir, { recursive: true });
      cb(null, dir);
    },
    filename: (_req, file, cb) => {
      cb(null, sanitizeFileName(file.originalname));
    },
  }),
  limits: { fileSize: 10 * 1024 * 1024 },
});

export const mediaRouter = Router();

mediaRouter.use(requireAuth);
mediaRouter.use(requireRoles('SUPER_ADMIN', 'OWNER', 'ADMIN'));

mediaRouter.get('/folders', asyncHandler(mediaController.listFolders));
mediaRouter.get('/', asyncHandler(mediaController.listMedia));
mediaRouter.post(
  '/upload',
  upload.single('file'),
  asyncHandler(mediaController.uploadMedia),
);
mediaRouter.get('/:id', asyncHandler(mediaController.getMedia));
mediaRouter.put('/:id', asyncHandler(mediaController.updateMedia));
mediaRouter.delete('/:id', asyncHandler(mediaController.deleteMedia));

void ensureStorageRoot();
