import { useEffect, useRef } from 'react'
import { useExecutionStore } from '../../stores/execution-store'

export default function ConsolePanel() {
  const consoleOutput = useExecutionStore((s) => s.consoleOutput)
  const clearRuntime = useExecutionStore((s) => s.clearRuntime)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [consoleOutput])

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <div style={{
        height: 32, display: 'flex', alignItems: 'center',
        padding: '0 12px', gap: 6,
        borderBottom: '1px solid #F3F2FA', flexShrink: 0,
      }}>
        <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#10B981', flexShrink: 0 }}/>
        <span style={{ fontSize: 11, fontWeight: 700, color: '#4B4B6B' }}>실행 결과</span>
        <button
          onClick={() => clearRuntime()}
          style={{
            marginLeft: 'auto',
            fontSize: 10, padding: '2px 7px', borderRadius: 5,
            border: '1px solid #EEEDF8', background: '#FAFAFE',
            color: '#8B8B9E', cursor: 'pointer',
          }}
        >지우기</button>
      </div>

      <div style={{
        flex: 1, overflowY: 'auto', padding: '5px 12px',
        fontFamily: "'JetBrains Mono', monospace",
        fontSize: 12, lineHeight: 1.6,
        display: 'flex', flexDirection: 'column', gap: 1,
      }}>
        {consoleOutput.length === 0 ? (
          <span style={{ color: '#C4B5FD', fontSize: 12, padding: '2px 0' }}>
            실행하면 결과가 여기 나와요
          </span>
        ) : (
          consoleOutput.map((line, i) => {
            const isError = line.startsWith('오류:') || line.startsWith('실행 오류:')
            return (
              <div key={i} style={{ display: 'flex', alignItems: 'baseline', gap: 5 }}>
                <span style={{ color: isError ? '#EF4444' : '#A78BFA', fontSize: 10, flexShrink: 0, lineHeight: 1.6 }}>▶</span>
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
