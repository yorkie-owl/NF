import { z } from 'zod';

/** B 板块骨架：无 DB 时可只配 CORS + 端口；接入队友 A+C 后补全 DB/JWT。 */
export const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(3000),
  CORS_ORIGIN: z.string().url(),

  DB_HOST: z.string().min(1).optional(),
  DB_PORT: z.coerce.number().int().positive().optional(),
  DB_USER: z.string().min(1).optional(),
  DB_PASSWORD: z.string().min(1).optional(),
  DB_NAME: z.string().min(1).optional(),

  JWT_ACCESS_SECRET: z.string().min(32).optional(),
  JWT_ACCESS_TTL: z.string().default('15m'),
  JWT_REFRESH_SECRET: z.string().min(32).optional(),
  JWT_REFRESH_TTL: z.string().default('7d'),

  UPLOADS_DIR: z.string().default('./uploads'),
  UPLOADS_PUBLIC_URL: z.string().url().optional(),

  INGREDIENTS_DEV_BYPASS_AUTH: z.preprocess(
    (v) => (v === undefined || v === '' ? 'true' : v),
    z.enum(['true', 'false']),
  ).transform((v) => v === 'true'),
});

export type Env = z.infer<typeof envSchema>;
