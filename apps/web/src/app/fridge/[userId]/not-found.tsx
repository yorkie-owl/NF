import Link from 'next/link';
import { MobileShell } from '@/components/linshi/mobile-shell';

export default function FridgeNotFound() {
  return (
    <MobileShell className="flex flex-col">
      <main className="flex min-h-0 flex-1 flex-col items-center justify-center gap-4 p-8">
        <p className="text-neutral-500">找不到这张 idea</p>
        <Link href="/fridge" className="text-[#ff4d4f] hover:underline">
          返回 idea 面板
        </Link>
      </main>
    </MobileShell>
  );
}
