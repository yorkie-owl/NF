'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  ActivityEventSchema,
  paginatedResponseSchema,
  type ActivityDetail,
  type ActivityEvent,
  type PaginatedResponse,
} from '@lin-shi/contracts';
import { api } from '@/lib/api';
import { isAuthed } from '@/lib/auth';
import { useDocumentHidden } from '@/lib/visibility-pause';
import { activityDetailKey } from './use-activity';

const EventsResponseSchema = paginatedResponseSchema(ActivityEventSchema);

export function activityEventsKey(id: string) {
  return ['activities', 'events', id] as const;
}

export function useActivityEvents(id: string | undefined, pageSize = 20) {
  const hidden = useDocumentHidden();
  const qc = useQueryClient();
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
    enabled: Boolean(id) && isAuthed(),
    refetchInterval: () => {
      if (hidden) return false;
      const activity = id
        ? qc.getQueryData<ActivityDetail>(activityDetailKey(id))
        : undefined;
      const status = activity?.status;
      if (status === 'COMPLETED' || status === 'CANCELLED') return false;
      return 10_000;
    },
    refetchOnWindowFocus: true,
    staleTime: 5_000,
  });
}
