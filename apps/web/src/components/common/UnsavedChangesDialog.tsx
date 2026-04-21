'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { Button } from '@/components/ui/button';

export interface UnsavedChangesDialogProps {
  open: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function UnsavedChangesDialog({
  open,
  onConfirm,
  onCancel,
}: UnsavedChangesDialogProps) {
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            key="ucd-overlay"
            className="fixed inset-0 z-40 bg-black/40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onCancel}
            aria-hidden
          />
          <motion.div
            key="ucd-panel"
            role="alertdialog"
            aria-modal
            aria-label="未保存的修改"
            className="fixed left-1/2 top-1/2 z-50 w-[min(320px,86vw)] -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-white p-6 shadow-2xl"
            initial={{ scale: 0.92, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.92, opacity: 0 }}
            transition={{ duration: 0.18 }}
          >
            <h3 className="text-[18px] font-semibold text-neutral-900">
              还没保存哦
            </h3>
            <p className="mt-2 text-[14px] text-neutral-500">
              确定离开？当前修改不会保留。
            </p>
            <div className="mt-5 flex gap-3">
              <Button
                variant="secondary"
                size="md"
                full
                onClick={onCancel}
                type="button"
              >
                继续编辑
              </Button>
              <Button
                variant="danger"
                size="md"
                full
                onClick={onConfirm}
                type="button"
              >
                放弃修改
              </Button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
