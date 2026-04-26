import Editor, { type Monaco, type OnMount } from '@monaco-editor/react'
import { DalbitYaksokApplier, LANG_ID } from '@dalbit-yaksok/monaco-language-provider'
import { useRef, useEffect } from 'react'
import * as monaco from 'monaco-editor'
import { useEditorStore } from '../../stores/editor-store'
import { editorInstanceRef } from './editor-ref'

// Monaco 언어 등록은 한 번만
const applier = new DalbitYaksokApplier('')
let isLanguageRegistered = false

let highlightDecoration: string[] = []

export default function CodeEditor() {
  const setCode = useEditorStore((s) => s.setCode)
  const executingLine = useEditorStore((s) => s.executingLine)
  const registeredRef = useRef(false)

  // 실행 중인 줄 하이라이트
  useEffect(() => {
    const editor = editorInstanceRef.current
    if (!editor) return

    if (executingLine == null) {
      highlightDecoration = editor.deltaDecorations(highlightDecoration, [])
      return
    }

    highlightDecoration = editor.deltaDecorations(highlightDecoration, [
      {
        range: new monaco.Range(executingLine, 1, executingLine, 1),
        options: {
          isWholeLine: true,
          className: 'executing-line-highlight',
          glyphMarginClassName: 'executing-line-glyph',
        },
      },
    ])
  }, [executingLine])

  const handleBeforeMount = async (monaco: Monaco) => {
    if (!isLanguageRegistered && !registeredRef.current) {
      registeredRef.current = true
      isLanguageRegistered = true
      await applier.register(monaco.languages)
    }
  }

  const handleMount: OnMount = (editorInstance) => {
    editorInstanceRef.current = editorInstance
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    applier.configEditor(editorInstance as any)

    editorInstance.onDidChangeModelContent(() => {
      setCode(editorInstance.getValue())
    })
  }

  return (
    <Editor
      height="100%"
      language={LANG_ID}
      defaultValue=""
      theme="vs-dark"
      beforeMount={handleBeforeMount}
      onMount={handleMount}
      options={{
        fontFamily: "'JetBrains Mono', monospace",
        fontSize: 14,
        minimap: { enabled: false },
        scrollBeyondLastLine: false,
        lineNumbers: 'on',
        wordWrap: 'on',
        automaticLayout: true,
        padding: { top: 12 },
      }}
    />
  )
}
