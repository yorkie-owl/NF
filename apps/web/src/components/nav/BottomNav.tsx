'use client';

import { User, Utensils } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { PotButton } from './PotButton';
import { useActivityFeeds } from '@/hooks/use-activity-feeds';
import { cn } from '@/lib/cn';

/**
 * Bottom-nav for (protected) routes. Three slots:
 *   · 个人信息 → /profile
 *   · 起锅 (raised PotButton) → /activities/new
 *   · 近期活动 → /activities (unread red dot from feed)
 *
 * Note: the "feed (message center)" lives at /activities/feed, entered via the
 * bell icon in the /activities and /profile headers. The bottom-nav "近期活动"
 * slot goes directly to /activities per the current task brief.
 */
export function BottomNav() {
  const pathname = usePathname();
  // Unread indicator — fire-and-forget, slower poll to avoid thrash.
  const feeds = useActivityFeeds('UNREAD', { pollMs: 60_000, staleTime: 30_000 });
  const hasUnread = (feeds.data?.total ?? 0) > 0;

  const isActive = (href: string): boolean =>
    pathname === href || (pathname?.startsWith(`${href}/`) ?? false);

  return (
    <nav
      aria-label="主导航"
      className="fixed inset-x-0 bottom-0 z-20 border-t border-neutral-200 bg-white/95 backdrop-blur"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <ul className="mx-auto flex h-16 max-w-md items-end justify-around px-4">
        <li className="flex flex-1 justify-center">
          <Link
            href="/profile"
            aria-label="个人信息"
            className={cn(
              'flex flex-col items-center gap-0.5 py-2 text-[11px] font-medium',
              isActive('/profile') ? 'text-brand-500' : 'text-neutral-500',
            )}
          >
            <User className="h-5 w-5" aria-hidden />
            个人信息
          </Link>
        </li>
        <li className="flex flex-1 justify-center">
          <PotButton href="/activities/new" label="起锅" />
        </li>
        <li className="flex flex-1 justify-center">
          <Link
            href="/activities"
            aria-label="近期活动"
            className={cn(
              'relative flex flex-col items-center gap-0.5 py-2 text-[11px] font-medium',
              isActive('/activities') && !isActive('/activities/new')
                ? 'text-brand-500'
                : 'text-neutral-500',
            )}
          >
            <span className="relative">
              <Utensils className="h-5 w-5" aria-hidden />
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
