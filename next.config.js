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
    webpack: (config, { isServer }) => {
          // Mark next-auth as external for Edge Runtime to avoid jose/CompressionStream errors
      if (!isServer) {
              config.externals = config.externals || {}
                      config.externals['next-auth'] = 'next-auth'
              config.externals['@auth/core'] = '@auth/core'
      }
          return config
    },
}

module.exports = nextConfig
