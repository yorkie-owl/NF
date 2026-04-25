# OPC Pivot Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 把"邻食"产品从留学生干饭社交 pivot 成 OPC（一人公司/十人内小协作团体）协作平台。隐喻整套保留（食材 = idea / 锅 = 协作局 / culina-bot = OPC 拼桌助理），通过新增 idea 躁动→出走→AI 匹配→拼桌→局长助理→复盘的链路，加上一个半手动 storyboard 演示页 `/?demo=1`，实现明天 3 分钟路演的"哇瞬间"。

**Architecture:** 复用现有 `Ingredient`/`Activity` 数据模型与 contracts；零后端改动；`packages/culina-agent` 复用 LangGraph 骨架，加一个新 system prompt + endpoint；前端新增 idea 躁动机制组件、AI 匹配客户端（含 3s 超时 + cache fallback）、局长助理 fake bubble、复盘卡、storyboard driver。

**Tech Stack:** Next.js 15 App Router + React 19 + TailwindCSS 4 + Framer Motion + zod + LangChain/LangGraph（已存在的 `@lin-shi/culina-agent`）+ 原生 Node http server。

**约束（用户决策已锁定）：**
- 名字保留"邻食"，emoji/文案不动
- 对抗局完全不提（不加 kind chip）
- 路演 storyboard 半手动按"下一帧"
- LLM key 用户后给，先 mock + cache 兜底
- 不写单元测试，靠 grep + Playwright 端到端验

**前端 UI 工作必须协助加载 `frontend-logic-design` + `ui-ux-pro-max`** 这两个 skill 决定视觉细节（出走动画 / 进度环 / 气泡 / 复盘卡）。

---

## File Structure

### 新建文件
| 路径 | 职责 |
|---|---|
| `apps/web/src/lib/restlessness.ts` | 纯函数：根据 ingredient 计算 0..100 躁动指数 |
| `apps/web/src/components/idea/RestlessnessRing.tsx` | SVG 进度环，0..100 输入 |
| `apps/web/src/components/idea/IdeaWalkOut.tsx` | Framer Motion 出走动画（卡片飞出冰箱） |
| `apps/web/src/lib/opc-agent.ts` | 客户端调 OPC 匹配 agent，3s 超时 race cache |
| `apps/web/public/demo-cache/opc-match.json` | 预录响应，作为 LLM 失败 fallback |
| `apps/web/src/components/activities/AgentBubble.tsx` | 活动详情页里的"局长助理"消息气泡 |
| `apps/web/src/components/activities/RetroCard.tsx` | 活动 COMPLETED 时显示的复盘卡 |
| `apps/web/src/lib/storyboard-frames.ts` | 6 帧 storyboard 数据（route + narration + action） |
| `apps/web/src/components/demo/StoryboardDriver.tsx` | 半手动 storyboard 控制器组件（字幕条 + 上下帧按钮） |
| `apps/web/src/components/demo/StoryboardMount.tsx` | 监听 `?demo=1` query 决定是否挂载 driver |
| `packages/culina-agent/src/opc-match-prompt.ts` | OPC 拼桌助理 system prompt 文本 |
| `packages/culina-agent/src/opc-match.ts` | `runOpcMatch(ideas[]) → { matchScore, reason, suggestedTitle, icebreakers[3], milestone }` |

### 修改文件
| 路径 | 改动 |
|---|---|
| `apps/web/src/lib/demo-ingredients.ts` | 9 个 entry 的 tasteTags / contextTags 替换为 OPC 风格/场景词 |
| `apps/web/src/app/fridge/inside/page.tsx` | 在 `IngredientCell` 角落渲染 `RestlessnessRing` |
| `apps/web/src/app/(protected)/activities/[id]/page.tsx` | 在合适位置插入 `AgentBubble`（FORMED+）和 `RetroCard`（COMPLETED） |
| `apps/web/src/app/layout.tsx` | 挂载 `StoryboardMount`（仅在 `?demo=1` 时激活） |
| `apps/culina-server/src/main.ts` | 加 `POST /api/opc-match` 端点 |
| `packages/culina-agent/src/index.ts` | re-export `runOpcMatch` 与 prompt |

---

## Task 1 · OPC vocabulary swap in demo ingredients

**Files:**
- Modify: `apps/web/src/lib/demo-ingredients.ts`

- [ ] **Step 1.1: 替换 9 个 entry 的 tasteTags（=风格） / contextTags（=场景）为 OPC 词典**

