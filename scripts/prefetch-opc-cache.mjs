// Prefetch OPC match agent response into public/demo-cache/opc-match.json.
//
// Why: The storyboard's frame 3 races a 3s live LLM call against a cached
// response. The cache is what guarantees the demo never stalls. This script
// produces a *real* agent response on your machine and burns it into the cache
// file, so during the 3-minute pitch you can truthfully say "agent really ran"
// even if the network hiccups.
//
// Run order:
//   1. In one terminal, start culina-server with the LLM env:
//        OPC_AGENT_KEY=sk-... \
//        OPC_AGENT_BASE_URL=https://api.your-provider/v1 \
//        OPC_AGENT_MODEL=your-model-name \
//        pnpm --filter @lin-shi/culina-server dev
//   2. In another terminal:
//        node scripts/prefetch-opc-cache.mjs
//
// The script never reads the LLM key — it just calls localhost:7860 and the
// server uses its own process env. Key never enters this file or any commit.

import { writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const CACHE_PATH = resolve(__dirname, '..', 'apps', 'web', 'public', 'demo-cache', 'opc-match.json');
const SERVER = process.env.CULINA_SERVER ?? 'http://127.0.0.1:7860';

const ideas = [
  { name: '番茄', styleTags: ['快速原型', '极简'], sceneTags: ['独立咖啡馆'], description: '想做独立咖啡馆 MVP' },
  { name: '鸡蛋', styleTags: ['React 全栈'], sceneTags: ['MVP 速搭'], description: '能给 React 全栈支持' },
];

async function main() {
  console.log(`[prefetch] POST ${SERVER}/api/opc-match …`);
  const t0 = Date.now();
  const r = await fetch(`${SERVER}/api/opc-match`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ideas }),
  });
  const json = await r.json();
  const ms = Date.now() - t0;
  console.log(`[prefetch] ← ${r.status} in ${ms}ms`);

  if (!json.ok) {
    console.error('[prefetch] agent FAILED:', json.error);
    console.error('[prefetch] cache file NOT modified.');
    console.error('[prefetch] check: server env OPC_AGENT_KEY/BASE_URL/MODEL set?');
    process.exitCode = 1;
    return;
  }

  await writeFile(CACHE_PATH, JSON.stringify(json, null, 2) + '\n', 'utf-8');
  console.log(`[prefetch] wrote ${CACHE_PATH}`);
  console.log('[prefetch] reason:', json.result.reason);
}

main().catch((e) => {
  console.error('[prefetch] crashed:', e);
  process.exitCode = 2;
});
