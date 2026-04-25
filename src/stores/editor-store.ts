import { create } from 'zustand'
import type { editor } from 'monaco-editor'

interface EditorStore {
  code: string
  errors: editor.IMarkerData[]
  executingLine: number | null
  setCode: (code: string) => void
  setErrors: (errors: editor.IMarkerData[]) => void
  setExecutingLine: (line: number | null) => void
}

export const useEditorStore = create<EditorStore>((set) => ({
  code: '',
  errors: [],
  executingLine: null,
  setCode: (code) => set({ code }),
  setErrors: (errors) => set({ errors }),
  setExecutingLine: (executingLine) => set({ executingLine }),
}))
