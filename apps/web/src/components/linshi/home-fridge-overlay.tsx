'use client';

import type { ReactNode } from 'react';
import { useCallback, useEffect, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { FridgeDoorHero } from '@/components/linshi/fridge-door-hero';
import { FridgePreviewModal } from '@/components/linshi/fridge-preview-modal';

const FRIDGE_PARAM = 'fridge';

type Props = {
  /** 首页顶栏（弹窗打开时隐藏，露出弹窗自己的标题区） */
  homeHeader: ReactNode;
};

export function HomeFridgeOverlay({ homeHeader }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [fridgeModalOpen, setFridgeModalOpen] = useState(false);

  useEffect(() => {
    if (searchParams.get(FRIDGE_PARAM) === '1') {
      setFridgeModalOpen(true);
    }
  }, [searchParams]);

  const syncUrl = useCallback(
    (open: boolean) => {
      const params = new URLSearchParams(searchParams.toString());
      if (open) {
        params.set(FRIDGE_PARAM, '1');
      } else {
        params.delete(FRIDGE_PARAM);
      }
      const q = params.toString();
      router.replace(q ? `${pathname}?${q}` : pathname, { scroll: false });
    },
    [pathname, router, searchParams],
  );

  const openModal = useCallback(() => {
    setFridgeModalOpen(true);
    syncUrl(true);
  }, [syncUrl]);

  const closeModal = useCallback(() => {
    setFridgeModalOpen(false);
    syncUrl(false);
  }, [syncUrl]);

  return (
    <>
      {!fridgeModalOpen ? homeHeader : null}
      <div className="relative z-0 flex min-h-0 flex-1 flex-col overflow-hidden px-3 pb-1 pt-2">
        <FridgeDoorHero onOpenFridge={openModal} />
        {fridgeModalOpen ? <FridgePreviewModal onClose={closeModal} /> : null}
      </div>
    </>
  );
}
