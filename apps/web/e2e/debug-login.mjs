import { chromium, devices } from 'playwright';

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({
  ...devices['iPhone 14 Pro'],
  locale: 'zh-CN',
});
const page = await context.newPage();

const logs = [];
const errors = [];
const netFails = [];

const allReqs = [];
page.on('console', (msg) => logs.push(`[${msg.type()}] ${msg.text()}`));
page.on('pageerror', (err) => errors.push(err.stack || err.message));
page.on('requestfailed', (req) => netFails.push(`${req.method()} ${req.url()} — ${req.failure()?.errorText}`));
page.on('request', (req) => {
  if (!req.url().startsWith('data:')) allReqs.push(`${req.method()} ${req.url()}`);
});
page.on('response', (resp) => {
  if (resp.status() >= 400) netFails.push(`${resp.status()} ${resp.request().method()} ${resp.url()}`);
});

console.log('=== NAV to /login ===');
const resp = await page.goto('http://localhost:3001/login', { waitUntil: 'networkidle', timeout: 15000 });
console.log('nav status:', resp?.status());

console.log('=== screenshot invite ===');
await page.screenshot({ path: 'apps/web/e2e/debug-01-invite.png' });

console.log('=== click "已有账号？直接登录" ===');
const switchBtn = await page.getByRole('button', { name: /已有账号/ }).first();
await switchBtn.click();
await page.waitForTimeout(800);

console.log('=== screenshot auth ===');
await page.screenshot({ path: 'apps/web/e2e/debug-02-auth.png' });

console.log('=== fill frank / Password123 ===');
await page.getByLabel('邮箱').fill('frank@example.com');
await page.getByLabel('密码').fill('Password123');
await page.waitForTimeout(300);

console.log('=== click login (submit) ===');
const loginBtn = page.locator('form button[type="submit"]');
console.log('  submit button count =', await loginBtn.count());
console.log('  submit button text =', await loginBtn.textContent());
await loginBtn.click();

console.log('=== wait for navigation ===');
await page.waitForTimeout(3000);

console.log('=== current url ===');
console.log('  ', page.url());

console.log('=== screenshot after-login ===');
await page.screenshot({ path: 'apps/web/e2e/debug-03-after.png', fullPage: true });

console.log('=== logs ===');
logs.forEach((l) => console.log(' ', l));
console.log('=== errors ===');
errors.forEach((e) => console.log(' ', e));
console.log('=== failed requests / 4xx+ ===');
netFails.forEach((n) => console.log(' ', n));

console.log('=== localStorage ===');
const ls = await page.evaluate(() => ({
  access: localStorage.getItem('lin-shi.access'),
  refresh: localStorage.getItem('lin-shi.refresh'),
}));
console.log('  access =', ls.access ? ls.access.slice(0, 40) + '...' : 'null');
console.log('  refresh =', ls.refresh ? ls.refresh.slice(0, 40) + '...' : 'null');

await browser.close();
console.log('=== all requests ===');
allReqs.forEach((r) => console.log('  ', r));
console.log('=== DONE ===');
