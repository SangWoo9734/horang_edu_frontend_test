import { useState, useEffect, useRef, useCallback } from 'react'
import { css } from 'styled-system/css'
import Layout from './app/layout'
import { useExecutionStore } from './stores/execution-store'
import { useEditorStore } from './stores/editor-store'
import { useUiStore } from './stores/ui-store'

import { EXAMPLES } from './data/examples'
import CodeEditor from './components/editor/CodeEditor'
import FlowCanvas from './components/flowchart/FlowCanvas'
import ConsolePanel from './components/panels/ConsolePanel'
import VariablePanel from './components/panels/VariablePanel'
import Mascot from './components/Mascot'
import HelpModal from './components/HelpModal'
import { startExecution, startStepExecution, stopExecution, pauseExecution, resumeExecution, stepNext } from './lib/yaksok/runner'
import { editorInstanceRef } from './components/editor/editor-ref'

// ── 공통 스타일 ──────────────────────────────
const S = {
  nav: css({
    height: '52px', bg: 'white',
    borderBottom: '1px solid', borderColor: 'border',
    display: 'flex', alignItems: 'center',
    paddingX: '5',
  }),
  logoLink: css({
    display: 'flex', alignItems: 'center', gap: '1.5',
    marginRight: '8', textDecoration: 'none',
  }),
  logoText: css({
    fontWeight: '700', fontSize: '15px',
    color: 'textPrimary', letterSpacing: '-0.3px',
    fontFamily: 'ui',
  }),
  navRight: css({
    marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '2',
  }),
  speedLabel: css({
    fontSize: '11px', fontWeight: '600',
    color: 'textSub', whiteSpace: 'nowrap', fontFamily: 'ui',
  }),
  speedBtn: css({
    paddingX: '2.5', paddingY: '1',
    borderRadius: '8px', border: '1.5px solid', borderColor: 'border',
    bg: 'bgSubtle', color: 'textSub',
    fontSize: '11px', fontWeight: '600', fontFamily: 'ui',
    cursor: 'pointer', transition: 'all 0.15s',
  }),
  speedBtnActive: css({
    paddingX: '2.5', paddingY: '1',
    borderRadius: '8px', border: '1.5px solid', borderColor: 'primary',
    bg: 'primaryLight', color: 'primary',
    fontSize: '11px', fontWeight: '700', fontFamily: 'ui',
    cursor: 'pointer', transition: 'all 0.15s',
  }),
  ghostBtn: css({
    display: 'flex', alignItems: 'center', gap: '1',
    paddingX: '2.5', paddingY: '1.5',
    borderRadius: '8px',
    border: '1px solid', borderColor: 'border',
    bg: 'bgSubtle', fontSize: '12px', fontWeight: '500',
    color: 'textMid', fontFamily: 'ui', cursor: 'pointer',
  }),
  primaryBtn: css({
    display: 'flex', alignItems: 'center', gap: '1.5',
    paddingX: '3.5', paddingY: '1.5',
    borderRadius: '8px', border: 'none',
    bg: 'primary', fontSize: '12px', fontWeight: '700',
    color: 'white', fontFamily: 'ui', cursor: 'pointer',
  }),
  divider: css({
    width: '1px', height: '20px',
    bg: 'border', marginX: '1',
  }),
  btnGroup: css({
    display: 'flex', alignItems: 'center',
    border: '1px solid', borderColor: 'border',
    borderRadius: '10px', overflow: 'hidden',
    bg: 'bgSubtle',
  }),
  helpBtn: css({
    display: 'flex', alignItems: 'center', gap: '1.5',
    paddingX: '3', paddingY: '1.5', borderRadius: '8px',
    border: '1.5px solid', borderColor: 'accent',
    bg: 'bgBase', fontSize: '12px', fontWeight: '700',
    color: 'primary', fontFamily: 'ui', cursor: 'pointer',
  }),
  userBadge: css({
    display: 'flex', alignItems: 'center', gap: '1.5',
    paddingX: '2.5', paddingY: '1.5', borderRadius: '8px',
    border: '1px solid', borderColor: 'border',
    bg: 'bgSubtle', fontSize: '12px', fontWeight: '500',
    color: 'textMid', fontFamily: 'ui',
  }),
  cardHeader: css({
    height: '40px', display: 'flex', alignItems: 'center',
    paddingX: '3.5', gap: '2',
    borderBottom: '1px solid', borderColor: 'bgBase',
    flexShrink: '0',
  }),
  cardTitle: css({
    fontSize: '12px', fontWeight: '700',
    color: 'textMid', fontFamily: 'ui',
    display: 'flex', alignItems: 'center', gap: '1.5',
  }),
  cardActions: css({
    marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '1.5',
  }),
  smallBtn: css({
    fontSize: '10px', paddingX: '2', paddingY: '0.5',
    borderRadius: '6px', border: '1px solid', borderColor: 'border',
    bg: 'bgSubtle', color: 'textMid', fontFamily: 'ui', cursor: 'pointer',
  }),
  syncBadgeWrap: css({
    position: 'absolute', left: '50%', top: '50%',
    transform: 'translate(-50%, -50%)',
    zIndex: '10', pointerEvents: 'none',
    transition: 'opacity 0.25s ease',
  }),
  syncBadge: css({
    bg: 'primary', color: 'white',
    fontSize: '11px', fontWeight: '700',
    paddingX: '3.5', paddingY: '1.5',
    borderRadius: '99px', whiteSpace: 'nowrap',
    boxShadow: '0 4px 16px token(colors.primary)/35',
    display: 'flex', alignItems: 'center', gap: '1.5',
    letterSpacing: '0.2px', fontFamily: 'ui',
  }),
  dropdownWrap: css({ position: 'relative' }),
  dropdownMenu: css({
    position: 'absolute', top: 'calc(100% + 6px)', left: '0',
    bg: 'white', border: '1.5px solid', borderColor: 'border',
    borderRadius: '10px', boxShadow: '0 8px 24px token(colors.primary)/6',
    minWidth: '200px', zIndex: '50', overflow: 'hidden',
  }),
  dropdownItem: css({
    padding: '9px 14px', fontSize: '12px', fontWeight: '500',
    color: 'textPrimary', cursor: 'pointer', fontFamily: 'ui',
    borderBottom: '1px solid', borderColor: 'bgBase',
    _hover: { bg: 'bgBase' },
    transition: 'background 0.1s',
  }),
}

