import { Star, User } from 'lucide-react';
import Link from 'next/link';
import { PotButton } from './pot-button';

export type BottomNavItemId = 'profile' | 'cook' | 'activity';

type Props = {
  active?: BottomNavItemId;
};

/** NF BottomNav dome path（Figma 2:6488）— 纯白弧，无额外渐变层。 */
const NAV_SURFACE_PATH =
  'M195 0C29.315 0 -105 134.315 -105 300V300.45C-105 466.135 28.865 600 194.55 600H195C360.685 600 495 466.135 495 300.45V300C495 134.315 361.135 0 195.45 0H195Z';

function cx(...parts: (string | false | undefined)[]) {
  return parts.filter(Boolean).join(' ');
}

/**
 * NF `BottomNav`：fixed 在 NF 为全屏；此处为 MobileShell 内 `absolute`。
 * 结构：165px 白弧 SVG + `h-[96px]` + `ul` `bottom-4` `justify-around px-8`。
 */
export function BottomNav({ active = 'cook' }: Props) {
  const isProfile = active === 'profile';
  const isActivity = active === 'activity';

  return (
    <nav
      aria-label="主导航"
      className="pointer-events-none absolute inset-x-0 bottom-0 z-20"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <svg
        className="absolute inset-x-0 bottom-0 h-[165px] w-full drop-shadow-[0_-6px_20px_rgba(24,24,27,0.06)]"
        viewBox="0 0 390 165"
        preserveAspectRatio="none"
        aria-hidden
      >
        <path d={NAV_SURFACE_PATH} fill="white" />
      </svg>

      <div className="pointer-events-auto relative mx-auto h-[96px] max-w-md">
        <ul className="absolute inset-x-0 bottom-4 flex items-end justify-around px-8">
          <li className="flex flex-1 justify-center">
            <Link
              href="/profile"
              aria-label="个人信息"
              aria-current={isProfile ? 'page' : undefined}
              className={cx(
                'flex flex-col items-center gap-1 text-[11px] font-medium',
                isProfile ? 'text-brand-500' : 'text-neutral-500',
              )}
            >
              <span
                className={cx(
                  'flex h-12 w-12 items-center justify-center rounded-full',
                  isProfile ? 'bg-brand-100 text-brand-500' : 'bg-neutral-100 text-neutral-500',
                )}
              >
                <User className="h-5 w-5" aria-hidden />
              </span>
              个人信息
            </Link>
          </li>

          <li className="flex flex-1 justify-center">
            <PotButton href="/activities/new" label="准备起锅" />
          </li>

          <li className="flex flex-1 justify-center">
            <Link
              href="/activities"
              aria-label="近期活动"
              aria-current={isActivity ? 'page' : undefined}
              className={cx(
                'flex flex-col items-center gap-1 text-[11px] font-medium',
                isActivity ? 'text-brand-500' : 'text-neutral-500',
              )}
            >
              <span
                className={cx(
                  'relative flex h-12 w-12 items-center justify-center rounded-full',
                  isActivity ? 'bg-brand-100 text-brand-500' : 'bg-neutral-100 text-neutral-500',
                )}
              >
                <Star className="h-5 w-5" aria-hidden />
              </span>
              近期活动
            </Link>
          </li>
        </ul>
      </div>
    </nav>
  );
}
