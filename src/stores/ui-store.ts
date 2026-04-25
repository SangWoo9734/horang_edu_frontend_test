import { create } from 'zustand'

type EditSource = 'code' | 'flowchart' | 'none'

interface UiStore {
  lastEditSource: EditSource
  isSyncing: boolean
  modalOpen: boolean
  modalNodeId: string | null
  setLastEditSource: (src: EditSource) => void
  setIsSyncing: (v: boolean) => void
  openModal: (nodeId: string | null) => void
  closeModal: () => void
}

export const useUiStore = create<UiStore>((set) => ({
  lastEditSource: 'none',
  isSyncing: false,
  modalOpen: false,
  modalNodeId: null,
  setLastEditSource: (lastEditSource) => set({ lastEditSource }),
  setIsSyncing: (isSyncing) => set({ isSyncing }),
  openModal: (modalNodeId) => set({ modalOpen: true, modalNodeId }),
  closeModal: () => set({ modalOpen: false, modalNodeId: null }),
}))
