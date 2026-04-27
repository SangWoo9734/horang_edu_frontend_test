import { useState, useCallback } from 'react'
import Layout from './app/layout'
import { useExecutionStore } from './stores/execution-store'
import { useEditorStore } from './stores/editor-store'
import CodeEditor from './components/editor/CodeEditor'
import FlowCanvas from './components/flowchart/FlowCanvas'
import ConsolePanel from './components/panels/ConsolePanel'
import VariablePanel from './components/panels/VariablePanel'
import Mascot from './components/Mascot'
import HelpModal from './components/HelpModal'
import TopNav, { SyncBadge } from './components/nav/TopNav'
import { CardHeader, SmallBtn } from './components/ui/CardHeader'
import { editorInstanceRef } from './components/editor/editor-ref'

export default function App() {
  const [helpOpen, setHelpOpen] = useState(() => {
    return !localStorage.getItem('dalbit-help-seen')
  })

  const handleCloseHelp = useCallback(() => {
    localStorage.setItem('dalbit-help-seen', '1')
    setHelpOpen(false)
  }, [])
  const setCode = useEditorStore((s) => s.setCode)

  const handleSelectExample = useCallback((code: string) => {
    setCode(code)
    editorInstanceRef.current?.setValue(code)
  }, [setCode])

  const status = useExecutionStore((s) => s.status)
  const executingLine = useEditorStore((s) => s.executingLine)
  const code = useEditorStore((s) => s.code)

  const currentLineText = executingLine != null
    ? code.split('\n')[executingLine - 1]?.trim()
    : undefined

  return (
    <>
      <Layout
        topNav={<TopNav onHelp={() => setHelpOpen(true)} onSelectExample={handleSelectExample}/>}
        syncBadge={<SyncBadge/>}
        mascot={<Mascot status={status} currentLine={currentLineText}/>}
        editor={
          <>
            <CardHeader
              dotColor="#706EEB"
              title="코드 작성"
              actions={<SmallBtn onClick={() => { setCode(''); editorInstanceRef.current?.setValue('') }}>초기화</SmallBtn>}
            />
            <CodeEditor/>
          </>
        }
        flowchart={<FlowCanvas/>}
        console={<ConsolePanel/>}
        variables={<VariablePanel/>}
      />
      {helpOpen && <HelpModal onClose={handleCloseHelp}/>}
    </>
  )
}
