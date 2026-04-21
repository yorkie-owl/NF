'use client';

import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';
import type {
  ActivityJoinScope,
  ActivityStatus,
} from '@lin-shi/contracts';
import { ActivityCard } from '@/components/activities/ActivityCard';
import {
  fadeInUp,
  fadeInUpTransition,
  staggerContainer,
} from '@/components/motion/presets';
import {
  useActivities,
  type UseActivitiesParams,
} from '@/hooks/use-activities';
import {
  TIME_QUICK_OPTIONS,
  quickOptionToDate,
  type TimeQuickOptionId,
} from '@/lib/time-quick-picker';
import { cn } from '@/lib/cn';

type StatusFilter = 'ALL' | 'WAITING_FOR_MEMBERS' | 'STARTING_SOON';
type TimeFilter = 'ALL' | TimeQuickOptionId;
type SizeFilter = 'ALL' | 'SMALL' | 'MEDIUM' | 'LARGE';
type ScopeFilter = 'ALL' | ActivityJoinScope;

const STATUS_CHIPS: ReadonlyArray<{ id: StatusFilter; label: string }> = [
  { id: 'ALL', label: '全部状态' },
  { id: 'WAITING_FOR_MEMBERS', label: '招募中' },
  { id: 'STARTING_SOON', label: '快开始' },
];

const SIZE_CHIPS: ReadonlyArray<{ id: SizeFilter; label: string; min?: number; max?: number }> = [
  { id: 'ALL', label: '全部人数' },
  { id: 'SMALL', label: '2-4 人', min: 2, max: 4 },
  { id: 'MEDIUM', label: '5-6 人', min: 5, max: 6 },
  { id: 'LARGE', label: '7-10 人', min: 7, max: 10 },
];

const SCOPE_CHIPS: ReadonlyArray<{ id: ScopeFilter; label: string }> = [
  { id: 'ALL', label: '全部范围' },
  { id: 'ACQUAINTANCES_ONLY', label: '熟人扩展' },
  { id: 'STRANGERS_OK', label: '接受陌生人' },
];

const TIME_CHIPS: ReadonlyArray<{ id: TimeFilter; label: string }> = [
  { id: 'ALL', label: '全部时间' },
  { id: 'tonight', label: '今晚' },
  { id: 'tomorrowNight', label: '明晚' },
  { id: 'thisWeekend', label: '本周末' },
];

function FilterChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        'inline-flex items-center rounded-full border px-3 py-1.5 text-[12px] font-medium transition-colors',
        active
          ? 'border-brand-500 bg-brand-500 text-white'
          : 'border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-50',
      )}
    >
      {children}
    </button>
  );
}

export default function DiscoverActivitiesPage() {
  const router = useRouter();
  const [status, setStatus] = useState<StatusFilter>('ALL');
  const [size, setSize] = useState<SizeFilter>('ALL');
  const [scope, setScope] = useState<ScopeFilter>('ALL');
  const [time, setTime] = useState<TimeFilter>('ALL');

  const params = useMemo<UseActivitiesParams>(() => {
    const sizeCfg = SIZE_CHIPS.find((s) => s.id === size);
    let from: string | undefined;
    let to: string | undefined;
    if (time !== 'ALL') {
      const start = quickOptionToDate(time);
      if (start) {
        from = new Date(start.getTime() - 6 * 3600_000).toISOString();
        to = new Date(start.getTime() + 6 * 3600_000).toISOString();
      }
    }
    const out: UseActivitiesParams = {
      scope: 'all',
      page: 1,
      pageSize: 20,
    };
    if (status !== 'ALL') {
      const s: ActivityStatus = status;
      out.status = s;
    }
    if (scope !== 'ALL') out.joinScope = scope;
    if (from) out.from = from;
    if (to) out.to = to;
    if (sizeCfg?.min !== undefined) out.minParticipants = sizeCfg.min;
    if (sizeCfg?.max !== undefined) out.maxParticipants = sizeCfg.max;
    return out;
  }, [status, size, scope, time]);

  const { data, isLoading, error } = useActivities(params);

  return (
    <div className="mx-auto max-w-md px-5 pb-6 pt-6">
      {/* Header */}
      <header className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => router.back()}
          aria-label="返回"
          className="flex h-9 w-9 items-center justify-center rounded-full bg-white shadow-sm hover:bg-neutral-100"
        >
          <ArrowLeft className="h-4 w-4 text-neutral-700" />
        </button>
        <h1 className="text-[22px] font-bold text-neutral-900">发现活动</h1>
      </header>

      {/* Tabs — mirror the pair on /activities */}
      <div className="mt-4 flex gap-6 border-b border-neutral-200">
        <Link
          href="/activities"
          className="pb-2 text-[14px] font-medium text-neutral-500 hover:text-neutral-700"
        >
          我的锅
        </Link>
        <span className="pb-2 text-[14px] font-semibold text-brand-500 border-b-2 border-brand-500">
          全部活动
        </span>
      </div>

      {/* Filters */}
      <div className="mt-4 flex flex-col gap-2">
        <div className="flex flex-wrap gap-2">
          {STATUS_CHIPS.map((c) => (
            <FilterChip
              key={c.id}
              active={status === c.id}
              onClick={() => setStatus(c.id)}
            >
              {c.label}
            </FilterChip>
          ))}
        </div>
        <div className="flex flex-wrap gap-2">
          {TIME_CHIPS.map((c) => (
            <FilterChip
              key={c.id}
              active={time === c.id}
              onClick={() => setTime(c.id)}
            >
              {c.label}
            </FilterChip>
          ))}
          {TIME_QUICK_OPTIONS.length /* reference to keep import used */ ? null : null}
        </div>
        <div className="flex flex-wrap gap-2">
          {SIZE_CHIPS.map((c) => (
            <FilterChip
              key={c.id}
              active={size === c.id}
              onClick={() => setSize(c.id)}
            >
              {c.label}
            </FilterChip>
          ))}
        </div>
        <div className="flex flex-wrap gap-2">
          {SCOPE_CHIPS.map((c) => (
            <FilterChip
              key={c.id}
              active={scope === c.id}
              onClick={() => setScope(c.id)}
            >
              {c.label}
            </FilterChip>
          ))}
        </div>
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
            <span className="text-[40px]" aria-hidden>
              🍽️
            </span>
            <p className="mt-2 text-[14px] text-neutral-500">
              没有符合条件的活动
            </p>
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
                <ActivityCard activity={activity} variant="discover" />
              </motion.li>
            ))}
          </motion.ul>
        )}
      </div>
    </div>
  );
}
