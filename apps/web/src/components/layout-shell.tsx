'use client';

import { usePathname } from 'next/navigation';
import { ToastHost } from '@/components/common/ToastHost';

/**
 * Conditional shell: most pages render inside a phone-frame mockup.
 * The /intro landing page needs the full browser viewport, so we render its
 * children plain (no phone-frame). The phone-frame creates a CSS containing
 * block via transform: translateZ(0), which would otherwise trap fixed-position
 * content inside the phone, breaking the landing page.
 */
export function LayoutShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLanding = pathname?.startsWith('/intro');

  if (isLanding) {
    return (
      <>
        {children}
        <ToastHost />
      </>
    );
  }

  return (
    <div className="demo-stage bg-white">
      <div className="phone-frame bg-[#FFF5F7] overflow-hidden">
        <div className="relative flex h-full min-h-0 w-full flex-1 flex-col overflow-y-auto overflow-x-hidden overscroll-y-contain [-webkit-overflow-scrolling:touch]">
          {children}
        </div>
        <ToastHost />
      </div>
    </div>
  );
}
