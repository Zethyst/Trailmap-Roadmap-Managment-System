import { create } from 'zustand'
import { temporal } from 'zundo'
import type { CanvasNode, CanvasEdge, NodeData } from '@/types'
import {
  applyNodeChanges,
  applyEdgeChanges,
  addEdge,
  type NodeChange,
  type EdgeChange,
  type Connection,
} from '@xyflow/react'
import { wouldCreateCycle } from '@/lib/dag'

interface CanvasState {
  roadmapId: string | null
  nodes: CanvasNode[]
  edges: CanvasEdge[]
  selectedNodeId: string | null
  isDirty: boolean

  setRoadmapId: (id: string) => void
  setNodes: (nodes: CanvasNode[]) => void
  setEdges: (edges: CanvasEdge[]) => void
  onNodesChange: (changes: NodeChange<CanvasNode>[]) => void
  onEdgesChange: (changes: EdgeChange[]) => void
  onConnect: (connection: Connection) => void
  addNode: (node: CanvasNode) => void
  updateNodeData: (id: string, data: Partial<NodeData>) => void
  deleteNode: (id: string) => void
  selectNode: (id: string | null) => void
  markClean: () => void
  loadRoadmap: (nodes: CanvasNode[], edges: CanvasEdge[]) => void
}
export const useCanvasStore = create<CanvasState>()( 
  // temporal allows us to undo/redo changes to the canvas state, with a limit of 50 snapshots
  temporal(
    (set) => ({
      roadmapId: null,
      nodes: [],
      edges: [],
      selectedNodeId: null,
      isDirty: false,

      setRoadmapId: (id) => set({ roadmapId: id }),

      setNodes: (nodes) => set({ nodes, isDirty: true }),

      setEdges: (edges) => set({ edges, isDirty: true }),

      onNodesChange: (changes) =>
        set((state) => ({
          nodes: applyNodeChanges(changes, state.nodes),
          isDirty: true,
        })),

      onEdgesChange: (changes) =>
        set((state) => ({
          edges: applyEdgeChanges(changes, state.edges),
          isDirty: true,
        })),

      onConnect: (connection) =>
        set((state) => {
          if (!connection.source || !connection.target) return state
          if (wouldCreateCycle(state.edges, connection.source, connection.target)) return state
          return { edges: addEdge(connection, state.edges), isDirty: true }
        }),

      addNode: (node) =>
        set((state) => ({ nodes: [...state.nodes, node], isDirty: true })), //here we have made isDirty true because we want to autosave the roadmap when a new node is added. This ensures that any changes made to the canvas are persisted in the local database, providing a seamless user experience and preventing data loss.

      updateNodeData: (id, data) =>
        set((state) => ({
          nodes: state.nodes.map((n) =>
            n.id === id ? { ...n, data: { ...n.data, ...data } } : n,
          ),
          isDirty: true,
        })),

      deleteNode: (id) =>
        set((state) => ({
          nodes: state.nodes.filter((n) => n.id !== id),
          edges: state.edges.filter((e) => e.source !== id && e.target !== id),
          selectedNodeId: state.selectedNodeId === id ? null : state.selectedNodeId,
          isDirty: true,
        })),

      selectNode: (id) => set({ selectedNodeId: id }),

      markClean: () => set({ isDirty: false }),

      loadRoadmap: (nodes, edges) => set({ nodes, edges, isDirty: false }),
    }),
    {
      limit: 50,
      // Only snapshot nodes+edges — ignore selection, dirty flag, roadmapId
      partialize: (state) => ({ nodes: state.nodes, edges: state.edges }), //partialize tells zundo which slice of state to snapshot for undo/redo history. Here it only snapshots nodes and edges, ignoring other state properties like selectedNodeId, isDirty, and roadmapId. This ensures that undo/redo operations only affect the visual elements of the canvas, while preserving the user's selection and other metadata.
    },
  ),
)
