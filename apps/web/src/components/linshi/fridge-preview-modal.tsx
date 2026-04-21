'use client';

import Link from 'next/link';
import { useState } from 'react';
import { ArrowRight } from 'lucide-react';

type Props = {
  onClose: () => void;
};

/** 左上角小冰箱装饰：箱体统一淡蓝，右侧细条为把手 */
function FridgeGlyph({ className = '' }: { className?: string }) {
  return (
    <div
      className={`relative shrink-0 overflow-hidden rounded-xl bg-sky-100 shadow-md ring-1 ring-sky-300/40 ${className}`}
      aria-hidden
    >
      <div className="absolute right-2 top-1/2 h-[28%] w-1 -translate-y-1/2 rounded-full bg-white/90 shadow-sm" />
    </div>
  );
}

/**
 * Figma 画板「2」：邀请码 → 进入冰箱（叠在首页冰箱上的弹层，非全屏路由）。
 */
export function FridgePreviewModal({ onClose }: Props) {
  const [inviteCode, setInviteCode] = useState('');

  const canEnter = inviteCode.trim().length > 0;

  return (
    <div className="pointer-events-none absolute inset-0 z-[300] flex min-h-0 flex-col items-center justify-center px-4 py-6">
      <button
        type="button"
        className="pointer-events-auto absolute inset-0 z-0 bg-[#fdfbfc]/82 backdrop-blur-[3px]"
        aria-label="关闭"
        onClick={onClose}
      />

      <div
        className="pointer-events-auto relative z-10 w-full max-w-[340px] rounded-[1.75rem] bg-white p-6 shadow-[0_24px_64px_rgba(0,0,0,0.18)] ring-1 ring-black/[0.04]"
        role="dialog"
        aria-modal="true"
        aria-labelledby="fridge-invite-title"
      >
        <div className="flex gap-3">
          <FridgeGlyph className="h-14 w-11" />
          <div className="min-w-0 flex-1 pt-0.5">
            <h2 id="fridge-invite-title" className="text-[17px] font-bold leading-snug text-[#1a1a2e]">
              打开你的冰箱
            </h2>
            <p className="mt-1.5 text-[13px] leading-relaxed text-neutral-400">
              输入邀请码，注册账号，加入邻食
            </p>
          </div>
        </div>

        <label className="mt-6 block">
          <span className="sr-only">邀请码</span>
          <input
            type="text"
            inputMode="text"
            autoComplete="off"
            placeholder="请输入邀请码"
            value={inviteCode}
            onChange={(e) => setInviteCode(e.target.value)}
            className="w-full rounded-2xl border-0 bg-neutral-100 px-4 py-3.5 text-[15px] text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#ff4d4f]/35"
          />
        </label>

        <p className="mt-3">
          <span className="inline-flex rounded-full bg-[#ffe8ec] px-3 py-1 text-[11px] font-medium leading-relaxed text-[#e85d75]">
            · 每人限量 <span className="mx-0.5 font-bold text-[#ff4d4f]">3</span> 个邀请名额
          </span>
        </p>

        <div className="mt-6">
          {canEnter ? (
            <Link
              href="/fridge/inside"
              className="flex w-full items-center justify-center gap-1.5 rounded-full bg-[#ff4d4f] py-3.5 text-[15px] font-semibold text-white shadow-lg shadow-red-500/25 transition hover:bg-[#e64545]"
            >
              进入冰箱
              <ArrowRight className="h-4 w-4" strokeWidth={2.5} />
            </Link>
          ) : (
            <button
              type="button"
              disabled
              className="flex w-full cursor-not-allowed items-center justify-center gap-1.5 rounded-full bg-neutral-200 py-3.5 text-[15px] font-semibold text-neutral-400"
            >
              进入冰箱
              <ArrowRight className="h-4 w-4 opacity-60" strokeWidth={2.5} />
            </button>
          )}
        </div>

        <p className="mt-5 text-center text-[12px] leading-relaxed text-neutral-400">
          还没有邀请码？联系已有用户获取
        </p>
      </div>
    </div>
  );
}
