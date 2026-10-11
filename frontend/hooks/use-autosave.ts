import { useEffect, useRef } from 'react'
import { useCanvasStore } from '@/store/canvas-store'
import { saveRoadmap } from '@/lib/local-db'
import { api } from '@/lib/api-client'

const DEBOUNCE_MS = 800

export type AutosaveMode = 'local' | 'cloud' | 'none'

/**
 * Debounced autosave driven by the canvas store's `isDirty` flag.
 *  - 'local' → IndexedDB (Dexie), for anonymous users.
 *  - 'cloud' → PATCH /roadmaps/:id/graph via the backend proxy, for signed-in users.
 *  - 'none'  → disabled (read-only views).
 */
export function useAutosave(mode: AutosaveMode = 'local') {
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (mode === 'none') return
    return useCanvasStore.subscribe((state) => {
      if (!state.isDirty || !state.roadmapId) return

      if (timer.current) clearTimeout(timer.current)
      timer.current = setTimeout(async () => {
        const { roadmapId, nodes, edges } = useCanvasStore.getState()
        if (!roadmapId) return
        try {
          if (mode === 'cloud') {
            await api.saveGraph(roadmapId, nodes, edges)
          } else {
            await saveRoadmap({
              id: roadmapId,
              title: 'Untitled roadmap',
              nodes,
              edges,
              createdAt: Date.now(),
              updatedAt: Date.now(),
            })
          }
          useCanvasStore.getState().markClean()
        } catch (err) {
          // Keep isDirty set so the next change retries the save.
          console.error('[autosave] failed', err)
        }
      }, DEBOUNCE_MS)
    })
  }, [mode])
}
