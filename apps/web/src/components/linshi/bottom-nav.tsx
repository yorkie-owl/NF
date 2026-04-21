import Link from 'next/link';
import { useId } from 'react';
import { CookingPot, Star, User } from 'lucide-react';

export type BottomNavItemId = 'profile' | 'cook' | 'activity';

type Props = {
  active?: BottomNavItemId;
};

const NAV_ITEMS: ReadonlyArray<{
  id: BottomNavItemId;
  href: string;
  label: string;
}> = [
  { id: 'profile', href: '#', label: '个人信息' },
  { id: 'cook', href: '#', label: '准备起锅' },
  { id: 'activity', href: '/fridge/inside', label: '近期活动' },
];

const COOK = NAV_ITEMS[1]!;
const SIDE_L = NAV_ITEMS[0]!;
const SIDE_R = NAV_ITEMS[2]!;

/**
 * Figma `2:6488`「Clip path group」：390×165，画板 y=679 起。
 * 子层坐标来自文件 metadata（与 mobile-shell 390 宽一致）：
 * - 2:6494 左图标 48×48 @ (58.992, 743)
 * - 2:6547 右图标 48×48 @ (283.008, 743)
 * - 2:6562 角标 10×10 @ (313.008, 751) → 相对右图标左上 (30, 8)
 * - 2:6518 中钮 76×76 @ (157, 707)
 * - 2:6510 / 2:6572 侧栏文案 16px 高 @ y=799
 * - 2:6539 中栏文案 20px 高 @ y=793（较侧栏上移 6px）
 */
/** 白底圆弧：与用户提供的 SVG 完全一致（path + viewBox） */
function NavSurfaceSvg() {
  const filterId = `linshi-nav-surface-shadow-${useId().replace(/:/g, '')}`;
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="390"
      height="165"
      viewBox="0 0 390 165"
      fill="none"
      className="pointer-events-none absolute inset-0 z-0 block h-full w-full select-none"
      preserveAspectRatio="xMidYMid meet"
      aria-hidden
    >
      {/* 顶边阴影：否则白底与页面白/浅粉底贴在一起时弧边肉眼看不出 */}
      <defs>
        <filter id={filterId} x="-20%" y="-30%" width="140%" height="160%">
          <feDropShadow dx="0" dy="-6" stdDeviation="8" floodColor="#000000" floodOpacity="0.12" />
        </filter>
      </defs>
      <path
        d="M195 0C29.315 0 -105 134.315 -105 300V300.45C-105 466.135 28.865 600 194.55 600H195C360.685 600 495 466.135 495 300.45V300C495 134.315 361.135 0 195.45 0H195Z"
        fill="#ffffff"
        filter={`url(#${filterId})`}
      />
    </svg>
  );
}

const BAR_TOP = 679;

const FIGMA = {
  leftIcon: { left: 58.99220275878906, top: 743, size: 48 },
  rightIcon: { left: 283.00799560546875, top: 743, size: 48 },
  badge: { left: 313.00799560546875, top: 751, size: 10 },
  centerBtn: { left: 157, top: 707, size: 76 },
  leftLabel: { left: 58.984405517578125, top: 799, width: 48.01559829711914, height: 16 },
  centerLabel: { left: 167, top: 793, width: 56, height: 20 },
  rightLabel: { left: 283, top: 799, width: 48.01559829711914, height: 16 },
} as const;

function relTop(docY: number) {
  return docY - BAR_TOP;
}

/** 侧栏列：图标顶到文案底（799+16−679=136 与 743−679=64 → 高 72） */
const SIDE_COL_HEIGHT = relTop(FIGMA.leftLabel.top + FIGMA.leftLabel.height) - relTop(FIGMA.leftIcon.top);

