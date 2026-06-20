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
              // Mark auth-related packages as external to avoid Edge Runtime
        // bundling issues with Node.js-only APIs (jose/CompressionStream, etc.)
        if (!isServer) {
                  config.externals = config.externals || {}
                            config.externals['next-auth'] = 'next-auth'
                  config.externals['@auth/core'] = '@auth/core'
        }

        // Prevent jose and its sub-paths from being bundled by webpack.
        // jose uses CompressionStream which is not available in the Edge Runtime
        // build phase. The actual runtime (workerd) supports it, but the Next.js
        // build-time bundler does not – so we must mark it as external.
        config.externals = config.externals || {}
                if (Array.isArray(config.externals)) {
                          config.externals.push(({ request }, callback) => {
                                      if (request && (request === 'jose' || request.startsWith('jose/'))) {
                                                    return callback(null, 'commonjs ' + request)
                                      }
                                      callback()
                          })
                } else {
                          config.externals['jose'] = 'jose'
                }

        return config
      },
        typescript: { ignoreBuildErrors: true },
}

module.exports = nextConfig
