import type { OpcIdeaCard, OpcMatchResult } from '@lin-shi/culina-agent';

const SERVER = process.env.NEXT_PUBLIC_CULINA_SERVER ?? 'http://127.0.0.1:7860';
const TIMEOUT_MS = 3000;

type CacheEnvelope = { ok: true; result: OpcMatchResult };

async function readCache(): Promise<OpcMatchResult> {
  const r = await fetch('/demo-cache/opc-match.json', { cache: 'no-store' });
  const j = (await r.json()) as CacheEnvelope;
  return j.result;
}

/**
 * 调真 LLM 匹配；3s 内未回则 race 输给 cache。
 */
export async function matchIdeas(ideas: OpcIdeaCard[]): Promise<{
  result: OpcMatchResult;
  source: 'live' | 'cache';
}> {
  const apiKey = process.env.NEXT_PUBLIC_OPC_AGENT_KEY ?? '';
  const baseUrl = process.env.NEXT_PUBLIC_OPC_AGENT_BASE_URL ?? '';
  const model = process.env.NEXT_PUBLIC_OPC_AGENT_MODEL ?? '';
  if (!apiKey || !baseUrl || !model) {
    return { result: await readCache(), source: 'cache' };
  }

  const live = (async (): Promise<{ result: OpcMatchResult; source: 'live' }> => {
    const r = await fetch(`${SERVER}/api/opc-match`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ api_key: apiKey, base_url: baseUrl, model, ideas }),
    });
    const j = (await r.json()) as { ok: boolean; result?: OpcMatchResult; error?: string };
    if (!j.ok || !j.result) throw new Error(j.error ?? 'live failed');
    return { result: j.result, source: 'live' };
  })();

  const fallback = new Promise<{ result: OpcMatchResult; source: 'cache' }>((resolve) => {
    setTimeout(async () => {
      resolve({ result: await readCache(), source: 'cache' });
    }, TIMEOUT_MS);
  });

  return Promise.race([live, fallback]).catch(async () => ({
    result: await readCache(),
    source: 'cache' as const,
  }));
}
