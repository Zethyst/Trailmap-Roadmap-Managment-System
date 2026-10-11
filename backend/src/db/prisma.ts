import { PrismaClient } from '@prisma/client'
import { neonConfig } from '@neondatabase/serverless'
import { PrismaNeon } from '@prisma/adapter-neon'
import ws from 'ws'

// Neon's serverless driver needs a WebSocket implementation in Node.
// Prefer the global WebSocket (Node 22+); fall back to the `ws` package.
const g = globalThis as unknown as { WebSocket?: unknown }
neonConfig.webSocketConstructor = (g.WebSocket as typeof ws) ?? ws

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is not set')
}

const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL })

export const prisma = new PrismaClient({
  adapter,
  log: ['error', 'warn'],
})
