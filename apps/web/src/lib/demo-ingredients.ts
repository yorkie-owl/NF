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
  { name: '西兰花', id: 'b0000000-0000-4000-8000-000000000001', category: '蔬菜', tasteTags: ['清爽'], contextTags: [], gone: true },
  { name: '胡萝卜', id: 'b0000000-0000-4000-8000-000000000002', category: '蔬菜', tasteTags: ['微甜'], contextTags: [], gone: true },
  { name: '番茄', id: 'b0000000-0000-4000-8000-000000000003', category: '蔬菜', tasteTags: ['酸甜', '多汁'], contextTags: [], gone: false },
  { name: '鸡蛋', id: 'b0000000-0000-4000-8000-000000000004', category: '蛋奶', tasteTags: ['高蛋白'], contextTags: [], gone: false },
  { name: '柠檬', id: 'b0000000-0000-4000-8000-000000000005', category: '水果', tasteTags: ['酸爽'], contextTags: [], gone: false },
  { name: '玉米', id: 'b0000000-0000-4000-8000-000000000006', category: '谷物', tasteTags: ['香甜'], contextTags: [], gone: false },
  { name: '生菜', id: 'b0000000-0000-4000-8000-000000000007', category: '蔬菜', tasteTags: ['脆爽'], contextTags: [], gone: false },
  { name: '洋葱', id: 'b0000000-0000-4000-8000-000000000008', category: '蔬菜', tasteTags: ['辛香'], contextTags: [], gone: false },
  { name: '葡萄', id: 'b0000000-0000-4000-8000-000000000009', category: '水果', tasteTags: ['多汁'], contextTags: [], gone: false },
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
