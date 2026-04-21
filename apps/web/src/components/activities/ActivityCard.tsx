'use client';

import { MessageCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import type { Activity } from '@lin-shi/contracts';
import { ActivityStatusChip } from './ActivityStatusChip';
import {
  activityEmoji,
  formatStartTime,
} from '@/lib/activity-status-label';
import { toast } from '@/lib/toast';
import { cn } from '@/lib/cn';

export interface ActivityCardProps {
  activity: Activity;
  variant?: 'mine' | 'discover';
}

export function ActivityCard({ activity, variant = 'mine' }: ActivityCardProps) {
  const router = useRouter();

  const { id, title, status, location, startTime, maxParticipants, participantCount } =
    activity;
  const emoji = activityEmoji(title);

  const goDetail = (): void => {
    router.push(`/activities/${id}`);
  };

  const onChatClick = (e: React.MouseEvent<HTMLButtonElement>): void => {
    e.stopPropagation();
    // E 板块未实现 — chatRoomId 实际永远 null。按任务说明提示。
    toast.info('聊天板块稍后上线');
  };

  // progress dots (up to maxParticipants)
  const dots = Array.from({ length: maxParticipants }, (_, i) => i < participantCount);

  return (
    <article
      className="group flex flex-col gap-3 rounded-2xl bg-white p-4 shadow-sm transition-shadow hover:shadow-md"
      onClick={goDetail}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          goDetail();
        }
      }}
      aria-label={`${title} — 查看详情`}
    >
      {/* Top row */}
      <div className="flex items-start gap-3">
        <div
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-neutral-100 text-[24px]"
          aria-hidden
        >
          {emoji}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="truncate text-[16px] font-semibold text-neutral-900">
            {title}
          </h3>
          <p className="mt-0.5 truncate text-[12px] text-neutral-500">
            {activity.description ?? `${location}`}
          </p>
        </div>
        <ActivityStatusChip status={status} />
      </div>

      <div className="border-t border-neutral-100" />

      {/* Meta row */}
      <div className="flex items-center gap-3 text-[13px] text-neutral-700">
        <span className="inline-flex items-center gap-1">
          <span aria-hidden>📆</span>
          {formatStartTime(startTime)}
        </span>
        <span className="inline-flex items-center gap-1">
          <span aria-hidden>📍</span>
          <span className="truncate max-w-[9rem]">{location}</span>
        </span>
      </div>

      {/* Bottom row */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1" aria-label={`${participantCount}/${maxParticipants} 人`}>
          {dots.map((filled, i) => (
            <span
              key={i}
              className={cn(
                'h-2 w-6 rounded-full',
                filled ? 'bg-accent-peach-500' : 'bg-neutral-200',
              )}
              aria-hidden
            />
          ))}
        </div>
        <span className="text-[12px] font-medium text-neutral-700">
          {participantCount}/{maxParticipants} 人
        </span>
        {variant === 'mine' ? (
          <button
            type="button"
            onClick={onChatClick}
            className="ml-auto inline-flex h-8 items-center gap-1 rounded-full bg-accent-peach-500 px-3 text-[12px] font-semibold text-white hover:opacity-95"
            aria-label="去聊聊"
          >
            <MessageCircle className="h-3.5 w-3.5" />
            去聊聊
          </button>
        ) : null}
      </div>
    </article>
  );
}
