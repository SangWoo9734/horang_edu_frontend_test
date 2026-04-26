import { css } from 'styled-system/css'
import type { FlowNodeType } from '../../types/flowchart'

const PALETTE_ITEMS: { type: FlowNodeType; icon: string; label: string; color: string }[] = [
  { type: 'process', icon: '□', label: '처리', color: '#3B82F6' },
  { type: 'decision', icon: '◇', label: '분기', color: '#F59E0B' },
  { type: 'loop', icon: '⬡', label: '반복', color: '#10B981' },
  { type: 'output', icon: '▱', label: '출력', color: '#8B5CF6' },
]

export default function NodePalette() {
  const handleDragStart = (e: React.DragEvent, type: FlowNodeType) => {
    e.dataTransfer.setData('nodeType', type)
    e.dataTransfer.effectAllowed = 'move'
  }

  return (
    <div className={css({
      position: 'absolute',
      left: '8px',
      top: '50%',
      transform: 'translateY(-50%)',
      zIndex: 10,
      display: 'flex',
      flexDirection: 'column',
      gap: '2',
      bg: 'bgPanel',
      border: '1px solid rgba(255,255,255,0.1)',
      borderRadius: '8px',
      p: '2',
    })}>
      {PALETTE_ITEMS.map(({ type, icon, label, color }) => (
        <div
          key={type}
          draggable
          onDragStart={(e) => handleDragStart(e, type)}
          className={css({
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '1',
            px: '3',
            py: '2',
            borderRadius: '6px',
            cursor: 'grab',
            userSelect: 'none',
            transition: 'background 0.15s',
            _hover: { bg: 'rgba(255,255,255,0.08)' },
            _active: { cursor: 'grabbing' },
          })}
        >
          <span style={{ fontSize: '16px', color }}>{icon}</span>
          <span className={css({ fontSize: '10px', color: 'textSecondary' })}>{label}</span>
        </div>
      ))}
    </div>
  )
}
