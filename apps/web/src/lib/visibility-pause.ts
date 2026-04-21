'use client';

import { useEffect, useState } from 'react';

/**
 * Tracks `document.visibilityState` and returns `true` when the tab is hidden.
 * Use with React Query's `refetchInterval` via:
 *
 *     const hidden = useDocumentHidden();
 *     useQuery({ refetchInterval: hidden ? false : 10_000, ... });
 */
export function useDocumentHidden(): boolean {
  const [hidden, setHidden] = useState<boolean>(() =>
    typeof document === 'undefined' ? false : document.visibilityState === 'hidden',
  );

  useEffect(() => {
    const onChange = (): void => {
      setHidden(document.visibilityState === 'hidden');
    };
    document.addEventListener('visibilitychange', onChange);
    return () => document.removeEventListener('visibilitychange', onChange);
  }, []);

  return hidden;
}

/**
 * Returns the refetchInterval value for React Query given a desired ms interval,
 * auto-pausing when the document is hidden.
 *
 *     refetchInterval: useVisibilityRefetchInterval(10_000)
 */
export function useVisibilityRefetchInterval(intervalMs: number): number | false {
  const hidden = useDocumentHidden();
  return hidden ? false : intervalMs;
}
