import { PrismaClient } from '@prisma/client'
import { neonConfig } from '@neondatabase/serverless'
import { PrismaNeon } from '@prisma/adapter-neon'

if (typeof window === 'undefined') {
  // Dynamic import to avoid bufferUtil.mask errors when ws is bundled or optional deps missing.
  // Prefer Node's global WebSocket (Node 18+) when available to avoid ws native addon issues.
  const g = globalThis as unknown as { WebSocket?: new (url: string) => WebSocket }
  if (typeof g.WebSocket === 'function') {
    neonConfig.webSocketConstructor = g.WebSocket
  } else {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const ws = require('ws')
    neonConfig.webSocketConstructor = ws
  }
}

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

function createPrismaClient() {
  if (typeof window !== 'undefined') {
    throw new Error('Prisma Client should only be used on the server side')
  }

  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL environment variable is not set')
  }

  const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL })

  return new PrismaClient({
    adapter,
    log: ['error', 'warn'], // Removed 'query' to disable query logs
  })
}

// Lazy initialization - only create client when accessed
function getPrismaClient() {
  if (!globalForPrisma.prisma) {
    globalForPrisma.prisma = createPrismaClient()
  }
  return globalForPrisma.prisma
}

// Use a Proxy to lazily initialize the client only when accessed
export const prisma = new Proxy({} as PrismaClient, {
  get(_target, prop) {
    const client = getPrismaClient()
    // Bind getters (model delegates) to the real client — otherwise `someModel` can be undefined
    // when the getter runs with an incorrect receiver through the Proxy chain.
    return Reflect.get(client, prop, client)
  },
})