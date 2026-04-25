import type { ReactNode } from 'react';

/**
 * 设计稿基准：390×844（与 iPhone 12–16 标准款逻辑分辨率一致；常见还有 375、402、412 宽等）。
 * 布局：宽度优先 `min(390px, 100vw - padding)`，高度由 `aspect-ratio` 决定；
 * 视口较矮时不再把整机等比缩成「细条」，改为整页纵向滚动。
 */
const DESIGN_W = 390;
const DESIGN_H = 844;

type ShellVariant = 'linshi' | 'activity';

export function MobileShell({
  children,
  className = '',
  variant = 'linshi',
}: {
  children: ReactNode;
  className?: string;
  /** `activity`：对齐 NF `(protected)` 里 activity 列表页同款 `bg-neutral-50` */
  variant?: ShellVariant;
}) {
  const surface = variant === 'activity' ? 'bg-neutral-50' : 'bg-linshi-page';

  return (
    <div className={`relative flex w-full min-h-0 flex-1 flex-col ${surface} ${className}`}>
      {/* 纵向滚动由根 layout 的机框内层承担，此处不再套一层 overflow，避免与长页（食材详情）嵌套截断 */}
      <div className="relative flex w-full min-w-0 flex-1 flex-col">{children}</div>
    </div>
  );
}
