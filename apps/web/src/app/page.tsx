'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getAccessToken } from '@/lib/auth';

export default function RootPage() {
  const router = useRouter();
  useEffect(() => {
    const token = getAccessToken();
    router.replace(token ? '/profile' : '/login');
  }, [router]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-warm">
      <p className="text-[14px] text-neutral-500">正在打开冰箱…</p>
    </main>
  );
}
