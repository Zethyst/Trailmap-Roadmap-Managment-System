import type { Request, Response, NextFunction } from 'express'
import { upsertUserByEmail } from '../services/users'

/**
 * Verifies the NextAuth v5 session token on incoming requests.
 *
 * NextAuth issues an *encrypted* JWE (A256CBC-HS512, key derived from AUTH_SECRET
 * via HKDF with salt = cookie name). We reuse `@auth/core/jwt`'s `decode` so the
 * derivation matches the frontend exactly. `@auth/core` is ESM-only, so it's
 * loaded via dynamic import from this CommonJS build.
 *
 * The frontend forwards the raw session-cookie value as `Authorization: Bearer <token>`.
 * We try both the dev (http) and prod (https/__Secure-) cookie-name salts.
 */

const SALTS = ['authjs.session-token', '__Secure-authjs.session-token']

export interface AuthUser {
  id: string
  email: string
  plan: 'free' | 'pro'
  name?: string
}

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: AuthUser
    }
  }
}

// Lazily import the ESM-only decoder once.
let decodeFn: typeof import('@auth/core/jwt').decode | null = null
async function getDecode() {
  if (!decodeFn) {
    const mod = await import('@auth/core/jwt')
    decodeFn = mod.decode
  }
  return decodeFn
}

function extractToken(req: Request): string | null {
  const header = req.headers.authorization
  if (header?.startsWith('Bearer ')) return header.slice(7)
  return null
}

async function resolveUser(req: Request): Promise<AuthUser | null> {
  const token = extractToken(req)
  if (!token) return null

  const secret = process.env.AUTH_SECRET
  if (!secret) throw new Error('AUTH_SECRET is not set')

  const decode = await getDecode()
  for (const salt of SALTS) {
    try {
      const payload = await decode({ token, secret, salt })
      if (!payload) continue

      const email = (payload.email as string)?.trim()
      if (!email) continue

      const name = (payload.name as string) ?? undefined
      const avatarUrl = (payload.picture as string) ?? undefined

      // Resolve to the canonical DB user (upserted by email, cached).
      const dbUser = await upsertUserByEmail({ email, name, avatarUrl })
      return { id: dbUser.id, email, plan: dbUser.plan, name }
    } catch {
      // try next salt
    }
  }
  return null
}

/** Rejects the request with 401 unless a valid session token is present. */
export async function requireAuth(req: Request, res: Response, next: NextFunction) {
  try {
    const user = await resolveUser(req)
    if (!user) return res.status(401).json({ error: 'Unauthorized' })
    req.user = user
    next()
  } catch (err) {
    next(err)
  }
}

/** Attaches req.user if a valid token is present, but never rejects. */
export async function optionalAuth(req: Request, _res: Response, next: NextFunction) {
  try {
    const user = await resolveUser(req)
    if (user) req.user = user
  } catch {
    // ignore — anonymous request
  }
  next()
}
