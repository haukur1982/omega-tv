import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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
      }
    ],
  },
};

export default nextConfig;

// Force restart for Legacy Section update
