'use client';

import { useQuery } from '@tanstack/react-query';
import { UserPrivateSchema, type UserPrivate } from '@lin-shi/contracts';
import { api } from '@/lib/api';
import { isAuthed } from '@/lib/auth';

export const meQueryKey = ['me'] as const;

export function useMe() {
  return useQuery<UserPrivate>({
    queryKey: meQueryKey,
    queryFn: async () => UserPrivateSchema.parse(await api.get('me').json()),
    retry: false,
    refetchOnWindowFocus: true,
    enabled: isAuthed(),
  });
}
