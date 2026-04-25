import type { Metadata } from 'next';
import { ToastHost } from '@/components/common/ToastHost';
import { QueryProvider } from '@/providers/query-provider';
import './globals.css';

export const metadata: Metadata = {
  title: '邻食',
  description: '与邻居一起吃饭',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN">
      <body className="antialiased">
        <QueryProvider>
          <div className="demo-stage bg-white">
            <div className="phone-frame bg-[#FFF5F7] overflow-hidden">
              {/* 机框内可纵向滚动；勿用 overflow-hidden，否则长页（如食材探索配置）被裁切且无法滑到底部 */}
              <div className="relative flex h-full min-h-0 w-full flex-1 flex-col overflow-y-auto overflow-x-hidden overscroll-y-contain [-webkit-overflow-scrolling:touch]">
                {children}
              </div>
              <ToastHost />
            </div>
          </div>
        </QueryProvider>
      </body>
    </html>
  );
}
