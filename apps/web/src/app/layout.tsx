import type { Metadata } from 'next';
import { QueryProvider } from '@/providers/query-provider';
import { StoryboardMount } from '@/components/demo/StoryboardMount';
import { LayoutShell } from '@/components/layout-shell';
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
          <LayoutShell>{children}</LayoutShell>
          <StoryboardMount />
        </QueryProvider>
      </body>
    </html>
  );
}
