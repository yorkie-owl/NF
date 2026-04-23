import {
  INGREDIENT_RECOGNITION_SYSTEM_CULINABOT_ALIGNED,
  INGREDIENT_RECOGNITION_USER_PROMPT_DEFAULT,
  parseCulinaBotAnswerToRecognized,
  type ParsedRecognizedItem,
} from '@lin-shi/contracts';
import { type NextRequest, NextResponse } from 'next/server';

const DEFAULT_RECOGNIZE_BASE_URL = 'https://api.stepfun.com/v1';
const DEFAULT_RECOGNIZE_MODEL = 'step-1o-turbo-vision';

const MOCK: { recognized: ParsedRecognizedItem[] } = {
  recognized: [
    { name: '青椒', confidence: 0.92, tasteTags: ['清爽', '微辣'] },
    { name: '土豆', confidence: 0.88, tasteTags: ['淀粉', '饱腹'] },
  ],
};

/** 与 env.example 中命名一致；兼容旧名 RECOGNIZE_LLM_*、CULINABOT_LLM_*（与 api 共用时常拷同一套）。 */
function readRecognizeConfig(): {
  key: string;
  base: string;
  model: string;
  forceMock: boolean;
  requireReal: boolean;
} {
  const key =
    process.env.RECOGNIZE_API_KEY?.trim() ||
    process.env.RECOGNIZE_LLM_API_KEY?.trim() ||
    process.env.CULINABOT_LLM_API_KEY?.trim() ||
    '';
  const base =
    process.env.RECOGNIZE_BASE_URL?.trim() ||
    process.env.RECOGNIZE_LLM_BASE_URL?.trim() ||
    process.env.CULINABOT_LLM_BASE_URL?.trim() ||
    DEFAULT_RECOGNIZE_BASE_URL;
  const model =
    process.env.RECOGNIZE_MODEL?.trim() ||
    process.env.RECOGNIZE_LLM_MODEL?.trim() ||
    process.env.CULINABOT_LLM_MODEL?.trim() ||
    DEFAULT_RECOGNIZE_MODEL;
  const forceMock =
    process.env.RECOGNIZE_MOCK === 'true' || process.env.RECOGNIZE_USE_MOCK === 'true';
  const requireReal =
    process.env.RECOGNIZE_MOCK === 'false' || process.env.RECOGNIZE_USE_MOCK === 'false';
  return { key, base, model, forceMock, requireReal };
}

function openAiMessageText(content: unknown): string {
  if (content == null) return '';
  if (typeof content === 'string') return content;
  if (Array.isArray(content)) {
    return content
      .map((p) => {
        if (typeof p === 'string') return p;
        if (p && typeof p === 'object' && p !== null && 'text' in p) {
          return String((p as { text?: string }).text ?? '');
        }
        return '';
      })
      .filter(Boolean)
      .join('\n');
  }
  return String(content);
}

export const maxDuration = 120;

/** 解析阶跃 / OpenAI 兼容错误体，便于在 4xx/5xx 时排查（密钥、限流、模型名、图过大等） */
function parseUpstreamErrorText(body: unknown, status: number): string {
  if (body == null) return `上游返回 HTTP ${status}（无响应体）`;
  if (typeof body === 'string') return body.slice(0, 800);
  if (typeof body === 'object' && body !== null) {
    const o = body as Record<string, unknown>;
    const err = o.error;
    if (err && typeof err === 'object' && err !== null) {
      const m = (err as { message?: string }).message;
      if (typeof m === 'string' && m.length > 0) return m;
    }
    const m = o.message;
    if (typeof m === 'string' && m.length > 0) return m;
    try {
      return JSON.stringify(o).slice(0, 800);
    } catch {
      return `上游错误 HTTP ${status}`;
    }
  }
  return `上游返回 HTTP ${status}`;
}

/**
 * 本地识图：直连 OpenAI 兼容多模态；有 RECOGNIZE_API_KEY 即真识图，BASE/MODEL 有默认值。
 */
export async function POST(req: NextRequest) {
  const { key, base, model, forceMock, requireReal } = readRecognizeConfig();
  const hasKey = key.length > 0;

  if (forceMock) {
    return NextResponse.json(MOCK);
  }

  if (!hasKey) {
    if (requireReal) {
      return NextResponse.json(
        { statusCode: 503, code: 'SERVICE_UNAVAILABLE', message: '识图未配置：请设置 RECOGNIZE_API_KEY' },
        { status: 503 },
      );
    }
    return NextResponse.json(MOCK);
  }

  const form = await req.formData();
  const f = form.get('file');
  if (typeof f === 'string' || f == null) {
    return NextResponse.json(
      { statusCode: 400, code: 'VALIDATION', message: 'file required (multipart field: file)' },
      { status: 400 },
    );
  }
  if (!(f instanceof Blob) || f.size < 1) {
    return NextResponse.json(
      { statusCode: 400, code: 'VALIDATION', message: 'file required (multipart field: file)' },
      { status: 400 },
    );
  }

  const buf = Buffer.from(await f.arrayBuffer());
  const mime = f.type && f.type.length > 0 ? f.type : 'image/jpeg';
  const imageUrl = `data:${mime};base64,${buf.toString('base64')}`;
  const userPrompt =
    process.env.RECOGNIZE_QUESTION?.trim() ||
    process.env.CULINABOT_QUESTION?.trim() ||
    INGREDIENT_RECOGNITION_USER_PROMPT_DEFAULT;
  const systemPrompt =
    process.env.RECOGNIZE_SYSTEM?.trim() || INGREDIENT_RECOGNITION_SYSTEM_CULINABOT_ALIGNED;
  const baseUrl = base.replace(/\/$/, '');
  const chatUrl = `${baseUrl}/chat/completions`;

  let res: Response;
  try {
    res = await fetch(chatUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${key}`,
      },
      body: JSON.stringify({
        model,
        max_tokens: 2048,
        messages: [
          { role: 'system', content: systemPrompt },
          {
            role: 'user',
            content: [
              { type: 'text', text: userPrompt },
              { type: 'image_url', image_url: { url: imageUrl } },
            ],
          },
        ],
      }),
      signal: AbortSignal.timeout(180_000),
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.json(
      { statusCode: 502, code: 'RECOGNIZE_NETWORK', message: `请求阶跃失败（网络/超时）：${msg}` },
      { status: 502 },
    );
  }

  const resText = await res.text();
  let raw: unknown = null;
  try {
    raw = resText ? (JSON.parse(resText) as unknown) : null;
  } catch {
    raw = { parse_error: resText.slice(0, 500) };
  }
  if (!res.ok) {
    const message = parseUpstreamErrorText(raw, res.status);
    if (process.env.NODE_ENV === 'development') {
      console.error(
        '[recognize] StepFun HTTP',
        res.status,
        message.slice(0, 400),
      );
    }
    const errMsg =
      res.status === 401
        ? `鉴权失败：${message}。请检查 apps/web/.env.local 的 RECOGNIZE_API_KEY（阶跃「接口密钥」须正确、未过期）。`
        : message;
    return NextResponse.json(
      { statusCode: 502, code: 'RECOGNIZE_UPSTREAM', message: errMsg },
      { status: 502 },
    );
  }

  const data = raw as { choices?: Array<{ message?: { content?: unknown } }> } | null;
  const answer = openAiMessageText(data?.choices?.[0]?.message?.content);
  const recognized = parseCulinaBotAnswerToRecognized(answer) as ParsedRecognizedItem[];
  return NextResponse.json({ recognized });
}
