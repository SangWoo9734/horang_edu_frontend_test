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
    paddingX: '2', paddingY: '0.5',
    bg: 'bgSubtle', borderRadius: '6px',
    border: '1px solid', borderColor: 'border',
    gap: '1.5', minWidth: 0,
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
    maxWidth: '140px',
  }),
}

export default function VariablePanel() {
  const variables = useExecutionStore((s) => s.variables)
  const entries = Object.entries(variables)

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
            <div key={name} className={S.varRow}>
              <span className={S.varName}>{name}</span>
              <span className={S.varEq}>=</span>
              <span className={S.varValue}>{String(value)}</span>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
