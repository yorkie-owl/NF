'use client';

import { useQuery } from '@tanstack/react-query';
import {
  InviteCodeDetailSchema,
  type InviteCodeDetail,
} from '@lin-shi/contracts';
import { api } from '@/lib/api';
import { isAuthed } from '@/lib/auth';
import { DEMO_INVITE_CODE } from '@/lib/demo-data';

export function useInviteCode() {
  return useQuery<InviteCodeDetail>({
    queryKey: ['me', 'invite-code'],
    queryFn: async () => {
      if (!isAuthed()) return DEMO_INVITE_CODE;
      try {
        return InviteCodeDetailSchema.parse(await api.get('me/invite-code').json());
      } catch {
        return DEMO_INVITE_CODE;
      }
    },
    retry: false,
    enabled: true,
  });
}
