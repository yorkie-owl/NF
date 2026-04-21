'use client';

import { useQuery } from '@tanstack/react-query';
import {
  ActivityEventSchema,
  paginatedResponseSchema,
  type ActivityEvent,
  type PaginatedResponse,
} from '@lin-shi/contracts';
import { api } from '@/lib/api';
import { getAccessToken } from '@/lib/auth';
import { useDocumentHidden } from '@/lib/visibility-pause';

const EventsResponseSchema = paginatedResponseSchema(ActivityEventSchema);

export function activityEventsKey(id: string) {
  return ['activities', 'events', id] as const;
}

export function useActivityEvents(id: string | undefined, pageSize = 20) {
  const hidden = useDocumentHidden();
  return useQuery<PaginatedResponse<ActivityEvent>>({
    queryKey: activityEventsKey(id ?? ''),
    queryFn: async () =>
      EventsResponseSchema.parse(
        await api
          .get(`activities/${id}/events`, {
            searchParams: { page: 1, pageSize },
          })
          .json(),
      ),
    enabled:
      typeof window === 'undefined'
        ? false
        : Boolean(id) && Boolean(getAccessToken()),
    refetchInterval: hidden ? false : 10_000,
    refetchOnWindowFocus: true,
    staleTime: 5_000,
  });
}