export function BottomNav({ active = 'cook' }: Props) {
  const badgeLeftInIcon = FIGMA.badge.left - FIGMA.rightIcon.left;
  const badgeTopInIcon = FIGMA.badge.top - FIGMA.rightIcon.top;

  return (
    <nav
      className="pointer-events-none absolute bottom-0 left-0 right-0 z-[200] w-full shrink-0"
      aria-label="底部导航"
      data-active={active}
    >
      <div className="pointer-events-auto relative mx-auto w-full max-w-[390px]">
        {/*
          用 padding-bottom 撑出 390:165 盒子。仅 aspect-ratio + 全子元素 absolute 时，
          部分布局下高度会塌成 0，弧/SVG 整块不显示。
        */}
        <div className="relative w-full overflow-visible" style={{ paddingBottom: `${(165 / 390) * 100}%` }}>
          <div className="absolute inset-0 overflow-visible">
            <NavSurfaceSvg />

          {/* 2:6518 Group 76×76 @ (157, 707) */}
          <div
            className="absolute z-[110]"
            style={{
              left: `${(FIGMA.centerBtn.left / 390) * 100}%`,
              top: `${(relTop(FIGMA.centerBtn.top) / 165) * 100}%`,
              width: `${(FIGMA.centerBtn.size / 390) * 100}%`,
              aspectRatio: '1',
            }}
          >
            <Link
              href={COOK.href}
              aria-label={COOK.label}
              aria-current={active === 'cook' ? 'page' : undefined}
              data-nav-item={COOK.id}
              data-node-id="2:6518"
              className="flex h-full w-full items-center justify-center rounded-full border-4 border-white bg-[#ff5a5f] outline-none focus-visible:ring-2 focus-visible:ring-[#ff5a5f]/50"
            >
              <CookingPot className="h-9 w-9 text-white" strokeWidth={1.75} />
            </Link>
          </div>

          {/* 左列：2:6494 + 2:6510 */}
          <Link
            href={SIDE_L.href}
            aria-label={SIDE_L.label}
            aria-current={active === 'profile' ? 'page' : undefined}
            data-nav-item={SIDE_L.id}
            data-node-id="2:6494"
            className={`absolute z-[2] flex flex-col items-center outline-none focus-visible:ring-2 focus-visible:ring-[#ff5a5f]/40 focus-visible:ring-offset-2 ${
              active === 'profile' ? 'text-neutral-900' : 'text-neutral-500'
            }`}
            style={{
              left: `${(FIGMA.leftLabel.left / 390) * 100}%`,
              top: `${(relTop(FIGMA.leftIcon.top) / 165) * 100}%`,
              width: `${(FIGMA.leftLabel.width / 390) * 100}%`,
              height: `${(SIDE_COL_HEIGHT / 165) * 100}%`,
            }}
          >
            <span className="flex w-full shrink-0 items-center justify-center rounded-full bg-[#f0f2f5] text-current" style={{ aspectRatio: '1', width: `${(FIGMA.leftIcon.size / FIGMA.leftLabel.width) * 100}%` }}>
              <User className="h-6 w-6" strokeWidth={1.5} />
            </span>
            <span
              data-node-id="2:6510"
              className="mt-2 w-full text-center text-[11px] font-medium leading-[16px]"
              style={{ height: FIGMA.leftLabel.height }}
            >
              {SIDE_L.label}
            </span>
          </Link>

          {/* 右列：2:6547 + 2:6562 + 2:6572 */}
          <Link
            href={SIDE_R.href}
            aria-label={SIDE_R.label}
            aria-current={active === 'activity' ? 'page' : undefined}
            data-nav-item={SIDE_R.id}
            data-node-id="2:6547"
            className={`absolute z-[2] flex flex-col items-center outline-none focus-visible:ring-2 focus-visible:ring-[#ff5a5f]/40 focus-visible:ring-offset-2 ${
              active === 'activity' ? 'text-neutral-900' : 'text-neutral-500'
            }`}
            style={{
              left: `${(FIGMA.rightLabel.left / 390) * 100}%`,
              top: `${(relTop(FIGMA.rightIcon.top) / 165) * 100}%`,
              width: `${(FIGMA.rightLabel.width / 390) * 100}%`,
              height: `${(SIDE_COL_HEIGHT / 165) * 100}%`,
            }}
          >
            <span className="relative flex w-full shrink-0 items-center justify-center rounded-full bg-[#f0f2f5] text-current" style={{ aspectRatio: '1', width: `${(FIGMA.rightIcon.size / FIGMA.rightLabel.width) * 100}%` }}>
              <Star className="h-6 w-6" strokeWidth={1.5} />
              <span
                data-node-id="2:6562"
                className="absolute rounded-full bg-[#ff4d4f]"
                style={{
                  left: `${(badgeLeftInIcon / FIGMA.rightIcon.size) * 100}%`,
                  top: `${(badgeTopInIcon / FIGMA.rightIcon.size) * 100}%`,
                  width: `${(FIGMA.badge.size / FIGMA.rightIcon.size) * 100}%`,
                  aspectRatio: '1',
                }}
                aria-hidden
              />
            </span>
            <span
              data-node-id="2:6572"
              className="mt-2 w-full text-center text-[11px] font-medium leading-[16px]"
              style={{ height: FIGMA.rightLabel.height }}
            >
              {SIDE_R.label}
            </span>
          </Link>

          {/* 2:6539 中栏文案（非链接，主操作在 2:6518） */}
          <div
            data-node-id="2:6539"
            className="pointer-events-none absolute z-[2] flex items-start justify-center text-center text-[12px] font-bold leading-[20px] text-neutral-900"
            style={{
              left: `${(FIGMA.centerLabel.left / 390) * 100}%`,
              top: `${(relTop(FIGMA.centerLabel.top) / 165) * 100}%`,
              width: `${(FIGMA.centerLabel.width / 390) * 100}%`,
              height: FIGMA.centerLabel.height,
            }}
          >
            {COOK.label}
          </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
