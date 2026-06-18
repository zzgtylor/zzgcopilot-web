/** @type {import('next').NextConfig} */
const nextConfig = {
  // Required for Cloudflare Pages deployment
  experimental: {
    runtime: 'edge',
  },
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
