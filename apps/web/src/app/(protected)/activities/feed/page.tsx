'use client';

import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import type { ActivityFeedFilter } from '@lin-shi/contracts';
import { FeedItem } from '@/components/activities/FeedItem';
import {
  fadeInUp,
  fadeInUpTransition,
  staggerContainer,
} from '@/components/motion/presets';
import { useActivityFeeds } from '@/hooks/use-activity-feeds';
import { cn } from '@/lib/cn';

interface Tab {
  id: ActivityFeedFilter;
  label: string;
  empty: string;
}

const TABS: ReadonlyArray<Tab> = [
  { id: 'ALL', label: '全部', empty: '还没有活动消息' },
  { id: 'UNREAD', label: '未读', empty: '没有未读消息 🎉' },
  { id: 'IN_PROGRESS', label: '进行中', empty: '暂无进行中的活动' },
  { id: 'STARTING_SOON', label: '快开始', empty: '近期没有快开始的活动' },
];

export default function FeedPage() {
  const router = useRouter();
  const [tab, setTab] = useState<ActivityFeedFilter>('ALL');
  const { data, isLoading, error } = useActivityFeeds(tab);
  const currentTab: Tab = TABS.find((t) => t.id === tab) ?? TABS[0]!;

  return (
    <div className="mx-auto max-w-md px-5 pb-6 pt-6">
      <header className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => router.back()}
          aria-label="返回"
          className="flex h-9 w-9 items-center justify-center rounded-full bg-white shadow-sm hover:bg-neutral-100"
        >
          <ArrowLeft className="h-4 w-4 text-neutral-700" />
        </button>
        <h1 className="text-[22px] font-bold text-neutral-900">这几桌协作</h1>
      </header>

      {/* Tabs */}
      <div
        role="tablist"
        aria-label="消息筛选"
        className="mt-4 flex gap-1 overflow-x-auto rounded-full bg-neutral-100 p-1"
      >
        {TABS.map((t) => {
          const active = tab === t.id;
          return (
            <button
              key={t.id}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => setTab(t.id)}
              className={cn(
                'flex-1 rounded-full px-3 py-1.5 text-[13px] font-medium transition-colors',
                active
                  ? 'bg-white text-neutral-900 shadow-sm'
                  : 'text-neutral-500 hover:text-neutral-700',
              )}
            >
              {t.label}
            </button>
          );
        })}
      </div>

      {/* Content */}
      <div className="mt-4">
        {isLoading ? (
          <p className="py-12 text-center text-[13px] text-neutral-500">
            加载中…
          </p>
        ) : error ? (
          <p className="py-12 text-center text-[13px] text-danger-500">
            加载失败，请稍后重试
          </p>
        ) : !data || data.items.length === 0 ? (
          <div className="mt-10 rounded-2xl bg-white p-8 text-center shadow-sm">
            <span className="text-[36px]" aria-hidden>
              📨
            </span>
            <p className="mt-2 text-[14px] text-neutral-500">
              {currentTab.empty}
            </p>
          </div>
        ) : (
          <motion.ul
            className="flex flex-col gap-3"
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
          >
            {data.items.map((item) => (
              <motion.li
                key={item.activityId}
                variants={fadeInUp}
                transition={fadeInUpTransition}
              >
                <FeedItem item={item} />
              </motion.li>
            ))}
          </motion.ul>
        )}
      </div>
    </div>
  );
}
