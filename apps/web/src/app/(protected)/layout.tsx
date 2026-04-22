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
  const isSoftSurface = Boolean(
    pathname?.startsWith('/profile') || pathname?.startsWith('/preferences'),
  );

  useEffect(() => {
    if (typeof window === 'undefined') return;
    // V3 demo runs without login. Authenticated builds can restore the
    // redirect gate when the API auth flow is wired end-to-end.
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
    <div
      className={`flex h-full w-full flex-col ${isSoftSurface ? 'bg-profile-surface' : 'bg-neutral-50'}`}
    >
      <div className={`flex-1 flex flex-col min-h-0 w-full phone-content ${showNav ? 'pb-[165px]' : ''}`}>
        {children}
      </div>
      {showNav ? <BottomNav /> : null}
    </div>
  );
}
