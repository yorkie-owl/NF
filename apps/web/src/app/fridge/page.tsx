import { redirect } from 'next/navigation';

/**
 * 兼容旧链路与分享：历史上 /fridge 为画板2 全屏页。
 * 现与 Figma 一致：画板2 为首页冰箱上的弹层，故统一回到首页并带上查询参数打开弹窗。
 */
export default function FridgeLegacyRedirectPage() {
  redirect('/?fridge=1');
}
