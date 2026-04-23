import { CULINABOT_FULL_SYSTEM_PROMPT, CULINABOT_FULL_SYSTEM_PROMPT_NO_WEB } from '@lin-shi/contracts';
import { MemorySaver } from '@langchain/langgraph-checkpoint';
import { ChatOpenAI } from '@langchain/openai';
import { TavilySearch } from '@langchain/tavily';
import { createAgent } from 'langchain';
import { z } from 'zod';

const ApiTestBodySchema = z.object({
  api_key: z.string().min(1),
  base_url: z.string().url(),
  model: z.string().min(1),
  tavily_api_key: z.string().optional().default(''),
  question: z.string().optional().default(''),
  image_data_url: z.string().optional().default(''),
  image_url: z.string().optional().default(''),
});

export type CulinaApiTestBody = z.infer<typeof ApiTestBodySchema>;

function buildSystemPrompt(hasTavily: boolean): string {
  return hasTavily ? CULINABOT_FULL_SYSTEM_PROMPT : CULINABOT_FULL_SYSTEM_PROMPT_NO_WEB;
}

/**
 * 对齐 `web_test.build_agent`：多模态 ChatOpenAI + 可选 Tavily + MemorySaver checkpointer + `createAgent`（ReAct）。
 */
export function buildCulinaAgentFromBody(body: CulinaApiTestBody) {
  const parsed = ApiTestBodySchema.parse(body);
  const tavilyKey = parsed.tavily_api_key.trim();
  const hasTavily = tavilyKey.length > 0;
  const tools = hasTavily
    ? [
        new TavilySearch({
          tavilyApiKey: tavilyKey,
          maxResults: 5,
        }),
      ]
    : [];
  const model = new ChatOpenAI({
    model: parsed.model,
    apiKey: parsed.api_key,
    configuration: { baseURL: parsed.base_url },
    temperature: 0.2,
  });
  return createAgent({
    model,
    tools,
    systemPrompt: buildSystemPrompt(hasTavily),
    checkpointer: new MemorySaver(),
  });
}

export { ApiTestBodySchema };
