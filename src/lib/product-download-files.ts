import { z } from 'zod';

const nullableString = z.string().nullable().optional();

export const productDownloadFileSchema = z.object({
  label: z.string(),
  url: z.string().nullable().optional().transform((value) => value ?? ''),
  type: z.enum(['setup', 'portable', 'other']).nullable().optional(),
  mediaAssetId: nullableString,
  storageProvider: z
    .enum(['LOCAL', 'VERCEL_BLOB', 'R2'])
    .nullable()
    .optional(),
  storageKey: nullableString,
  fileName: nullableString,
  originalName: nullableString,
  mimeType: nullableString,
  version: nullableString,
  size: nullableString,
  sha256: nullableString,
  buttonLabel: nullableString,
});

export const productDownloadFilesSchema = z
  .object({
    version: nullableString,
    publicFreeDownload: z.boolean().optional(),
    showAfterPaymentOnly: z.boolean().optional(),
    files: z.array(productDownloadFileSchema).optional(),
  })
  .nullish();

export type ProductDownloadFilesConfig = z.infer<
  typeof productDownloadFilesSchema
>;

export function emptyDownloadFilesConfig(): NonNullable<ProductDownloadFilesConfig> {
  return {
    version: '',
    publicFreeDownload: false,
    showAfterPaymentOnly: true,
    files: [
      {
        label: 'Setup',
        url: '',
        type: 'setup',
        version: '',
        size: '',
        sha256: '',
        buttonLabel: 'Kurulum Dosyasını İndir',
      },
      {
        label: 'Portable',
        url: '',
        type: 'portable',
        version: '',
        size: '',
        sha256: '',
        buttonLabel: 'Portable Sürümü İndir',
      },
    ],
  };
}

export function parseDownloadFiles(raw: unknown): ProductDownloadFilesConfig {
  if (raw === null || raw === undefined) return null;
  const parsed = productDownloadFilesSchema.safeParse(raw);
  return parsed.success ? parsed.data : null;
}

export function hasDownloadFiles(
  config: ProductDownloadFilesConfig,
): boolean {
  if (!config?.files?.length) return false;
  return config.files.some(
    (file) =>
      Boolean(file.mediaAssetId?.trim()) ||
      Boolean(file.storageKey?.trim()) ||
      Boolean(file.url?.trim()),
  );
}

/** @deprecated use hasDownloadFiles */
export function hasDownloadFileUrls(
  config: ProductDownloadFilesConfig,
): boolean {
  return hasDownloadFiles(config);
}

export function sanitizeDownloadFilesForPublic(
  config: ProductDownloadFilesConfig,
): ProductDownloadFilesConfig {
  if (!config) return null;
  const isPublicFree = config.publicFreeDownload ?? false;
  return {
    version: config.version,
    publicFreeDownload: config.publicFreeDownload,
    showAfterPaymentOnly: config.showAfterPaymentOnly,
    files: config.files?.map((file) => ({
      label: file.label,
      type: file.type,
      version: file.version,
      size: file.size,
      buttonLabel: file.buttonLabel,
      url: isPublicFree ? (file.url ?? '') : '',
    })),
  };
}
