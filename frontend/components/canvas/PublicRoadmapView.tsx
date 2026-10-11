'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { GitFork, Loader2 } from 'lucide-react'
import { useCanvasStore } from '@/store/canvas-store'
import { useProgressStore } from '@/store/progress-store'
import { api } from '@/lib/api-client'
import type { RoadmapFull } from '@/lib/api-client'
import { ExportMenu } from './ExportMenu'
import { Canvas } from './Canvas'

export function PublicRoadmapView({ roadmap }: { roadmap: RoadmapFull }) {
  const router = useRouter()
  const { status } = useSession()
  const setRoadmapId = useCanvasStore((s) => s.setRoadmapId)
  const loadRoadmap = useCanvasStore((s) => s.loadRoadmap)
  const loadedRef = useRef(false)
  const [forking, setForking] = useState(false)

  useEffect(() => {
    if (loadedRef.current) return
    loadedRef.current = true
    setRoadmapId(roadmap.id)
    loadRoadmap(roadmap.nodes ?? [], roadmap.edges ?? [])
    useCanvasStore.temporal.getState().clear()
  }, [roadmap, setRoadmapId, loadRoadmap])

  // Signed-in viewers can track their own progress on a shared roadmap.
  useEffect(() => {
    if (status === 'authenticated') useProgressStore.getState().load(roadmap.id)
    else useProgressStore.getState().reset()
  }, [status, roadmap.id])

  async function fork() {
    setForking(true)
    try {
      const { roadmap: copy } = await api.forkRoadmap(roadmap.id)
      router.push(`/roadmap/${copy.id}`)
    } catch {
      setForking(false)
    }
  }

  return (
    <div className="flex h-full flex-1 flex-col">
      <header className="relative z-50 flex items-center justify-between gap-3 border-b border-white/10 bg-neutral-950/60 px-5 py-3 backdrop-blur">
        <div className="min-w-0">
          <h1 className="truncate text-sm font-semibold text-white">{roadmap.title}</h1>
          <p className="text-xs text-white/40">Read-only · shared roadmap</p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <ExportMenu title={roadmap.title} />
          {status === 'authenticated' ? (
            <button
              onClick={fork}
              disabled={forking}
              className="flex items-center gap-1.5 rounded-lg bg-white px-3 py-1.5 text-xs font-medium text-gray-900 hover:bg-gray-100 disabled:opacity-60"
            >
              {forking ? <Loader2 size={13} className="animate-spin" /> : <GitFork size={13} />}
              {forking ? 'Forking…' : 'Fork'}
            </button>
          ) : (
            <Link
              href="/login"
              className="rounded-lg bg-white px-3 py-1.5 text-xs font-medium text-gray-900 hover:bg-gray-100"
            >
              Sign in to fork
            </Link>
          )}
        </div>
      </header>
      <div className="min-h-0 flex-1">
        <Canvas localInit={false} autosaveMode="none" readOnly />
      </div>
    </div>
  )
}