```ts
const ENTRIES: {
  name: string;
  id: string;
  category: string;
  tasteTags: string[];
  contextTags: string[];
  gone: boolean;
}[] = [
  { name: '西兰花', id: 'b0000000-0000-4000-8000-000000000001', category: '想做的事', tasteTags: ['长期主义'], contextTags: ['可持续品牌'], gone: true },
  { name: '胡萝卜', id: 'b0000000-0000-4000-8000-000000000002', category: '想做的事', tasteTags: ['工程感'], contextTags: ['B2B SaaS'], gone: true },
  { name: '番茄', id: 'b0000000-0000-4000-8000-000000000003', category: '想做的事', tasteTags: ['快速原型', '极简'], contextTags: ['独立咖啡馆'], gone: false },
  { name: '鸡蛋', id: 'b0000000-0000-4000-8000-000000000004', category: '我能给的', tasteTags: ['React 全栈'], contextTags: ['MVP 速搭'], gone: false },
  { name: '柠檬', id: 'b0000000-0000-4000-8000-000000000005', category: '想做的事', tasteTags: ['锋利', '毒舌'], contextTags: ['内容工作坊'], gone: false },
  { name: '玉米', id: 'b0000000-0000-4000-8000-000000000006', category: '我能给的', tasteTags: ['朴素好用'], contextTags: ['社区运营'], gone: false },
  { name: '生菜', id: 'b0000000-0000-4000-8000-000000000007', category: '想做的事', tasteTags: ['轻盈', '日常'], contextTags: ['周更播客'], gone: false },
  { name: '洋葱', id: 'b0000000-0000-4000-8000-000000000008', category: '我能给的', tasteTags: ['有层次', '抗压'], contextTags: ['危机公关'], gone: false },
  { name: '葡萄', id: 'b0000000-0000-4000-8000-000000000009', category: '想做的事', tasteTags: ['成串', '复利'], contextTags: ['会员体系'], gone: false },
];
```

- [ ] **Step 1.2: grep verify**

Run: `grep -n "tasteTags\|contextTags" apps/web/src/lib/demo-ingredients.ts`
Expected: 9 行 entry 全部命中且无遗漏。

- [ ] **Step 1.3: Commit**

```bash
git add apps/web/src/lib/demo-ingredients.ts
git commit -m "feat(opc): repurpose demo ingredients with OPC tags"
```

---

## Task 2 · Restlessness helper

**Files:**
- Create: `apps/web/src/lib/restlessness.ts`

- [ ] **Step 2.1: 写纯函数**

```ts
import type { Ingredient } from '@lin-shi/contracts';

/**
 * 把"食材"重新解读为 OPC idea 卡——躁动指数 0..100。
 * - 0 表示刚上架；100 表示已超期，必须出走。
 */
export function restlessness(ing: Pick<Ingredient, 'addedAt' | 'expiresAt'>): number {
  const added = new Date(ing.addedAt).getTime();
  const expires = new Date(ing.expiresAt).getTime();
  const span = expires - added;
  if (span <= 0) return 100;
  const elapsed = Date.now() - added;
  if (elapsed <= 0) return 0;
  if (elapsed >= span) return 100;
  return Math.round((elapsed / span) * 100);
}

export function isRestless(ing: Pick<Ingredient, 'addedAt' | 'expiresAt'>): boolean {
  return restlessness(ing) >= 95;
}
```

- [ ] **Step 2.2: 类型检查**

Run: `pnpm --filter @lin-shi/web typecheck`
Expected: PASS（如果失败立即修，禁 any）。

- [ ] **Step 2.3: Commit**

```bash
git add apps/web/src/lib/restlessness.ts
git commit -m "feat(opc): add restlessness helper for idea cards"
```

---

## Task 3 · RestlessnessRing component

**Files:**
- Create: `apps/web/src/components/idea/RestlessnessRing.tsx`

> **协助 skill：** 调用 `frontend-logic-design` 与 `ui-ux-pro-max`，确认环的视觉风格——尺寸 14-20px、颗粒感、渐变色（≥95% 时变红色 + 心跳脉冲）。

- [ ] **Step 3.1: 写组件**

```tsx
'use client';

import { motion } from 'framer-motion';

type Props = {
  /** 0..100 */
  value: number;
  /** 视觉直径 px */
  size?: number;
  className?: string;
};

const STROKE = 2;

/**
 * 一个圆环进度条。≥95% 时心跳脉冲提示"它要出门了"。
 */
export function RestlessnessRing({ value, size = 16, className }: Props) {
  const v = Math.max(0, Math.min(100, value));
  const r = (size - STROKE) / 2;
  const c = 2 * Math.PI * r;
  const offset = c * (1 - v / 100);
  const restless = v >= 95;
  const stroke = restless ? '#fb7185' : v >= 60 ? '#f97316' : '#a3a3a3';

  return (
    <motion.svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      className={className}
      animate={restless ? { scale: [1, 1.08, 1] } : { scale: 1 }}
      transition={restless ? { repeat: Infinity, duration: 0.9, ease: 'easeInOut' } : { duration: 0 }}
      aria-label={`躁动 ${v}%`}
      role="img"
    >
      <circle cx={size / 2} cy={size / 2} r={r} stroke="rgba(0,0,0,0.06)" strokeWidth={STROKE} fill="none" />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        stroke={stroke}
        strokeWidth={STROKE}
        fill="none"
        strokeDasharray={c}
        strokeDashoffset={offset}
        strokeLinecap="round"
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
      />
    </motion.svg>
  );
}
```

