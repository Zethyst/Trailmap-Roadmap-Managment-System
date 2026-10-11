import type { Request, Response, NextFunction } from 'express'
import type { AiKind } from '@prisma/client'
import { prisma } from '../db/prisma'

// Daily AI quota per plan (no Redis — counted straight from ai_generations).
const DAILY_LIMITS: Record<'free' | 'pro', number> = {
  free: 10,
  pro: 100,
}

/**
 * Blocks the request with 429 once the user has hit their daily quota for a
 * given AI kind. Backed by an index on ai_generations(user_id, created_at).
 */
export function rateLimitAi(kind: AiKind) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = req.user!
      const since = new Date(Date.now() - 24 * 60 * 60 * 1000)
      const count = await prisma.aiGeneration.count({
        where: { userId: user.id, kind, createdAt: { gt: since } },
      })
      const limit = DAILY_LIMITS[user.plan] ?? DAILY_LIMITS.free
      if (count >= limit) {
        return res.status(429).json({ error: `Daily AI limit reached (${limit}/day). Try again tomorrow.` })
      }
      next()
    } catch (err) {
      next(err)
    }
  }
}
