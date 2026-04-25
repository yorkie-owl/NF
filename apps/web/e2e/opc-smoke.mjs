// OPC pivot smoke E2E.
// Boots Playwright against an already-running web dev server (:3001),
// drives the half-manual storyboard via ?demo=1, walks through 6 frames,
// captures screenshots on desktop + mobile, and exits non-zero on failure.
//
// Usage: `node apps/web/e2e/opc-smoke.mjs`
// Pre-req: `pnpm --filter @lin-shi/web dev` running in another terminal.

import { chromium, devices } from 'playwright';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { mkdir, writeFile } from 'node:fs/promises';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const SCREENSHOTS_DIR = resolve(__dirname, '_screenshots', 'opc');
const REPORT_PATH = resolve(__dirname, '..', '..', '..', 'docs', 'verification', '2026-04-25-opc-smoke.md');
const BASE_URL = process.env.BASE_URL ?? 'http://localhost:3001';

const VIEWPORTS = [
  { name: 'desktop', viewport: { width: 1440, height: 900 }, ua: undefined },
  { name: 'mobile', viewport: devices['iPhone 14 Pro'].viewport, ua: devices['iPhone 14 Pro'].userAgent },
];

async function shoot(page, viewport, label) {
  const file = resolve(SCREENSHOTS_DIR, viewport, `${label}.png`);
  await page.screenshot({ path: file, fullPage: false });
  return file;
}

async function runOne(vp) {
  console.log(`\n=== ${vp.name} (${vp.viewport.width}x${vp.viewport.height}) ===`);
  await mkdir(resolve(SCREENSHOTS_DIR, vp.name), { recursive: true });

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: vp.viewport,
    ...(vp.ua ? { userAgent: vp.ua } : {}),
    locale: 'zh-CN',
  });
  const page = await context.newPage();

  const consoleErrors = [];
  page.on('pageerror', (err) => consoleErrors.push(`pageerror: ${err.message}`));
  page.on('console', (msg) => {
    if (msg.type() === 'error') consoleErrors.push(`console: ${msg.text()}`);
  });

  const steps = [];
  const record = (name, status, note = '') => {
    steps.push({ name, status, note });
    console.log(`  [${status}] ${name}${note ? ' — ' + note : ''}`);
  };

  try {
    // Step 1: open /fridge/inside?demo=1
    await page.goto(`${BASE_URL}/fridge/inside?demo=1`, { waitUntil: 'domcontentloaded', timeout: 30_000 });
    await page.waitForSelector('text=/Frame 1/', { timeout: 15_000 });
    await shoot(page, vp.name, '01-frame1');
    record('Frame 1 · 字幕条出现 + 进度环渲染', 'PASS');

    // Step 2: verify a RestlessnessRing svg exists with role=img + aria-label
    const ringCount = await page.locator('svg[role="img"][aria-label^="躁动"]').count();
    if (ringCount < 1) throw new Error('no RestlessnessRing rendered');
    record(`RestlessnessRing 数量=${ringCount}`, 'PASS');

    // Step 3: keyboard ArrowRight → frame 2
    await page.keyboard.press('ArrowRight');
    await page.waitForSelector('text=/Frame 2/', { timeout: 5_000 });
    await shoot(page, vp.name, '02-frame2');
    record('Frame 2 · 字幕换内容', 'PASS');

    // Step 4: → frame 3 → walk-out animation + agent thinking
    await page.keyboard.press('ArrowRight');
    await page.waitForSelector('text=/Frame 3/', { timeout: 5_000 });
    // wait for walk-out / agent thinking line to appear (cache fallback ≤3s)
    await page.waitForTimeout(800);
    await shoot(page, vp.name, '03-frame3-walkout');
    const agentLine = await page.locator('text=/agent thinking|实时|缓存|预录方案/').first().isVisible().catch(() => false);
    record('Frame 3 · agent 思考行可见', agentLine ? 'PASS' : 'FAIL', agentLine ? '' : 'agent line not visible after 800ms');
    // wait for cache fallback resolution (3s + network)
    await page.waitForTimeout(3500);
    const reasonVisible = await page.locator('text=/缓存|预录方案/').first().isVisible().catch(() => false);
    await shoot(page, vp.name, '04-frame3-agent-result');
    record('Frame 3 · agent 结果出现（缓存/预录）', reasonVisible ? 'PASS' : 'FAIL');

    // Step 5: → frame 4 (activities/new)
    await page.keyboard.press('ArrowRight');
    await page.waitForURL(/\/activities\/new/, { timeout: 10_000 });
    await page.waitForSelector('text=/Frame 4/', { timeout: 5_000 });
    await shoot(page, vp.name, '05-frame4-activities-new');
    record('Frame 4 · 跳到 /activities/new', 'PASS');

    // Step 6: → frame 5 (activities)
    await page.keyboard.press('ArrowRight');
    await page.waitForURL((u) => u.pathname.startsWith('/activities'), { timeout: 10_000 });
    await page.waitForSelector('text=/Frame 5/', { timeout: 5_000 });
    await shoot(page, vp.name, '06-frame5-activities');
    record('Frame 5 · 跳到活动列表', 'PASS');

    // Step 7: → frame 6 (fridge home) — server component fetches ingredients;
    // wait only until URL commits, then poll for narration text.
    await page.keyboard.press('ArrowRight');
    await page.waitForURL(/\/fridge(\?|$)/, { timeout: 30_000, waitUntil: 'commit' });
    await page.waitForSelector('text=/Frame 6/', { timeout: 30_000 });
    await shoot(page, vp.name, '07-frame6-fridge-home');
    record('Frame 6 · 跳到冰箱首页', 'PASS');

    // Step 8: ArrowLeft × 5 → back to frame 1
    for (let i = 0; i < 5; i += 1) {
      await page.keyboard.press('ArrowLeft');
      await page.waitForTimeout(300);
    }
    await page.waitForSelector('text=/Frame 1/', { timeout: 5_000 });
    record('反向方向键回到 Frame 1', 'PASS');
  } catch (err) {
    record('fatal', 'FAIL', err.message);
    await shoot(page, vp.name, '99-fatal').catch(() => {});
  }

  await browser.close();
  return { vp, steps, consoleErrors };
}

