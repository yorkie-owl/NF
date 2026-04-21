'use client';

import { Star, User } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { PotButton } from './PotButton';
import { useActivityFeeds } from '@/hooks/use-activity-feeds';
import { cn } from '@/lib/cn';

/**
 * Bottom-nav for (protected) routes. Three slots with a curved cutout
 * under the central raised pot button (matches Figma frame-01).
 *   · 个人信息 → /profile
 *   · 准备起锅 (raised PotButton) → /activities/new
 *   · 近期活动 → /activities (star icon, unread red dot from feed)
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
      className="fixed inset-x-0 bottom-0 z-20"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      {/* SVG background with an arch cutout under the center pot button. */}
      <svg
        className="absolute inset-x-0 bottom-0 h-[88px] w-full drop-shadow-[0_-4px_16px_rgba(24,24,27,0.06)]"
        viewBox="0 0 375 88"
        preserveAspectRatio="none"
        aria-hidden
      >
        <path
          // M start top-left · to left of notch · arc down-across-up around center ·
          // to right top edge · down · across bottom · up close
          d="M 0,16
             L 141,16
             C 150,16 156,48 187.5,48
             C 219,48 225,16 234,16
             L 375,16
             L 375,88
             L 0,88
             Z"
          fill="rgba(255,255,255,0.98)"
        />
      </svg>

      <ul className="relative mx-auto flex h-[88px] max-w-md items-end justify-around px-6 pb-3 pt-2">
        <li className="flex flex-1 justify-center">
          <Link
            href="/profile"
            aria-label="个人信息"
            className={cn(
              'flex flex-col items-center gap-0.5 pt-1 text-[11px] font-medium',
              isActive('/profile') ? 'text-brand-500' : 'text-neutral-500',
            )}
          >
            <User className="h-5 w-5" aria-hidden />
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
              'relative flex flex-col items-center gap-0.5 pt-1 text-[11px] font-medium',
              isActive('/activities') && !isActive('/activities/new')
                ? 'text-brand-500'
                : 'text-neutral-500',
            )}
          >
            <span className="relative">
              <Star className="h-5 w-5" aria-hidden />
              {hasUnread ? (
                <span
                  className="absolute -right-1 -top-1 h-2 w-2 rounded-full bg-brand-500 ring-2 ring-white"
                  aria-label="有未读消息"
                />
              ) : null}
            </span>
            近期活动
          </Link>
        </li>
      </ul>
    </nav>
  );
}
