import { useEffect, useRef } from 'react'
import { css } from 'styled-system/css'
import { useExecutionStore } from '../../stores/execution-store'

const S = {
  root: css({ height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }),
  header: css({
    height: '32px', display: 'flex', alignItems: 'center',
    paddingX: '3', gap: '1.5',
    borderBottom: '1px solid', borderColor: 'bgBase', flexShrink: 0,
  }),
  dot: css({ width: '6px', height: '6px', borderRadius: 'full', bg: 'nodeLoop', flexShrink: 0 }),
  title: css({ fontSize: '11px', fontWeight: '700', color: 'textMid', fontFamily: 'ui' }),
  clearBtn: css({
    marginLeft: 'auto', fontSize: '10px',
    paddingX: '1.5', paddingY: '0.5',
    borderRadius: '5px', border: '1px solid', borderColor: 'border',
    bg: 'bgSubtle', color: 'textMuted', fontFamily: 'ui', cursor: 'pointer',
  }),
  body: css({
    flex: 1, overflowY: 'auto', paddingX: '3', paddingY: '1.5',
    fontFamily: 'code', fontSize: '12px', lineHeight: '1.6',
    display: 'flex', flexDirection: 'column', gap: '0.5',
  }),
  empty: css({ color: 'textAccent', fontSize: '12px', paddingY: '0.5', fontFamily: 'ui' }),
  row: css({ display: 'flex', alignItems: 'baseline', gap: '1' }),
  bullet: css({ fontSize: '10px', flexShrink: 0, lineHeight: '1.6' }),
}

export default function ConsolePanel() {
  const consoleOutput = useExecutionStore((s) => s.consoleOutput)
  const clearRuntime = useExecutionStore((s) => s.clearRuntime)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [consoleOutput])

  return (
    <div className={S.root}>
      <div className={S.header}>
        <span className={S.dot}/>
        <span className={S.title}>실행 결과</span>
        <button className={S.clearBtn} onClick={() => clearRuntime()}>지우기</button>
      </div>

      <div className={S.body}>
        {consoleOutput.length === 0 ? (
          <span className={S.empty}>실행하면 결과가 여기 나와요</span>
        ) : (
          consoleOutput.map((line, i) => {
            const isError = line.startsWith('오류:') || line.startsWith('실행 오류:')
            return (
              <div key={i} className={S.row}>
                <span className={S.bullet} style={{ color: isError ? '#F87171' : '#C4B5FD' }}>▶</span>
                <span style={{
                  color: isError ? '#991B1B' : '#065F46',
                  fontWeight: 500, whiteSpace: 'pre-wrap', wordBreak: 'break-all',
                }}>
                  {line}
                </span>
              </div>
            )
          })
        )}
        <div ref={bottomRef}/>
      </div>
    </div>
  )
}
