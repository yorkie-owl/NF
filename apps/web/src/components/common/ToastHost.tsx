'use client';

import { useEffect, useState } from 'react';
import { subscribeToast, type ToastMessage } from '@/lib/toast';

const toneClass: Record<ToastMessage['tone'], string> = {
  success: 'bg-[#FF7A9A] text-white shadow-[0_12px_28px_rgba(255,122,154,0.35)]',
  error: 'bg-danger-500 text-white shadow-[0_12px_28px_rgba(239,68,68,0.24)]',
  info: 'bg-neutral-900 text-white shadow-[0_12px_28px_rgba(24,24,27,0.22)]',
};

export function ToastHost() {
  const [items, setItems] = useState<ToastMessage[]>([]);

  useEffect(() => {
    return subscribeToast((msg) => {
      setItems((prev) => [...prev, msg]);
      window.setTimeout(() => {
        setItems((prev) => prev.filter((item) => item.id !== msg.id));
      }, msg.ttlMs);
    });
  }, []);

  return (
    <div className="pointer-events-none absolute inset-x-0 top-16 z-[9999] flex flex-col items-center gap-2 px-5">
      {items.map((item) => (
        <div
          key={item.id}
          className={`rounded-full px-4 py-2 text-[13px] font-semibold ${toneClass[item.tone]}`}
        >
          {item.text}
        </div>
      ))}
    </div>
  );
}
