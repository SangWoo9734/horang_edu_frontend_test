import Editor, { type Monaco, type OnMount } from '@monaco-editor/react'
import { DalbitYaksokApplier, LANG_ID } from '@dalbit-yaksok/monaco-language-provider'
import { useRef } from 'react'
import type { editor } from 'monaco-editor'
import { useEditorStore } from '../../stores/editor-store'

// Monaco 언어 등록은 한 번만
const applier = new DalbitYaksokApplier('')
let isLanguageRegistered = false

// 외부(sync 등)에서 에디터 내용을 직접 제어하기 위한 ref export
export const editorInstanceRef: { current: editor.IStandaloneCodeEditor | null } = {
  current: null,
}

export default function CodeEditor() {
  const setCode = useEditorStore((s) => s.setCode)
  const registeredRef = useRef(false)

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
