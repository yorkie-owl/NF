import { z } from 'zod';

export const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
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

  /** 空串视为未配置（.env 里常写 `AI_VISION_ENDPOINT=`） */
  AI_VISION_API_KEY: z.preprocess(
    (v) => (v === '' || v === undefined ? undefined : v),
    z.string().optional(),
  ),
  AI_VISION_ENDPOINT: z.preprocess(
    (v) => (v === '' || v === undefined ? undefined : v),
    z.string().url().optional(),
  ),

  /** CulinaBot `web_test.py` 基址，如 `http://127.0.0.1:7860`；不配置则识图为 mock */
  CULINABOT_URL: z.preprocess(
    (v) => (v === '' || v === undefined ? undefined : v),
    z.string().url().optional(),
  ),
  /** 多模态 Key：见阶跃开放平台 [接口密钥](https://platform.stepfun.com/interface-key) 或火山等提供方 */
  CULINABOT_LLM_API_KEY: z.preprocess(
    (v) => (v === '' || v === undefined ? undefined : v),
    z.string().optional(),
  ),
  /** OpenAI 兼容 Base URL。阶跃视觉示例：`https://api.stepfun.com/v1`（[快速开始](https://platform.stepfun.com/docs/zh/quickstart/overview)） */
  CULINABOT_LLM_BASE_URL: z.preprocess(
    (v) => (v === '' || v === undefined ? undefined : v),
    z.string().url().optional(),
  ),
  /** 识图建议：`step-1o-turbo-vision`（[图片理解 / 视觉模型](https://platform.stepfun.com/docs/zh/guides/developer/image-chat)） */
  CULINABOT_LLM_MODEL: z.preprocess(
    (v) => (v === '' || v === undefined ? undefined : v),
    z.string().optional(),
  ),
  CULINABOT_TAVILY_API_KEY: z.preprocess(
    (v) => (v === '' || v === undefined ? undefined : v),
    z.string().optional(),
  ),
  CULINABOT_QUESTION: z.preprocess(
    (v) => (v === '' || v === undefined ? undefined : v),
    z.string().optional(),
  ),

  RECIPE_API_KEY: z.string().optional(),
  MATCH_LLM_API_KEY: z.string().optional(),
  SOCKET_CORS_ORIGIN: z.string().optional(),
  CORS_ORIGIN: z.string().url(),
  EXTERNAL_USE_MOCK: z.enum(['true', 'false']).default('true'),
  INGREDIENTS_DEV_BYPASS_AUTH: z.preprocess(
    (v) => (v === undefined || v === '' ? 'true' : v),
    z.enum(['true', 'false']),
  ).transform((v) => v === 'true'),
});

export type Env = z.infer<typeof envSchema>;
