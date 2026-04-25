import type { ActivityEvent } from '@lin-shi/contracts';
import { relativeTime } from '@/lib/relative-time';

const EVENT_COPY: Record<ActivityEvent['type'], { icon: string; label: string }> = {
  CREATED: { icon: '🤝', label: '活动创建' },
  JOINED: { icon: '🙋', label: '有人加入了' },
  LEFT: { icon: '👋', label: '有人退出了' },
  FORMED: { icon: '🎉', label: '成局啦' },
  STATUS_CHANGED: { icon: '🔄', label: '状态变更' },
  INGREDIENT_ADDED: { icon: '💡', label: '新 idea 加入' },
  INGREDIENT_REMOVED: { icon: '📌', label: '能力调整' },
  CANCELLED: { icon: '⚠️', label: '活动取消' },
  COMPLETED: { icon: '✅', label: '活动结束' },
};

export interface ActivityEventItemProps {
  event: ActivityEvent;
}

export function ActivityEventItem({ event }: ActivityEventItemProps) {
  const c = EVENT_COPY[event.type];
  return (
    <div className="flex items-start gap-3 py-2">
      <div
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-neutral-100 text-[14px]"
        aria-hidden
      >
        {c.icon}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[13px] font-medium text-neutral-900">{c.label}</p>
        <p className="text-[11px] text-neutral-500">{relativeTime(event.createdAt)}</p>
      </div>
    </div>
  );
}
