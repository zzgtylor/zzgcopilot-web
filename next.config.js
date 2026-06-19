/** @type {import('next').NextConfig} */
const nextConfig = {
  // Cloudflare Pages deployment - edge runtime is set per-route
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.r2.cloudflarestorage.com',
      },
      {
        protocol: 'https',
        hostname: '*.zzgcopilot.com',
      },
    ],
  },
};

module.exports = nextConfig;
