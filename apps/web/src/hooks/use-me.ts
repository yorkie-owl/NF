'use client';

import { useQuery } from '@tanstack/react-query';
import { UserPrivateSchema, type UserPrivate } from '@lin-shi/contracts';
import { api } from '@/lib/api';
import { isAuthed } from '@/lib/auth';
import { DEMO_USER } from '@/lib/demo-data';

export const meQueryKey = ['me'] as const;

export function useMe() {
  return useQuery<UserPrivate>({
    queryKey: meQueryKey,
    queryFn: async () => {
      if (!isAuthed()) return DEMO_USER;
      try {
        return UserPrivateSchema.parse(await api.get('me').json());
      } catch {
        return DEMO_USER;
      }
    },
    retry: false,
    refetchOnWindowFocus: true,
  });
}
