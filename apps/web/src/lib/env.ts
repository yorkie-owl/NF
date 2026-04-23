import { z } from 'zod';

const schema = z.object({
  NEXT_PUBLIC_API_URL: z.string().url(),
});

const parsed = schema.safeParse({
  NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
});

/** 开发缺省与 env.example 一致，避免在模块加载时 Zod 抛错拖垮整站 */
export const env = parsed.success
  ? parsed.data
  : { NEXT_PUBLIC_API_URL: 'http://localhost:3000' as const };
