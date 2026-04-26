import { useExecutionStore } from '../../stores/execution-store'

export default function VariablePanel() {
  const variables = useExecutionStore((s) => s.variables)
  const entries = Object.entries(variables)

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      {/* 헤더 */}
      <div style={{
        height: 40, display: 'flex', alignItems: 'center',
        padding: '0 14px', gap: 8,
        borderBottom: '1px solid #F3F2FA', flexShrink: 0,
      }}>
        <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#F59E0B', flexShrink: 0 }}/>
        <span style={{ fontSize: 12, fontWeight: 700, color: '#4B4B6B' }}>변수 현황판</span>
      </div>

      {/* 변수 목록 */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '6px 8px', display: 'flex', flexDirection: 'column', gap: 4 }}>
        {entries.length === 0 ? (
          <div style={{ color: '#C4B5FD', fontSize: 11, padding: '2px 8px', fontWeight: 500 }}>
            실행하면 변수가 여기 나타나요!
          </div>
        ) : (
          entries.map(([name, value]) => (
            <div key={name} style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '5px 10px',
              background: '#FAFAFE',
              borderRadius: 8,
              border: '1.5px solid #EEEDF8',
            }}>
              <span style={{ color: '#4F46E5', fontFamily: "'JetBrains Mono', monospace", fontSize: 11, fontWeight: 700 }}>
                {name}
              </span>
              <span style={{ color: '#C4B5FD', fontSize: 11 }}>=</span>
              <span style={{ color: '#F59E0B', fontFamily: "'JetBrains Mono', monospace", fontSize: 12, fontWeight: 700, marginLeft: 'auto' }}>
                {String(value)}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
