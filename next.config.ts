import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // @resvg/resvg-js uses platform-specific native binaries (e.g.
  // @resvg/resvg-js-darwin-arm64) that the bundler can't trace.
  // Externalize the package so Node resolves it at runtime.
  serverExternalPackages: ['@resvg/resvg-js'],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'assets.mixkit.co',
      },
      {
        protocol: 'https',
        hostname: 'iframe.mediadelivery.net',
      },
      {
        protocol: 'https',
        hostname: 'video.bunnycdn.com',
      },
      {
        protocol: 'https',
        hostname: 'omega-tv.b-cdn.net',
      },
      {
        // Supabase Storage — branded key-art variants + article images.
        protocol: 'https',
        hostname: 'dvzwpwlgucsdyrkhrpah.supabase.co',
      },
      {
        // fal.ai hosted outputs (AI-repolished frames), if ever rendered directly.
        protocol: 'https',
        hostname: 'fal.media',
      }
    ],
  },
};

export default nextConfig;

// Force restart for Legacy Section update