// ── 달빛약속 로고 ─────────────────────────────
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
const chipBase = css({
  display: 'inline-flex', alignItems: 'center', gap: '1',
  paddingX: '2.5', paddingY: '0.5',
  borderRadius: '99px', fontSize: '11px', fontWeight: '700',
  fontFamily: 'ui',
})
const CHIP_STYLES = {
  idle:     { bg: 'token(colors.bgBase)',   color: 'token(colors.textMuted)' },
  running:  { bg: 'token(colors.bgActive)', color: 'token(colors.primary)' },
  stepping: { bg: '#EDE9FE',               color: '#6D28D9' },
  paused:   { bg: '#FEF9C3',               color: '#92400E' },
  done:     { bg: '#DCFCE7',               color: '#166534' },
  error:    { bg: '#FEE2E2',               color: '#991B1B' },
}
const CHIP_LABEL = { idle: '대기 중', running: '실행 중', stepping: '단계별', paused: '일시정지', done: '완료', error: '오류' }

function StatusChip() {
  const status = useExecutionStore((s) => s.status)
  const { bg, color } = CHIP_STYLES[status] ?? CHIP_STYLES.idle
  return (
    <span
      className={chipBase}
      style={{
        background: bg, color,
        animation: status === 'running' ? 'chipPulse 1.2s infinite' : undefined,
      }}
    >
      <span style={{ fontSize: 8, lineHeight: 1 }}>●</span>
      {CHIP_LABEL[status]}
    </span>
  )
}

// ── 동기화 방향 배지 ─────────────────────────
function SyncBadge() {
  const lastEditSource = useUiStore((s) => s.lastEditSource)
  const [visible, setVisible] = useState(false)
  const [dir, setDir] = useState<'c2f' | 'f2c'>('c2f')
  const prevRef = useRef(lastEditSource)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (lastEditSource === prevRef.current || lastEditSource === 'none') return
    prevRef.current = lastEditSource
    setDir(lastEditSource === 'code' ? 'c2f' : 'f2c')
    setVisible(true)
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => setVisible(false), 1500)
  }, [lastEditSource])

  return (
    <div className={S.syncBadgeWrap} style={{ opacity: visible ? 1 : 0 }}>
      <div className={S.syncBadge}>
        {dir === 'c2f' ? '코드 → 순서도' : '순서도 → 코드'}
      </div>
    </div>
  )
}

