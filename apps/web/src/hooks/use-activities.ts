'use client';

import { useQuery } from '@tanstack/react-query';
import {
  ActivitySchema,
  paginatedResponseSchema,
  type Activity,
  type ActivityJoinScope,
  type ActivityStatus,
  type PaginatedResponse,
} from '@lin-shi/contracts';
import { api } from '@/lib/api';
import { isAuthed } from '@/lib/auth';

export interface UseActivitiesParams {
  scope: 'mine' | 'all';
  status?: ActivityStatus | ActivityStatus[];
  joinScope?: ActivityJoinScope;
  from?: string;
  to?: string;
  minParticipants?: number;
  maxParticipants?: number;
  page?: number;
  pageSize?: number;
}

const ActivityListSchema = paginatedResponseSchema(ActivitySchema);

export function activitiesQueryKey(params: UseActivitiesParams) {
  return ['activities', params] as const;
}

function buildSearchParams(
  params: UseActivitiesParams,
): Record<string, string | number> {
  const out: Record<string, string | number> = {
    scope: params.scope,
    page: params.page ?? 1,
    pageSize: params.pageSize ?? 20,
  };
  if (params.status) {
    out.status = Array.isArray(params.status)
      ? params.status.join(',')
      : params.status;
  }
  if (params.joinScope) out.joinScope = params.joinScope;
  if (params.from) out.from = params.from;
  if (params.to) out.to = params.to;
  if (typeof params.minParticipants === 'number')
    out.minParticipants = params.minParticipants;
  if (typeof params.maxParticipants === 'number')
    out.maxParticipants = params.maxParticipants;
  return out;
}

export function useActivities(params: UseActivitiesParams) {
  return useQuery<PaginatedResponse<Activity>>({
    queryKey: activitiesQueryKey(params),
    queryFn: async () =>
      ActivityListSchema.parse(
        await api
          .get('activities', { searchParams: buildSearchParams(params) })
          .json(),
      ),
    enabled: isAuthed(),
    staleTime: 30_000,
    refetchOnWindowFocus: true,
  });
}
