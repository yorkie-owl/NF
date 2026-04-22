'use client';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/cn';

export interface SaveBarProps {
  visible: boolean;
  onSave: () => void;
  saving?: boolean;
  label?: string;
}

export function SaveBar({
  visible,
  onSave,
  saving,
  label = '保存修改',
}: SaveBarProps) {
  return (
    <div
      className={cn(
        'sticky bottom-0 left-0 right-0 z-30 mt-6 -mx-5 px-5 pb-5 pt-3',
        'bg-gradient-to-t from-[#f9f9f9] via-[#fdf8f9]/95 to-transparent',
        'transition-opacity duration-200',
        visible ? 'opacity-100' : 'pointer-events-none opacity-0',
      )}
    >
      <Button
        variant="gradient"
        size="xl"
        full
        disabled={!visible || saving}
        onClick={onSave}
      >
        {saving ? '保存中...' : label}
      </Button>
    </div>
  );
}
