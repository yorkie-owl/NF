// 手机状态栏：9:41 + 信号 + WiFi + 电量
export default function StatusBar() {
  return (
    <div className="flex justify-between items-center px-6 pt-8 pb-1 shrink-0">
      <span className="text-[14px] font-semibold tracking-tight">9:41</span>
      <div className="flex items-center gap-[6px]">
        {/* 信号格 */}
        <svg width="17" height="12" viewBox="0 0 17 12" fill="currentColor">
          <rect x="0"   y="8"  width="3" height="4"  rx="0.8"/>
          <rect x="4.5" y="5.5" width="3" height="6.5" rx="0.8"/>
          <rect x="9"   y="3"  width="3" height="9"  rx="0.8"/>
          <rect x="13.5" y="0" width="3" height="12" rx="0.8"/>
        </svg>
        {/* WiFi */}
        <svg width="16" height="12" viewBox="0 0 16 12" fill="none">
          <path d="M8 9.5a1.25 1.25 0 1 1 0 2.5 1.25 1.25 0 0 1 0-2.5Z" fill="currentColor"/>
          <path d="M3.5 6.2A6.5 6.5 0 0 1 8 4.5c1.7 0 3.25.65 4.5 1.7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          <path d="M1 3.5A10 10 0 0 1 8 1a10 10 0 0 1 7 2.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
        {/* 电量 */}
        <svg width="25" height="12" viewBox="0 0 25 12" fill="currentColor">
          <rect x="0.5" y="0.5" width="21" height="11" rx="3.5" stroke="currentColor" strokeOpacity="0.35" fill="none"/>
          <rect x="2" y="2" width="17" height="8" rx="2"/>
          <path d="M23 4v4a2 2 0 0 0 0-4Z"/>
        </svg>
      </div>
    </div>
  );
}
