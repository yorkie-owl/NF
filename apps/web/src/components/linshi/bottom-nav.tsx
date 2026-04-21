import Link from 'next/link';
import { CookingPot, Star, User } from 'lucide-react';

type Props = {
  /** 当前高亮：profile | cook | activity */
  active?: 'profile' | 'cook' | 'activity';
};

export function BottomNav({ active = 'cook' }: Props) {
  return (
    <nav className="relative z-[100] mt-auto w-full shrink-0">
      <div className="relative rounded-t-[36px] bg-white pb-6 pt-2 shadow-[0_-8px_32px_rgba(0,0,0,0.08)]">
        {/* 高于主内容、弹窗遮罩，保证中间按钮永远压在最上层 */}
        <div className="absolute -top-7 left-1/2 z-[110] -translate-x-1/2">
          <Link
            href="#"
            className="flex h-[76px] w-[76px] items-center justify-center rounded-full border-4 border-white bg-[#ff4d4f] shadow-lg shadow-red-500/30"
            aria-label="准备起锅"
          >
            <CookingPot className="h-9 w-9 text-white" strokeWidth={1.75} />
          </Link>
        </div>
        <div className="grid grid-cols-3 items-end gap-2 px-4 pt-2">
          <Link
            href="#"
            className={`flex flex-col items-center gap-1 pb-1 ${active === 'profile' ? 'text-neutral-900' : 'text-neutral-400'}`}
          >
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-neutral-100">
              <User className="h-6 w-6" strokeWidth={1.5} />
            </span>
            <span className="text-[11px] font-medium">个人信息</span>
          </Link>
          <div className="flex flex-col items-center pt-10">
            <span className="text-[12px] font-bold text-neutral-900">准备起锅</span>
          </div>
          <Link
            href="/fridge/inside"
            className={`relative flex flex-col items-center gap-1 pb-1 ${active === 'activity' ? 'text-neutral-900' : 'text-neutral-400'}`}
          >
            <span className="relative flex h-12 w-12 items-center justify-center rounded-full bg-neutral-100">
              <Star className="h-6 w-6" strokeWidth={1.5} />
              <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-[#ff4d4f]" />
            </span>
            <span className="text-[11px] font-medium">近期活动</span>
          </Link>
        </div>
      </div>
    </nav>
  );
}
