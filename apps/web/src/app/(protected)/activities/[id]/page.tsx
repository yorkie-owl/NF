'use client';

import { motion } from 'framer-motion';
import {
  ArrowLeft,
  MessageCircle,
  MoreHorizontal,
  UserPlus,
  Utensils,
} from 'lucide-react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';
import { ActivityEventItem } from '@/components/activities/ActivityEventItem';
import { ActivityStatusBanner } from '@/components/activities/ActivityStatusBanner';
import { AgentBubble } from '@/components/activities/AgentBubble';
import { RetroCard } from '@/components/activities/RetroCard';
import { IngredientBadge } from '@/components/activities/IngredientBadge';
import {
  ParticipantPlaceholder,
  ParticipantRow,
} from '@/components/activities/ParticipantRow';
import {
  fadeInUp,
  fadeInUpTransition,
} from '@/components/motion/presets';
import { Button } from '@/components/ui/button';
import { useActivity } from '@/hooks/use-activity';
import { useActivityEvents } from '@/hooks/use-activity-events';
import { useCancelActivity } from '@/hooks/use-cancel-activity';
import { useJoinActivity } from '@/hooks/use-join-activity';
import { useLeaveActivity } from '@/hooks/use-leave-activity';
import { useMe } from '@/hooks/use-me';
import { extractApiError } from '@/lib/api';
import {
  activityEmoji,
  formatStartTime,
} from '@/lib/activity-status-label';
import { toast } from '@/lib/toast';
import { cn } from '@/lib/cn';

