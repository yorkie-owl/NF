'use client';

import { useQuery } from '@tanstack/react-query';
import { UserBadgeSchema, type UserBadge } from '@lin-shi/contracts';
import { z } from 'zod';
import { api } from '@/lib/api';
import { getAccessToken } from '@/lib/auth';

const MyBadgesSchema = z.array(UserBadgeSchema);

export function useMyBadges() {
  return useQuery<UserBadge[]>({
    queryKey: ['me', 'badges'],
    queryFn: async () =>
      MyBadgesSchema.parse(await api.get('me/badges').json()),
    retry: false,
    enabled: typeof window === 'undefined' ? false : Boolean(getAccessToken()),
  });
}
