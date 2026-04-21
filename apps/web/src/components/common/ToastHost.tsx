'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { subscribeToast, type ToastMessage } from '@/lib/toast';
import { cn } from '@/lib/cn';

const toneCls: Record<ToastMessage['tone'], string> = {
  success: 'bg-success-500 text-white',
  error: 'bg-danger-500 text-white',
  info: 'bg-neutral-900 text-white',
};

export function ToastHost() {
  const [items, setItems] = useState<ToastMessage[]>([]);

  useEffect(() => {
    const unsubscribe = subscribeToast((msg) => {
      setItems((prev) => [...prev, msg]);
      window.setTimeout(() => {
        setItems((prev) => prev.filter((m) => m.id !== msg.id));
      }, msg.ttlMs);
    });
    return unsubscribe;
  }, []);

  return (
    <div className="pointer-events-none fixed inset-x-0 top-4 z-[60] flex flex-col items-center gap-2 px-4">
      <AnimatePresence>
        {items.map((m) => (
          <motion.div
            key={m.id}
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.18 }}
            className={cn(
              'pointer-events-auto rounded-full px-4 py-2 text-[14px] font-medium shadow-lg',
              toneCls[m.tone],
            )}
          >
            {m.text}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
