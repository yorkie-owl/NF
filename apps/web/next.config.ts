import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  /** CJS 包在 Webpack 下与 App Router 混用时的兼容 */
  transpilePackages: ['@lin-shi/contracts'],
  experimental: {
    /** 避免 lucide 大 barrel 在 Webpack 下解析异常 */
    optimizePackageImports: ['lucide-react'],
  },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'www.figma.com' },
    ],
  },
};

export default nextConfig;
