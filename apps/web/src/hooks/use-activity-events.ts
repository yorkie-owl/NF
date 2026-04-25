'use client';

import { useQuery } from '@tanstack/react-query';
import type {
  ActivityEvent,
  PaginatedResponse,
} from '@lin-shi/contracts';

export function activityEventsKey(id: string) {
  return ['activities', 'events', id] as const;
}

const EMPTY_EVENTS: PaginatedResponse<ActivityEvent> = {
  items: [],
  total: 0,
  page: 1,
  pageSize: 20,
};

// V3 demo: activity-events backend lives on dev (module-c). Until ported,
// return an empty list so the detail page renders without polling 404s.
export function useActivityEvents(id: string | undefined, _pageSize = 20) {
  return useQuery<PaginatedResponse<ActivityEvent>>({
    queryKey: activityEventsKey(id ?? ''),
    queryFn: async () => EMPTY_EVENTS,
    enabled: Boolean(id),
    refetchInterval: false,
    refetchOnWindowFocus: false,
    staleTime: Infinity,
    retry: false,
  });
}
