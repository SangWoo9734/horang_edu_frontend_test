import type { editor } from 'monaco-editor'

export const editorInstanceRef: { current: editor.IStandaloneCodeEditor | null } = {
  current: null,
}

// F2C에서 programmatic setValue 중임을 표시 — onChange에서 lastEditSource 변경 막기용
export const isProgrammaticUpdateRef = { current: false }
