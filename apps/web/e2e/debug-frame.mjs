import { chromium } from 'playwright';

const browser = await chromium.launch({ headless: true });

// desktop (shows phone frame)
const dCtx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const dPage = await dCtx.newPage();
await dPage.goto('http://localhost:3001/login', { waitUntil: 'networkidle' });
await dPage.waitForTimeout(800);
await dPage.screenshot({ path: 'apps/web/e2e/debug-frame-desktop.png' });

// mobile (no frame)
const mCtx = await browser.newContext({ viewport: { width: 393, height: 852 } });
const mPage = await mCtx.newPage();
await mPage.goto('http://localhost:3001/login', { waitUntil: 'networkidle' });
await mPage.waitForTimeout(800);
await mPage.screenshot({ path: 'apps/web/e2e/debug-frame-mobile.png' });

await browser.close();
console.log('DONE');
