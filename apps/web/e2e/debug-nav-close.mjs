import { chromium, devices } from 'playwright';
const b = await chromium.launch({ headless: true });
const c = await b.newContext({ ...devices['iPhone 14 Pro'], locale: 'zh-CN' });
const p = await c.newPage();
await p.goto('http://localhost:3001/login');
await p.waitForTimeout(500);
await p.getByRole('button', { name: /已有账号/ }).click();
await p.waitForTimeout(400);
await p.getByLabel('邮箱').fill('frank@example.com');
await p.getByLabel('密码').fill('Password123');
await p.locator('form button[type=submit]').click();
await p.waitForURL('**/profile', { timeout: 10000 });
await p.waitForTimeout(1500);
// 只截底部 160px
const vp = p.viewportSize();
await p.screenshot({
  path: 'apps/web/e2e/debug-nav-close.png',
  clip: { x: 0, y: vp.height - 160, width: vp.width, height: 160 },
});
await b.close();
console.log('DONE');
