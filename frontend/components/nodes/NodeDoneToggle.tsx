'use client'

import { CheckCircle2, Circle } from 'lucide-react'
import { useCanvasStore } from '@/store/canvas-store'
import { useProgressStore } from '@/store/progress-store'
import { cn } from '@/lib/utils'

/** Whether progress tracking applies to this node, and whether it's done. */
export function useNodeDone(nodeId: string) {
  const canvasRoadmapId = useCanvasStore((s) => s.roadmapId)
  const progressRoadmapId = useProgressStore((s) => s.roadmapId)
  const status = useProgressStore((s) => s.statuses[nodeId])
  const trackable = progressRoadmapId !== null && progressRoadmapId === canvasRoadmapId
  return { trackable, done: status === 'done' }
}

/** Circular check toggle; renders nothing when progress tracking is off. */
export function NodeDoneToggle({ nodeId, className }: { nodeId: string; className?: string }) {
  const toggleDone = useProgressStore((s) => s.toggleDone)
  const { trackable, done } = useNodeDone(nodeId)
  if (!trackable) return null
  return (
    <button
      className={cn('nodrag nopan shrink-0 transition-colors', done && 'text-emerald-700', className)}
      onMouseDown={(e) => e.stopPropagation()}
      onClick={(e) => {
        e.stopPropagation()
        toggleDone(nodeId)
      }}
      title={done ? 'Mark as not done' : 'Mark as done'}
      aria-label={done ? 'Mark as not done' : 'Mark as done'}
    >
      {done ? <CheckCircle2 size={16} /> : <Circle size={16} />}
    </button>
  )
}
