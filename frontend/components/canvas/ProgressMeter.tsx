'use client'

import { useCanvasStore } from '@/store/canvas-store'
import { useProgressStore } from '@/store/progress-store'

/** Compact "% · done/total" meter for step + milestone completion. */
export function ProgressMeter() {
  const nodes = useCanvasStore((s) => s.nodes)
  const canvasRoadmapId = useCanvasStore((s) => s.roadmapId)
  const roadmapId = useProgressStore((s) => s.roadmapId)
  const statuses = useProgressStore((s) => s.statuses)

  if (roadmapId === null || roadmapId !== canvasRoadmapId) return null

  const trackable = nodes.filter((n) => n.type === 'step' || n.type === 'milestone')
  const total = trackable.length
  if (total === 0) return null

  const done = trackable.filter((n) => statuses[n.id] === 'done').length
  const pct = Math.round((done / total) * 100)

  return (
    <div className="flex items-center gap-2">
      <div className="h-1.5 w-24 overflow-hidden rounded-full bg-white/10">
        <div
          className="h-full rounded-full bg-emerald-500 transition-all duration-300"
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="whitespace-nowrap text-xs text-white/50">
        {pct}% · {done}/{total}
      </span>
    </div>
  )
}
