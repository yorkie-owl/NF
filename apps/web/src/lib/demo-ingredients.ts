import type { Ingredient } from '@lin-shi/contracts';

const DEMO_USER = '00000000-0000-4000-8000-000000000001';

/** 与 Figma 演示格一致，用于 /fridge/preview/[name]（无 API 时仍可进探索配置） */
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

function buildIngredient(e: (typeof ENTRIES)[number]): Ingredient {
  const now = Date.now();
  const gone = e.gone;
  return {
    id: e.id,
    userId: DEMO_USER,
    name: e.name,
    category: e.category,
    tasteTags: e.tasteTags,
    contextTags: e.contextTags,
    recognizedFromImageUrl: null,
    addedAt: new Date(now - 86400000 * 3).toISOString(),
    expiresAt: new Date(
      gone ? now - 86400000 : now + 86400000 * 2,
    ).toISOString(),
  };
}

const byName = new Map(ENTRIES.map((e) => [e.name, buildIngredient(e)]));

export function getDemoIngredientByName(name: string): Ingredient | undefined {
  return byName.get(name);
}

export function getDemoIngredientPreviewHref(name: string): string {
  return `/fridge/preview/${encodeURIComponent(name)}`;
}
