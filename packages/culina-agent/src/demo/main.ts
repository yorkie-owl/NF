/**
 * 对位 Culina 历史 `main.py`：一次多模态 invoke 演示。需 DASH/阶跃 等由环境提供或通过命令行传 URL。
 * 使用：`pnpm --filter @lin-shi/culina-agent run demo`（在 monorepo 根目录）
 */
import { runCulinaPostApiTest } from '../api-test.js';

const key = process.env.CULINABOT_LLM_API_KEY ?? process.env.CULINABOT_API_KEY ?? '';
const base = process.env.CULINABOT_LLM_BASE_URL ?? 'https://api.stepfun.com/v1';
const model = process.env.CULINABOT_LLM_MODEL ?? 'step-1o-turbo-vision';
const tavily = process.env.CULINABOT_TAVILY_API_KEY ?? '';
const imageUrl = process.env.CULINABOT_DEMO_IMAGE_URL ?? 'https://aisearch.cdn.bcebos.com/pic_create/2026-04-10/10/74d52055e4947f8c.jpg';

async function main() {
  if (!key) {
    console.error('请设置 CULINABOT_LLM_API_KEY 或 CULINABOT_API_KEY');
    process.exit(1);
  }
  const r = await runCulinaPostApiTest({
    api_key: key,
    base_url: base,
    model,
    tavily_api_key: tavily,
    question: '帮我看看能做什么？',
    image_data_url: '',
    image_url: imageUrl,
  });
  if (r.ok) {
    console.log(r.answer);
  } else {
    console.error(r.error);
    process.exit(1);
  }
}

void main();
