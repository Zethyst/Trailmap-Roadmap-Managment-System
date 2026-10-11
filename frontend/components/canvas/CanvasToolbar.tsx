'use client'

import { useState } from 'react'
import { useCanvasStore } from '@/store/canvas-store'
import { useStore } from 'zustand'
import type { CanvasNode } from '@/types'
import { Undo2, Redo2, Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'
import { GenerateModal } from '@/components/ai/GenerateModal'

const NODE_PRESETS: { type: CanvasNode['type']; label: string; emoji: string; color: string }[] = [
  { type: 'step',      label: 'Step',      emoji: '📍', color: 'hover:bg-blue-500/15 hover:text-blue-300' },
  { type: 'milestone', label: 'Milestone', emoji: '🏆', color: 'hover:bg-amber-500/15 hover:text-amber-300' },
  { type: 'note',      label: 'Note',      emoji: '📝', color: 'hover:bg-yellow-500/15 hover:text-yellow-300' },
  { type: 'group',     label: 'Group',     emoji: '⬡',  color: 'hover:bg-indigo-500/15 hover:text-indigo-300' },
]

export function CanvasToolbar() {
  const addNode = useCanvasStore((s) => s.addNode)
  const { undo, redo, pastStates, futureStates } = useStore(useCanvasStore.temporal)
  const [genOpen, setGenOpen] = useState(false)

  function handleAdd(type: CanvasNode['type']) {
    const node: CanvasNode = {
      id: crypto.randomUUID(),
      type,
      position: { x: 160 + Math.random() * 200, y: 160 + Math.random() * 200 },
      data: { title: '', blocks: [], color: 'blue' },
      // Top-level width/height (not style) so NodeResizer can update them and
      // they get persisted by serializeGraph.
      ...(type === 'group' && { width: 320, height: 200 }),
    }
    addNode(node)
  }

  return (
    <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 flex items-center gap-1 rounded-2xl border border-white/10 bg-gray-950/80 backdrop-blur-md px-2 py-1.5 shadow-xl">
      {NODE_PRESETS.map((p) => (
        <button
          key={p.type}
          onClick={() => handleAdd(p.type)}
          className={cn(
            'flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-sm font-medium text-gray-400 transition-colors',
            p.color,
          )}
          title={`Add ${p.label}`}
        >
          <span className="text-base leading-none">{p.emoji}</span>
          <span>{p.label}</span>
        </button>
      ))}

      <div className="mx-1.5 h-4 w-px bg-white/10" />

      <button
        onClick={() => setGenOpen(true)}
        className="flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-sm font-medium text-violet-300 transition-colors hover:bg-violet-500/15"
        title="Generate with AI"
      >
        <Sparkles size={15} />
        <span>Generate</span>
      </button>

      <div className="mx-1.5 h-4 w-px bg-white/10" />

      <button
        onClick={() => undo()}
        disabled={pastStates.length === 0}
        className="rounded-lg p-1.5 text-gray-500 hover:bg-white/10 hover:text-gray-200 disabled:cursor-not-allowed disabled:opacity-20 transition-colors"
        title="Undo"
      >
        <Undo2 size={15} />
      </button>
      <button
        onClick={() => redo()}
        disabled={futureStates.length === 0}
        className="rounded-lg p-1.5 text-gray-500 hover:bg-white/10 hover:text-gray-200 disabled:cursor-not-allowed disabled:opacity-20 transition-colors"
        title="Redo"
      >
        <Redo2 size={15} />
      </button>

      <GenerateModal open={genOpen} onClose={() => setGenOpen(false)} />
    </div>
  )
}
