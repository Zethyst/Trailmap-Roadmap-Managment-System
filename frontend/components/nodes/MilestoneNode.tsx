'use client'

import { memo, useState } from 'react'
import { Handle, Position, type NodeProps } from '@xyflow/react'
import { ChevronDown } from 'lucide-react'
import type { CanvasNode } from '@/types'
import { useCanvasStore } from '@/store/canvas-store'
import { useUIStore } from '@/store/ui-store'
import { cn } from '@/lib/utils'
import { InlineBlockList } from './InlineBlockList'
import { PeelCorner } from './PeelCorner'
import { NodeDoneToggle, useNodeDone } from './NodeDoneToggle'

const FOLD = 38

const HANDLE_STYLE: React.CSSProperties = {
  background: 'rgba(0,0,0,0.28)',
  borderColor: 'rgba(255,255,255,0.65)',
  width: 10,
  height: 10,
}

function MilestoneNode({ data, id, selected }: NodeProps<CanvasNode>) {
  const [expanded, setExpanded] = useState(false)
  const openSidebar    = useUIStore((s) => s.openSidebar)
  const selectNode     = useCanvasStore((s) => s.selectNode)
  const updateNodeData = useCanvasStore((s) => s.updateNodeData)

  const blockCount = data.blocks.length
  const { done } = useNodeDone(id)

  return (
    <div className={cn('relative w-[220px] transition-opacity', done && 'opacity-60', selected ? 'note-shadow-selected' : 'note-shadow')}>

      {/* ── Main card ───────────────────────────────────────────────── */}
      <div
        className="relative overflow-hidden"
        style={{
          background: '#FFD233',
          clipPath: `polygon(0 0, 100% 0, 100% calc(100% - ${FOLD}px), calc(100% - ${FOLD}px) 100%, 0 100%)`,
          borderRadius: 3,
        }}
      >
        {/* Gold shimmer at top */}
        <div className="absolute top-0 inset-x-0 h-[11px] bg-white/22 rounded-b-md" />

        <Handle type="target" position={Position.Top} style={HANDLE_STYLE} className="!border-2" />

        {/* Top meta row */}
        <div
          className="flex cursor-pointer select-none items-center justify-between px-4 pb-1.5 pt-5"
          onClick={() => setExpanded((e) => !e)}
          onDoubleClick={() => { selectNode(id); openSidebar(id) }}
        >
          <div className="flex items-center gap-1.5 text-xs font-medium text-amber-950/55">
            <NodeDoneToggle nodeId={id} className="text-amber-950" />
            <span className="text-sm leading-none">🏆</span>
            <span>Milestone</span>
            {data.estMinutes && <span>· ~{data.estMinutes}m</span>}
          </div>
          <ChevronDown
            size={14}
            className={cn('text-amber-950/45 transition-transform duration-200', expanded && 'rotate-180')}
          />
        </div>

        {/* Title */}
        <div
          className="nodrag nopan px-4 pb-3"
          onMouseDown={(e) => e.stopPropagation()}
          onClick={(e) => e.stopPropagation()}
        >
          <input
            value={data.title}
            onChange={(e) => updateNodeData(id, { title: e.target.value })}
            placeholder="Milestone"
            className={cn(
              'w-full bg-transparent text-[15px] font-bold leading-snug text-amber-950 placeholder:text-amber-950/30 focus:outline-none',
              done && 'line-through',
            )}
          />
          {blockCount > 0 && !expanded && (
            <p className="mt-1 text-[11px] font-medium text-amber-950/50">
              ▼ {blockCount} resource{blockCount !== 1 ? 's' : ''}
            </p>
          )}
        </div>

        {/* Collapsible */}
        <div
          style={{
            display: 'grid',
            gridTemplateRows: expanded ? '1fr' : '0fr',
            transition: 'grid-template-rows 200ms ease',
          }}
        >
          <div className="overflow-hidden">
            <div className="h-px w-full bg-amber-950/10" />
            <InlineBlockList nodeId={id} data={data} />
          </div>
        </div>

        <Handle type="source" position={Position.Bottom} style={HANDLE_STYLE} className="!border-2" />
      </div>

      {/* Peeling corner */}
      <PeelCorner size={FOLD} back="#C4980A" />

      {selected && (
        <div className="pointer-events-none absolute inset-0 rounded-[3px] ring-2 ring-inset ring-amber-600/70" />
      )}
    </div>
  )
}

export default memo(MilestoneNode)
