'use client';

import { ChefHat, User, Utensils } from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, type ReactNode } from 'react';
import { HTTPError } from '@/lib/api';
import { getAccessToken } from '@/lib/auth';
import { cn } from '@/lib/cn';
import { toast } from '@/lib/toast';
import { useMe } from '@/hooks/use-me';

const NAV = [
  { href: '/profile', label: '个人信息', icon: User, enabled: true },
  {
    href: '/activities/new',
    label: '准备起锅',
    icon: ChefHat,
    enabled: false,
  },
  { href: '/activities', label: '近期活动', icon: Utensils, enabled: false },
] as const;

export default function ProtectedLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
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
      router.replace('/login');
    }
  }, [error, router]);

  if (isLoading && !getAccessToken()) {
    return null;
  }

  return (
    <div className="flex min-h-screen flex-col bg-neutral-50 pb-20">
      <div className="flex-1">{children}</div>
      <nav
        aria-label="主导航"
        className="fixed inset-x-0 bottom-0 z-20 border-t border-neutral-200 bg-white/95 backdrop-blur"
      >
        <ul className="mx-auto flex max-w-md items-stretch justify-around">
          {NAV.map(({ href, label, icon: Icon, enabled }) => {
            const active = pathname === href || pathname?.startsWith(`${href}/`);
            const commonCls = cn(
              'flex flex-1 flex-col items-center gap-0.5 py-2 text-[11px] font-medium',
              active ? 'text-brand-500' : 'text-neutral-500',
              !enabled && 'opacity-50',
            );
            return (
              <li key={href} className="flex flex-1">
                {enabled ? (
                  <Link href={href} className={commonCls} aria-label={label}>
                    <Icon className="h-5 w-5" />
                    {label}
                  </Link>
                ) : (
                  <button
                    type="button"
                    className={commonCls}
                    aria-label={label}
                    onClick={() => toast.info('活动板块稍后上线')}
                  >
                    <Icon className="h-5 w-5" />
                    {label}
                  </button>
                )}
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}
