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
import { getAccessToken } from '@/lib/auth';
import { useDocumentHidden } from '@/lib/visibility-pause';

const FeedsResponseSchema = paginatedResponseSchema(ActivityFeedItemSchema);

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
    queryFn: async () =>
      FeedsResponseSchema.parse(
        await api.get('activity-feeds', { searchParams: { status } }).json(),
      ),
    enabled: typeof window === 'undefined' ? false : Boolean(getAccessToken()),
    refetchInterval: hidden || pollMs === false ? false : pollMs,
    refetchOnWindowFocus: true,
    staleTime,
  });
}
