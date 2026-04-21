'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { activityDetailKey } from './use-activity';

export function useCancelActivity(id: string) {
  const qc = useQueryClient();
  return useMutation<void, Error, void>({
    mutationFn: async () => {
      await api.delete(`activities/${id}`);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: activityDetailKey(id) });
      qc.invalidateQueries({ queryKey: ['activities'] });
      qc.invalidateQueries({ queryKey: ['activity-feeds'] });
    },
  });
}
