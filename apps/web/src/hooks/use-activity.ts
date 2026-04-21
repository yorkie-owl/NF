'use client';

import { useQuery } from '@tanstack/react-query';
import {
  ActivityDetailSchema,
  type ActivityDetail,
} from '@lin-shi/contracts';
import { api } from '@/lib/api';
import { isAuthed } from '@/lib/auth';
import { useDocumentHidden } from '@/lib/visibility-pause';

export const activityDetailKey = (id: string) =>
  ['activities', 'detail', id] as const;

export function useActivity(id: string | undefined) {
  const hidden = useDocumentHidden();
  return useQuery<ActivityDetail>({
    queryKey: activityDetailKey(id ?? ''),
    queryFn: async () =>
      ActivityDetailSchema.parse(await api.get(`activities/${id}`).json()),
    enabled: Boolean(id) && isAuthed(),
    refetchInterval: (q) => {
      if (hidden) return false;
      const status = q.state.data?.status;
      if (status === 'COMPLETED' || status === 'CANCELLED') return false;
      return 10_000;
    },
    refetchOnWindowFocus: true,
    staleTime: 5_000,
  });
}
