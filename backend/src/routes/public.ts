import { Router } from 'express'
import { prisma } from '../db/prisma'
import { serializeRoadmap } from '../lib/serialize'

const router = Router()

/**
 * GET /api/r/:slug — public, read-only roadmap by share slug. No auth.
 * Only resolves roadmaps whose visibility is not `private`.
 */
router.get('/:slug', async (req, res, next) => {
  try {
    const roadmap = await prisma.roadmap.findUnique({
      where: { shareSlug: req.params.slug },
      include: { nodes: true, edges: true },
    })
    if (!roadmap || roadmap.visibility === 'private') {
      return res.status(404).json({ error: 'Not found' })
    }

    // Best-effort view count; don't block the response on it.
    prisma.roadmap
      .update({ where: { id: roadmap.id }, data: { viewCount: { increment: 1 } } })
      .catch(() => {})

    res.json({ roadmap: serializeRoadmap(roadmap) })
  } catch (err) {
    next(err)
  }
})

export default router
