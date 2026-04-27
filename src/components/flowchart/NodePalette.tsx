import { css } from 'styled-system/css'
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
  { nodeType: 'process',  processVariant: 'assign',    emoji: '📦', label: '변수',   sublabel: 'A = 값',    color: '#3B82F6' },
  { nodeType: 'output',                                emoji: '📢', label: '출력',   sublabel: '보여주기',   color: '#8B5CF6' },
  { nodeType: 'decision',                              emoji: '🔀', label: '조건',   sublabel: '만약~이면', color: '#F59E0B' },
  { nodeType: 'loop',     loopVariant: 'count',        emoji: '🔄', label: '횟수반복', sublabel: 'N번',     color: '#10B981' },
  { nodeType: 'loop',     loopVariant: 'while',        emoji: '♾️', label: '조건반복', sublabel: '~동안',   color: '#10B981' },
  { nodeType: 'loop',     loopVariant: 'list',         emoji: '📋', label: '목록반복', sublabel: '~마다',   color: '#10B981' },
  { nodeType: 'function',                              emoji: '📝', label: '함수선언', sublabel: '약속,',   color: '#6366F1' },
  { nodeType: 'process',  processVariant: 'func-call', emoji: '📞', label: '함수호출', sublabel: '호출',    color: '#3B82F6' },
]

const S = {
  palette: css({
    width: '58px', bg: 'bgSubtle',
    borderRight: '1px solid #EEEDF8',
    display: 'flex', flexDirection: 'column',
    alignItems: 'center', paddingY: '1.5',
    gap: '1', flexShrink: 0, overflowY: 'auto',
  }),
  item: css({
    width: '44px', height: '44px', flexShrink: 0,
    display: 'flex', flexDirection: 'column',
    alignItems: 'center', justifyContent: 'center',
    borderRadius: '10px', cursor: 'grab',
    border: '1.5px solid', borderColor: 'border',
    bg: 'white', fontSize: '8.5px', color: 'textSub',
    gap: '0.5', fontWeight: '700', fontFamily: 'ui',
    userSelect: 'none', transition: 'all 0.15s',
  }),
}

export default function NodePalette() {
  const handleDragStart = (e: React.DragEvent, item: PaletteItem) => {
    e.dataTransfer.setData('nodeType', item.nodeType)
    if (item.loopVariant) e.dataTransfer.setData('loopVariant', item.loopVariant)
    if (item.processVariant) e.dataTransfer.setData('processVariant', item.processVariant)
    e.dataTransfer.effectAllowed = 'move'
  }

  return (
    <div className={S.palette}>
      {ITEMS.map((item, i) => (
        <div
          key={i}
          className={S.item}
          draggable
          onDragStart={(e) => handleDragStart(e, item)}
          title={`${item.label} (${item.sublabel})`}
          onMouseEnter={(e) => {
            const el = e.currentTarget as HTMLElement
            el.style.borderColor = item.color
            el.style.color = item.color
            el.style.background = `${item.color}18`
          }}
          onMouseLeave={(e) => {
            const el = e.currentTarget as HTMLElement
            el.style.borderColor = ''
            el.style.color = ''
            el.style.background = ''
          }}
        >
          <span style={{ fontSize: 15 }}>{item.emoji}</span>
          <span style={{ lineHeight: 1 }}>{item.label}</span>
        </div>
      ))}
    </div>
  )
}
