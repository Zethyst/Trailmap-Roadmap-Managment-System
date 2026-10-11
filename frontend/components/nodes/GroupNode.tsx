'use client'

import { memo } from 'react'
import { NodeResizer, Handle, Position, type NodeProps } from '@xyflow/react'
import type { CanvasNode } from '@/types'
import { useCanvasStore } from '@/store/canvas-store'
import { useUIStore } from '@/store/ui-store'
import { cn } from '@/lib/utils'

const HANDLE_STYLE: React.CSSProperties = {
  background: 'rgba(0,0,0,0.25)',
  borderColor: 'rgba(255,255,255,0.5)',
  width: 10,
  height: 10,
}

function GroupNode({ data, id, selected }: NodeProps<CanvasNode>) {
  const openSidebar = useUIStore((s) => s.openSidebar)
  const selectNode = useCanvasStore((s) => s.selectNode)

  return (
    <>
      <NodeResizer
        isVisible={selected}
        minWidth={200}
        minHeight={120}
        lineClassName="!border-slate-500/60"
        handleClassName="!h-2.5 !w-2.5 !rounded-sm !bg-slate-500 !border-slate-700"
      />
      <div
        onDoubleClick={() => { selectNode(id); openSidebar(id) }}
        className={cn(
          'w-full h-full rounded-sm',
          'border-2 border-dashed border-slate-500/40',
          'bg-slate-800/30 backdrop-blur-sm',
          selected && 'border-solid border-slate-400/70 bg-slate-800/50',
          'transition-all duration-150',
        )}
      >
        {/* Label */}
        <div className="inline-flex items-center rounded-sm bg-slate-700/60 px-2.5 py-1 m-2.5 mb-0">
          <span className="text-[11px] font-bold uppercase tracking-widest text-slate-300/80">
            {data.title || 'Section'}
          </span>
        </div>
      </div>
      <Handle type="target" position={Position.Top} style={HANDLE_STYLE} className="!border-2" />
      <Handle type="source" position={Position.Bottom} style={HANDLE_STYLE} className="!border-2" />
    </>
  )
}

export default memo(GroupNode)
