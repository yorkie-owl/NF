'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';

export function useMarkFeedRead() {
  const qc = useQueryClient();
  return useMutation<void, Error, string>({
    mutationFn: async (activityId) => {
      await api.post(`activity-feeds/${activityId}/read`);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['activity-feeds'] });
    },
  });
}
