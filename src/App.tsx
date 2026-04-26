import { useState } from 'react'
import { css } from 'styled-system/css'
import Layout from './app/layout'
import { useExecutionStore } from './stores/execution-store'
import { useEditorStore } from './stores/editor-store'

import CodeEditor from './components/editor/CodeEditor'
import FlowCanvas from './components/flowchart/FlowCanvas'
import ConsolePanel from './components/panels/ConsolePanel'
import VariablePanel from './components/panels/VariablePanel'
import Mascot from './components/Mascot'
import HelpModal from './components/HelpModal'
import { startExecution, stopExecution, pauseExecution, resumeExecution } from './lib/yaksok/runner'
import { editorInstanceRef } from './components/editor/editor-ref'

// ── 달빛약속 3원 로고 ──────────────────────────
function Logo() {
  return (
    <svg width="32" height="32" viewBox="0 0 40 40" fill="none">
      <circle cx="12" cy="14" r="7" fill="#F97316"/>
      <circle cx="28" cy="14" r="7" fill="#10B981"/>
      <circle cx="20" cy="27" r="7" fill="#818CF8"/>
    </svg>
  )
}

// ── 상태 칩 ─────────────────────────────────
const CHIP_STYLES = {
  idle:    { bg: '#F3F2FA', color: '#8B8B9E' },
  running: { bg: '#EEF0FF', color: '#4F46E5' },
  paused:  { bg: '#FEF9C3', color: '#92400E' },
  done:    { bg: '#DCFCE7', color: '#166534' },
  error:   { bg: '#FEE2E2', color: '#991B1B' },
}
const CHIP_LABEL = { idle: '대기 중', running: '실행 중', paused: '일시정지', done: '완료', error: '오류' }

function StatusChip() {
  const status = useExecutionStore((s) => s.status)
  const { bg, color } = CHIP_STYLES[status] ?? CHIP_STYLES.idle

  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      padding: '3px 10px', borderRadius: 99,
      fontSize: 11, fontWeight: 700,
      background: bg, color,
      animation: status === 'running' ? 'chipPulse 1.2s infinite' : undefined,
    }}>
      <span style={{ fontSize: 8, lineHeight: 1 }}>●</span>
      {CHIP_LABEL[status]}
    </span>
  )
}

