import { CodeFile } from '@dalbit-yaksok/core'
import type { editor } from 'monaco-editor'

export function validateCode(code: string): editor.IMarkerData[] {
  if (!code.trim()) return []

  try {
    const codeFile = new CodeFile(code, 'main')
    const { errors } = codeFile.validate()

    return errors.map((err) => ({
      severity: 8, // monaco.MarkerSeverity.Error
      message: err.message,
      startLineNumber: err.position?.line ?? 1,
      startColumn: err.position?.column ?? 1,
      endLineNumber: err.position?.line ?? 1,
      endColumn: (err.position?.column ?? 1) + 1,
    }))
  } catch {
    return []
  }
}
