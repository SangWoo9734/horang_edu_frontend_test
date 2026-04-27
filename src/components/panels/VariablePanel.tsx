import { useEffect, useRef, useState } from 'react'
import { css } from 'styled-system/css'
import { useExecutionStore } from '../../stores/execution-store'

const S = {
  root: css({ height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }),
  header: css({
    height: '32px', display: 'flex', alignItems: 'center',
    paddingX: '3', gap: '1.5',
    borderBottom: '1px solid', borderColor: 'bgBase', flexShrink: 0,
  }),
  dot: css({ width: '6px', height: '6px', borderRadius: 'full', bg: 'nodeDecision', flexShrink: 0 }),
  title: css({ fontSize: '11px', fontWeight: '700', color: 'textMid', fontFamily: 'ui' }),
  body: css({
    flex: 1, overflowY: 'auto',
    padding: '1', display: 'flex', flexDirection: 'column', gap: '0.5',
  }),
  empty: css({ color: 'textAccent', fontSize: '12px', padding: '1.5', fontFamily: 'ui' }),
  varRow: css({
    display: 'flex', alignItems: 'center',
    paddingX: '2', paddingY: '1',
    bg: 'bgSubtle', borderRadius: '6px',
    border: '1px solid', borderColor: 'border',
    gap: '1.5', minWidth: 0,
    transition: 'background 0.2s',
  }),
  varName: css({
    color: 'primary', fontFamily: 'code',
    fontSize: '12px', fontWeight: '700', flexShrink: 0,
  }),
  varEq: css({ color: 'accent', fontSize: '12px', flexShrink: 0 }),
  varValue: css({
    color: 'nodeDecision', fontFamily: 'code',
    fontSize: '12px', fontWeight: '600',
    marginLeft: 'auto',
    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
    maxWidth: '180px',
  }),
}

export default function VariablePanel() {
  const variables = useExecutionStore((s) => s.variables)
  const entries = Object.entries(variables)

  // 이전 값과 비교해서 방금 바뀐 변수 이름 추적
  const prevRef = useRef<Record<string, unknown>>({})
  const [changed, setChanged] = useState<Set<string>>(new Set())

  useEffect(() => {
    const prev = prevRef.current
    const justChanged = new Set<string>()
    for (const [name, value] of Object.entries(variables)) {
      if (prev[name] !== value) justChanged.add(name)
    }
    prevRef.current = { ...variables }
    if (justChanged.size === 0) return

    // 다음 틱에 상태 변경 — effect 내 동기 setState 방지
    const showTimer = setTimeout(() => setChanged(justChanged), 0)
    const hideTimer = setTimeout(() => setChanged(new Set()), 650)
    return () => { clearTimeout(showTimer); clearTimeout(hideTimer) }
  }, [variables])

  return (
    <div className={S.root}>
      <div className={S.header}>
        <span className={S.dot}/>
        <span className={S.title}>변수 현황판</span>
      </div>

      <div className={S.body}>
        {entries.length === 0 ? (
          <span className={S.empty}>실행하면 변수가 여기 나타나요</span>
        ) : (
          entries.map(([name, value]) => (
            <div
              key={name}
              className={S.varRow}
              style={changed.has(name) ? {
                background: '#FEF9C3',
                borderColor: '#FDE047',
              } : undefined}
            >
              <span className={S.varName}>{name}</span>
              <span className={S.varEq}>=</span>
              <span
                className={S.varValue}
                style={changed.has(name) ? { color: '#92400E', fontWeight: 800 } : undefined}
              >
                {String(value)}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
