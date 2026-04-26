import { useExecutionStore } from '../../stores/execution-store'

export default function VariablePanel() {
  const variables = useExecutionStore((s) => s.variables)
  const entries = Object.entries(variables)

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <div style={{
        height: 32, display: 'flex', alignItems: 'center',
        padding: '0 12px', gap: 6,
        borderBottom: '1px solid #F3F2FA', flexShrink: 0,
      }}>
        <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#F59E0B', flexShrink: 0 }}/>
        <span style={{ fontSize: 11, fontWeight: 700, color: '#4B4B6B' }}>변수 현황판</span>
      </div>

      <div style={{
        flex: 1, overflowY: 'auto',
        padding: '4px 8px',
        display: 'flex', flexDirection: 'column', gap: 2,
      }}>
        {entries.length === 0 ? (
          <span style={{ color: '#C4B5FD', fontSize: 10.5, padding: '2px 4px' }}>
            실행하면 변수가 여기 나타나요
          </span>
        ) : (
          entries.map(([name, value]) => (
            <div key={name} style={{
              display: 'flex', alignItems: 'center',
              padding: '3px 8px',
              background: '#FAFAFE',
              borderRadius: 6,
              border: '1px solid #EEEDF8',
              gap: 6, minWidth: 0,
            }}>
              <span style={{
                color: '#4F46E5',
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: 12, fontWeight: 700,
                flexShrink: 0,
              }}>
                {name}
              </span>
              <span style={{ color: '#C4B5FD', fontSize: 12, flexShrink: 0 }}>=</span>
              <span style={{
                color: '#D97706',
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: 12, fontWeight: 600,
                marginLeft: 'auto',
                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                maxWidth: '140px',
              }}>
                {String(value)}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
