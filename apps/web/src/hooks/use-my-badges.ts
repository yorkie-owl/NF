'use client';

import { useQuery } from '@tanstack/react-query';
import { UserBadgeSchema, type UserBadge } from '@lin-shi/contracts';
import { z } from 'zod';
import { api } from '@/lib/api';
import { isAuthed } from '@/lib/auth';
import { DEMO_BADGES } from '@/lib/demo-data';

const MyBadgesSchema = z.array(UserBadgeSchema);

export function useMyBadges() {
  return useQuery<UserBadge[]>({
    queryKey: ['me', 'badges'],
    queryFn: async () => {
      if (!isAuthed()) return DEMO_BADGES;
      try {
        return MyBadgesSchema.parse(await api.get('me/badges').json());
      } catch {
        return DEMO_BADGES;
      }
    },
    retry: false,
    enabled: true,
  });
}
