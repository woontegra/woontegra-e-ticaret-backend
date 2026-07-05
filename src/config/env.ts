import path from 'node:path';
import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z
    .enum(['development', 'production', 'test'])
    .default('development'),
  PORT: z.coerce.number().int().positive().default(3001),
  DATABASE_URL: z.string().min(1),
  JWT_SECRET: z.string().min(8),
  JWT_ACCESS_EXPIRES_IN: z.string().default('15m'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),
  DEFAULT_TENANT_SLUG: z.string().default('demo'),
  /** Public storefront origin — CORS + sitemap/robots fallback */
  PUBLIC_SITE_URL: z
    .string()
    .url()
    .optional()
    .or(z.literal('').transform(() => undefined)),
  /** Public API origin — media URL fallback (https://api.example.com) */
  API_PUBLIC_URL: z
    .string()
    .url()
    .optional()
    .or(z.literal('').transform(() => undefined)),
  STORAGE_DRIVER: z.enum(['local', 's3']).default('local'),
  STORAGE_LOCAL_PATH: z.string().default('./storage/uploads'),
  UPLOAD_DIR: z.string().default('uploads'),
  IMAGE_STORAGE_DRIVER: z.enum(['local', 'vercel_blob']).default('vercel_blob'),
  DOWNLOAD_STORAGE_DRIVER: z.enum(['local', 'r2']).default('r2'),
  /** Max image upload size in bytes (default 10 MB) */
  UPLOAD_MAX_IMAGE_BYTES: z.coerce.number().int().positive().default(10 * 1024 * 1024),
  /** Max download binary upload size in bytes (default 500 MB) */
  UPLOAD_MAX_DOWNLOAD_BYTES: z.coerce
    .number()
    .int()
    .positive()
    .default(500 * 1024 * 1024),
  BLOB_READ_WRITE_TOKEN: z
    .string()
    .optional()
    .or(z.literal('').transform(() => undefined)),
  VERCEL_BLOB_READ_WRITE_TOKEN: z
    .string()
    .optional()
    .or(z.literal('').transform(() => undefined)),
  R2_ACCOUNT_ID: z.string().optional().or(z.literal('').transform(() => undefined)),
  R2_ACCESS_KEY_ID: z.string().optional().or(z.literal('').transform(() => undefined)),
  R2_SECRET_ACCESS_KEY: z
    .string()
    .optional()
    .or(z.literal('').transform(() => undefined)),
  R2_ENDPOINT: z.string().optional().or(z.literal('').transform(() => undefined)),
  R2_PUBLIC_BUCKET_NAME: z.string().default('woontegra-media'),
  R2_PRIVATE_BUCKET_NAME: z.string().default('woontegra-downloads'),
  R2_PUBLIC_BASE_URL: z
    .string()
    .url()
    .optional()
    .or(z.literal('').transform(() => undefined)),
  R2_DOWNLOADS_PUBLIC_BASE_URL: z
    .string()
    .url()
    .optional()
    .or(z.literal('').transform(() => undefined)),
  DOWNLOAD_TOKEN_SECRET: z
    .string()
    .optional()
    .or(z.literal('').transform(() => undefined)),
  DOWNLOAD_TOKEN_DAYS: z.coerce.number().int().positive().default(90),
  STORAGE_PUBLIC_BASE_URL: z
    .string()
    .url()
    .optional()
    .or(z.literal('').transform(() => undefined)),
  /** Comma-separated allowed browser origins */
  CORS_ORIGIN: z.string().default('http://localhost:5173'),
  LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error']).default('info'),
  /** Optional SMTP bootstrap — admin panel overrides when filled */
  SMTP_HOST: z.string().optional().or(z.literal('').transform(() => undefined)),
  SMTP_PORT: z.coerce.number().int().positive().optional(),
  SMTP_USER: z.string().optional().or(z.literal('').transform(() => undefined)),
  SMTP_PASS: z.string().optional().or(z.literal('').transform(() => undefined)),
  MAIL_FROM_EMAIL: z
    .string()
    .email()
    .optional()
    .or(z.literal('').transform(() => undefined)),
  MAIL_FROM_NAME: z.string().optional().or(z.literal('').transform(() => undefined)),
  MAIL_REPLY_TO: z
    .string()
    .email()
    .optional()
    .or(z.literal('').transform(() => undefined)),
  MAIL_ACTIVE: z
    .enum(['true', 'false'])
    .optional()
    .transform((value) => value === 'true'),
});

export type Env = z.infer<typeof envSchema>;

function resolveStorageLocalPath(raw: string, nodeEnv: string): string {
  if (path.isAbsolute(raw)) return raw;
  if (nodeEnv === 'production') {
    return path.resolve('/data/uploads');
  }
  return path.resolve(raw);
}

function loadEnv(): Env {
  const result = envSchema.safeParse(process.env);

  if (!result.success) {
    const formatted = result.error.flatten().fieldErrors;
    console.error('[config] Missing or invalid environment variables:');
    for (const [key, messages] of Object.entries(formatted)) {
      console.error(`  - ${key}: ${messages?.join(', ')}`);
    }
    console.error(
      '[config] Production minimum: DATABASE_URL, JWT_SECRET, NODE_ENV=production',
    );
    console.error(
      '[config] Recommended: PUBLIC_SITE_URL, API_PUBLIC_URL, STORAGE_PUBLIC_BASE_URL, CORS_ORIGIN',
    );
    throw new Error('Invalid environment configuration');
  }

  const data = result.data;

  return {
    ...data,
    STORAGE_LOCAL_PATH: resolveStorageLocalPath(
      data.STORAGE_LOCAL_PATH,
      data.NODE_ENV,
    ),
  };
}

export const env = loadEnv();
