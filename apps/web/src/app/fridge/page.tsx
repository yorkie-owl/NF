import { BottomNav } from '@/components/linshi/bottom-nav';
import { FigmaHomeScreen } from '@/components/home/figma-home-screen';

export default function FridgeHomePage() {
  return (
    <div className="relative flex min-h-full flex-1 flex-col bg-linshi-page">
      <div className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden pb-linshi-bottom-nav">
        <FigmaHomeScreen />
      </div>
      <BottomNav active="cook" />
    </div>
  );
}
