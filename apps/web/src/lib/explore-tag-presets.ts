/** 旅行探索标签：口味 / 场景·对方 — 与食材详情 UI 配套 */

export const TASTE_PRESETS = ['甜', '咸', '鲜', '酸', '辣', '清淡', '浓郁', '多汁'] as const;

export const CONTEXT_PRESETS = [
  '湖南菜',
  '川菜',
  '粤菜',
  '家常',
  '轻食',
  '本科生',
  '研究生',
  '上班族',
  '带娃家庭',
] as const;

const EMOJI_MAP: Record<string, string> = {
  甜: '🍯',
  咸: '🧂',
  鲜: '🦐',
  酸: '🍋',
  辣: '🌶️',
  清淡: '🍃',
  浓郁: '🍲',
  多汁: '💧',
  湖南菜: '🌶️',
  川菜: '🫕',
  粤菜: '🍚',
  家常: '🏠',
  轻食: '🥗',
  本科生: '🎓',
  研究生: '📚',
  上班族: '💼',
  带娃家庭: '👨‍👩‍👧',
};

export function tagToEmoji(label: string): string {
  return EMOJI_MAP[label] ?? '🏷️';
}
