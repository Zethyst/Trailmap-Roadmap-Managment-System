import { Router } from 'express'

const router = Router()

function isYouTubeUrl(url: string): boolean {
  try {
    const host = new URL(url).hostname.replace(/^www\./, '')
    return host === 'youtube.com' || host === 'youtu.be' || host === 'm.youtube.com'
  } catch {
    return false
  }
}

/**
 * GET /api/youtube/metadata?url= — title + thumbnail for a YouTube URL.
 * Uses YouTube's keyless oEmbed endpoint (no API key / quota needed).
 * Duration is not available via oEmbed.
 */
router.get('/metadata', async (req, res, next) => {
  try {
    const url = req.query.url
    if (typeof url !== 'string' || !isYouTubeUrl(url)) {
      return res.status(400).json({ error: 'A valid YouTube URL is required' })
    }
    const oembed = `https://www.youtube.com/oembed?url=${encodeURIComponent(url)}&format=json`
    const r = await fetch(oembed)
    if (!r.ok) return res.status(404).json({ error: 'Could not fetch video metadata' })
    const d = (await r.json()) as { title?: string; thumbnail_url?: string; author_name?: string }
    res.json({ title: d.title ?? '', thumbnail: d.thumbnail_url ?? '', author: d.author_name ?? '' })
  } catch (err) {
    next(err)
  }
})

export default router