- [ ] **Step 3.2: 类型检查**

Run: `pnpm --filter @lin-shi/web typecheck`
Expected: PASS。

- [ ] **Step 3.3: Commit**

```bash
git add apps/web/src/components/idea/RestlessnessRing.tsx
git commit -m "feat(opc): add RestlessnessRing svg component"
```

---

## Task 4 · Wire RestlessnessRing into IngredientCell

**Files:**
- Modify: `apps/web/src/app/fridge/inside/page.tsx:46-67`

- [ ] **Step 4.1: 在 `IngredientCell` 内嵌入环**

替换现有 `IngredientCell`（`fridge/inside/page.tsx:46-67`）为：

```tsx
import { RestlessnessRing } from '@/components/idea/RestlessnessRing';
import { restlessness } from '@/lib/restlessness';
// （在文件顶部 import 区追加上面两行）

function IngredientCell({ cell, ingredient }: { cell: GridCell; ingredient?: Ingredient }) {
  const restless = ingredient ? restlessness(ingredient) : cell.gone ? 100 : 30;
  return (
    <Link
      href={cell.href}
      className="group flex min-h-[48px] flex-col items-center gap-1 rounded-xl p-0.5 outline-none ring-rose-400/0 transition hover:opacity-95 active:scale-[0.97] focus-visible:ring-2 focus-visible:ring-rose-300/80"
    >
      <div
        className={`relative flex h-[40px] w-[40px] items-center justify-center rounded-[10px] bg-white shadow-md ring-1 ring-black/[0.06] transition group-hover:ring-rose-200/80 sm:h-[44px] sm:w-[44px] ${cell.gone ? 'opacity-45 grayscale' : ''}`}
      >
        <span className="text-lg sm:text-xl">{cell.emoji}</span>
        {cell.gone ? (
          <span className="absolute -right-1 -top-1 rounded-full bg-pink-400 px-1.5 py-0.5 text-[9px] font-medium text-white">
            出走
          </span>
        ) : (
          <span className="absolute -right-0.5 -top-0.5">
            <RestlessnessRing value={restless} size={14} />
          </span>
        )}
      </div>
      <span className="max-w-[44px] truncate text-center text-[8px] leading-tight text-neutral-700 sm:max-w-[48px] sm:text-[9px]">
        {cell.name}
      </span>
    </Link>
  );
}
```

`buildGrid` 已经返回 `cells`，需要把对应 `Ingredient` 也带回去：把 `GridCell` 类型加 `ingredient?: Ingredient`，`buildGrid` 真实分支里写 `ingredient: ing`，demo 分支写 `ingredient: undefined`，然后在调用处 `<IngredientCell key={...} cell={cell} ingredient={cell.ingredient} />`。

- [ ] **Step 4.2: 类型检查 + 启动 dev server 手测**

Run:
```bash
pnpm --filter @lin-shi/web typecheck
pnpm --filter @lin-shi/web dev
```
打开 http://localhost:3001/fridge/inside ，看到 9 张食材右上角有进度环；过期的 2 张仍显示"出走"。

- [ ] **Step 4.3: Commit**

```bash
git add apps/web/src/app/fridge/inside/page.tsx
git commit -m "feat(opc): show restlessness ring on each ingredient cell"
```

---

## Task 5 · OPC match prompt + agent

**Files:**
- Create: `packages/culina-agent/src/opc-match-prompt.ts`
- Create: `packages/culina-agent/src/opc-match.ts`
- Modify: `packages/culina-agent/src/index.ts`

- [ ] **Step 5.1: 写 system prompt**

```ts
// packages/culina-agent/src/opc-match-prompt.ts
export const OPC_MATCH_SYSTEM_PROMPT = [
  '你是一个 OPC 拼桌助理。OPC = One Person Company / 一到十人的小型协作团体。',
  '我会发给你 1~3 张「idea 卡」，每张卡描述一个 OPC（一个人或一小撮人）想做的事或能给的能力，含 styleTags（风格）和 sceneTags（场景）。',
  '你的任务：判断这些卡能不能拼成一桌、能不能成一次小型协作。',
  '严格只输出 JSON，结构如下，不要任何额外文字、不要 markdown 代码块：',
  '{',
  '  "matchScore": 0.0~1.0,                       // 你的匹配置信度',
  '  "reason": "一句给人看的拟人理由，30 字内",   // 用第二人称、亲切',
  '  "suggestedTitle": "建议饭局题目，含一个具体行动",',
  '  "icebreakers": ["破冰题1", "破冰题2", "破冰题3"], // 每题一句话',
  '  "milestone": "第一周可交付的最小里程碑，一句话"',
  '}',
].join('\n');
```

- [ ] **Step 5.2: 写 runOpcMatch 函数**

```ts
// packages/culina-agent/src/opc-match.ts
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
```

- [ ] **Step 5.3: 在 index.ts re-export**

