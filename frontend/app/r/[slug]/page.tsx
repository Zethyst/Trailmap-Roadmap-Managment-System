import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { PublicRoadmapView } from '@/components/canvas/PublicRoadmapView'
import type { RoadmapFull } from '@/lib/api-client'

const BACKEND_URL = process.env.BACKEND_URL ?? 'http://localhost:4000'

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
  return { title: roadmap ? `${roadmap.title} · Trailmap` : 'Trailmap' }
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
