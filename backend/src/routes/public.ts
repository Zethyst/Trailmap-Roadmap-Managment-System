import { Router } from 'express'
import { prisma } from '../db/prisma'
import { serializeRoadmap } from '../lib/serialize'

const router = Router()

/**
 * GET /api/r/:slug — public, read-only roadmap by share slug. No auth.
 * Only resolves roadmaps whose visibility is not `private`.
 * `?preview=1` fetches without counting a view.
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

    // Best-effort view count; don't block the response on it. `?preview=1`
    // (the link-preview image) skips it, since crawlers aren't views.
    // Raw SQL so it doesn't bump updated_at: Prisma's @updatedAt fires on any
    // update, and a view isn't an edit (it would reorder "recently updated").
    if (req.query.preview !== '1') {
      prisma.$executeRaw`UPDATE roadmaps SET view_count = view_count + 1 WHERE id = ${roadmap.id}`.catch(() => {})
    }

    res.json({ roadmap: serializeRoadmap(roadmap) })
  } catch (err) {
    next(err)
  }
})

export default router