```ts
// packages/culina-agent/src/index.ts —— 在已有 export 后追加
export {
  runOpcMatch,
  OpcIdeaCardSchema,
  OpcMatchResultSchema,
  type OpcIdeaCard,
  type OpcMatchResult,
  type OpcMatchInput,
  type OpcMatchSuccess,
  type OpcMatchFailure,
} from './opc-match.js';
export { OPC_MATCH_SYSTEM_PROMPT } from './opc-match-prompt.js';
```

- [ ] **Step 5.4: typecheck**

Run: `pnpm --filter @lin-shi/culina-agent typecheck`
Expected: PASS。

- [ ] **Step 5.5: Commit**

```bash
git add packages/culina-agent/src/opc-match-prompt.ts packages/culina-agent/src/opc-match.ts packages/culina-agent/src/index.ts
git commit -m "feat(culina-agent): add OPC table-matching agent"
```

---

## Task 6 · Server endpoint POST /api/opc-match

**Files:**
- Modify: `apps/culina-server/src/main.ts`

- [ ] **Step 6.1: 加 endpoint 处理**

在 `apps/culina-server/src/main.ts` 的 server handler 内，**在现有 `if (req.method === 'POST' && url === '/api/test')` 块之后** 追加：

```ts
import { runOpcMatch } from '@lin-shi/culina-agent';
// ↑ 顶部 import 区追加

// 在 server callback 内追加：
if (req.method === 'POST' && url === '/api/opc-match') {
  const chunks: Buffer[] = [];
  for await (const c of req) {
    chunks.push(c as Buffer);
  }
  let body: unknown = {};
  try {
    const raw = Buffer.concat(chunks).toString('utf8');
    body = raw ? (JSON.parse(raw) as unknown) : {};
  } catch {
    res.writeHead(400, { 'Content-Type': 'application/json; charset=utf-8' });
    res.end(JSON.stringify({ ok: false, error: 'Invalid JSON' }));
    return;
  }
  const b = body as Record<string, unknown>;
  const result = await runOpcMatch({
    api_key: String(b.api_key ?? ''),
    base_url: String(b.base_url ?? ''),
    model: String(b.model ?? ''),
    ideas: Array.isArray(b.ideas) ? (b.ideas as unknown[]).map((x) => x as { name: string; styleTags: string[]; sceneTags: string[]; description?: string }) : [],
  });
  const status = result.ok ? 200 : 500;
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8' });
  res.end(JSON.stringify(result));
  return;
}
```

加 CORS 头（前端 :3001 调 :7860 跨域必须）：在文件顶部 server callback 最前面、所有 `if` 之前补：

```ts
res.setHeader('Access-Control-Allow-Origin', '*');
res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
if (req.method === 'OPTIONS') {
  res.writeHead(204);
  res.end();
  return;
}
```

- [ ] **Step 6.2: typecheck**

Run: `pnpm --filter @lin-shi/culina-server typecheck`
Expected: PASS。

- [ ] **Step 6.3: 启动 server 烟测**

Run: `pnpm --filter @lin-shi/culina-server dev`
另一终端：
```bash
curl -X POST http://127.0.0.1:7860/api/opc-match -H 'Content-Type: application/json' -d '{"api_key":"","base_url":"https://api.openai.com/v1","model":"gpt-4o-mini","ideas":[]}'
```
Expected: 返回 `{"ok":false,"error":"..."}`，证明 endpoint 联通且会按预期失败（无 key）。

- [ ] **Step 6.4: Commit**

```bash
git add apps/culina-server/src/main.ts
git commit -m "feat(culina-server): expose POST /api/opc-match"
```

---

## Task 7 · Demo cache JSON seed

**Files:**
- Create: `apps/web/public/demo-cache/opc-match.json`

- [ ] **Step 7.1: 写预录响应**

```json
{
  "ok": true,
  "result": {
    "matchScore": 0.86,
    "reason": "你想做独立咖啡馆 MVP，TA 手里恰好有半年甜品店运营 + React 全栈，撞上正合适。",
    "suggestedTitle": "周三晚 7 点·把咖啡馆会员小程序原型撑起来",
    "icebreakers": [
      "你最近一次为客户算复购周期是什么时候？",
      "如果 MVP 砍到只剩一个功能，你会留哪个？",
      "你愿意为这个 MVP 让出多少周末？"
    ],
    "milestone": "第一周交付一个能扫码入会、看积分的最小可点击 demo。"
  }
}
```

- [ ] **Step 7.2: Commit**

```bash
git add apps/web/public/demo-cache/opc-match.json
git commit -m "feat(opc): seed demo-cache opc-match fallback"
```

---

## Task 8 · Web client `opc-agent.ts`

**Files:**
- Create: `apps/web/src/lib/opc-agent.ts`

- [ ] **Step 8.1: 写客户端 + 3s 超时 + cache fallback**

```ts
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
 * 只要返回 OpcMatchResult，调用方不需要关心来源。
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
```

