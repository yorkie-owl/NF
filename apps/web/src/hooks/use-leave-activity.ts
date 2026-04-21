'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  ActivityDetailSchema,
  type ActivityDetail,
} from '@lin-shi/contracts';
import { api } from '@/lib/api';
import { activityDetailKey } from './use-activity';

export function useLeaveActivity(id: string) {
  const qc = useQueryClient();
  return useMutation<ActivityDetail, Error, void>({
    mutationFn: async () =>
      ActivityDetailSchema.parse(
        await api.post(`activities/${id}/leave`).json(),
      ),
    onSuccess: (data) => {
      qc.setQueryData(activityDetailKey(id), data);
      qc.invalidateQueries({ queryKey: ['activities'] });
      qc.invalidateQueries({ queryKey: ['activity-feeds'] });
    },
  });
}
