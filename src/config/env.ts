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
  STORAGE_DRIVER: z.enum(['local', 's3']).default('local'),
  STORAGE_LOCAL_PATH: z.string().default('./storage/uploads'),
  STORAGE_PUBLIC_BASE_URL: z.string().url().optional().or(z.literal('').transform(() => undefined)),
  CORS_ORIGIN: z.string().default('http://localhost:5173'),
});

export type Env = z.infer<typeof envSchema>;

function loadEnv(): Env {
  const result = envSchema.safeParse(process.env);

  if (!result.success) {
    const formatted = result.error.flatten().fieldErrors;
    console.error('[config] Missing or invalid environment variables:');
    for (const [key, messages] of Object.entries(formatted)) {
      console.error(`  - ${key}: ${messages?.join(', ')}`);
    }
    console.error('[config] Railway: add DATABASE_URL, JWT_SECRET, NODE_ENV=production');
    throw new Error('Invalid environment configuration');
  }

  return result.data;
}

export const env = loadEnv();