- [ ] **Step 8.2: 加 env 模板**

修改 `apps/web/.env.example`，追加：

```
NEXT_PUBLIC_CULINA_SERVER=http://127.0.0.1:7860
NEXT_PUBLIC_OPC_AGENT_KEY=
NEXT_PUBLIC_OPC_AGENT_BASE_URL=
NEXT_PUBLIC_OPC_AGENT_MODEL=
```

- [ ] **Step 8.3: typecheck**

Run: `pnpm --filter @lin-shi/web typecheck`
Expected: PASS。

- [ ] **Step 8.4: Commit**

```bash
git add apps/web/src/lib/opc-agent.ts apps/web/.env.example
git commit -m "feat(opc): add web client with 3s race fallback"
```

---

## Task 9 · AgentBubble component

**Files:**
- Create: `apps/web/src/components/activities/AgentBubble.tsx`

> **协助 skill：** 调 `ui-ux-pro-max` 给"局长助理"气泡的视觉灵感（建议：紫色头像 + 一段 markdown 风格段落 + 时间戳）。

- [ ] **Step 9.1: 写组件**

```tsx
import { Sparkles } from 'lucide-react';

type Props = {
  title: string;
  body: React.ReactNode;
  hint?: string;
};

/**
 * 活动详情页里的"局长助理"消息气泡（fake bot）。
 * 视觉上明显区别于真人参与者，避免误导。
 */
export function AgentBubble({ title, body, hint }: Props) {
  return (
    <div className="rounded-2xl bg-gradient-to-br from-violet-50 to-rose-50 p-4 ring-1 ring-violet-200/50">
      <div className="flex items-start gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-violet-500 text-white">
          <Sparkles className="h-4 w-4" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <p className="text-[13px] font-semibold text-violet-700">局长助理</p>
            {hint ? (
              <span className="rounded-full bg-violet-100 px-2 py-0.5 text-[10px] text-violet-600">{hint}</span>
            ) : null}
          </div>
          <p className="mt-1 text-[13px] font-medium text-neutral-800">{title}</p>
          <div className="mt-2 text-[13px] text-neutral-700">{body}</div>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 9.2: typecheck + Commit**

```bash
pnpm --filter @lin-shi/web typecheck
git add apps/web/src/components/activities/AgentBubble.tsx
git commit -m "feat(opc): add AgentBubble for the in-activity host bot"
```

---

## Task 10 · RetroCard component

**Files:**
- Create: `apps/web/src/components/activities/RetroCard.tsx`

- [ ] **Step 10.1: 写组件**

```tsx
import { Award, RefreshCw } from 'lucide-react';

type Props = {
  produce: string;
  nextStep: string;
  onContinue?: () => void;
};

/**
 * 活动 COMPLETED 时显示的复盘卡（mock 数据）。
 */
export function RetroCard({ produce, nextStep, onContinue }: Props) {
  return (
    <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-neutral-100">
      <div className="flex items-center gap-2">
        <Award className="h-4 w-4 text-amber-500" />
        <p className="text-[14px] font-semibold text-neutral-900">本桌复盘</p>
      </div>
      <div className="mt-3 grid gap-3">
        <div>
          <p className="text-[11px] font-medium uppercase tracking-wider text-neutral-400">本桌产出</p>
          <p className="mt-1 text-[13px] text-neutral-800">{produce}</p>
        </div>
        <div>
          <p className="text-[11px] font-medium uppercase tracking-wider text-neutral-400">下一步</p>
          <p className="mt-1 text-[13px] text-neutral-800">{nextStep}</p>
        </div>
      </div>
      <button
        type="button"
        onClick={onContinue}
        className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-violet-500 px-3 py-1.5 text-[12px] font-medium text-white hover:bg-violet-600"
      >
        <RefreshCw className="h-3.5 w-3.5" />
        续一桌
      </button>
      <p className="mt-3 text-[11px] text-neutral-500">已颁发"首桌成局"冰箱贴 🎖️</p>
    </div>
  );
}
```

- [ ] **Step 10.2: typecheck + Commit**

```bash
pnpm --filter @lin-shi/web typecheck
git add apps/web/src/components/activities/RetroCard.tsx
git commit -m "feat(opc): add RetroCard for COMPLETED activities"
```

---

## Task 11 · Wire AgentBubble + RetroCard into activity detail

**Files:**
- Modify: `apps/web/src/app/(protected)/activities/[id]/page.tsx`

- [ ] **Step 11.1: 在详情页插入两个组件**

在 `apps/web/src/app/(protected)/activities/[id]/page.tsx` 的 import 区追加：

```tsx
import { AgentBubble } from '@/components/activities/AgentBubble';
import { RetroCard } from '@/components/activities/RetroCard';
```

在「📋 动态」section 之后、Sticky bottom CTA 之前，插入：

```tsx
{/* 局长助理（FORMED 之后才出现） */}
{['FORMED', 'STARTING_SOON', 'IN_PROGRESS', 'COMPLETED'].includes(activity.status) ? (
  <section className="mt-3">
    <AgentBubble
      title="给三位 OPC 的破冰三连"
      hint="开桌即送"
      body={
        <ol className="list-decimal pl-5 space-y-1">
          <li>你最近一次为客户算复购周期是什么时候？</li>
          <li>如果 MVP 砍到只剩一个功能，你会留哪个？</li>
          <li>你愿意为这个 MVP 让出多少周末？</li>
        </ol>
      }
    />
  </section>
) : null}

