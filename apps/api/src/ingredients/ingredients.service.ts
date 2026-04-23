import { Injectable, Logger, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { randomUUID } from 'node:crypto';
import type { Ingredient } from '@lin-shi/contracts';
import type { Env } from '../config/env.schema';
import {
  INGREDIENT_RECOGNITION_USER_PROMPT_DEFAULT,
  parseCulinaBotAnswerToRecognized,
} from '@lin-shi/contracts';

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
   * 优先：配置了 `CULINABOT_URL` 则 `POST` 转发到同构的 `/api/test`（可为本仓库 `culina-server` 或历史 Python）；
   * 否则在配齐 `CULINABOT_LLM_*` 且 `CULINABOT_USE_TYPESCRIPT` 为真时，进程内执行 `@lin-shi/culina-agent`；
   * 再否则 mock。`answer` 经 {@link parseCulinaBotAnswerToRecognized} 映射为 `recognized`。
   */
  async recognizeFromUpload(file: Express.Multer.File): Promise<{ recognized: RecognizedItem[] }> {
    const apiKey = this.config.get('CULINABOT_LLM_API_KEY', { infer: true });
    const llmBase = this.config.get('CULINABOT_LLM_BASE_URL', { infer: true });
    const model = this.config.get('CULINABOT_LLM_MODEL', { infer: true });
    const hasLlm = Boolean(apiKey && llmBase && model);
    if (!hasLlm) {
      return this.mockRecognizeResponse();
    }

    const mime = file.mimetype || 'image/jpeg';
    const b64 = file.buffer.toString('base64');
    const image_data_url = `data:${mime};base64,${b64}`;
    const tavily = this.config.get('CULINABOT_TAVILY_API_KEY', { infer: true }) ?? '';
    const question =
      this.config.get('CULINABOT_QUESTION', { infer: true }) ?? INGREDIENT_RECOGNITION_USER_PROMPT_DEFAULT;
    const payload = {
      api_key: apiKey!,
      base_url: llmBase!,
      model: model!,
      tavily_api_key: tavily,
      question,
      image_data_url,
    } as const;

    const base = this.config.get('CULINABOT_URL', { infer: true });
    if (base) {
      return this.culinaAnswerToRecognized(await this.culinaFetchApiTest(base, payload));
    }

    const useTs = this.config.get('CULINABOT_USE_TYPESCRIPT', { infer: true });
    if (useTs) {
      return this.culinaAnswerToRecognized(await this.culinaInvokeTypeScript(payload));
    }

    return this.mockRecognizeResponse();
  }

  private async culinaFetchApiTest(
    base: string,
    payload: {
      api_key: string;
      base_url: string;
      model: string;
      tavily_api_key: string;
      question: string;
      image_data_url: string;
    },
  ): Promise<{ ok: boolean; answer?: string; error?: string }> {
    const target = new URL('/api/test', base.endsWith('/') ? base : `${base}/`);
    let res: Response;
    try {
      res = await fetch(target, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(180_000),
      });
    } catch (e) {
      this.logger.error(`Culina 请求失败: ${e instanceof Error ? e.message : String(e)}`);
      throw new ServiceUnavailableException('识图服务暂不可用，请稍后重试');
    }
    const data: unknown = await res.json().catch(() => null);
    const body = data as { ok?: boolean; answer?: string; error?: string } | null;
    if (!body) {
      this.logger.warn(`Culina 非 JSON 响应 HTTP ${res.status}`);
      throw new ServiceUnavailableException('识图服务返回异常');
    }
    if (!res.ok) {
      this.logger.warn(`Culina HTTP ${res.status} body=${JSON.stringify(body).slice(0, 500)}`);
      throw new ServiceUnavailableException('识图服务暂不可用');
    }
    if (body.ok !== true) {
      this.logger.warn(`Culina 业务失败: ${String(body.error).slice(0, 400)}`);
      throw new ServiceUnavailableException('识图失败，请重试或更换图片');
    }
    return { ok: true, answer: body.answer ?? '' };
  }

  private async culinaInvokeTypeScript(payload: {
    api_key: string;
    base_url: string;
    model: string;
    tavily_api_key: string;
    question: string;
    image_data_url: string;
  }): Promise<{ ok: boolean; answer?: string; error?: string }> {
    try {
      const { runCulinaPostApiTest } = await import('@lin-shi/culina-agent');
      return (await runCulinaPostApiTest(payload)) as { ok: boolean; answer?: string; error?: string };
    } catch (e) {
      this.logger.error(
        `Culina TypeScript 执行失败: ${e instanceof Error ? e.message : String(e)}`,
      );
      throw new ServiceUnavailableException('识图服务暂不可用，请稍后重试');
    }
  }

  private culinaAnswerToRecognized(body: { ok: boolean; answer?: string; error?: string }): {
    recognized: RecognizedItem[];
  } {
    if (!body.ok) {
      this.logger.warn(`Culina 业务失败: ${String(body.error).slice(0, 400)}`);
      throw new ServiceUnavailableException('识图失败，请重试或更换图片');
    }
    const answer = typeof body.answer === 'string' ? body.answer : '';
    const recognized = parseCulinaBotAnswerToRecognized(answer) as RecognizedItem[];
    if (recognized.length === 0) {
      this.logger.warn('Culina 返回未能解析出食材（answer 可人工对照日志）');
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
