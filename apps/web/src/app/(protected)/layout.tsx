'use client';

import { useRouter } from 'next/navigation';
import { useEffect, type ReactNode } from 'react';
import { HTTPError } from '@/lib/api';
import { clearTokens, getAccessToken } from '@/lib/auth';
import { useMe } from '@/hooks/use-me';
import { BottomNav } from '@/components/nav/BottomNav';

export default function ProtectedLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { error, isLoading } = useMe();

  useEffect(() => {
    // Synchronous token check — if there's no access token, bounce immediately.
    if (typeof window === 'undefined') return;
    if (!getAccessToken()) {
      router.replace('/login');
    }
  }, [router]);

  useEffect(() => {
    if (error && error instanceof HTTPError && error.response.status === 401) {
      // Clear stale tokens before bouncing — otherwise /login will see them and bounce back (loop).
      clearTokens();
      router.replace('/login');
    }
  }, [error, router]);

  if (isLoading && !getAccessToken()) {
    return null;
  }

  return (
    <div className="flex min-h-screen flex-col bg-neutral-50 pb-24">
      <div className="flex-1">{children}</div>
      <BottomNav />
    </div>
  );
}
