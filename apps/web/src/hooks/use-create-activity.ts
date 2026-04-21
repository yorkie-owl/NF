'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  ActivityDetailSchema,
  type ActivityDetail,
  type CreateActivityRequest,
} from '@lin-shi/contracts';
import { api } from '@/lib/api';

export function useCreateActivity() {
  const qc = useQueryClient();
  return useMutation<ActivityDetail, Error, CreateActivityRequest>({
    mutationFn: async (payload) =>
      ActivityDetailSchema.parse(
        await api.post('activities', { json: payload }).json(),
      ),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['activities'] });
    },
  });
}
