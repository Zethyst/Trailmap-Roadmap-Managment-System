import { Router } from 'express'
import { prisma } from '../db/prisma'
import { requireAuth } from '../middleware/auth'
import { progressSchema } from '../lib/validators'

const router = Router()
router.use(requireAuth)

/** GET /api/progress/:roadmapId — the signed-in user's node statuses for a roadmap. */
router.get('/:roadmapId', async (req, res, next) => {
  try {
    const rows = await prisma.nodeProgress.findMany({
      where: { userId: req.user!.id, roadmapId: req.params.roadmapId },
      select: { nodeId: true, status: true, completedAt: true },
    })
    res.json({ progress: rows })
  } catch (err) {
    next(err)
  }
})

/** POST /api/progress — upsert one node's status for the current user. */
router.post('/', async (req, res, next) => {
  try {
    const { roadmapId, nodeId, status } = progressSchema.parse(req.body ?? {})
    const completedAt = status === 'done' ? new Date() : null
    const row = await prisma.nodeProgress.upsert({
      where: { userId_nodeId: { userId: req.user!.id, nodeId } },
      update: { status, roadmapId, completedAt },
      create: { userId: req.user!.id, nodeId, roadmapId, status, completedAt },
      select: { nodeId: true, status: true, completedAt: true },
    })
    res.json({ progress: row })
  } catch (err) {
    next(err)
  }
})

export default router