// ── 탑 네비 ─────────────────────────────────
function TopNav({ activeNav, onNavChange, onHelp }: { activeNav: string; onNavChange: (v: string) => void; onHelp: () => void }) {
  const status = useExecutionStore((s) => s.status)
  const { executionDelay, setExecutionDelay } = useExecutionStore()
  const isRunning = status === 'running'
  const isPaused = status === 'paused'
  const isIdle = status === 'idle' || status === 'done' || status === 'error'

  // 속도 슬라이더: 0~2000ms → 0~100% 역방향 표시
  const speedPct = (100 - (executionDelay / 2000) * 100).toFixed(0)

  const navItems = ['학습하기', '순서도 실습']

  return (
    <nav style={{
      height: 52, background: '#fff',
      borderBottom: '1px solid #EEEDF8',
      display: 'flex', alignItems: 'center',
      padding: '0 20px', gap: 0,
    }}>
      {/* 로고 */}
      <a style={{ display: 'flex', alignItems: 'center', gap: 6, marginRight: 32, textDecoration: 'none' }} href="#">
        <Logo/>
        <span style={{ fontWeight: 700, fontSize: 15, color: '#1A1A2E', letterSpacing: -0.3 }}>달빛약속</span>
      </a>

      {/* 탭 */}
      <div style={{ display: 'flex', alignItems: 'stretch', height: '100%' }}>
        {navItems.map((label) => (
          <div
            key={label}
            onClick={() => onNavChange(label)}
            style={{
              display: 'flex', alignItems: 'center', padding: '0 16px',
              fontSize: 13, fontWeight: activeNav === label ? 600 : 500,
              color: activeNav === label ? '#4F46E5' : '#8B8B9E',
              borderBottom: `2px solid ${activeNav === label ? '#4F46E5' : 'transparent'}`,
              cursor: 'pointer', position: 'relative', top: 1,
              transition: 'all .15s',
            }}
          >
            {label}
          </div>
        ))}
      </div>

      {/* 오른쪽 컨트롤 */}
      <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 8 }}>
        {/* 속도 슬라이더 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ fontSize: 11, fontWeight: 600, color: '#6B6B8B', whiteSpace: 'nowrap' }}>속도</span>
          <input
            type="range" min={0} max={2000} step={100}
            value={executionDelay}
            onChange={(e) => setExecutionDelay(Number(e.target.value))}
            style={{
              WebkitAppearance: 'none', width: 88, height: 4,
              background: `linear-gradient(to right, #4F46E5 ${speedPct}%, #E0DEFF ${speedPct}%)`,
              borderRadius: 99, outline: 'none', cursor: 'pointer',
            } as React.CSSProperties}
          />
        </div>

        <button
          onClick={() => isPaused ? resumeExecution() : pauseExecution()}
          disabled={isIdle}
          className={css({ fontFamily: 'ui' })}
          style={{
            display: 'flex', alignItems: 'center', gap: 4,
            padding: '5px 10px', borderRadius: 8,
            border: '1px solid #EEEDF8', background: '#FAFAFE',
            fontSize: 12, fontWeight: 500, color: '#4B4B6B',
            cursor: isIdle ? 'not-allowed' : 'pointer',
            opacity: isIdle ? 0.4 : 1, transition: 'all .15s',
          }}
        >
          {isPaused ? '▶ 계속' : '⏸ 멈춤'}
        </button>

        <button
          onClick={stopExecution}
          disabled={isIdle}
          className={css({ fontFamily: 'ui' })}
          style={{
            display: 'flex', alignItems: 'center', gap: 4,
            padding: '5px 10px', borderRadius: 8,
            border: '1px solid #EEEDF8', background: '#FAFAFE',
            fontSize: 12, fontWeight: 500, color: '#4B4B6B',
            cursor: isIdle ? 'not-allowed' : 'pointer',
            opacity: isIdle ? 0.4 : 1,
          }}
        >⏹</button>

        <button
          onClick={() => startExecution()}
          disabled={isRunning || isPaused}
          className={css({ fontFamily: 'ui' })}
          style={{
            display: 'flex', alignItems: 'center', gap: 5,
            padding: '5px 14px', borderRadius: 8,
            border: 'none', background: '#4F46E5',
            fontSize: 12, fontWeight: 700, color: '#fff',
            cursor: isRunning || isPaused ? 'not-allowed' : 'pointer',
            opacity: isRunning || isPaused ? 0.45 : 1,
          }}
        >▶ 실행하기</button>

        <StatusChip/>

        <div style={{ width: 1, height: 20, background: '#EEEDF8', margin: '0 4px' }}/>

        {/* 도움말 버튼 */}
        <button
          onClick={onHelp}
          style={{
            display: 'flex', alignItems: 'center', gap: 5,
            padding: '5px 12px', borderRadius: 8,
            border: '1.5px solid #C4B5FD', background: '#F3F2FA',
            fontSize: 12, fontWeight: 700, color: '#4F46E5',
            cursor: 'pointer', transition: 'all .15s',
          }}
        >
          📖 사용 방법
        </button>

        <div style={{
          display: 'flex', alignItems: 'center', gap: 6,
          padding: '5px 10px', borderRadius: 8,
          border: '1px solid #EEEDF8', background: '#FAFAFE',
          fontSize: 12, fontWeight: 500, color: '#4B4B6B', cursor: 'pointer',
        }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
          </svg>
          달빛 학생
        </div>
      </div>

      <style>{`@keyframes chipPulse{0%,100%{opacity:1}50%{opacity:.6}}`}</style>
    </nav>
  )
}

// ── 카드 헤더 ────────────────────────────────
function CardHeader({ dotColor, title, meta, actions }: { dotColor: string; title: string; meta?: string; actions?: React.ReactNode }) {
  return (
    <div style={{
      height: 40, display: 'flex', alignItems: 'center',
      padding: '0 14px', gap: 8,
      borderBottom: '1px solid #F3F2FA', flexShrink: 0,
    }}>
      <span style={{ width: 7, height: 7, borderRadius: '50%', background: dotColor, flexShrink: 0 }}/>
      <span style={{ fontSize: 12, fontWeight: 700, color: '#4B4B6B', display: 'flex', alignItems: 'center', gap: 6 }}>
        {title}
      </span>
      {meta && <span style={{ marginLeft: 8, fontSize: 10, color: '#8B8B9E', fontWeight: 500 }}>{meta}</span>}
      {actions && <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 6 }}>{actions}</div>}
    </div>
  )
}

function SmallBtn({ onClick, children }: { onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={css({ fontFamily: 'ui' })}
      style={{
        fontSize: 10, padding: '3px 8px', borderRadius: 6,
        border: '1px solid #EEEDF8', background: '#FAFAFE',
        color: '#4B4B6B', cursor: 'pointer',
      }}
    >{children}</button>
  )
}

// ── App ─────────────────────────────────────
export default function App() {
  const [activeNav, setActiveNav] = useState('학습하기')
  const [helpOpen, setHelpOpen] = useState(false)
  const setCode = useEditorStore((s) => s.setCode)
  const status = useExecutionStore((s) => s.status)
  const executingLine = useEditorStore((s) => s.executingLine)
  const code = useEditorStore((s) => s.code)

  const currentLineText = executingLine != null
    ? code.split('\n')[executingLine - 1]?.trim()
    : undefined

  return (
    <>
    <Layout
      topNav={<TopNav activeNav={activeNav} onNavChange={setActiveNav} onHelp={() => setHelpOpen(true)}/>}
      mascot={<Mascot status={status} currentLine={currentLineText}/>}
      editor={
        <>
          <CardHeader
            dotColor="#4F46E5"
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
    {helpOpen && <HelpModal onClose={() => setHelpOpen(false)} />}
    </>
  )
}
