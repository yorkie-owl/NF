'use client';

import { ChevronLeft, Share2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { InviteCodeCard } from '@/components/common/InviteCodeCard';
import { useInviteCode } from '@/hooks/use-invite-code';
import { shareOrCopy } from '@/lib/copy';
import { relativeTime } from '@/lib/relative-time';
import { toast } from '@/lib/toast';

export default function InvitePage() {
  const router = useRouter();
  const { data, isLoading } = useInviteCode();

  const handleShare = async () => {
    if (!data) return;
    const text = `用我的邀请码 ${data.code} 加入邻食吧～`;
    const result = await shareOrCopy(text);
    if (result === 'shared') toast.success('已分享');
    else if (result === 'copied') toast.success('已复制分享文案');
    else toast.error('分享失败');
  };

  return (
    <div className="mx-auto max-w-md px-5 pb-6 pt-4">
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => router.back()}
          aria-label="返回"
          className="-ml-2 flex h-9 w-9 items-center justify-center rounded-full hover:bg-neutral-100"
        >
          <ChevronLeft className="h-5 w-5 text-neutral-700" />
        </button>
        <h1 className="text-[20px] font-semibold text-neutral-900">
          我的邀请码
        </h1>
      </div>

      <div className="mt-5">
        {isLoading || !data ? (
          <div className="rounded-2xl bg-gradient-invite-card p-6 text-[13px] text-neutral-700/80">
            加载中…
          </div>
        ) : (
          <InviteCodeCard
            code={data.code}
            maxUses={data.maxUses}
            usesRemaining={data.usesRemaining}
            variant="full"
          />
        )}
      </div>

      <div className="mt-4">
        <Button
          variant="secondary"
          size="md"
          full
          onClick={handleShare}
          disabled={!data}
        >
          <span className="flex items-center gap-2">
            <Share2 className="h-4 w-4" />
            分享邀请文案
          </span>
        </Button>
      </div>

      <section className="mt-6">
        <h2 className="text-[16px] font-semibold text-neutral-900">
          用这张码加入的朋友
        </h2>
        {!data || data.redemptions.length === 0 ? (
          <div className="mt-3 rounded-2xl bg-white p-8 text-center shadow-sm">
            <p className="text-[14px] text-neutral-500">
              还没有人用这张码呢
            </p>
            <p className="mt-1 text-[12px] text-neutral-400">
              把它分享给朋友吧 ↑
            </p>
          </div>
        ) : (
          <ul className="mt-3 space-y-2">
            {data.redemptions.map((r) => (
              <li
                key={r.userId}
                className="flex items-center gap-3 rounded-2xl bg-white p-4 shadow-sm"
              >
                <div
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-100 text-[18px]"
                  aria-hidden
                >
                  🍽️
                </div>
                <div className="flex-1">
                  <p className="text-[15px] font-medium text-neutral-900">
                    {r.nickname}
                  </p>
                  <p className="text-[12px] text-neutral-500">
                    {relativeTime(r.redeemedAt)}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
