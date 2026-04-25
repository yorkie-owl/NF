import type { ActivityStatus } from '@lin-shi/contracts';
import { minutesBetween } from '@/lib/activity-status-label';
import { cn } from '@/lib/cn';

export interface ActivityStatusBannerProps {
  status: ActivityStatus;
  startTime: string;
  /** Reference "now" (default: new Date()). Used for testability. */
  now?: Date;
}

/**
 * Top banner on `/activities/[id]` that surfaces the state-machine state
 * in natural language. Hidden for WAITING_FOR_MEMBERS and FORMED.
 */
export function ActivityStatusBanner({
  status,
  startTime,
  now,
}: ActivityStatusBannerProps) {
  const ref = (now ?? new Date()).toISOString();
  const diffMin = minutesBetween(ref, startTime); // positive = start in future
  const absSince = -diffMin; // minutes since start (when negative = start in future)

  if (status === 'WAITING_FOR_MEMBERS' || status === 'FORMED') return null;

  let content: { bg: string; text: string; body: string };
  if (status === 'STARTING_SOON') {
    const min = Math.max(0, diffMin);
    content = {
      bg: 'bg-warning-100',
      text: 'text-warning-500',
      body: `🔥 距离开桌还有 ${min} 分钟`,
    };
  } else if (status === 'IN_PROGRESS') {
    const min = Math.max(0, absSince);
    content = {
      bg: 'bg-success-100',
      text: 'text-success-500',
      body: `🤝 进行中 · 已开始 ${min} 分钟`,
    };
  } else if (status === 'COMPLETED') {
    content = {
      bg: 'bg-neutral-200',
      text: 'text-neutral-500',
      body: '✅ 活动已结束',
    };
  } else {
    // CANCELLED
    content = {
      bg: 'bg-danger-100',
      text: 'text-danger-500',
      body: '⚠️ 活动已取消',
    };
  }

  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        'flex items-center justify-center rounded-xl px-4 py-2.5 text-[13px] font-semibold',
        content.bg,
        content.text,
      )}
    >
      {content.body}
    </div>
  );
}
