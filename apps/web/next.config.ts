import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  /**
   * Windows：默认请用 `pnpm dev`（Webpack），勿长期用 `dev:turbo`。
   * Turbopack 在部分 Win 环境会写 `_buildManifest.js.tmp.*` 时竞态 → ENOENT。
   */
  /**
   * Next 默认使用 `cache.type: 'filesystem'`（.next/cache/webpack/*.pack.gz）。
   * Windows 上易被并发/杀软/半删目录搞坏 → ENOENT → 模块表错乱 → __webpack_modules__ is not a function。
   * 开发态改为 **memory**，不落盘 pack，避免 PackFileCacheStrategy。
   * （`cache: false` 在部分路径仍会与内部逻辑打架；memory 更稳。）
   */
  webpack: (config, { dev }) => {
    if (dev) {
      config.cache = { type: 'memory', maxGenerations: 1 };
    }
    return config;
  },
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