// ── 예제 드롭다운 ────────────────────────────
function ExampleDropdown({ onSelect }: { onSelect: (code: string) => void }) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  return (
    <div ref={ref} className={S.dropdownWrap}>
      <button className={S.ghostBtn} onClick={() => setOpen((v) => !v)}>
        예제 코드 {open ? '▴' : '▾'}
      </button>
      {open && (
        <div className={S.dropdownMenu}>
          {EXAMPLES.map((ex) => (
            <div
              key={ex.id}
              className={S.dropdownItem}
              onClick={() => { onSelect(ex.code); setOpen(false) }}
            >
              {ex.title}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ── 탑 네비 ─────────────────────────────────
function TopNav({ onHelp, onSelectExample }: { onHelp: () => void; onSelectExample: (code: string) => void }) {
  const status = useExecutionStore((s) => s.status)
  const isStepMode = useExecutionStore((s) => s.isStepMode)
  const { executionDelay, setExecutionDelay } = useExecutionStore()
  const isPaused = status === 'paused'
  const isStepping = status === 'stepping'
  const isIdle = status === 'idle' || status === 'done' || status === 'error'
  const isActive = !isIdle
  const SPEED_STEPS = [
    { label: '느림', delay: 1500 },
    { label: '보통', delay: 700 },
    { label: '빠름', delay: 300 },
    { label: '매우빠름', delay: 80 },
  ]

  return (
    <nav className={S.nav}>
      <a className={S.logoLink} href="#">
        <Logo/>
        <span className={S.logoText}>달빛흐름</span>
        <span className={css({ fontSize: '10px', color: 'textMuted', fontFamily: 'ui', fontWeight: '500', marginLeft: '0.5' })}>
          코드 ↔ 순서도 디버거
        </span>
      </a>

      <div className={S.navRight}>

        {/* ① 속도 그룹 */}
        {!isStepMode && (
          <>
            <span className={S.speedLabel}>속도</span>
            <div className={S.btnGroup}>
              {SPEED_STEPS.map(({ label, delay }, i) => (
                <button
                  key={label}
                  type="button"
                  className={executionDelay === delay ? S.speedBtnActive : S.speedBtn}
                  onClick={() => setExecutionDelay(delay)}
                  style={{ borderRadius: 0, border: 'none', borderLeft: i === 0 ? 'none' : '1px solid #EEEDF8' }}
                >
                  {label}
                </button>
              ))}
            </div>
            <div className={S.divider}/>
          </>
        )}

        {/* ② 제어 그룹 */}
        <div className={S.btnGroup}>
          {isStepping && (
            <button
              className={S.ghostBtn}
              onClick={() => stepNext()}
              style={{ borderRadius: 0, border: 'none', background: '#EDE9FE', color: '#6D28D9', fontWeight: 700 }}
            >⏭ 다음</button>
          )}
          {!isStepMode && (
            <button
              className={S.ghostBtn}
              onClick={() => isPaused ? resumeExecution() : pauseExecution()}
              disabled={isIdle}
              style={{ borderRadius: 0, border: 'none', opacity: isIdle ? 0.4 : 1 }}
            >
              {isPaused ? '▶ 계속' : '⏸ 멈춤'}
            </button>
          )}
          <button
            className={S.ghostBtn}
            onClick={stopExecution}
            disabled={isIdle}
            style={{ borderRadius: 0, border: 'none', borderLeft: '1px solid #EEEDF8', opacity: isIdle ? 0.4 : 1 }}
          >⏹ 정지</button>
        </div>

        <div className={S.divider}/>

        {/* ③ 실행 시작 그룹 */}
        <button
          className={S.primaryBtn}
          onClick={() => startStepExecution()}
          disabled={isActive}
          style={{ opacity: isActive ? 0.45 : 1, background: '#7C3AED', cursor: isActive ? 'not-allowed' : 'pointer' }}
        >⏭ 단계별</button>
        <button
          className={S.primaryBtn}
          onClick={() => startExecution()}
          disabled={isActive}
          style={{ opacity: isActive ? 0.45 : 1, cursor: isActive ? 'not-allowed' : 'pointer' }}
        >▶ 실행하기</button>

        <StatusChip/>

        <div className={S.divider}/>

        <ExampleDropdown onSelect={onSelectExample} />

        <button className={S.helpBtn} onClick={onHelp}>
          📖 사용 방법
        </button>

        <div className={S.userBadge}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
          </svg>
          달빛흐름
        </div>
      </div>

      <style>{`@keyframes chipPulse{0%,100%{opacity:1}50%{opacity:.6}}`}</style>
    </nav>
  )
}

// ── 카드 헤더 ────────────────────────────────
function CardHeader({ dotColor, title, meta, actions }: {
  dotColor: string; title: string; meta?: string; actions?: React.ReactNode
}) {
  return (
    <div className={S.cardHeader}>
      <span style={{ width: 7, height: 7, borderRadius: '50%', background: dotColor, flexShrink: 0 }}/>
      <span className={S.cardTitle}>{title}</span>
      {meta && (
        <span className={css({ marginLeft: '2', fontSize: '10px', color: 'textMuted', fontWeight: '500', fontFamily: 'ui' })}>
          {meta}
        </span>
      )}
      {actions && <div className={S.cardActions}>{actions}</div>}
    </div>
  )
}

function SmallBtn({ onClick, children }: { onClick: () => void; children: React.ReactNode }) {
  return (
    <button className={S.smallBtn} onClick={onClick}>{children}</button>
  )
}

// ── App ─────────────────────────────────────
export default function App() {
  const [helpOpen, setHelpOpen] = useState(false)
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
              dotColor="token(colors.primary)"
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
