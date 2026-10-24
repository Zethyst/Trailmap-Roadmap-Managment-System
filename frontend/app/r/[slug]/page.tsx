import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { PublicRoadmapView } from '@/components/canvas/PublicRoadmapView'
import type { RoadmapFull } from '@/lib/api-client'

const BACKEND_URL = process.env.BACKEND_URL ?? 'http://localhost:4000'

// Called from both generateMetadata and the page; Next memoizes identical GET
// fetches within one request, so the backend (and viewCount) sees one hit.
async function fetchRoadmap(slug: string): Promise<RoadmapFull | null> {
  const res = await fetch(`${BACKEND_URL}/api/r/${slug}`, { cache: 'no-store' })
  if (!res.ok) return null
  const { roadmap } = await res.json()
  return roadmap as RoadmapFull
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const roadmap = await fetchRoadmap(slug)
  if (!roadmap) return { title: 'Trailmap' }
  const steps = (roadmap.nodes ?? []).filter((n) => n.type === 'step' || n.type === 'milestone').length
  const description =
    roadmap.description || `A ${steps}-step learning roadmap on Trailmap. Follow it, or fork it into your own.`
  const title = `${roadmap.title} · Trailmap`
  return {
    title,
    description,
    openGraph: { title, description, type: 'article' },
    twitter: { card: 'summary', title, description },
  }
}

export default async function PublicRoadmapPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const roadmap = await fetchRoadmap(slug)
  if (!roadmap) notFound()
  return <PublicRoadmapView roadmap={roadmap} />
}
