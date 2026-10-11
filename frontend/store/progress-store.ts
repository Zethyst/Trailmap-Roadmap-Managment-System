import { create } from 'zustand'
import { api, type ProgressStatus } from '@/lib/api-client'

interface ProgressState {
  /** Roadmap progress is currently loaded for (null = tracking disabled, e.g. local canvas). */
  roadmapId: string | null
  statuses: Record<string, ProgressStatus>

  load: (roadmapId: string) => Promise<void>
  toggleDone: (nodeId: string) => Promise<void>
  reset: () => void
}

export const useProgressStore = create<ProgressState>((set, get) => ({
  roadmapId: null,
  statuses: {},

  load: async (roadmapId) => {
    set({ roadmapId, statuses: {} })
    try {
      const { progress } = await api.getProgress(roadmapId)
      const statuses: Record<string, ProgressStatus> = {}
      for (const p of progress) statuses[p.nodeId] = p.status
      // Guard against a race if the roadmap changed mid-fetch.
      if (get().roadmapId === roadmapId) set({ statuses })
    } catch {
      /* leave empty on failure */
    }
  },

  toggleDone: async (nodeId) => {
    const { roadmapId, statuses } = get()
    if (!roadmapId) return
    const prev = statuses[nodeId]
    const next: ProgressStatus = prev === 'done' ? 'todo' : 'done'

    // Optimistic update.
    set({ statuses: { ...statuses, [nodeId]: next } })
    try {
      await api.setProgress(roadmapId, nodeId, next)
    } catch {
      // Revert on failure.
      set((s) => ({ statuses: { ...s.statuses, [nodeId]: prev ?? 'todo' } }))
    }
  },

  reset: () => set({ roadmapId: null, statuses: {} }),
}))
