import { css } from 'styled-system/css'
import Layout from './app/layout'
import { useExecutionStore } from './stores/execution-store'
import CodeEditor from './components/editor/CodeEditor'

function Header() {
  const { status, setStatus } = useExecutionStore()
  const isRunning = status === 'running'
  const isPaused = status === 'paused'
  const isIdle = status === 'idle' || status === 'done' || status === 'error'

  return (
    <div className={css({ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' })}>
      <span className={css({ fontFamily: 'ui', fontWeight: 'bold', fontSize: '16px', color: 'primary' })}>
        🌙 달빛흐름
      </span>
      <div className={css({ display: 'flex', gap: '2' })}>
        <button
          disabled={isRunning || isPaused}
          onClick={() => setStatus('running')}
          className={btnStyle(isRunning || isPaused)}
        >
          ▶ 실행
        </button>
        <button
          disabled={isIdle}
          onClick={() => setStatus(isPaused ? 'running' : 'paused')}
          className={btnStyle(isIdle)}
        >
          {isPaused ? '▶ 재개' : '⏸ 일시정지'}
        </button>
        <button
          disabled={isIdle}
          onClick={() => setStatus('idle')}
          className={btnStyle(isIdle)}
        >
          ⏹ 정지
        </button>
      </div>
    </div>
  )
}

function Placeholder({ label }: { label: string }) {
  return (
    <div className={css({
      width: '100%',
      height: '100%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: 'textSecondary',
      fontSize: '13px',
      fontFamily: 'ui',
    })}>
      {label}
    </div>
  )
}

function Footer() {
  return (
    <div className={css({ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' })}>
      <span className={css({ fontSize: '12px', color: 'textSecondary' })}>실행 속도: —</span>
      <span className={css({ fontSize: '12px', color: 'textSecondary' })}>예제 코드 ▾</span>
    </div>
  )
}

const btnStyle = (disabled: boolean) =>
  css({
    px: '3',
    py: '1',
    fontSize: '12px',
    fontFamily: 'ui',
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
      flowchart={<Placeholder label="순서도 캔버스 (React Flow)" />}
      console={<Placeholder label="실행 결과 콘솔" />}
      variables={<Placeholder label="변수 상태" />}
      footer={<Footer />}
    />
  )
}
