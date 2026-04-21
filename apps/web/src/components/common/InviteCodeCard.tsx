'use client';

import { Copy } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/cn';
import { copyText } from '@/lib/copy';
import { toast } from '@/lib/toast';

export interface InviteCodeCardProps {
  code: string;
  usesRemaining: number;
  maxUses: number;
  /** "summary" shows the compact card on /profile; "full" is the big one on /invite. */
  variant?: 'summary' | 'full';
  credit?: number | null;
  onTap?: () => void;
}

export function InviteCodeCard({
  code,
  usesRemaining,
  maxUses,
  variant = 'summary',
  credit,
  onTap,
}: InviteCodeCardProps) {
  const router = useRouter();
  const used = maxUses - usesRemaining;

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const ok = await copyText(code);
    toast[ok ? 'success' : 'error'](ok ? '已复制邀请码' : '复制失败');
  };

  const handleCardTap = () => {
    if (onTap) onTap();
    else if (variant === 'summary') router.push('/invite');
  };

  return (
    <div
      role={variant === 'summary' ? 'button' : undefined}
      tabIndex={variant === 'summary' ? 0 : undefined}
      onClick={variant === 'summary' ? handleCardTap : undefined}
      onKeyDown={
        variant === 'summary'
          ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handleCardTap();
              }
            }
          : undefined
      }
      className={cn(
        'bg-gradient-invite rounded-2xl p-5 shadow-lg',
        variant === 'full' && 'p-6',
        variant === 'summary' &&
          'cursor-pointer hover:opacity-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400/60',
      )}
    >
      <div className="flex items-start justify-between">
        <span className="text-[12px] font-medium text-neutral-700/80">
          我的邀请码
        </span>
        {variant === 'summary' && (
          <span className="rounded-full bg-white/60 px-3 py-1 text-[12px] font-semibold text-neutral-900 tabular-nums">
            {credit ?? '--'} 积分
          </span>
        )}
      </div>

      <div
        className={cn(
          'mt-2 font-bold tracking-wider text-neutral-900 tabular-nums',
          variant === 'summary' ? 'text-[28px]' : 'text-[32px] leading-10',
        )}
      >
        {code}
      </div>

      {variant === 'full' ? (
        <>
          <p className="mt-1 text-[12px] text-neutral-700/80">
            每人限额 {maxUses} 次邀请 · 已用 {used} 次
          </p>
          <div className="mt-4 flex gap-1">
            {Array.from({ length: maxUses }).map((_, i) => (
              <div
                key={i}
                className={cn(
                  'h-1.5 flex-1 rounded-full',
                  i < used ? 'bg-white/90' : 'bg-white/30',
                )}
              />
            ))}
          </div>
          <button
            type="button"
            onClick={handleCopy}
            className="mt-4 inline-flex items-center gap-2 rounded-full bg-white px-5 py-2 text-[14px] font-semibold text-neutral-900 shadow hover:bg-neutral-50"
            aria-label="复制邀请码"
          >
            <Copy className="h-4 w-4" /> 复制邀请码
          </button>
        </>
      ) : (
        <div className="mt-3 flex items-center justify-between">
          <p className="text-[12px] text-neutral-700/80">
            每人限额 {maxUses} 次邀请 · 已用 {used} 次
          </p>
          <button
            type="button"
            onClick={handleCopy}
            className="inline-flex items-center gap-1 rounded-full bg-white px-3 py-1 text-[12px] font-semibold text-neutral-900 shadow"
            aria-label="复制邀请码"
          >
            <Copy className="h-3.5 w-3.5" /> 复制
          </button>
        </div>
      )}
    </div>
  );
}
