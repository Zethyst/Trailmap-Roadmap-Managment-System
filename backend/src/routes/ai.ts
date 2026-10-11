import { Router } from 'express'
import { createHash } from 'crypto'
import { Prisma } from '@prisma/client'
import { prisma } from '../db/prisma'
import { requireAuth } from '../middleware/auth'
import { rateLimitAi } from '../middleware/rate-limit'
import { aiGenerateSchema } from '../lib/validators'
import { generateRoadmap } from '../services/ai'
import { layoutAiRoadmap } from '../lib/ai-layout'

const router = Router()
router.use(requireAuth)

function hashPrompt(obj: unknown): string {
  return createHash('sha256').update(JSON.stringify(obj)).digest('hex')
}

/**
 * POST /api/ai/generate — generate a roadmap graph from a goal.
 * Rate-limited per plan; responses cached by prompt hash to cut cost.
 */
router.post('/generate', rateLimitAi('generate'), async (req, res, next) => {
  try {
    const input = aiGenerateSchema.parse(req.body ?? {})
    const promptHash = hashPrompt({
      kind: 'generate',
      goal: input.goal.toLowerCase().trim(),
      level: input.level ?? null,
      timeBudget: input.timeBudget ?? null,
    })

    // Cache hit → return stored graph (and still log usage for rate limiting).
    const cached = await prisma.aiGeneration.findFirst({
      where: { promptHash, kind: 'generate' },
      orderBy: { createdAt: 'desc' },
    })
    if (cached) {
      await prisma.aiGeneration.create({
        data: {
          userId: req.user!.id,
          kind: 'generate',
          promptHash,
          prompt: input.goal,
          response: cached.response as Prisma.InputJsonValue,
        },
      })
      return res.json({ ...(cached.response as object), cached: true })
    }

    let ai
    try {
      ai = await generateRoadmap(input)
    } catch (e) {
      const code = (e as { code?: string; lc_error_code?: string })?.code
      const lc = (e as { lc_error_code?: string })?.lc_error_code
      if (code === 'insufficient_quota' || code === 'credit_balance_exhausted') {
        return res.status(503).json({ error: 'AI is unavailable: the OpenRouter account has no credits.' })
      }
      if (lc === 'MODEL_RATE_LIMIT' || code === 'rate_limit_exceeded') {
        return res.status(503).json({ error: 'AI is busy right now. Please try again shortly.' })
      }
      throw e
    }
    const graph = layoutAiRoadmap(ai)

    await prisma.aiGeneration.create({
      data: {
        userId: req.user!.id,
        kind: 'generate',
        promptHash,
        prompt: input.goal,
        response: graph as unknown as Prisma.InputJsonValue,
      },
    })

    res.json({ ...graph, cached: false })
  } catch (err) {
    next(err)
  }
})

export default router
