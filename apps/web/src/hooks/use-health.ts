'use client';

import { useQuery } from '@tanstack/react-query';
import { HealthResponseSchema, type HealthResponse } from '@lin-shi/contracts';
import { api } from '@/lib/api';

export function useHealth() {
  return useQuery<HealthResponse>({
    queryKey: ['health'],
    queryFn: async () => HealthResponseSchema.parse(await api.get('health').json()),
    refetchInterval: 10_000,
  });
}
