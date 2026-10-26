// Server-side reads of the public explore listing (used by /explore and the sitemap).
const BACKEND_URL = process.env.BACKEND_URL ?? 'http://localhost:4000'

export interface ExploreRoadmap {
  title: string
  description?: string
  tags: string[]
  shareSlug: string
  viewCount: number
  forkCount: number
  steps: number
  milestones: number
  updatedAt: string
}

export type ExploreSort = 'popular' | 'recent'

async function get<T>(path: string, revalidate: number): Promise<T | null> {
  try {
    const res = await fetch(`${BACKEND_URL}/api/explore${path}`, { next: { revalidate } })
    return res.ok ? ((await res.json()) as T) : null
  } catch {
    return null
  }
}

export function listExplore(params: { q?: string; tag?: string; sort: ExploreSort; page: number }) {
  const qs = new URLSearchParams({ sort: params.sort, page: String(params.page) })
  if (params.q) qs.set('q', params.q)
  if (params.tag) qs.set('tag', params.tag)
  return get<{ roadmaps: ExploreRoadmap[]; page: number; hasMore: boolean }>(`?${qs}`, 60)
}

export function listExploreTags() {
  return get<{ tags: { tag: string; count: number }[] }>('/tags', 60)
}

export function listSitemapRoadmaps() {
  return get<{ roadmaps: { shareSlug: string; updatedAt: string }[] }>('/sitemap', 3600)
}
