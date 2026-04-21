'use client';

import { useQuery } from '@tanstack/react-query';
import {
  InviteCodeDetailSchema,
  type InviteCodeDetail,
} from '@lin-shi/contracts';
import { api } from '@/lib/api';
import { isAuthed } from '@/lib/auth';

export function useInviteCode() {
  return useQuery<InviteCodeDetail>({
    queryKey: ['me', 'invite-code'],
    queryFn: async () =>
      InviteCodeDetailSchema.parse(await api.get('me/invite-code').json()),
    retry: false,
    enabled: isAuthed(),
  });
}
