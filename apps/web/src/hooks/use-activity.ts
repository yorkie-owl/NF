'use client';

import { useQuery } from '@tanstack/react-query';
import {
  ActivityDetailSchema,
  type ActivityDetail,
} from '@lin-shi/contracts';
import { api } from '@/lib/api';
import { getAccessToken } from '@/lib/auth';
import { useDocumentHidden } from '@/lib/visibility-pause';

export const activityDetailKey = (id: string) =>
  ['activities', 'detail', id] as const;

export function useActivity(id: string | undefined) {
  const hidden = useDocumentHidden();
  return useQuery<ActivityDetail>({
    queryKey: activityDetailKey(id ?? ''),
    queryFn: async () =>
      ActivityDetailSchema.parse(await api.get(`activities/${id}`).json()),
    enabled:
      typeof window === 'undefined'
        ? false
        : Boolean(id) && Boolean(getAccessToken()),
    refetchInterval: hidden ? false : 10_000,
    refetchOnWindowFocus: true,
    staleTime: 5_000,
  });
}
