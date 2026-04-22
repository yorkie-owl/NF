'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  ActivityDetailSchema,
  type ActivityDetail,
  type CreateActivityRequest,
} from '@lin-shi/contracts';
import { api } from '@/lib/api';
import { saveCreatedActivity } from '@/lib/activity-drafts';

export function useCreateActivity() {
  const qc = useQueryClient();
  return useMutation<ActivityDetail, Error, CreateActivityRequest>({
    mutationFn: async (payload) => {
      try {
        return ActivityDetailSchema.parse(
          await api.post('activities', { json: payload }).json(),
        );
      } catch {
        return saveCreatedActivity(payload);
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['activities'] });
    },
  });
}
