import 'dotenv/config'
import { defineConfig } from 'prisma/config'

// Used by the Prisma CLI (migrate / db push / generate). Runtime queries go
// through the Neon driver adapter in src/db/prisma.ts instead.
export default defineConfig({
  datasource: {
    url: process.env.DATABASE_URL!,
  },
})
