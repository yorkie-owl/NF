'use client';

import { useRouter } from 'next/navigation';
import type { ActivityFeedItem } from '@lin-shi/contracts';
import { ActivityStatusChip } from './ActivityStatusChip';
import { relativeTime } from '@/lib/relative-time';
import { useMarkFeedRead } from '@/hooks/use-mark-feed-read';
import { cn } from '@/lib/cn';

export interface FeedItemProps {
  item: ActivityFeedItem;
}

export function FeedItem({ item }: FeedItemProps) {
  const router = useRouter();
  const markRead = useMarkFeedRead();

  const unread = (item.lastMessage?.unreadCount ?? 0) > 0;
  const previewText = item.lastMessage
    ? item.lastMessage.senderNickname
      ? `${item.lastMessage.senderNickname}: ${item.lastMessage.preview}`
      : item.lastMessage.preview
    : '暂无消息';

  const onClick = (): void => {
    if (unread) {
      markRead.mutate(item.activityId);
    }
    router.push(`/activities/${item.activityId}`);
  };

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'flex w-full items-start gap-3 rounded-2xl bg-white p-4 text-left shadow-sm transition-colors hover:bg-neutral-50',
      )}
    >
      <div className="relative">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-neutral-100 text-[20px]">
          {item.activityEmoji}
        </div>
        {unread ? (
          <span
            className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-brand-500 px-1 text-[10px] font-semibold text-white"
            aria-label={`${item.lastMessage?.unreadCount ?? 0} 条未读`}
          >
            {Math.min(99, item.lastMessage?.unreadCount ?? 0)}
          </span>
        ) : null}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <h3 className="truncate text-[15px] font-semibold text-neutral-900">
            {item.activityTitle}
          </h3>
          <span className="ml-auto shrink-0 text-[11px] text-neutral-400">
            {relativeTime(item.updatedAt)}
          </span>
        </div>
        <p
          className={cn(
            'mt-0.5 line-clamp-1 text-[13px]',
            unread ? 'text-neutral-900 font-medium' : 'text-neutral-500',
          )}
        >
          {previewText}
        </p>
        <div className="mt-2">
          <ActivityStatusChip status={item.activityStatus} />
        </div>
      </div>
    </button>
  );
}
