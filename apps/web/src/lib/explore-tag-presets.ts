/** OPC 探索标签：风格 / 场景 — 与 idea 详情 UI 配套 */

export const TASTE_PRESETS = ['快速原型', '工程感', '毒舌', '慢工', '极简', '高密度', '体系化', '游击'] as const;

export const CONTEXT_PRESETS = [
  '独立咖啡馆',
  'B2B SaaS',
  '周更播客',
  '社区运营',
  '会员体系',
  '小程序',
  '本地生活',
  '出海',
  '内容工作室',
] as const;

const EMOJI_MAP: Record<string, string> = {
  快速原型: '🛠️',
  工程感: '🛠️',
  毒舌: '📌',
  慢工: '🎯',
  极简: '💡',
  高密度: '💡',
  体系化: '🎯',
  游击: '🤝',
  独立咖啡馆: '🤝',
  'B2B SaaS': '🛠️',
  周更播客: '💡',
  社区运营: '🤝',
  会员体系: '🎯',
  小程序: '🛠️',
  本地生活: '📌',
  出海: '🎯',
  内容工作室: '💡',
};

export function tagToEmoji(label: string): string {
  return EMOJI_MAP[label] ?? '🏷️';
}
