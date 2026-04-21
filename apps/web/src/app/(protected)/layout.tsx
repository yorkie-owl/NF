'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useEffect, type ReactNode } from 'react';
import { HTTPError } from '@/lib/api';
import { clearTokens, getAccessToken } from '@/lib/auth';
import { useMe } from '@/hooks/use-me';
import { BottomNav } from '@/components/nav/BottomNav';

/**
 * Routes that show the bottom nav — tab-level pages only, per Figma.
 * Everything else (detail / edit / create) uses its own sticky CTA and
 * would visually clash with the dome nav.
 */
const NAV_ROUTES = new Set([
  '/activities',
  '/activities/discover',
]);

function shouldShowNav(pathname: string | null): boolean {
  if (!pathname) return false;
  return NAV_ROUTES.has(pathname);
}

export default function ProtectedLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { error, isLoading } = useMe();
  const showNav = shouldShowNav(pathname);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!getAccessToken()) {
      router.replace('/login');
    }
  }, [router]);

  useEffect(() => {
    if (error && error instanceof HTTPError && error.response.status === 401) {
      clearTokens();
      router.replace('/login');
    }
  }, [error, router]);

  if (isLoading && !getAccessToken()) {
    return null;
  }

  return (
    <div className={`flex min-h-screen flex-col bg-neutral-50 ${showNav ? 'pb-28' : ''}`}>
      <div className="flex-1">{children}</div>
      {showNav ? <BottomNav /> : null}
    </div>
  );
}
