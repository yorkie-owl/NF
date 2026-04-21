import { z } from 'zod';

const rawEnv = {
  NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
  NEXT_PUBLIC_UPLOADS_URL: process.env.NEXT_PUBLIC_UPLOADS_URL,
};

/** 本地默认与 apps/web/.env.example 一致；生产环境务必在部署平台设置变量。 */
export const env = z
  .object({
    NEXT_PUBLIC_API_URL: z.string().url().default('http://localhost:3000'),
    NEXT_PUBLIC_UPLOADS_URL: z.string().url().default('http://localhost:3000/uploads'),
  })
  .parse(rawEnv);
