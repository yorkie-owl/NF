import { Suspense } from 'react';
import Link from 'next/link';
import { Bell, ChefHat } from 'lucide-react';
import { BottomNav } from '@/components/linshi/bottom-nav';
import { HomeFridgeOverlay } from '@/components/linshi/home-fridge-overlay';
import { MobileShell } from '@/components/linshi/mobile-shell';
import { StatusBarDecor } from '@/components/linshi/status-bar';

const homeHeader = (
  <header className="relative z-30 flex shrink-0 items-center justify-between px-5 pt-1">
    <span className="text-xl font-bold tracking-tight text-neutral-900">邻食</span>
    <div className="flex items-center gap-2">
      <Link
        href="/fridge/inside"
        className="flex items-center gap-1.5 rounded-full border border-[#ff4d4f] bg-white px-2.5 py-1.5 text-[11px] font-medium text-[#ff4d4f] shadow-sm"
      >
        <ChefHat className="h-3.5 w-3.5" />
        我的锅
        <span className="rounded-full bg-[#ff4d4f] px-1.5 text-[9px] leading-none text-white">2</span>
      </Link>
      <button
        type="button"
        className="flex h-9 w-9 items-center justify-center rounded-full bg-white shadow-md"
        aria-label="通知"
      >
        <Bell className="h-4 w-4 text-neutral-600" />
      </button>
    </div>
  </header>
);

/** 首页：冰箱门主视觉 + 可拖拽冰箱贴；画板2 为叠在冰箱上的弹层（非 /fridge 全屏页） */
export default function HomePage() {
  return (
    <MobileShell className="flex flex-col">
      <div className="flex min-h-0 flex-1 flex-col overflow-y-auto overscroll-y-contain pb-linshi-bottom-nav">
        <StatusBarDecor />

        <Suspense
          fallback={
            <>
              {homeHeader}
              <div className="relative min-h-0 flex-1 overflow-hidden px-3 pb-1 pt-2" aria-hidden />
            </>
          }
        >
          <HomeFridgeOverlay homeHeader={homeHeader} />
        </Suspense>
      </div>

      <BottomNav active="cook" />
    </MobileShell>
  );
}
