import { create } from 'zustand'

interface UIState {
  sidebarOpen: boolean
  activePanelNodeId: string | null

  openSidebar: (nodeId: string) => void
  closeSidebar: () => void
  toggleSidebar: () => void
}

export const useUIStore = create<UIState>((set) => ({
  sidebarOpen: false,
  activePanelNodeId: null,

  openSidebar: (nodeId) => set({ sidebarOpen: true, activePanelNodeId: nodeId }),
  closeSidebar: () => set({ sidebarOpen: false, activePanelNodeId: null }),
  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
}))
