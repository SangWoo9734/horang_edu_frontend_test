import type { editor } from 'monaco-editor'

export const editorInstanceRef: { current: editor.IStandaloneCodeEditor | null } = {
  current: null,
}
