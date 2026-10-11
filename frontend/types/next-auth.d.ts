import type { DefaultSession } from 'next-auth'

/**
 * Augment NextAuth's Session/JWT with our domain fields (id + plan),
 * populated in the jwt/session callbacks in `auth.ts`.
 */
declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      plan: 'free' | 'pro'
    } & DefaultSession['user']
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    uid?: string
    plan?: 'free' | 'pro'
  }
}
