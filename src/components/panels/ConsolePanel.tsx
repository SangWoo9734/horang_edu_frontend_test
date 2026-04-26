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
      {/* 헤더 */}
      <div style={{
        height: 40, display: 'flex', alignItems: 'center',
        padding: '0 14px', gap: 8,
        borderBottom: '1px solid #F3F2FA', flexShrink: 0,
      }}>
        <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#10B981', flexShrink: 0 }}/>
        <span style={{ fontSize: 12, fontWeight: 700, color: '#4B4B6B' }}>실행 결과</span>
        <div style={{ marginLeft: 'auto' }}>
          <button
            onClick={() => clearRuntime()}
            style={{
              fontSize: 10, padding: '3px 8px', borderRadius: 6,
              border: '1px solid #EEEDF8', background: '#FAFAFE',
              color: '#4B4B6B', cursor: 'pointer',
            }}
          >지우기</button>
        </div>
      </div>

      {/* 출력 */}
      <div style={{
        flex: 1, overflowY: 'auto', padding: '8px 12px',
        fontFamily: "'JetBrains Mono', monospace",
        fontSize: 11.5, lineHeight: 1.7,
      }}>
        {consoleOutput.length === 0 ? (
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 7 }}>
            <span style={{ color: '#A78BFA', fontSize: 12, flexShrink: 0, marginTop: 1 }}>📌</span>
            <span style={{ color: '#5B21B6' }}>실행 결과가 여기에 나와요!</span>
          </div>
        ) : (
          consoleOutput.map((line, i) => {
            const isError = line.startsWith('오류:') || line.startsWith('실행 오류:')
            return (
              <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 7 }}>
                <span style={{ fontSize: 12, flexShrink: 0, marginTop: 1 }}>
                  {isError ? '❗' : '💬'}
                </span>
                <span style={{ color: isError ? '#991B1B' : '#065F46', fontWeight: isError ? 500 : 500, whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
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
