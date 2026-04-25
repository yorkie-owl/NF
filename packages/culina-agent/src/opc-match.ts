import { HumanMessage } from '@langchain/core/messages';
import { ChatOpenAI } from '@langchain/openai';
import { z } from 'zod';
import { OPC_MATCH_SYSTEM_PROMPT } from './opc-match-prompt.js';

export const OpcIdeaCardSchema = z.object({
  name: z.string(),
  styleTags: z.array(z.string()),
  sceneTags: z.array(z.string()),
  description: z.string().optional().default(''),
});
export type OpcIdeaCard = z.infer<typeof OpcIdeaCardSchema>;

export const OpcMatchResultSchema = z.object({
  matchScore: z.number().min(0).max(1),
  reason: z.string(),
  suggestedTitle: z.string(),
  icebreakers: z.array(z.string()).length(3),
  milestone: z.string(),
});
export type OpcMatchResult = z.infer<typeof OpcMatchResultSchema>;

export type OpcMatchInput = {
  api_key: string;
  base_url: string;
  model: string;
  ideas: OpcIdeaCard[];
};

export type OpcMatchSuccess = { ok: true; result: OpcMatchResult };
export type OpcMatchFailure = { ok: false; error: string };

export async function runOpcMatch(
  input: OpcMatchInput,
): Promise<OpcMatchSuccess | OpcMatchFailure> {
  try {
    const ideas = input.ideas.map((c) => OpcIdeaCardSchema.parse(c));
    const llm = new ChatOpenAI({
      model: input.model,
      apiKey: input.api_key,
      configuration: { baseURL: input.base_url },
      temperature: 0.4,
    });
    const human = new HumanMessage({
      content: `这是 ${ideas.length} 张 idea 卡（JSON）：\n${JSON.stringify(ideas, null, 2)}\n请按 system 规定的 JSON 输出。`,
    });
    const sys = { role: 'system' as const, content: OPC_MATCH_SYSTEM_PROMPT };
    const response = await llm.invoke([sys, human]);
    const text = typeof response.content === 'string'
      ? response.content
      : (response.content as Array<{ type?: string; text?: string }>).map((p) => p.text ?? '').join('');
    const json = extractJson(text);
    const result = OpcMatchResultSchema.parse(json);
    return { ok: true, result };
  } catch (e) {
    const err = e instanceof Error ? e : new Error(String(e));
    return { ok: false, error: err.message };
  }
}

function extractJson(s: string): unknown {
  const trimmed = s.trim();
  try {
    return JSON.parse(trimmed);
  } catch {
    const start = trimmed.indexOf('{');
    const end = trimmed.lastIndexOf('}');
    if (start === -1 || end === -1 || end <= start) {
      throw new Error('no JSON object in LLM response');
    }
    return JSON.parse(trimmed.slice(start, end + 1));
  }
}
