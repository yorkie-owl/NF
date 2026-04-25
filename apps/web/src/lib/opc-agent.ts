import type { OpcIdeaCard, OpcMatchResult, OpcMatchSuccess } from '@lin-shi/culina-agent';

const SERVER = process.env.NEXT_PUBLIC_CULINA_SERVER ?? 'http://127.0.0.1:7860';
const TIMEOUT_MS = 3000;

async function readCache(): Promise<OpcMatchResult> {
  const r = await fetch('/demo-cache/opc-match.json', { cache: 'no-store' });
  const j = (await r.json()) as OpcMatchSuccess;
  return j.result;
}

/**
 * 调真 LLM 匹配；3s 内未回则 race 输给 cache。
 * cache 赢时 abort live fetch，避免后台多跑一次 LLM 调用与丢弃响应。
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

  const ac = new AbortController();
  let timer: ReturnType<typeof setTimeout> | null = null;

  const live = (async (): Promise<{ result: OpcMatchResult; source: 'live' }> => {
    const r = await fetch(`${SERVER}/api/opc-match`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ api_key: apiKey, base_url: baseUrl, model, ideas }),
      signal: ac.signal,
    });
    const j = (await r.json()) as { ok: boolean; result?: OpcMatchResult; error?: string };
    if (!j.ok || !j.result) throw new Error(j.error ?? 'live failed');
    return { result: j.result, source: 'live' };
  })();

  const fallback = new Promise<{ result: OpcMatchResult; source: 'cache' }>((resolve) => {
    timer = setTimeout(async () => {
      ac.abort();
      resolve({ result: await readCache(), source: 'cache' });
    }, TIMEOUT_MS);
  });

  try {
    return await Promise.race([live, fallback]);
  } catch {
    return { result: await readCache(), source: 'cache' as const };
  } finally {
    if (timer) clearTimeout(timer);
  }
}
