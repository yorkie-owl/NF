'use client';

import { useQuery } from '@tanstack/react-query';
import {
  ActivityFeedItemSchema,
  paginatedResponseSchema,
  type ActivityFeedFilter,
  type ActivityFeedItem,
  type PaginatedResponse,
} from '@lin-shi/contracts';
import { api } from '@/lib/api';
import { isAuthed } from '@/lib/auth';
import { useDocumentHidden } from '@/lib/visibility-pause';

const FeedsResponseSchema = paginatedResponseSchema(ActivityFeedItemSchema);

const MOCK_FEEDS: PaginatedResponse<ActivityFeedItem> = {
  items: [
    {
      activityId: '11111111-0000-4000-8000-000000000001',
      activityTitle: '周六川菜小聚 🌶️',
      activityEmoji: '🌶️',
      activityStatus: 'WAITING_FOR_MEMBERS',
      lastMessage: {
        type: 'CHAT',
        preview: '我带豆腐，你们看还缺什么？',
        senderNickname: '小林',
        unreadCount: 2,
        at: '2026-04-22T08:30:00.000Z',
      },
      updatedAt: '2026-04-22T08:30:00.000Z',
    },
  ],
  total: 1,
  page: 1,
  pageSize: 20,
};

export function activityFeedsKey(status: ActivityFeedFilter) {
  return ['activity-feeds', status] as const;
}

export interface UseActivityFeedsOptions {
  /** Override poll interval (ms). Default 10 000. Set to `false` to disable. */
  pollMs?: number | false;
  /** Override staleTime. */
  staleTime?: number;
}

export function useActivityFeeds(
  status: ActivityFeedFilter,
  { pollMs = 10_000, staleTime = 5_000 }: UseActivityFeedsOptions = {},
) {
  const hidden = useDocumentHidden();
  return useQuery<PaginatedResponse<ActivityFeedItem>>({
    queryKey: activityFeedsKey(status),
    // V3 demo: activity-feeds endpoint lives on dev branch. Skip the network
    // call so the unread badge / list never errors during the fridge demo.
    queryFn: async () => MOCK_FEEDS,
    enabled: true,
    refetchInterval: hidden || pollMs === false ? false : pollMs,
    refetchOnWindowFocus: true,
    staleTime,
  });
}
