import type { ReactNode } from 'react';

/**
 * 设计稿基准：390×844（与 iPhone 12–16 标准款逻辑分辨率一致；常见还有 375、402、412 宽等）。
 * 布局：宽度优先 `min(390px, 100vw - padding)`，高度由 `aspect-ratio` 决定；
 * 视口较矮时不再把整机等比缩成「细条」，改为整页纵向滚动。
 */
const DESIGN_W = 390;
const DESIGN_H = 844;

export function MobileShell({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div className="flex w-full flex-col items-center bg-[#e8e5ea] px-3 py-6 sm:px-6 sm:py-10">
      <div
        className={`relative flex w-full max-w-[390px] min-h-0 flex-col overflow-hidden rounded-[2.5rem] border border-black/[0.05] bg-[#fdfbfc] shadow-[0_32px_120px_rgba(0,0,0,0.16)] ${className}`}
        style={{
          width: `min(${DESIGN_W}px, calc(100vw - 24px))`,
          aspectRatio: `${DESIGN_W} / ${DESIGN_H}`,
        }}
      >
        {children}
      </div>
    </div>
  );
}