{activity.status === 'IN_PROGRESS' ? (
  <section className="mt-3">
    <AgentBubble
      title="第一周里程碑建议"
      hint="agent 自动生成"
      body={<p>第一周交付一个能扫码入会、看积分的最小可点击 demo。</p>}
    />
  </section>
) : null}

{activity.status === 'COMPLETED' ? (
  <section className="mt-3">
    <RetroCard
      produce="一个跑通会员入会 + 积分查询的可点击原型，已交付独立咖啡馆主理人。"
      nextStep="把核销动作打通，下周再开一桌做支付测试。"
    />
  </section>
) : null}
```

- [ ] **Step 11.2: 类型 + 视觉验**

Run: `pnpm --filter @lin-shi/web typecheck`
启动 dev：打开 `/activities/<任一已 mock 的 id>`，确认在不同 status 下气泡/复盘卡正确显隐。

- [ ] **Step 11.3: Commit**

```bash
git add apps/web/src/app/\(protected\)/activities/\[id\]/page.tsx
git commit -m "feat(opc): inject AgentBubble + RetroCard into activity detail"
```

---

## Task 12 · IdeaWalkOut animation component

**Files:**
- Create: `apps/web/src/components/idea/IdeaWalkOut.tsx`

> **协助 skill：** 调 `ui-ux-pro-max` 给出走动画细节——卡片飞出 + 灰白拖影 + 0.8s 内完成。

- [ ] **Step 12.1: 写组件**

```tsx
'use client';

import { AnimatePresence, motion } from 'framer-motion';

type Props = {
  visible: boolean;
  emoji: string;
  name: string;
  /** 屏幕坐标（px），决定起飞起点；默认从中间 */
  startX?: number;
  startY?: number;
  /** 飞行结束回调 */
  onDone?: () => void;
};

/**
 * 一张 idea 卡片"出走"的过场动画。
 * 用法：把它挂在页面顶层，靠 visible 控制显隐。
 */
