// Re-export the NextAuth route handlers from the single source of truth
// in `src/auth.ts`. This avoids duplicating the auth configuration and
// keeps the bcrypt-free, Edge-compatible password logic in one place.
import { handlers } from '@/auth'

export const { GET, POST } = handlers
