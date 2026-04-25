'use client';

import { motion } from 'framer-motion';
import { ArrowLeft, Bell } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ActivityCard } from '@/components/activities/ActivityCard';
import { Button } from '@/components/ui/button';
import {
  fadeInUp,
  fadeInUpTransition,
  staggerContainer,
} from '@/components/motion/presets';
import { useActivities } from '@/hooks/use-activities';
import { useActivityFeeds } from '@/hooks/use-activity-feeds';
import { cn } from '@/lib/cn';
import StatusBar from '@/components/common/status-bar';

export default function MyActivitiesPage() {
  const router = useRouter();
  const { data, isLoading, error } = useActivities({
    scope: 'mine',
    page: 1,
    pageSize: 20,
  });
  const feeds = useActivityFeeds('UNREAD', {
    pollMs: 60_000,
    staleTime: 30_000,
  });
  const hasUnread = (feeds.data?.total ?? 0) > 0;

  return (
    <div className="flex flex-col flex-1 min-h-0">
      {/* ── Fixed header ────────────────────────────────────────────── */}
      <div className="mx-auto w-full max-w-md px-5 pt-6 flex-shrink-0">
        {/* Header row */}
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => router.push('/fridge')}
              aria-label="返回"
              className="flex h-9 w-9 items-center justify-center rounded-full bg-white shadow-sm hover:bg-neutral-100"
            >
              <ArrowLeft className="h-4 w-4 text-neutral-700" />
            </button>
            <h1 className="text-[22px] font-bold text-neutral-900">我的局</h1>
          </div>
          <Link
            href="/chat/list?tab=unread"
            aria-label="我的消息"
            className="relative flex h-9 w-9 items-center justify-center rounded-full bg-white shadow-sm hover:bg-neutral-100"
          >
            <Bell className="h-4 w-4 text-neutral-700" />
            {hasUnread ? (
              <span
                className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-brand-500"
                aria-hidden
              />
            ) : null}
          </Link>
        </header>

        {/* Tabs */}
        <div className="mt-4 flex gap-6 border-b border-neutral-200">
          <span
            className={cn(
              'pb-2 text-[14px] font-semibold text-brand-500',
              'border-b-2 border-brand-500',
            )}
          >
            我的局
          </span>
          <Link
            href="/activities/discover"
            className="pb-2 text-[14px] font-medium text-neutral-500 hover:text-neutral-700"
          >
            全部活动
          </Link>
        </div>
      </div>

      {/* ── Scrollable content (bounded, never reaches bottom nav) ── */}
      <div className="mx-auto w-full max-w-md flex-1 overflow-y-auto px-5 pt-4 pb-4">
        {isLoading ? (
          <p className="py-12 text-center text-[13px] text-neutral-500">
            加载中…
          </p>
        ) : error ? (
          <p className="py-12 text-center text-[13px] text-danger-500">
            加载失败，请稍后重试
          </p>
        ) : !data || data.items.length === 0 ? (
          <div className="mt-10 flex flex-col items-center gap-4 rounded-2xl bg-white p-8 text-center shadow-sm">
            <span className="text-[48px]" aria-hidden>
              🤝
            </span>
            <p className="text-[15px] font-medium text-neutral-700">
              还没有局在跑呢
            </p>
            <Link href="/activities/new">
              <Button variant="gradient" size="md">
                去起一桌 →
              </Button>
            </Link>
          </div>
        ) : (
          <motion.ul
            className="flex flex-col gap-3"
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
          >
            {data.items.map((activity) => (
              <motion.li
                key={activity.id}
                variants={fadeInUp}
                transition={fadeInUpTransition}
              >
                <ActivityCard activity={activity} variant="mine" />
              </motion.li>
            ))}
          </motion.ul>
        )}
      </div>
    </div>
  );
}
