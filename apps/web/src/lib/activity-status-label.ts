import type { ActivityStatus } from '@lin-shi/contracts';

export interface ActivityStatusStyle {
  label: string;
  chipBg: string;
  chipText: string;
  dotBg: string;
}

/**
 * Chip / banner styling driven by activity.status — NOT by Figma literal colors.
 * See module-c spec §4.1.3.
 * All class strings are static literals so Tailwind JIT picks them up.
 */
export const ACTIVITY_STATUS_STYLE: Record<ActivityStatus, ActivityStatusStyle> = {
  WAITING_FOR_MEMBERS: {
    label: '招募中',
    chipBg: 'bg-brand-100',
    chipText: 'text-brand-700',
    dotBg: 'bg-brand-500',
  },
  FORMED: {
    label: '已成局',
    chipBg: 'bg-success-100',
    chipText: 'text-success-500',
    dotBg: 'bg-success-500',
  },
  STARTING_SOON: {
    label: '快开始',
    chipBg: 'bg-warning-100',
    chipText: 'text-warning-500',
    dotBg: 'bg-warning-500',
  },
  IN_PROGRESS: {
    label: '进行中',
    chipBg: 'bg-success-100',
    chipText: 'text-success-500',
    dotBg: 'bg-success-500',
  },
  COMPLETED: {
    label: '已结束',
    chipBg: 'bg-neutral-200',
    chipText: 'text-neutral-500',
    dotBg: 'bg-neutral-400',
  },
  CANCELLED: {
    label: '已取消',
    chipBg: 'bg-danger-100',
    chipText: 'text-danger-500',
    dotBg: 'bg-danger-500',
  },
};

/**
 * Pick an OPC abstract emoji from a 局 title. Falls back to a handshake.
 */
export function activityEmoji(title: string): string {
  const t = title;
  if (/MVP|原型|工程|开发|代码|prototype/i.test(t)) return '🛠️';
  if (/idea|想法|灵感|脑暴|brainstorm/i.test(t)) return '💡';
  if (/目标|计划|路线|roadmap|OKR/i.test(t)) return '🎯';
  if (/钉|锁定|跟进|pin/i.test(t)) return '📌';
  return '🤝';
}

/**
 * Minutes between two ISO timestamps, signed. Positive = b is after a.
 */
export function minutesBetween(a: string, b: string): number {
  return Math.round((new Date(b).getTime() - new Date(a).getTime()) / 60000);
}

/**
 * Format ISO time → "今晚 19:00" / "明晚 19:00" / "4月22日 19:00".
 */
export function formatStartTime(iso: string, now: Date = new Date()): string {
  const d = new Date(iso);
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const tomorrow = new Date(today.getTime() + 86400000);
  const dayAfter = new Date(today.getTime() + 2 * 86400000);
  const dDay = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const hh = d.getHours().toString().padStart(2, '0');
  const mm = d.getMinutes().toString().padStart(2, '0');
  const time = `${hh}:${mm}`;

  if (dDay.getTime() === today.getTime()) {
    return d.getHours() >= 17 ? `今晚 ${time}` : `今天 ${time}`;
  }
  if (dDay.getTime() === tomorrow.getTime()) {
    return d.getHours() >= 17 ? `明晚 ${time}` : `明天 ${time}`;
  }
  if (dDay.getTime() === dayAfter.getTime()) {
    return `后天 ${time}`;
  }
  return `${d.getMonth() + 1}月${d.getDate()}日 ${time}`;
}