export default function ActivityDetailPage() {
  const params = useParams<{ id: string }>();
  const id = params.id;
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);

  const { data: activity, isLoading, error } = useActivity(id);
  const { data: events } = useActivityEvents(id);
  const { data: me } = useMe();

  const join = useJoinActivity(id);
  const leave = useLeaveActivity(id);
  const cancel = useCancelActivity(id);

  const isCreator = Boolean(me && activity && me.id === activity.createdBy);
  const hasJoined = useMemo(() => {
    if (!me || !activity) return false;
    return activity.participants.some(
      (p) => p.userId === me.id && p.leftAt === null,
    );
  }, [me, activity]);

  if (isLoading) {
    return (
      <p className="py-20 text-center text-[13px] text-neutral-500">加载中…</p>
    );
  }
  if (error || !activity) {
    return (
      <div className="mx-auto max-w-md px-5 pt-8">
        <p className="rounded-2xl bg-white p-6 text-center text-[13px] text-danger-500 shadow-sm">
          活动加载失败
        </p>
      </div>
    );
  }

  const missing = Math.max(
    0,
    activity.maxParticipants - activity.participantCount,
  );
  const emoji = activityEmoji(activity.title);
  const isTerminal =
    activity.status === 'COMPLETED' || activity.status === 'CANCELLED';

  const onChat = (): void => {
    toast.info('聊天板块稍后上线');
  };

  const onJoin = async (): Promise<void> => {
    try {
      await join.mutateAsync();
      toast.success('加入成功');
    } catch (e) {
      const api = await extractApiError(e);
      toast.error(api?.message ?? '加入失败');
    }
  };

  const onLeave = async (): Promise<void> => {
    try {
      await leave.mutateAsync();
      toast.success('已退出');
    } catch (e) {
      const api = await extractApiError(e);
      toast.error(api?.message ?? '退出失败');
    }
  };

  const onCancel = async (): Promise<void> => {
    setMenuOpen(false);
    try {
      await cancel.mutateAsync();
      toast.success('活动已取消');
      router.replace('/activities');
    } catch (e) {
      const api = await extractApiError(e);
      toast.error(api?.message ?? '取消失败');
    }
  };

  return (
    <div className="mx-auto max-w-md px-5 pb-32 pt-6">
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
        <div className="flex-1 min-w-0">
          <h1 className="truncate text-[18px] font-bold text-neutral-900">
            {activity.title}
          </h1>
          <p className="truncate text-[12px] text-neutral-500">
            {activity.location}
          </p>
        </div>
        {isCreator ? (
          <div className="relative">
            <button
              type="button"
              aria-label="更多操作"
              onClick={() => setMenuOpen((o) => !o)}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-white shadow-sm hover:bg-neutral-100"
            >
              <MoreHorizontal className="h-4 w-4 text-neutral-700" />
            </button>
            {menuOpen && !isTerminal ? (
              <div className="absolute right-0 top-11 z-10 w-36 overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-lg">
                <button
                  type="button"
                  onClick={onCancel}
                  className="block w-full px-4 py-2.5 text-left text-[13px] text-danger-500 hover:bg-neutral-50"
                >
                  取消活动
                </button>
              </div>
            ) : null}
          </div>
        ) : null}
      </header>

      {/* Banner (status-driven) */}
      <div className="mt-4">
        <ActivityStatusBanner
          status={activity.status}
          startTime={activity.startTime}
        />
      </div>

      {/* Title hero */}
      <motion.section
        variants={fadeInUp}
        initial="hidden"
        animate="visible"
        transition={fadeInUpTransition}
        className="mt-4 flex flex-col items-center gap-2 rounded-2xl bg-white p-6 shadow-sm"
      >
        <div
          className="flex h-16 w-16 items-center justify-center rounded-full bg-neutral-100 text-[32px]"
          aria-hidden
        >
          {emoji}
        </div>
        <h2 className="text-center text-[20px] font-bold text-neutral-900">
          {activity.title}
        </h2>
        {activity.description ? (
          <p className="text-center text-[13px] text-neutral-500">
            {activity.description}
          </p>
        ) : null}
      </motion.section>

      {/* Info card */}
      <section className="mt-3 flex flex-col gap-2 rounded-2xl bg-white p-4 text-[14px] text-neutral-700 shadow-sm">
        <div className="flex items-center gap-2">
          <span aria-hidden>📆</span>
          {formatStartTime(activity.startTime)}
        </div>
        <div className="flex items-center gap-2">
          <span aria-hidden>📍</span>
          <span className="truncate">{activity.location}</span>
        </div>
        <div className="flex items-center gap-2">
          <span aria-hidden>👥</span>
          <span className="text-accent-coral-500 font-semibold">
            {activity.participantCount}/{activity.maxParticipants} 人已加入
          </span>
        </div>
      </section>

      {/* System-recommended dish (fallback) */}
      <section className="mt-3 rounded-2xl bg-gradient-warm p-4 shadow-sm">
        <p className="text-[13px] font-semibold text-neutral-900">
          💡 推荐协作方向
        </p>
        <p className="mt-1 text-[13px] text-neutral-700">
          推荐协作方向 · {activity.title}
        </p>
      </section>

      {/* Ingredients */}
      {(activity.manualIngredients.length > 0 ||
        activity.ingredients.length > 0) && (
        <section className="mt-3 rounded-2xl bg-white p-4 shadow-sm">
          <p className="text-[13px] font-semibold text-neutral-900">
            🛠️ 这桌的能力清单
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {activity.manualIngredients.map((ing) => (
              <IngredientBadge key={ing.name} name={ing.name} />
            ))}
          </div>
        </section>
      )}

      {/* Participants */}
      <section className="mt-3 rounded-2xl bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <p className="text-[13px] font-semibold text-neutral-900">
            👥 参与者
          </p>
          <span className="text-[12px] text-neutral-500">
            {activity.participantCount}/{activity.maxParticipants}
          </span>
        </div>
        <div className="mt-2 flex flex-col divide-y divide-neutral-100">
          {activity.participants
            .filter((p) => p.leftAt === null)
            .map((p) => (
              <ParticipantRow
                key={p.userId}
                participant={p}
                isCreator={p.userId === activity.createdBy}
              />
            ))}
          {missing > 0 ? <ParticipantPlaceholder missing={missing} /> : null}
        </div>
      </section>

      {/* Activity events timeline */}
      <section className="mt-3 rounded-2xl bg-white p-4 shadow-sm">
        <p className="text-[13px] font-semibold text-neutral-900">📋 动态</p>
        <div className="mt-2 flex flex-col divide-y divide-neutral-100">
          {(events?.items ?? []).slice(0, 5).map((ev) => (
            <ActivityEventItem key={ev.id} event={ev} />
          ))}
          {events && events.items.length === 0 ? (
            <p className="py-4 text-center text-[12px] text-neutral-400">
              暂无动态
            </p>
          ) : null}
        </div>
      </section>

      {/* 局长助理 · FORMED 之后入场（=非招募中、非已取消） */}
      {activity.status !== 'WAITING_FOR_MEMBERS' && activity.status !== 'CANCELLED' ? (
        <section className="mt-3">
          <AgentBubble
            title="给三位 OPC 的破冰三连"
            hint="开桌即送"
            body={
              <ol className="list-decimal pl-5 space-y-1">
                <li>你最近一次为客户算复购周期是什么时候？</li>
                <li>如果 MVP 砍到只剩一个功能，你会留哪个？</li>
                <li>你愿意为这个 MVP 让出多少周末？</li>
              </ol>
            }
          />
        </section>
      ) : null}

      {activity.status === 'IN_PROGRESS' ? (
        <section className="mt-3">
          <AgentBubble
            title="第一周里程碑建议"
            hint="agent 自动生成"
            body={<p>第一周交付一个能扫码入会、看积分的最小可点击 demo。</p>}
          />
        </section>
      ) : null}

      {activity.status === 'COMPLETED' ? (
        <section className="mt-3">
          <RetroCard
            produce="一个跑通会员入会 + 积分查询的可点击原型，已交付独立咖啡馆主理人。"
            nextStep="把核销动作打通，下周再开一桌做支付测试。"
          />
        </section>
      ) : null}

      {/* Sticky bottom CTA */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={fadeInUpTransition}
        className="fixed inset-x-0 bottom-16 z-10 px-5"
      >
        <div className={cn('mx-auto max-w-md rounded-2xl bg-white/95 p-3 shadow-lg backdrop-blur')}>
          {isTerminal ? (
            <Button variant="secondary" size="xl" full disabled>
              {activity.status === 'CANCELLED' ? '活动已取消' : '活动已结束'}
            </Button>
          ) : isCreator ? (
            <div className="flex gap-2">
              <Button
                variant="gradient"
                size="xl"
                full
                onClick={onChat}
                className="flex-1"
              >
                <MessageCircle className="h-5 w-5" />
                去聊这桌
              </Button>
              {activity.status === 'WAITING_FOR_MEMBERS' ? (
                <Link href="/invite" className="shrink-0">
                  <Button variant="secondary" size="xl">
                    <UserPlus className="h-5 w-5" />
                    邀请
                  </Button>
                </Link>
              ) : null}
            </div>
          ) : hasJoined ? (
            <div className="flex gap-2">
              <Button
                variant="gradient"
                size="xl"
                full
                onClick={onChat}
                className="flex-1"
              >
                <MessageCircle className="h-5 w-5" />
                去聊这桌
              </Button>
              <Button
                variant="secondary"
                size="xl"
                onClick={onLeave}
                disabled={leave.isPending}
              >
                退出
              </Button>
            </div>
          ) : (
            <Button
              variant="primary"
              size="xl"
              full
              onClick={onJoin}
              disabled={join.isPending || activity.participantCount >= activity.maxParticipants}
              className="bg-success-500 hover:opacity-95"
            >
              <Utensils className="h-5 w-5" />
              加入这桌 🤝
            </Button>
          )}
        </div>
      </motion.div>
    </div>
  );
}
