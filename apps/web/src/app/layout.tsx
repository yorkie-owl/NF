import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: '邻食',
  description: '邻食 · 冰箱与食材',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-Hans">
      <body className="font-sans">{children}</body>
    </html>
  );
}
