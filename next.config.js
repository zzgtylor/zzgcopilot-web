/** @type {import('next').NextConfig} */
const nextConfig = {
      async headers() {
              return [
                  {
                      source: '/(.*)',
                      headers: [
                          { key: 'X-Content-Type-Options', value: 'nosniff' },
                          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
                          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
                          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
                      ],
                  },
              ]
      },
      images: {
              remotePatterns: [
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
