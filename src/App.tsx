import { css } from 'styled-system/css'
import Layout from './app/layout'
import { useExecutionStore } from './stores/execution-store'
import { useEditorStore } from './stores/editor-store'
import CodeEditor from './components/editor/CodeEditor'
import FlowCanvas from './components/flowchart/FlowCanvas'
import ConsolePanel from './components/panels/ConsolePanel'
import VariablePanel from './components/panels/VariablePanel'
import {
  startExecution,
  stopExecution,
  pauseExecution,
  resumeExecution,
} from './lib/yaksok/runner'
import { editorInstanceRef } from './components/editor/editor-ref'

function Header() {
  const status = useExecutionStore((s) => s.status)
  const isRunning = status === 'running'
  const isPaused = status === 'paused'
  const isIdle = status === 'idle' || status === 'done' || status === 'error'

  const handleRun = () => { startExecution() }
  const handlePauseResume = () => { isPaused ? resumeExecution() : pauseExecution() }
  const handleStop = () => { stopExecution() }

  return (
    <div className={css({ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' })}>
      <span className={css({ fontWeight: 'bold', fontSize: '16px', color: 'primary' })}>
        🌙 달빛흐름
      </span>
      <div className={css({ display: 'flex', gap: '2' })}>
        <button disabled={isRunning || isPaused} onClick={handleRun} className={btnStyle(isRunning || isPaused)}>
          ▶ 실행
        </button>
        <button disabled={isIdle} onClick={handlePauseResume} className={btnStyle(isIdle)}>
          {isPaused ? '▶ 재개' : '⏸ 일시정지'}
        </button>
        <button disabled={isIdle} onClick={handleStop} className={btnStyle(isIdle)}>
          ⏹ 정지
        </button>
      </div>
    </div>
  )
}

function Footer() {
  const { executionDelay, setExecutionDelay } = useExecutionStore()

  return (
    <div className={css({ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', gap: '4' })}>
      <div className={css({ display: 'flex', alignItems: 'center', gap: '3' })}>
        <span className={css({ fontSize: '12px', color: 'textSecondary', whiteSpace: 'nowrap' })}>
          실행 속도
        </span>
        <input
          type="range"
          min={0}
          max={2000}
          step={100}
          value={executionDelay}
          onChange={(e) => setExecutionDelay(Number(e.target.value))}
          className={css({ cursor: 'pointer', accentColor: 'var(--colors-primary)' })}
          style={{ width: '120px' }}
        />
        <span className={css({ fontSize: '12px', color: 'textSecondary', minWidth: '40px' })}>
          {executionDelay === 0 ? '최대' : `${(executionDelay / 1000).toFixed(1)}초`}
        </span>
      </div>
      <ExampleDropdown />
    </div>
  )
}

function ExampleDropdown() {
  const setCode = useEditorStore((s) => s.setCode)

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value
    if (!value) return
    // Phase 7에서 examples.ts 완성 후 연결 예정
    const code = EXAMPLES[value] ?? ''
    setCode(code)
    editorInstanceRef.current?.setValue(code)
    e.target.value = ''
  }

  return (
    <select
      onChange={handleChange}
      defaultValue=""
      className={css({
        bg: 'bgPanel',
        color: 'textSecondary',
        border: '1px solid rgba(255,255,255,0.15)',
        borderRadius: '4px',
        px: '2',
        py: '1',
        fontSize: '12px',
        cursor: 'pointer',
      })}
    >
      <option value="" disabled>예제 코드 ▾</option>
      <option value="hello">기본 출력</option>
      <option value="age-check">변수와 조건문</option>
      <option value="sum-loop">반복문 합계</option>
    </select>
  )
}

// 임시 예제 (Phase 7에서 examples.ts로 이동)
const EXAMPLES: Record<string, string> = {
  'hello': '"안녕하세요!" 보여주기',
  'age-check': `나이 = 20
만약 나이 >= 18 이면
\t"성인입니다" 보여주기
아니면
\t"미성년자입니다" 보여주기`,
  'sum-loop': `합계 = 0
반복 10번
\t합계 = 합계 + 1
합계 보여주기`,
}

const btnStyle = (disabled: boolean) =>
  css({
    px: '3',
    py: '1',
    fontSize: '12px',
    borderRadius: '4px',
    border: '1px solid',
    borderColor: disabled ? 'rgba(255,255,255,0.1)' : 'primary',
    bg: 'transparent',
    color: disabled ? 'textSecondary' : 'primary',
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.5 : 1,
  })

export default function App() {
  return (
    <Layout
      header={<Header />}
      editor={<CodeEditor />}
      flowchart={<FlowCanvas />}
      console={<ConsolePanel />}
      variables={<VariablePanel />}
      footer={<Footer />}
    />
  )
}
