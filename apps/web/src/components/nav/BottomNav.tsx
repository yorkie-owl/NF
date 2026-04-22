'use client';

import { Star, User } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { PotButton } from './PotButton';
import { useActivityFeeds } from '@/hooks/use-activity-feeds';
import { cn } from '@/lib/cn';

/**
 * Bottom-nav for (protected) routes. Matches Figma frame-01 (2:6490): the
 * background is the top of a huge circle clipped to 390×165, creating a wide
 * dome/half-arch where all three slots live. Center slot raises a pot button.
 */
export function BottomNav() {
  const pathname = usePathname();
  const feeds = useActivityFeeds('UNREAD', { pollMs: 60_000, staleTime: 30_000 });
  const hasUnread = (feeds.data?.total ?? 0) > 0;

  const isActive = (href: string): boolean =>
    pathname === href || (pathname?.startsWith(`${href}/`) ?? false);

  return (
    <nav
      aria-label="主导航"
      className="pointer-events-none fixed inset-x-0 bottom-0 z-20"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      {/* Dome background — exact path from Figma 2:6488. */}
      <svg
        className="absolute inset-x-0 bottom-0 h-[165px] w-full drop-shadow-[0_-6px_20px_rgba(24,24,27,0.06)]"
        viewBox="0 0 390 165"
        preserveAspectRatio="none"
        aria-hidden
      >
        <path
          d="M195 0C29.315 0 -105 134.315 -105 300V300.45C-105 466.135 28.865 600 194.55 600H195C360.685 600 495 466.135 495 300.45V300C495 134.315 361.135 0 195.45 0H195Z"
          fill="white"
        />
      </svg>

      {/* Interactive layer sits on the dome. */}
      <div className="pointer-events-auto relative mx-auto h-[96px] max-w-md">
        <ul className="absolute inset-x-0 bottom-4 flex items-end justify-around px-8">
          <li className="flex flex-1 justify-center">
            <Link
              href="/profile"
              aria-label="个人信息"
              className={cn(
                'flex flex-col items-center gap-1 text-[11px] font-medium',
                isActive('/profile') ? 'text-brand-500' : 'text-neutral-500',
              )}
            >
              <span
                className={cn(
                  'flex h-12 w-12 items-center justify-center rounded-full',
                  isActive('/profile') ? 'bg-brand-100 text-brand-500' : 'bg-neutral-100 text-neutral-500',
                )}
              >
                <User className="h-5 w-5" aria-hidden />
              </span>
              个人信息
            </Link>
          </li>

          <li className="flex flex-1 justify-center">
            <PotButton href="/activities/new" label="准备起锅" />
          </li>

          <li className="flex flex-1 justify-center">
            <Link
              href="/activities"
              aria-label="近期活动"
              className={cn(
                'flex flex-col items-center gap-1 text-[11px] font-medium',
                isActive('/activities') && !isActive('/activities/new')
                  ? 'text-brand-500'
                  : 'text-neutral-500',
              )}
            >
              <span
                className={cn(
                  'relative flex h-12 w-12 items-center justify-center rounded-full',
                  isActive('/activities') && !isActive('/activities/new')
                    ? 'bg-brand-100 text-brand-500'
                    : 'bg-neutral-100 text-neutral-500',
                )}
              >
                <Star className="h-5 w-5" aria-hidden />
                {hasUnread ? (
                  <span
                    className="absolute right-1 top-1 h-2 w-2 rounded-full bg-brand-500 ring-2 ring-white"
                    aria-label="有未读消息"
                  />
                ) : null}
              </span>
              近期活动
            </Link>
          </li>
        </ul>
      </div>
    </nav>
  );
}
