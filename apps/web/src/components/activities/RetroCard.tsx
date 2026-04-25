'use client';

import { Award, RefreshCw } from 'lucide-react';

type Props = {
  produce: string;
  nextStep: string;
  onContinue?: () => void;
};

/**
 * 活动 COMPLETED 时显示的复盘卡（mock 数据）。
 */
export function RetroCard({ produce, nextStep, onContinue }: Props) {
  return (
    <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-neutral-100">
      <div className="flex items-center gap-2">
        <Award className="h-4 w-4 text-amber-500" />
        <p className="text-[14px] font-semibold text-neutral-900">本桌复盘</p>
      </div>
      <div className="mt-3 grid gap-3">
        <div>
          <p className="text-[11px] font-medium uppercase tracking-wider text-neutral-400">本桌产出</p>
          <p className="mt-1 text-[13px] text-neutral-800">{produce}</p>
        </div>
        <div>
          <p className="text-[11px] font-medium uppercase tracking-wider text-neutral-400">下一步</p>
          <p className="mt-1 text-[13px] text-neutral-800">{nextStep}</p>
        </div>
      </div>
      <button
        type="button"
        onClick={onContinue}
        className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-violet-500 px-3 py-1.5 text-[12px] font-medium text-white hover:bg-violet-600"
      >
        <RefreshCw className="h-3.5 w-3.5" />
        续一桌
      </button>
      <p className="mt-3 text-[11px] text-neutral-500">已颁发"首桌成局"冰箱贴 🎖️</p>
    </div>
  );
}
