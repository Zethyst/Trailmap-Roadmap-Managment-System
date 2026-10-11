import { prisma } from '../db/prisma'

/**
 * Maps a NextAuth token identity to a canonical Postgres user row.
 *
 * The token's `uid`/`sub` is the *provider* subject (e.g. a Google id), not our
 * DB primary key. We key users by their unique email so the DB `users.id` (uuid)
 * stays the single canonical id used for all ownership FKs.
 *
 * A short-lived in-memory cache keeps this off the hot path for repeat requests.
 */

interface CachedUser {
  id: string
  plan: 'free' | 'pro'
  expires: number
}

const CACHE_TTL_MS = 60_000
const cache = new Map<string, CachedUser>()

export async function upsertUserByEmail(params: {
  email: string
  name?: string
  avatarUrl?: string
}): Promise<{ id: string; plan: 'free' | 'pro' }> {
  const email = params.email.toLowerCase().trim()

  const cached = cache.get(email)
  if (cached && cached.expires > Date.now()) {
    return { id: cached.id, plan: cached.plan }
  }

  const user = await prisma.user.upsert({
    where: { email },
    update: {
      // Only fill in missing profile fields; never clobber on every request.
      ...(params.name ? { name: params.name } : {}),
      ...(params.avatarUrl ? { avatarUrl: params.avatarUrl } : {}),
    },
    create: {
      email,
      name: params.name,
      avatarUrl: params.avatarUrl,
    },
    select: { id: true, plan: true },
  })

  const plan = user.plan === 'pro' ? 'pro' : 'free'
  cache.set(email, { id: user.id, plan, expires: Date.now() + CACHE_TTL_MS })
  return { id: user.id, plan }
}
