import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '1337',
        pathname: '/uploads/**',
      },
      {
        protocol: 'https',
        hostname: process.env.STRAPI_HOST ?? 'your-strapi-domain.com',
        pathname: '/uploads/**',
      },
    ],
  },
  // Enable experimental features if needed
  // experimental: { ppr: true },
};

export default nextConfig;
