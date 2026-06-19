/** @type {import('next').NextConfig} */
const nextConfig = {
  // Required for OpenNext / Cloudflare Pages deployment
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
}

module.exports = nextConfig
