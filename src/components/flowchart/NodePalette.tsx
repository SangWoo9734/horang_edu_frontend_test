import type { FlowNodeType, LoopVariant, ProcessVariant } from '../../types/flowchart'

interface PaletteItem {
  nodeType: FlowNodeType
  loopVariant?: LoopVariant
  processVariant?: ProcessVariant
  emoji: string
  label: string
  sublabel: string
  color: string
}

const ITEMS: PaletteItem[] = [
  { nodeType: 'process',  processVariant: 'assign',    emoji: '📦', label: '변수',   sublabel: 'A = 값',           color: '#3B82F6' },
  { nodeType: 'output',                                emoji: '📢', label: '출력',   sublabel: '보여주기',           color: '#8B5CF6' },
  { nodeType: 'decision',                              emoji: '🔀', label: '조건',   sublabel: '만약~이면',          color: '#F59E0B' },
  { nodeType: 'loop',     loopVariant: 'count',        emoji: '🔄', label: '횟수반복', sublabel: 'N번',              color: '#10B981' },
  { nodeType: 'loop',     loopVariant: 'while',        emoji: '♾️', label: '조건반복', sublabel: '~동안',            color: '#10B981' },
  { nodeType: 'loop',     loopVariant: 'list',         emoji: '📋', label: '목록반복', sublabel: '~마다',            color: '#10B981' },
  { nodeType: 'function',                              emoji: '📝', label: '함수선언', sublabel: '약속,',            color: '#6366F1' },
  { nodeType: 'process',  processVariant: 'func-call', emoji: '📞', label: '함수호출', sublabel: '호출',             color: '#3B82F6' },
]

export default function NodePalette() {
  const handleDragStart = (e: React.DragEvent, item: PaletteItem) => {
    e.dataTransfer.setData('nodeType', item.nodeType)
    if (item.loopVariant) e.dataTransfer.setData('loopVariant', item.loopVariant)
    if (item.processVariant) e.dataTransfer.setData('processVariant', item.processVariant)
    e.dataTransfer.effectAllowed = 'move'
  }

  return (
    <div style={{
      width: 58,
      background: '#FAFAFE',
      borderRight: '1px solid #F3F2FA',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: '6px 0',
      gap: 4,
      flexShrink: 0,
      overflowY: 'auto',
    }}>
      {ITEMS.map((item, i) => (
        <div
          key={i}
          draggable
          onDragStart={(e) => handleDragStart(e, item)}
          title={`${item.label} (${item.sublabel})`}
          style={{
            width: 44, height: 44,
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
            borderRadius: 10, cursor: 'grab',
            border: '1.5px solid #EEEDF8', background: '#fff',
            fontSize: 8.5, color: '#6B6B8B',
            gap: 2, fontWeight: 700,
            userSelect: 'none', transition: 'all .15s',
            flexShrink: 0,
          }}
          onMouseEnter={(e) => {
            const el = e.currentTarget as HTMLElement
            el.style.borderColor = item.color
            el.style.color = item.color
            el.style.background = `${item.color}10`
          }}
          onMouseLeave={(e) => {
            const el = e.currentTarget as HTMLElement
            el.style.borderColor = '#EEEDF8'
            el.style.color = '#6B6B8B'
            el.style.background = '#fff'
          }}
        >
          <span style={{ fontSize: 15 }}>{item.emoji}</span>
          <span style={{ lineHeight: 1 }}>{item.label}</span>
        </div>
      ))}
    </div>
  )
}
