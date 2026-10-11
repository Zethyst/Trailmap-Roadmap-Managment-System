import type { Request, Response, NextFunction } from 'express'
import { ZodError } from 'zod'

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction) {
  if (err instanceof ZodError) {
    return res.status(400).json({ error: 'Invalid request', details: err.issues })
  }
  console.error('[error]', err)
  res.status(500).json({ error: 'Internal server error' })
}
