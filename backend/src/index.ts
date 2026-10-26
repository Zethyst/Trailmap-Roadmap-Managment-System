import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import roadmapsRouter from './routes/roadmaps'
import publicRouter from './routes/public'
import exploreRouter from './routes/explore'
import progressRouter from './routes/progress'
import aiRouter from './routes/ai'
import uploadsRouter from './routes/uploads'
import youtubeRouter from './routes/youtube'
import { errorHandler } from './middleware/error'

const app = express()

// CORS: allow the frontend origin to send the Authorization header.
const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN ?? 'http://localhost:3000'
app.use(
  cors({
    origin: FRONTEND_ORIGIN,
    credentials: true,
  }),
)

app.use(express.json({ limit: '2mb' }))

app.get('/health', (_req, res) => {
  res.json({ ok: true })
})

app.use('/api/roadmaps', roadmapsRouter)
app.use('/api/r', publicRouter)
app.use('/api/explore', exploreRouter)
app.use('/api/progress', progressRouter)
app.use('/api/ai', aiRouter)
app.use('/api/uploads', uploadsRouter)
app.use('/api/youtube', youtubeRouter)

app.use(errorHandler)

const PORT = Number(process.env.PORT ?? 8080)
app.listen(PORT, () => {
  console.log(`[trailmap-backend] listening on http://localhost:${PORT}`)
})
