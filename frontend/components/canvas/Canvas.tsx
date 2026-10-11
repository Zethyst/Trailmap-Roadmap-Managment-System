'use client'

import { useCallback, useEffect } from 'react'
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  BackgroundVariant,
  MarkerType,
  type NodeTypes,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'

import { useCanvasStore } from '@/store/canvas-store'
import { useUIStore } from '@/store/ui-store'
import { useProgressStore } from '@/store/progress-store'
import { useAutosave } from '@/hooks/use-autosave'
import { CanvasToolbar } from './CanvasToolbar'
import { NodePanel } from './NodePanel'

import StepNode from '@/components/nodes/StepNode'
import MilestoneNode from '@/components/nodes/MilestoneNode'
import NoteNode from '@/components/nodes/NoteNode'
import GroupNode from '@/components/nodes/GroupNode'
import { MigrationBanner } from './MigrationBanner'

const nodeTypes: NodeTypes = {
  step: StepNode,
  milestone: MilestoneNode,
  note: NoteNode,
  group: GroupNode,
}

const defaultEdgeOptions = {
  markerEnd: { type: MarkerType.ArrowClosed, width: 18, height: 18, color: '#94a3b8' },
  style: { stroke: '#94a3b8', strokeWidth: 2 },
}

interface CanvasProps {
  /** When true (default), initialise/persist an anonymous roadmap in IndexedDB. */
  localInit?: boolean
  /** Where autosave writes: local IndexedDB, the cloud backend, or disabled. */
  autosaveMode?: 'local' | 'cloud' | 'none'
  /** Hide editing affordances for public read-only view. */
  readOnly?: boolean
}

export function Canvas({ localInit = true, autosaveMode = 'local', readOnly = false }: CanvasProps) {
  const nodes = useCanvasStore((s) => s.nodes)
  const edges = useCanvasStore((s) => s.edges)
  const onNodesChange = useCanvasStore((s) => s.onNodesChange)
  const onEdgesChange = useCanvasStore((s) => s.onEdgesChange)
  const onConnect = useCanvasStore((s) => s.onConnect)
  const setRoadmapId = useCanvasStore((s) => s.setRoadmapId)
  const loadRoadmap = useCanvasStore((s) => s.loadRoadmap)
  const selectNode = useCanvasStore((s) => s.selectNode)
  const closeSidebar = useUIStore((s) => s.closeSidebar)
  const sidebarOpen = useUIStore((s) => s.sidebarOpen)

  useAutosave(autosaveMode)

  // The anonymous/local canvas has no per-user progress tracking.
  useEffect(() => {
    if (autosaveMode === 'local') useProgressStore.getState().reset()
  }, [autosaveMode])

  useEffect(() => {
    if (!localInit) return
    const stored = localStorage.getItem('trailmap:activeRoadmapId')
    if (stored) {
      setRoadmapId(stored)
      import('@/lib/local-db').then(({ getRoadmap }) =>
        getRoadmap(stored).then((r) => {
          if (r) loadRoadmap(r.nodes, r.edges)
        }),
      )
    } else {
      const id = crypto.randomUUID()
      localStorage.setItem('trailmap:activeRoadmapId', id)
      setRoadmapId(id)
    }
  }, [setRoadmapId, loadRoadmap, localInit])

  // When someone clicks on the canvas pane (not on a node), we want to deselect any selected node and close the sidebar. This is a common UX pattern to allow users to easily exit node editing mode and return to the main canvas view.
  const handlePaneClick = useCallback(() => {
    selectNode(null)
    closeSidebar()
  }, [selectNode, closeSidebar])

  // When a node drag starts, we pause the temporal state to prevent recording intermediate states during the drag operation. This ensures that only the final position of the node is recorded in the undo/redo history.
  const handleNodeDragStart = useCallback(() => {
    useCanvasStore.temporal.getState().pause() 
  }, [])

  // When a node drag stops, we resume the temporal state to allow recording of subsequent changes. This ensures that the final position of the node is captured in the undo/redo history.
  const handleNodeDragStop = useCallback(() => {
    useCanvasStore.temporal.getState().resume()
  }, [])

  return (
    <div className="flex flex-1 h-full overflow-hidden">
      <div className="relative flex-1 h-full">
        {!readOnly && <CanvasToolbar />}
        {!readOnly && autosaveMode === 'local' && <MigrationBanner />}
        <ReactFlow
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          onNodesChange={readOnly ? undefined : onNodesChange}
          onEdgesChange={readOnly ? undefined : onEdgesChange}
          onConnect={readOnly ? undefined : onConnect}
          onPaneClick={handlePaneClick}
          onNodeDragStart={handleNodeDragStart}
          onNodeDragStop={handleNodeDragStop}
          defaultEdgeOptions={defaultEdgeOptions}
          nodesDraggable={!readOnly}
          nodesConnectable={!readOnly}
          elementsSelectable={!readOnly}
          fitView
          colorMode="dark"
        >
          <Background
            variant={BackgroundVariant.Dots}
            gap={20} //dot ke beech ka gap
            size={1} //dot ka size
            color="#1e4535"
            style={{ backgroundColor: '#07190f' }}
          />
          <Controls />
          <MiniMap
            zoomable
            pannable
            style={{ backgroundColor: '#0f261b' }}
            maskColor="rgba(0,0,0,0.5)"
          />
        </ReactFlow>
      </div>
      {sidebarOpen && <NodePanel />}
    </div>
  )
}
