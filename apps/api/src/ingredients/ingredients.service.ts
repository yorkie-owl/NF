import { Injectable, Logger, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { randomUUID } from 'node:crypto';
import type { Ingredient } from '@lin-shi/contracts';
import type { Env } from '../config/env.schema';
import { parseCulinaBotAnswerToRecognized } from './culinabot-answer';

const DEMO_USER = '00000000-0000-4000-8000-000000000001';

export type RecognizedItem = {
  name: string;
  confidence: number;
  tasteTags: string[];
};

export type CreateIngredientInput = {
  userId: string;
  name: string;
  category: string | null;
  tasteTags: string[];
  recognizedFromImageUrl: string | null;
};

const DEFAULT_CULINABOT_QUESTION =
  '请识别图中可见的食材，只输出食材名称，用顿号「、」分隔，不要编号和多余说明。';

/** Mock 数据：队友接入 `i_ingredients` 后可替换为 TypeORM。 */
@Injectable()
export class IngredientsService {
  private readonly logger = new Logger(IngredientsService.name);

  private readonly mock: Ingredient[] = [
    {
      id: '10000000-0000-4000-8000-000000000001',
      userId: DEMO_USER,
      name: '番茄',
      category: '蔬菜',
      tasteTags: ['酸甜', '多汁'],
      recognizedFromImageUrl: null,
      addedAt: new Date(Date.now() - 86400000).toISOString(),
      expiresAt: new Date(Date.now() + 86400000 * 2).toISOString(),
    },
    {
      id: '10000000-0000-4000-8000-000000000002',
      userId: DEMO_USER,
      name: '鸡蛋',
      category: '蛋奶',
      tasteTags: ['高蛋白'],
      recognizedFromImageUrl: null,
      addedAt: new Date(Date.now() - 172800000).toISOString(),
      expiresAt: new Date(Date.now() + 432000000).toISOString(),
    },
    {
      id: '10000000-0000-4000-8000-000000000003',
      userId: DEMO_USER,
      name: '牛奶',
      category: '饮品',
      tasteTags: ['乳香'],
      recognizedFromImageUrl: null,
      addedAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 86400000 * 3).toISOString(),
    },
  ];

  constructor(private readonly config: ConfigService<Env, true>) {}

  listByUser(userId: string): Ingredient[] {
    return this.mock.filter((i) => i.userId === userId);
  }

  getByIds(ids: string[]): Ingredient[] {
    const set = new Set(ids);
    return this.mock.filter((i) => set.has(i.id));
  }

  getDemoUserId(): string {
    return DEMO_USER;
  }

  /**
   * 契约 §7.1：multipart 图片 → 识图结果。
   * 若配置 `CULINABOT_URL` 与 LLM 相关变量，则转发到 CulinaBot `web_test` 的 `POST /api/test`；
   * 否则返回 mock。长文本 `answer` 经 {@link parseCulinaBotAnswerToRecognized} 映射为 `recognized`。
   */
  async recognizeFromUpload(file: Express.Multer.File): Promise<{ recognized: RecognizedItem[] }> {
    const base = this.config.get('CULINABOT_URL', { infer: true });
    if (!base) {
      return this.mockRecognizeResponse();
    }

    const apiKey = this.config.get('CULINABOT_LLM_API_KEY', { infer: true });
    const llmBase = this.config.get('CULINABOT_LLM_BASE_URL', { infer: true });
    const model = this.config.get('CULINABOT_LLM_MODEL', { infer: true });
    if (!apiKey || !llmBase || !model) {
      this.logger.warn('CULINABOT_URL 已设但 CULINABOT_LLM_* 不完整，回退 mock');
      return this.mockRecognizeResponse();
    }

    const mime = file.mimetype || 'image/jpeg';
    const b64 = file.buffer.toString('base64');
    const image_data_url = `data:${mime};base64,${b64}`;
    const tavily = this.config.get('CULINABOT_TAVILY_API_KEY', { infer: true }) ?? '';
    const question = this.config.get('CULINABOT_QUESTION', { infer: true }) ?? DEFAULT_CULINABOT_QUESTION;

    const target = new URL('/api/test', base.endsWith('/') ? base : `${base}/`);

    let res: Response;
    try {
      res = await fetch(target, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          api_key: apiKey,
          base_url: llmBase,
          model,
          tavily_api_key: tavily,
          question,
          image_data_url,
        }),
        signal: AbortSignal.timeout(180_000),
      });
    } catch (e) {
      this.logger.error(`CulinaBot 请求失败: ${e instanceof Error ? e.message : String(e)}`);
      throw new ServiceUnavailableException('识图服务暂不可用，请稍后重试');
    }

    const data: unknown = await res.json().catch(() => (null));
    const body = data as { ok?: boolean; answer?: string; error?: string } | null;
    if (!body) {
      this.logger.warn(`CulinaBot 非 JSON 响应 HTTP ${res.status}`);
      throw new ServiceUnavailableException('识图服务返回异常');
    }
    if (!res.ok) {
      this.logger.warn(`CulinaBot HTTP ${res.status} body=${JSON.stringify(body).slice(0, 500)}`);
      throw new ServiceUnavailableException('识图服务暂不可用');
    }
    if (!body.ok) {
      this.logger.warn(`CulinaBot 业务失败: ${String(body.error).slice(0, 400)}`);
      throw new ServiceUnavailableException('识图失败，请重试或更换图片');
    }

    const answer = typeof body.answer === 'string' ? body.answer : '';
    const recognized = parseCulinaBotAnswerToRecognized(answer) as RecognizedItem[];
    if (recognized.length === 0) {
      this.logger.warn('CulinaBot 返回未能解析出食材（answer 可人工对照日志）');
    }
    return { recognized };
  }

  private mockRecognizeResponse(): { recognized: RecognizedItem[] } {
    return {
      recognized: [
        { name: '青椒', confidence: 0.92, tasteTags: ['清爽', '微辣'] },
        { name: '土豆', confidence: 0.88, tasteTags: ['淀粉', '饱腹'] },
      ],
    };
  }

  /** 向 mock 追加一条，字段符合 IngredientSchema */
  addIngredient(input: CreateIngredientInput): Ingredient {
    const now = Date.now();
    const day = 86400000;
    const row: Ingredient = {
      id: randomUUID(),
      userId: input.userId,
      name: input.name,
      category: input.category,
      tasteTags: input.tasteTags,
      recognizedFromImageUrl: input.recognizedFromImageUrl,
      addedAt: new Date(now).toISOString(),
      expiresAt: new Date(now + day).toISOString(),
    };
    this.mock.push(row);
    return row;
  }
}
