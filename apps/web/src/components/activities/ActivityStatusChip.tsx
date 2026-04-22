import type { ActivityStatus } from '@lin-shi/contracts';
import { ACTIVITY_STATUS_STYLE } from '@/lib/activity-status-label';
import { cn } from '@/lib/cn';

export interface ActivityStatusChipProps {
  status: ActivityStatus;
  className?: string;
}

export function ActivityStatusChip({ status, className }: ActivityStatusChipProps) {
  const s = ACTIVITY_STATUS_STYLE[status];
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold leading-4',
        s.chipBg,
        s.chipText,
        className,
      )}
    >
      <span className={cn('h-1.5 w-1.5 rounded-full', s.dotBg)} aria-hidden />
      {s.label}
    </span>
  );
}
