import { BottomNav } from '@/components/linshi/bottom-nav';
import { FigmaHomeScreen } from '@/components/home/figma-home-screen';
import { MobileShell } from '@/components/linshi/mobile-shell';

/** Figma node 2:8906 — 首页（冰箱贴可拖拽） */
export default function HomePage() {
  return (
    <MobileShell className="flex flex-col">
      <div className="flex min-h-0 flex-1 flex-col overflow-y-auto overscroll-y-contain pb-linshi-bottom-nav">
        <FigmaHomeScreen />
      </div>

      <BottomNav active="cook" />
    </MobileShell>
  );
}
