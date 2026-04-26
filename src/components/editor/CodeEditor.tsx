import Editor, { type Monaco, type OnMount } from '@monaco-editor/react'
import { DalbitYaksokApplier, LANG_ID } from '@dalbit-yaksok/monaco-language-provider'
import { useRef, useEffect } from 'react'
import * as monaco from 'monaco-editor'
import { useEditorStore } from '../../stores/editor-store'
import { useUiStore } from '../../stores/ui-store'
import { editorInstanceRef } from './editor-ref'
import { validateCode } from '../../lib/yaksok/validator'
import { SYNC_DEBOUNCE_MS } from '../../lib/flowchart/sync'

const applier = new DalbitYaksokApplier('')
let isLanguageRegistered = false
let highlightDecoration: string[] = []

export default function CodeEditor() {
  const setCode = useEditorStore((s) => s.setCode)
  const setErrors = useEditorStore((s) => s.setErrors)
  const executingLine = useEditorStore((s) => s.executingLine)
  const code = useEditorStore((s) => s.code)
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
        },
      },
    ])
  }, [executingLine])

  // 코드 변경 시 validate → 에러 마커 (항상 실행)
  useEffect(() => {
    const timer = setTimeout(() => {
      const editor = editorInstanceRef.current
      if (!editor) return
      const model = editor.getModel()
      if (!model) return
      const markers = validateCode(code)
      monaco.editor.setModelMarkers(model, 'yaksok-validator', markers)
      setErrors(markers)
    }, SYNC_DEBOUNCE_MS)
    return () => clearTimeout(timer)
  }, [code, setErrors])

  const handleBeforeMount = async (monacoInstance: Monaco) => {
    if (!isLanguageRegistered && !registeredRef.current) {
      registeredRef.current = true
      isLanguageRegistered = true
      await applier.register(monacoInstance.languages)
    }
  }

  const handleMount: OnMount = (editorInstance) => {
    editorInstanceRef.current = editorInstance
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    applier.configEditor(editorInstance as any)

    editorInstance.onDidChangeModelContent(() => {
      const newCode = editorInstance.getValue()
      const { lastEditSource, setLastEditSource } = useUiStore.getState()

      // 순서도 편집으로 setValue가 호출된 경우 lastEditSource 변경 안 함
      if (lastEditSource !== 'flowchart') {
        setLastEditSource('code')
      }
      setCode(newCode)
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
