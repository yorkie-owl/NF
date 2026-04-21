/** 装饰性状态栏，对齐 Figma 9:41 与图标位 */
export function StatusBarDecor() {
  return (
    <div className="flex h-12 shrink-0 items-end justify-between px-6 pb-1 pt-3 text-[13px] font-semibold text-neutral-900">
      <span>9:41</span>
      <div className="flex items-center gap-1.5 pr-1">
        <span className="text-[10px]">■■■</span>
        <span className="text-[10px]">📶</span>
        <span className="rounded-sm border border-neutral-400 px-0.5 text-[9px] leading-none">100</span>
      </div>
    </div>
  );
}
