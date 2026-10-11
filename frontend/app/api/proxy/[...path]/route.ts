import { cookies } from 'next/headers'
import { NextRequest } from 'next/server'

/**
 * Server-side proxy to the Express backend.
 *
 * The browser can't send the httpOnly NextAuth session cookie cross-origin to
 * the backend (:4000), and can't read it to build a Bearer header. So the client
 * calls this same-origin route, which reads the raw session cookie and forwards
 * the request to the backend as `Authorization: Bearer <token>`.
 *
 *   client → /api/proxy/roadmaps/123/graph → backend /api/roadmaps/123/graph
 */

const BACKEND_URL = process.env.BACKEND_URL ?? 'http://localhost:4000'
const COOKIE_NAMES = ['authjs.session-token', '__Secure-authjs.session-token']

async function getSessionToken(): Promise<string | null> {
  const store = await cookies()
  for (const name of COOKIE_NAMES) {
    const c = store.get(name)
    if (c?.value) return c.value
  }
  return null
}

async function forward(req: NextRequest, path: string[]) {
  const token = await getSessionToken()
  const search = req.nextUrl.search
  const target = `${BACKEND_URL}/api/${path.join('/')}${search}`

  const headers: Record<string, string> = { 'Content-Type': 'application/json' }
  if (token) headers['Authorization'] = `Bearer ${token}`

  const hasBody = req.method !== 'GET' && req.method !== 'HEAD'
  const body = hasBody ? await req.text() : undefined

  const res = await fetch(target, {
    method: req.method,
    headers,
    body,
    cache: 'no-store',
  })

  // Pass through status + JSON (or empty for 204).
  const text = await res.text()
  return new Response(text || null, {
    status: res.status,
    headers: { 'Content-Type': res.headers.get('Content-Type') ?? 'application/json' },
  })
}

type Ctx = { params: Promise<{ path: string[] }> }

export async function GET(req: NextRequest, ctx: Ctx) {
  return forward(req, (await ctx.params).path)
}
export async function POST(req: NextRequest, ctx: Ctx) {
  return forward(req, (await ctx.params).path)
}
export async function PATCH(req: NextRequest, ctx: Ctx) {
  return forward(req, (await ctx.params).path)
}
export async function PUT(req: NextRequest, ctx: Ctx) {
  return forward(req, (await ctx.params).path)
}
export async function DELETE(req: NextRequest, ctx: Ctx) {
  return forward(req, (await ctx.params).path)
}