export function IdeaWalkOut({ visible, emoji, name, startX = 0, startY = 0, onDone }: Props) {
  return (
    <AnimatePresence onExitComplete={onDone}>
      {visible ? (
        <motion.div
          className="pointer-events-none fixed left-0 top-0 z-50 flex flex-col items-center"
          initial={{ x: startX, y: startY, scale: 1, opacity: 1, rotate: 0 }}
          animate={{
            x: typeof window !== 'undefined' ? window.innerWidth + 80 : 800,
            y: startY - 200,
            scale: 0.6,
            opacity: 0.85,
            rotate: 25,
          }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.4, ease: [0.2, 0.7, 0.3, 1] }}
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-2xl shadow-xl ring-2 ring-rose-200">
            {emoji}
          </div>
          <span className="mt-1 rounded-full bg-white/90 px-2 py-0.5 text-[10px] font-medium text-rose-500 shadow">
            {name} 出走中…
          </span>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
```

- [ ] **Step 12.2: typecheck + Commit**

```bash
pnpm --filter @lin-shi/web typecheck
git add apps/web/src/components/idea/IdeaWalkOut.tsx
git commit -m "feat(opc): add IdeaWalkOut flying-card animation"
```

---

## Task 13 · Storyboard frames data

**Files:**
- Create: `apps/web/src/lib/storyboard-frames.ts`

- [ ] **Step 13.1: 写 6 帧 metadata**

```ts
export type StoryboardFrame = {
  id: number;
  /** Next.js route to push */
  route: string;
  /** Subtitle to display */
  narration: string;
  /** Optional flag controlling whether to trigger walk-out animation */
  triggerWalkOut?: boolean;
  /** Optional: which agent step to surface (live/cache) */
  triggerAgentMatch?: boolean;
};

export const STORYBOARD_FRAMES: ReadonlyArray<StoryboardFrame> = [
  {
    id: 1,
    route: '/fridge/inside',
    narration: '邻食原本是邻居一起干饭。今天我们告诉你它真正的样子：OPC——一到十人的小协作团体——把脑子里想做的事当成食材，扔进冰箱。',
  },
  {
    id: 2,
    route: '/fridge/inside',
    narration: '每张"食材"都有保鲜期。到点它就躁动——它知道自己不该烂在冰箱里。',
  },
  {
    id: 3,
    route: '/fridge/inside',
    narration: 'AI agent 主动出门，跨用户去找——不是别的商品、别的文档，是另一张能跟它配的"食材"，和它背后的人。',
    triggerWalkOut: true,
    triggerAgentMatch: true,
  },
  {
    id: 4,
    route: '/activities/new',
    narration: '一桌就是一次协作，可以约线上、可以约真饭——location 是你定的。',
  },
  {
    id: 5,
    route: '/activities/demo-success',
    narration: '局长助理是你的 agent 同事：5 分钟破冰、第一周里程碑、结束复盘——它一直在桌上。',
  },
  {
    id: 6,
    route: '/fridge',
    narration: '邻食。让脑子里那张食材，自己找到能拼桌的人。',
  },
];
```

注：第 5 帧的 `/activities/demo-success` 是一个**mock activity id**，需要在 `apps/web/src/lib/mock-activities.ts`（已存在 mock）里加一个 status=COMPLETED 的样本。如果该文件不存在，本步追加：在第 5 帧前直接 `router.push` 到任一已 mock 的 activity id 即可。

- [ ] **Step 13.2: Commit**

```bash
git add apps/web/src/lib/storyboard-frames.ts
git commit -m "feat(opc): define 6-frame storyboard"
```

---

## Task 14 · StoryboardDriver component

**Files:**
- Create: `apps/web/src/components/demo/StoryboardDriver.tsx`

> **协助 skill：** `ui-ux-pro-max` 给字幕条 + 控制按钮的视觉。

- [ ] **Step 14.1: 写组件**

```tsx
'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import { STORYBOARD_FRAMES } from '@/lib/storyboard-frames';
import { matchIdeas } from '@/lib/opc-agent';
import { IdeaWalkOut } from '@/components/idea/IdeaWalkOut';

export function StoryboardDriver() {
  const router = useRouter();
  const [idx, setIdx] = useState(0);
  const [walkOut, setWalkOut] = useState(false);
  const [agentLine, setAgentLine] = useState<string | null>(null);

  const frame = STORYBOARD_FRAMES[idx]!;

  const goTo = useCallback(
    (n: number) => {
      const next = Math.max(0, Math.min(STORYBOARD_FRAMES.length - 1, n));
      setIdx(next);
      const f = STORYBOARD_FRAMES[next]!;
      router.push(`${f.route}?demo=1`);
      setWalkOut(false);
      setAgentLine(null);
      if (f.triggerWalkOut) {
        setTimeout(() => setWalkOut(true), 400);
      }
      if (f.triggerAgentMatch) {
        setAgentLine('agent thinking…');
        matchIdeas([
          { name: '番茄', styleTags: ['快速原型', '极简'], sceneTags: ['独立咖啡馆'] },
          { name: '鸡蛋', styleTags: ['React 全栈'], sceneTags: ['MVP 速搭'] },
        ])
          .then(({ result, source }) => {
            setAgentLine(`${result.reason}（${source === 'live' ? '实时' : '缓存'}）`);
          })
          .catch(() => setAgentLine('（agent 暂时不在线，使用预录方案）'));
      }
    },
    [router],
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === ' ') {
        e.preventDefault();
        goTo(idx + 1);
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        goTo(idx - 1);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [idx, goTo]);

  return (
    <>
      <IdeaWalkOut
        visible={walkOut}
        emoji="🍅"
        name="番茄"
        startX={typeof window !== 'undefined' ? window.innerWidth / 2 - 24 : 200}
        startY={typeof window !== 'undefined' ? window.innerHeight / 2 - 24 : 300}
        onDone={() => setWalkOut(false)}
      />

      <div className="pointer-events-none fixed inset-x-0 bottom-0 z-40 flex justify-center pb-3">
        <div className="pointer-events-auto mx-3 max-w-[760px] rounded-2xl bg-black/85 px-4 py-3 text-white shadow-2xl ring-1 ring-white/10 backdrop-blur">
          <div className="flex items-start gap-3">
            <button
              type="button"
              onClick={() => goTo(idx - 1)}
              aria-label="上一帧"
              disabled={idx === 0}
              className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/10 hover:bg-white/20 disabled:opacity-30"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <div className="min-w-0 flex-1">
              <p className="text-[11px] uppercase tracking-wider text-white/50">
                Frame {frame.id} / {STORYBOARD_FRAMES.length}
              </p>
              <p className="mt-1 text-[14px] leading-relaxed">{frame.narration}</p>
              {agentLine ? (
                <p className="mt-2 inline-flex items-center gap-1.5 text-[12px] text-rose-200">
                  <Sparkles className="h-3.5 w-3.5" />
                  {agentLine}
                </p>
              ) : null}
            </div>
            <button
              type="button"
              onClick={() => goTo(idx + 1)}
              aria-label="下一帧"
              disabled={idx === STORYBOARD_FRAMES.length - 1}
              className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-rose-500 hover:bg-rose-400 disabled:opacity-30"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
```

- [ ] **Step 14.2: typecheck + Commit**

```bash
pnpm --filter @lin-shi/web typecheck
git add apps/web/src/components/demo/StoryboardDriver.tsx
git commit -m "feat(opc): add StoryboardDriver for half-manual demo"
```

---

## Task 15 · Mount StoryboardDriver via ?demo=1

**Files:**
- Create: `apps/web/src/components/demo/StoryboardMount.tsx`
- Modify: `apps/web/src/app/layout.tsx`

- [ ] **Step 15.1: 写挂载点**

```tsx
// apps/web/src/components/demo/StoryboardMount.tsx
'use client';

import { useSearchParams } from 'next/navigation';
import dynamic from 'next/dynamic';
import { Suspense } from 'react';

const StoryboardDriver = dynamic(
  () => import('./StoryboardDriver').then((m) => m.StoryboardDriver),
  { ssr: false },
);

function Inner() {
  const sp = useSearchParams();
  if (sp.get('demo') !== '1') return null;
  return <StoryboardDriver />;
}

export function StoryboardMount() {
  return (
    <Suspense fallback={null}>
      <Inner />
    </Suspense>
  );
}
```

- [ ] **Step 15.2: 在 root layout 挂载**

修改 `apps/web/src/app/layout.tsx`：在 `<body>` 内的页面树**之后**追加 `<StoryboardMount />`。先 Read 当前 layout：

```bash
cat apps/web/src/app/layout.tsx
```

然后在合适位置插入：
```tsx
import { StoryboardMount } from '@/components/demo/StoryboardMount';
// ...
<body>
  {/* 既有 providers + children */}
  <StoryboardMount />
</body>
```

- [ ] **Step 15.3: typecheck + 启动 dev 烟测**

```bash
pnpm --filter @lin-shi/web typecheck
pnpm --filter @lin-shi/web dev
```
打开 http://localhost:3001/fridge/inside?demo=1 ，看到底部黑色字幕条 + 上下帧按钮；按右方向键切到下一帧；第 3 帧应触发出走动画 + agent thinking 行。

- [ ] **Step 15.4: Commit**

```bash
git add apps/web/src/components/demo/StoryboardMount.tsx apps/web/src/app/layout.tsx
git commit -m "feat(opc): mount StoryboardDriver via ?demo=1"
```

---

## Task 16 · Verify integration locally before handoff

- [ ] **Step 16.1: 全 monorepo build / typecheck / lint**

```bash
pnpm -r typecheck
pnpm --filter @lin-shi/web lint
pnpm --filter @lin-shi/web build
```
Expected: 全 PASS。任何错误立刻修，禁忽略。

- [ ] **Step 16.2: 手动走查路径**

启 web dev + culina-server dev。手测：
1. `/fridge/inside` → 9 张卡片右上角进度环可见，过期的 2 张显示"出走"
2. `/activities` → 我的锅 + 全部活动列表正常
3. `/activities/<mock-id>` → 不同 status 下 AgentBubble / RetroCard 显隐正确
4. `/fridge/inside?demo=1` → 字幕条出现，方向键切帧
5. 第 3 帧触发出走动画 + agent thinking → 3s 内显示 reason（cache 来源，因没有 key）

- [ ] **Step 16.3: 进入 simplify 阶段（下一个 skill）**

下一步必须调 superpowers:simplify 对所有新增/修改文件做审查。

---

## Self-Review Notes

按 writing-plans 自检：

1. **Spec 覆盖**：spec §2 的 B/A'/C/D/E/F 区块——B (Tasks 2-4 + 12)、A' (Task 1)、C (Tasks 5-8)、D (砍掉，spec 已注明)、E (Tasks 9-11)、F (Tasks 13-15)。✅ 全部覆盖。
2. **Placeholder 扫描**：无 TBD / TODO / "稍后" / "类似上面" / "添加错误处理"等模糊语。✅
3. **类型一致性**：`OpcIdeaCard` 在 Task 5、8、14 都用同一字段 `{name, styleTags, sceneTags, description?}`；`OpcMatchResult` 在 5、7、8、14 一致。✅
4. **执行依赖**：Task 4 依赖 2、3；Task 11 依赖 9、10；Task 14 依赖 8、12、13；Task 15 依赖 14。无循环依赖。

---

## Final SOP After Implementation

1. **simplify** —— `superpowers:simplify` 审查所有新增/改动文件，去冗余。
2. **frontend visual verification** —— 调 `frontend-logic-design` 与 `ui-ux-pro-max` 复审组件视觉与逻辑层级。
3. **pjr (project-review:pjr)** —— lint + build + 文档一致性 + 工作区整洁。
4. **git-merge-to-develop:git-merge-to-develop** —— rebase + 合 develop。
5. **Playwright E2E** —— 桌面 + 移动两套 viewport，按钮全点：
   - 冰箱卡片点击 → 详情
   - 活动列表 → 详情 → join/leave 按钮
   - 偏好编辑 → 保存
   - `/?demo=1` storyboard 6 帧切换
   - agent thinking 行出现
