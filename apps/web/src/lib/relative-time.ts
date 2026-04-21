/**
 * Render a Chinese relative time string from an ISO timestamp.
 * Covers minute / hour / day granularity; falls back to `M月D日` beyond 7 days.
 * Shared between activity event timelines, feed items, and invite redemptions.
 */
export function relativeTime(iso: string, now: Date = new Date()): string {
  const t = new Date(iso).getTime();
  const diffMs = t - now.getTime();
  const absSec = Math.abs(diffMs) / 1000;
  const past = diffMs <= 0;

  if (absSec < 60) return past ? '刚刚' : '马上';
  const absMin = absSec / 60;
  if (absMin < 60) {
    const n = Math.round(absMin);
    return past ? `${n} 分钟前` : `${n} 分钟后`;
  }
  const absHr = absMin / 60;
  if (absHr < 24) {
    const n = Math.round(absHr);
    return past ? `${n} 小时前` : `${n} 小时后`;
  }
  const absDay = absHr / 24;
  if (absDay < 7) {
    const n = Math.round(absDay);
    return past ? `${n} 天前` : `${n} 天后`;
  }
  const d = new Date(iso);
  return `${d.getMonth() + 1}月${d.getDate()}日`;
}
