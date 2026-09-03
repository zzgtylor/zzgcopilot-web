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
                  {
                              protocol: 'https',
                              hostname: 'cdn.sanity.io',
                  },
                      ],
      },
}

module.exports = nextConfig
