import Editor, { type Monaco, type OnMount } from '@monaco-editor/react'
import { DalbitYaksokApplier, LANG_ID } from '@dalbit-yaksok/monaco-language-provider'
import { useRef, useEffect } from 'react'
import * as monaco from 'monaco-editor'
import { useEditorStore } from '../../stores/editor-store'
import { useUiStore } from '../../stores/ui-store'
import { editorInstanceRef, isProgrammaticUpdateRef } from './editor-ref'
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
    // 달빛 라이트 테마
    monacoInstance.editor.defineTheme('dalbit-light', {
      base: 'vs',
      inherit: true,
      rules: [
        { token: 'keyword', foreground: '4F46E5', fontStyle: 'bold' },
        { token: 'string', foreground: '059669' },
        { token: 'number', foreground: 'DC2626' },
      ],
      colors: {
        'editor.background': '#FFFFFF',
        'editor.foreground': '#1A1A2E',
        'editor.lineHighlightBackground': '#EEF0FF',
        'editor.selectionBackground': '#C4B5FD40',
        'editorLineNumber.foreground': '#C4B5FD',
        'editorLineNumber.activeForeground': '#4F46E5',
        'editorCursor.foreground': '#4F46E5',
        'editor.inactiveSelectionBackground': '#C4B5FD20',
      },
    })
  }

  const handleMount: OnMount = (editorInstance) => {
    editorInstanceRef.current = editorInstance
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    applier.configEditor(editorInstance as any)

    editorInstance.onDidChangeModelContent(() => {
      const newCode = editorInstance.getValue()
      // programmatic setValue(F2C)가 아닐 때만 lastEditSource를 'code'로 전환
      if (!isProgrammaticUpdateRef.current) {
        useUiStore.getState().setLastEditSource('code')
      }
      setCode(newCode)
    })
  }

  return (
    <Editor
      height="100%"
      language={LANG_ID}
      defaultValue=""
      theme="dalbit-light"
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
