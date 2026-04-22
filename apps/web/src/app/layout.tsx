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
              <div className="h-full w-full relative overflow-hidden">
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
