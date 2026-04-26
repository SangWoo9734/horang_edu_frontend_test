import { useEffect, useRef } from 'react'
import { css } from 'styled-system/css'
import { useExecutionStore } from '../../stores/execution-store'

export default function ConsolePanel() {
  const consoleOutput = useExecutionStore((s) => s.consoleOutput)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [consoleOutput])

  return (
    <div className={css({
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      bg: 'bgPanel',
      overflow: 'hidden',
    })}>
      <div className={css({
        px: '3',
        py: '1',
        fontSize: '11px',
        color: 'textSecondary',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        flexShrink: 0,
      })}>
        실행 결과
      </div>
      <div className={css({
        flex: 1,
        overflowY: 'auto',
        p: '3',
        fontFamily: 'code',
        fontSize: '12px',
        color: 'textPrimary',
      })}>
        {consoleOutput.length === 0 ? (
          <span className={css({ color: 'textSecondary' })}>실행 결과가 여기에 표시됩니다.</span>
        ) : (
          consoleOutput.map((line, i) => {
            const isError = line.startsWith('오류:') || line.startsWith('실행 오류:')
            return (
              <div
                key={i}
                className={css({
                  lineHeight: '1.6',
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-all',
                })}
                style={{ color: isError ? '#F87171' : undefined }}
              >
                {line}
              </div>
            )
          })
        )}
        <div ref={bottomRef} />
      </div>
    </div>
  )
}
