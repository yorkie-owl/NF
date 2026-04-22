'use client';

import { MessageCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import type { Activity } from '@lin-shi/contracts';
import { ActivityStatusChip } from './ActivityStatusChip';
import {
  activityEmoji,
  formatStartTime,
} from '@/lib/activity-status-label';
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
    router.push(`/chat/${activity.chatRoomId ?? id}?title=${encodeURIComponent(title)}`);
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
            className="ml-auto inline-flex h-8 w-8 items-center justify-center rounded-full bg-[#FF7A9A] text-white hover:opacity-95"
            aria-label={`进入 ${title} 聊天室`}
          >
            <MessageCircle className="h-3.5 w-3.5" />
          </button>
        ) : status === 'WAITING_FOR_MEMBERS' ? (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              import('@/lib/toast').then(({ toast }) => toast.success('已申请'));
            }}
            className="ml-auto inline-flex h-8 w-8 items-center justify-center rounded-full bg-[#FF7A9A] text-white hover:opacity-95"
            aria-label="申请加入"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
          </button>
        ) : null}
      </div>
    </article>
  );
}
