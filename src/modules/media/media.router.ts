import multer from 'multer';
import { Router } from 'express';
import { env } from '../../config/index.js';
import { AppError } from '../../lib/app-error.js';
import {
  isDownloadMimeType,
  isDocumentMimeType,
  isImageMimeType,
} from '../../lib/storage/file-utils.js';
import { ensureLocalStorageRoot } from '../../lib/storage/local-storage.provider.js';
import { requireAuth } from '../../middlewares/auth.middleware.js';
import { requireRoles } from '../../middlewares/authorize.middleware.js';
import { asyncHandler } from '../../utils/async-handler.js';
import * as mediaController from './media.controller.js';

const imageUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: env.UPLOAD_MAX_IMAGE_BYTES },
  fileFilter: (_req, file, cb) => {
    const mime = file.mimetype.toLowerCase();
    if (isImageMimeType(mime) || isDocumentMimeType(mime)) {
      cb(null, true);
      return;
    }
    cb(AppError.badRequest('Unsupported file type for image upload'));
  },
});

const downloadUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: env.UPLOAD_MAX_DOWNLOAD_BYTES },
  fileFilter: (_req, file, cb) => {
    if (isDownloadMimeType(file.mimetype, file.originalname)) {
      cb(null, true);
      return;
    }
    cb(AppError.badRequest('Unsupported download file type'));
  },
});

export const mediaRouter = Router();

mediaRouter.use(requireAuth);
mediaRouter.use(requireRoles('SUPER_ADMIN', 'ADMIN', 'EDITOR'));

mediaRouter.get('/folders', asyncHandler(mediaController.listFolders));
mediaRouter.get('/', asyncHandler(mediaController.listMedia));
mediaRouter.post(
  '/upload',
  imageUpload.single('file'),
  asyncHandler(mediaController.uploadMedia),
);
mediaRouter.post(
  '/upload-download',
  downloadUpload.single('file'),
  asyncHandler(mediaController.uploadDownloadMedia),
);
mediaRouter.get('/:id', asyncHandler(mediaController.getMedia));
mediaRouter.put('/:id', asyncHandler(mediaController.updateMedia));
mediaRouter.delete('/:id', asyncHandler(mediaController.deleteMedia));

void ensureLocalStorageRoot();
