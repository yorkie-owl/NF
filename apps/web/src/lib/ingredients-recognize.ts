import { z } from 'zod';

const RecognizedItemSchema = z.object({
  name: z.string(),
  confidence: z.number(),
  tasteTags: z.array(z.string()),
});

const RecognizeResponseSchema = z.object({
  recognized: z.array(RecognizedItemSchema),
});

export type RecognizedPreview = z.infer<typeof RecognizedItemSchema>;

/**
 * 识图：仅使用 fetch，不经过 `ky` / `api.ts`，避免 Webpack 对 ky 的打包问题导致
 * `Cannot read properties of undefined (reading 'call')` 等运行时错误。
 */
export async function recognizeIngredientsFromImage(file: File) {
  const form = new FormData();
  form.append('file', file);
  const res = await fetch('/api/ingredients/recognize', { method: 'POST', body: form });
  const json: unknown = await res.json();
  if (!res.ok) {
    const o = json as { message?: string } | null;
    throw new Error(o?.message ?? (res.statusText || '识图失败'));
  }
  return RecognizeResponseSchema.parse(json).recognized;
}
