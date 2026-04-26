import type { FlowNodeType } from '../../types/flowchart'

const ITEMS: { type: FlowNodeType; emoji: string; label: string }[] = [
  { type: 'process',  emoji: '📦', label: '처리' },
  { type: 'decision', emoji: '🔀', label: '판단' },
  { type: 'loop',     emoji: '🔄', label: '반복' },
  { type: 'output',   emoji: '📢', label: '출력' },
]

export default function NodePalette() {
  const handleDragStart = (e: React.DragEvent, type: FlowNodeType) => {
    e.dataTransfer.setData('nodeType', type)
    e.dataTransfer.effectAllowed = 'move'
  }

  return (
    <div style={{
      width: 52, background: '#FAFAFE',
      borderRight: '1px solid #F3F2FA',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', padding: '8px 0', gap: 6,
      flexShrink: 0,
    }}>
      {ITEMS.map(({ type, emoji, label }) => (
        <div
          key={type}
          draggable
          onDragStart={(e) => handleDragStart(e, type)}
          style={{
            width: 40, height: 42,
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
            borderRadius: 10, cursor: 'grab',
            border: '1.5px solid #EEEDF8', background: '#fff',
            fontSize: 9, color: '#6B6B8B', gap: 3, fontWeight: 700,
            userSelect: 'none', transition: 'all .15s',
          }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.borderColor = '#4F46E5'; (e.currentTarget as HTMLElement).style.color = '#4F46E5'; (e.currentTarget as HTMLElement).style.background = '#F3F2FA'; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = '#EEEDF8'; (e.currentTarget as HTMLElement).style.color = '#6B6B8B'; (e.currentTarget as HTMLElement).style.background = '#fff'; }}
        >
          <span style={{ fontSize: 16 }}>{emoji}</span>
          <span>{label}</span>
        </div>
      ))}
    </div>
  )
}
