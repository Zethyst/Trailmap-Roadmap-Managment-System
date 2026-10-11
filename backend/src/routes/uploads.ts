import { Router } from 'express'
import { requireAuth } from '../middleware/auth'
import { signUpload } from '../services/cloudinary'

const router = Router()
router.use(requireAuth)

/**
 * POST /api/uploads/sign — returns signed params for a direct browser upload
 * to Cloudinary. The client then POSTs the file + these params to `uploadUrl`
 * and stores the returned `secure_url` in an image block.
 */
router.post('/sign', (_req, res, next) => {
  try {
    res.json(signUpload())
  } catch (err) {
    next(err)
  }
})

export default router
