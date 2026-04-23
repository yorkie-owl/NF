import { HumanMessage } from '@langchain/core/messages';
import { buildCulinaAgentFromBody, type CulinaApiTestBody } from './culina-agent-factory.js';
import { extractAnswerFromAgentOutput } from './extract-answer.js';

export type ApiTestSuccess = { ok: true; answer: string };
export type ApiTestFailure = { ok: false; error: string };
export type ApiTestResult = ApiTestSuccess | ApiTestFailure;

/**
 * 对齐 `web_test.py` `POST /api/test` 的 JSON 契约与行为（TS 实现，无 Python）。
 */
export async function runCulinaPostApiTest(body: unknown): Promise<ApiTestResult> {
  try {
    const raw = body as Record<string, unknown>;
    const api_key = String(raw.api_key ?? '').trim();
    const base_url = String(raw.base_url ?? '').trim();
    const model = String(raw.model ?? '').trim();
    const tavily_api_key = String(raw.tavily_api_key ?? '').trim();
    const question = String(raw.question ?? '').trim() || '帮我看看能做什么？';
    const image_data_url = String(raw.image_data_url ?? '').trim();
    const image_url = String(raw.image_url ?? '').trim();
    if (!api_key || !base_url || !model) {
      return { ok: false, error: '请填写 API Key、Base URL 和 Model。' };
    }
    const payload: CulinaApiTestBody = {
      api_key,
      base_url,
      model,
      tavily_api_key,
      question,
      image_data_url,
      image_url,
    };
    const agent = buildCulinaAgentFromBody(payload);
    const textParts: Array<
      { type: 'text'; text: string } | { type: 'image_url'; image_url: { url: string } }
    > = [{ type: 'text', text: question }];
    if (image_data_url) {
      textParts.push({ type: 'image_url', image_url: { url: image_data_url } });
    } else if (image_url) {
      textParts.push({ type: 'image_url', image_url: { url: image_url } });
    }
    const human = new HumanMessage({ content: textParts });
    const response = await agent.invoke(
      { messages: [human] },
      { configurable: { thread_id: 'web_test' } },
    );
    const answer = extractAnswerFromAgentOutput(response);
    return { ok: true, answer };
  } catch (e) {
    const err = e instanceof Error ? e : new Error(String(e));
    return { ok: false, error: `${err.message}\n\n${err.stack ?? ''}` };
  }
}
