import NextAuth from 'next-auth'
import { authConfig } from './auth.config'

// Use the Edge-compatible config (no Credentials provider / crypto / jose)
// so the middleware can run in the Edge Runtime without bundling Node.js APIs.
// Route protection is handled by the `authorized` callback in auth.config.ts.
export default NextAuth(authConfig).auth

export const config = {
    matcher: ['/admin/:path*'],
}
