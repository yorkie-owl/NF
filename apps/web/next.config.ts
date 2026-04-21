import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  /**
   * Windows：默认请用 `pnpm dev`（Webpack），勿长期用 `dev:turbo`。
   * Turbopack 在部分 Win 环境会写 `_buildManifest.js.tmp.*` 时竞态 → ENOENT。
   */
  /**
   * 勿在 dev 里改 `config.cache` 为 `memory`：在 Next 15 + Windows 上曾出现
   * `.next/server/webpack-runtime.js` 引用缺失的 `./NNN.js` → MODULE_NOT_FOUND、
   * `reading '/_app'`。使用 Next 默认缓存；若遇 ENOENT，执行 `pnpm clean` 后重启。
   */
  /** 关闭底部 dev 指示器（与 Segment Explorer 无关，仅减少干扰） */
  devIndicators: false,
  /**
   * 关闭开发态 Segment Explorer（会注入 SegmentViewNode）。
   * 在部分环境（Windows + pnpm 路径、Cursor 等）会触发
   * 「Could not find ... segment-explorer-node#SegmentViewNode in the React Client Manifest」
   * 与 __webpack_modules__ 报错；关闭后不影响正常开发与热更新。
   */
  experimental: {
    devtoolSegmentExplorer: false,
  },
};

export default nextConfig;
