import 'dotenv/config'
import { encode } from '@auth/core/jwt'

// Mints a NextAuth-compatible session JWE for local API testing.
async function main() {
  const token = await encode({
    token: {
      sub: 'dev:dev@trailmap.app',
      uid: 'dev:dev@trailmap.app',
      email: 'dev@trailmap.app',
      name: 'Dev User',
      plan: 'free',
    },
    secret: process.env.AUTH_SECRET!,
    salt: 'authjs.session-token',
  })
  console.log(token)
}

main()
