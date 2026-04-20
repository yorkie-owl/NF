import { z } from 'zod';

export const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']),
  PORT: z.coerce.number().int().positive().default(3000),

  DB_HOST: z.string().min(1),
  DB_PORT: z.coerce.number().int().positive(),
  DB_USER: z.string().min(1),
  DB_PASSWORD: z.string().min(1),
  DB_NAME: z.string().min(1),

  JWT_ACCESS_SECRET: z.string().min(32),
  JWT_ACCESS_TTL: z.string().default('15m'),
  JWT_REFRESH_SECRET: z.string().min(32),
  JWT_REFRESH_TTL: z.string().default('7d'),

  UPLOADS_DIR: z.string().default('./uploads'),
  UPLOADS_PUBLIC_URL: z.string().url(),

  // Section-specific optional keys (added as modules land)
  AI_VISION_API_KEY: z.string().optional(),
  AI_VISION_ENDPOINT: z.string().url().optional(),
  RECIPE_API_KEY: z.string().optional(),
  MATCH_LLM_API_KEY: z.string().optional(),
  SOCKET_CORS_ORIGIN: z.string().optional(),

  CORS_ORIGIN: z.string().url(),

  EXTERNAL_USE_MOCK: z.enum(['true', 'false']).default('true'),
});

export type Env = z.infer<typeof envSchema>;
