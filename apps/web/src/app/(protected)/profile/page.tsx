'use client';

import {
  Bell,
  ChevronLeft,
  Heart,
  User as UserIcon,
  Utensils,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Chip } from '@/components/ui/chip';
import {
  BADGE_CODES,
  FridgeStickerBadge,
} from '@/components/common/FridgeStickerBadge';
import { InviteCodeCard } from '@/components/common/InviteCodeCard';
import {
  ProfileRow,
  ProfileSection,
} from '@/components/common/ProfileSection';
import { useFoodPreferences } from '@/hooks/use-food-preferences';
import { useFriendPreferences } from '@/hooks/use-friend-preferences';
import { useInviteCode } from '@/hooks/use-invite-code';
import { useMe } from '@/hooks/use-me';
import { useMyBadges } from '@/hooks/use-my-badges';
import { clearTokens } from '@/lib/auth';
import {
  CookingSkillLabel,
  CuisineLabel,
  DietaryLabel,
} from '@/lib/enum-labels';
import { detectPresets, TIME_SLOT_PRESETS } from '@/lib/time-slot-presets';

export default function ProfilePage() {
  const router = useRouter();
  const me = useMe();
  const invite = useInviteCode();
  const friend = useFriendPreferences();
  const food = useFoodPreferences();
  const badges = useMyBadges();

  if (me.isLoading) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center text-[14px] text-neutral-500">
        加载中…
      </div>
    );
  }
  if (!me.data) return null;

  const user = me.data;
  const earnedCodes = new Set((badges.data ?? []).map((b) => b.code));

  const presetLabels = friend.data
    ? detectPresets(friend.data.timeSlots).map(
        (id) => TIME_SLOT_PRESETS.find((p) => p.id === id)?.label ?? id,
      )
    : [];

  return (
    <div className="w-full px-5 pb-56 pt-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <button
          type="button"
          aria-label="返回"
          onClick={() => router.back()}
          className="-ml-2 inline-flex h-9 items-center gap-1 rounded-full px-2 text-[14px] font-medium text-[#0f1d33] hover:bg-white/70"
        >
          <ChevronLeft className="h-5 w-5" />
          返回
        </button>
        <Link
          href="/chat/list?tab=unread"
          aria-label="通知中心"
          className="flex h-9 w-9 items-center justify-center rounded-full bg-white shadow-sm hover:bg-neutral-100"
        >
          <Bell className="h-4 w-4 text-neutral-700" />
        </Link>
      </div>

      {/* Identity card */}
      <div className="mt-4 flex items-center gap-4 rounded-2xl bg-white p-4 shadow-sm">
        <div
          className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-100 text-brand-500"
          aria-hidden
        >
          {user.avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={user.avatarUrl}
              alt={user.nickname}
              className="h-full w-full rounded-full object-cover"
            />
          ) : (
            <UserIcon className="h-7 w-7" />
          )}
        </div>
        <div className="flex-1">
          <p className="text-[18px] font-semibold text-neutral-900">
            {user.nickname}
          </p>
          <p className="text-[13px] text-neutral-500">
            {user.city ?? '还没填城市'}
          </p>
        </div>
      </div>

      {/* Fridge stickers row */}
      <div className="mt-4 rounded-2xl bg-white p-4 shadow-sm">
        <p className="text-[13px] font-medium text-neutral-500">冰箱贴</p>
        <div className="mt-3 flex items-center justify-between gap-2">
          {BADGE_CODES.map((code) => (
            <FridgeStickerBadge
              key={code}
              code={code}
              earned={earnedCodes.has(code)}
            />
          ))}
        </div>
        {earnedCodes.size === 0 ? (
          <p className="mt-3 text-center text-[12px] text-neutral-400">
            解锁更多吧 →
          </p>
        ) : null}
      </div>

      {/* Invite code summary */}
      <div className="mt-4">
        {invite.data ? (
          <InviteCodeCard
            code={invite.data.code}
            maxUses={invite.data.maxUses}
            usesRemaining={invite.data.usesRemaining}
            variant="summary"
            credit={user.credit}
          />
        ) : (
          <div className="rounded-2xl bg-gradient-invite-card p-5 text-[12px] text-neutral-700/80">
            加载邀请码中…
          </div>
        )}
      </div>

      {/* Personal info */}
      <ProfileSection
        className="mt-4"
        title="个人信息"
        icon={<UserIcon className="h-4 w-4" />}
        editHref="/profile/edit"
        editLabel="编辑个人信息"
      >
        <ProfileRow label="学校">
          {user.school ?? <span className="text-neutral-400">未填写</span>}
        </ProfileRow>
        <ProfileRow label="一句话">
          {user.bio ?? <span className="text-neutral-400">还没介绍自己</span>}
        </ProfileRow>
      </ProfileSection>

      {/* Friend preferences */}
      <ProfileSection
        className="mt-4"
        title="交友偏好"
        icon={<Heart className="h-4 w-4" />}
        editHref="/preferences/friend"
        editLabel="编辑交友偏好"
      >
        <ProfileRow label="接受陌生人">
          {friend.data
            ? friend.data.acceptStrangers
              ? '接受'
              : '仅熟人'
            : '--'}
        </ProfileRow>
        <ProfileRow label="距离范围">
          {friend.data ? `${friend.data.distanceKm}km 以内` : '--'}
        </ProfileRow>
        <div className="flex items-start justify-between gap-3">
          <span className="text-[14px] text-neutral-500">时间偏好</span>
          <div className="flex flex-1 flex-wrap justify-end gap-1.5">
            {presetLabels.length === 0 ? (
              <span className="text-[14px] text-neutral-400">未设置</span>
            ) : (
              presetLabels.map((l) => (
                <Chip key={l} selected tone="brand" as="span">
                  {l}
                </Chip>
              ))
            )}
          </div>
        </div>
      </ProfileSection>

      {/* Food preferences */}
      <ProfileSection
        className="mt-4"
        title="食物偏好"
        icon={<Utensils className="h-4 w-4" />}
        editHref="/preferences/food"
        editLabel="编辑食物偏好"
      >
        <div className="flex items-start justify-between gap-3">
          <span className="text-[14px] text-neutral-500">常吃菜系</span>
          <div className="flex flex-1 flex-wrap justify-end gap-1.5">
            {food.data && food.data.cuisines.length > 0 ? (
              food.data.cuisines.map((c) => (
                <Chip key={c} selected tone="peach" as="span">
                  {CuisineLabel[c]}
                </Chip>
              ))
            ) : (
              <span className="text-[14px] text-neutral-400">未设置</span>
            )}
          </div>
        </div>
        <ProfileRow label="饮食限制">
          {food.data && food.data.dietaryRestrictions.length > 0
            ? food.data.dietaryRestrictions
                .map((r) => DietaryLabel[r])
                .join('、')
            : '无特殊限制'}
        </ProfileRow>
        <ProfileRow label="做饭水平">
          {food.data ? CookingSkillLabel[food.data.cookingSkill] : '--'}
        </ProfileRow>
      </ProfileSection>

      <div className="mb-16 mt-6 flex flex-col gap-3">
        <Button
          variant="secondary"
          size="md"
          full
          onClick={() => {
            clearTokens();
            router.replace('/login');
          }}
        >
          退出登录
        </Button>
      </div>
    </div>
  );
}