function renderTable(rows) {
  const head = '| # | 步骤 | 状态 | 备注 |\n|---|---|---|---|';
  const body = rows.map((r, i) => `| ${i + 1} | ${r.name} | ${r.status} | ${r.note} |`).join('\n');
  return [head, body].join('\n');
}

async function main() {
  const results = [];
  for (const vp of VIEWPORTS) {
    // eslint-disable-next-line no-await-in-loop
    results.push(await runOne(vp));
  }

  const now = new Date().toISOString().slice(0, 16).replace('T', ' ');
  const sections = results
    .map(({ vp, steps, consoleErrors }) => {
      const head = `## ${vp.name === 'desktop' ? '桌面 1440×900' : '移动 iPhone 14 Pro'}`;
      const tbl = renderTable(steps);
      const errs = consoleErrors.length === 0 ? '无' : consoleErrors.slice(0, 20).map((e) => `- ${e}`).join('\n');
      return [head, tbl, '', '### 控制台错误', errs, ''].join('\n');
    })
    .join('\n');

  const totals = results.flatMap((r) => r.steps);
  const pass = totals.filter((s) => s.status === 'PASS').length;
  const fail = totals.length - pass;

  const md = `# OPC pivot smoke 报告

**执行时间**：${now}
**Web**：${BASE_URL}
**Playwright**：v1.59.1

${sections}

## 总结
- 总步骤：${totals.length}
- 通过：${pass}
- 失败：${fail}
${fail > 0 ? '\n失败时退出码=1。截图见 \`apps/web/e2e/_screenshots/opc/{desktop,mobile}/\`。\n' : ''}
`;

  await mkdir(dirname(REPORT_PATH), { recursive: true });
  await writeFile(REPORT_PATH, md, 'utf-8');
  console.log(`\nReport: ${REPORT_PATH}`);
  console.log(`Overall: ${pass}/${totals.length} pass, ${fail} fail`);
  process.exitCode = fail > 0 ? 1 : 0;
}

main().catch((err) => {
  console.error('runner crashed:', err);
  process.exitCode = 2;
});
