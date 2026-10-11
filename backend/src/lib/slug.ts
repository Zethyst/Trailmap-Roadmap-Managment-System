import { randomBytes } from 'crypto'

function slugifyTitle(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 40)
}

/** A share slug: `my-roadmap-title-a1b2c3` (random suffix keeps it unique & unguessable). */
export function makeShareSlug(title: string): string {
  const base = slugifyTitle(title) || 'roadmap'
  const suffix = randomBytes(5).toString('hex').slice(0, 8)
  return `${base}-${suffix}`
}
