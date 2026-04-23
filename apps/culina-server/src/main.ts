import { createServer } from 'node:http';
import { runCulinaPostApiTest } from '@lin-shi/culina-agent';

const HOST = process.env.CULINABOT_HOST ?? '127.0.0.1';
const PORT = Number(process.env.CULINABOT_PORT ?? 7860);
const DEFAULT_BASE_URL = process.env.CULINABOT_DEFAULT_BASE_URL ?? 'https://api.stepfun.com/v1';
const DEFAULT_MODEL = process.env.CULINABOT_DEFAULT_MODEL ?? 'step-1o-turbo-vision';

const HTML = `<!doctype html>
<html lang="zh-CN">
<head><meta charset="utf-8"/><title>CulinaBot 本地测试 (TS)</title></head>
<body style="font-family:system-ui;padding:24px;max-width:720px;margin:0 auto">
  <h1>CulinaBot 本地测试（TypeScript）</h1>
  <p>与历史 <code>web_test.py</code> 同构：<code>POST /api/test</code>，JSON 体字段相同。本页为简易说明；可用原 HTML 客户端或 Postman。</p>
  <p>默认 Base URL：<strong>${DEFAULT_BASE_URL}</strong>，Model：<strong>${DEFAULT_MODEL}</strong></p>
  <pre style="background:#f5f5f5;padding:12px;border-radius:8px;overflow:auto">POST /api/test
Content-Type: application/json

{
  "api_key": "...",
  "base_url": "${DEFAULT_BASE_URL}",
  "model": "${DEFAULT_MODEL}",
  "tavily_api_key": "",
  "question": "帮我看看能做什么？",
  "image_data_url": "data:image/jpeg;base64,..."
}</pre>
</body>
</html>`;

const server = createServer(async (req, res) => {
  const url = req.url?.split('?')[0] ?? '';
  if (req.method === 'GET' && url === '/') {
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(HTML);
    return;
  }
  if (req.method === 'POST' && url === '/api/test') {
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
    const result = await runCulinaPostApiTest(body);
    const status = result.ok ? 200 : 500;
    res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8' });
    res.end(JSON.stringify(result));
    return;
  }
  res.writeHead(404);
  res.end();
});

server.listen(PORT, HOST, () => {
  console.log(`Culina TS test server at http://${HOST}:${PORT}`);
});
