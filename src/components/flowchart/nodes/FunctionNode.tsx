import { useState } from 'react'
import { Handle, Position } from '@xyflow/react'
import type { NodeProps } from '@xyflow/react'
import type { FlowNodeData, AppFlowNode } from '../../../types/flowchart'
import { css } from 'styled-system/css'

const col = '#6366F1'

const base = css({
  paddingX: '4', paddingY: '2.5',
  borderRadius: '4px',
  fontSize: '11.5px', fontFamily: 'code', fontWeight: '600',
  minWidth: '120px', maxWidth: '200px',
  textAlign: 'center', wordBreak: 'break-all', position: 'relative',
})
const badge = css({ fontSize: '8px', display: 'block', fontWeight: '700', opacity: 0.65, marginBottom: '0.5' })

const flowHint = (pos: 'top' | 'bottom') => ({
  position: 'absolute' as const,
  left: '50%', transform: 'translateX(-50%)',
  ...(pos === 'top' ? { bottom: '100%', marginBottom: 4 } : { top: '100%', marginTop: 4 }),
  background: '#1A1A2E', color: 'white',
  fontSize: 9, fontWeight: 600,
  padding: '2px 6px', borderRadius: 4,
  whiteSpace: 'nowrap' as const,
  pointerEvents: 'none' as const,
  opacity: 0.75,
})

export default function FunctionNode({ data, isConnectable }: NodeProps<AppFlowNode>) {
  const d = data as FlowNodeData
  const [hovered, setHovered] = useState(false)

  return (
    <div
      className={base}
      style={{
        background: d.disconnected ? '#FFF7ED' : d.executing ? `${col}20` : '#fff',
        color: d.executing ? col : '#1A1A2E',
        border: d.disconnected ? '1.5px dashed #F97316' : `${d.executing ? 2.5 : 1.5}px solid ${col}`,
        boxShadow: d.disconnected ? 'none'
          : d.executing ? `0 0 10px ${col}50, inset 0 0 0 3px #fff, inset 0 0 0 5px ${col}30`
          : `0 2px 8px ${col}20, inset 0 0 0 3px #fff, inset 0 0 0 5px ${col}20`,
        opacity: d.disconnected ? 0.75 : 1,
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <Handle type="target" position={Position.Top} isConnectable={isConnectable}/>
      {hovered && <div style={flowHint('top')}>↑ 이전 노드</div>}
      <span className={badge} style={{ color: d.disconnected ? '#F97316' : col }}>
        {d.disconnected ? '⚠️ 연결 끊김' : '약속'}
      </span>
      {d.funcName
        ? <><span style={{ color: '#9CA3AF', fontWeight: 500 }}>약속: </span><span style={{ color: col, fontWeight: 800 }}>{d.funcName}</span></>
        : d.label
      }
      {hovered && <div style={flowHint('bottom')}>↓ 함수 본문</div>}
      <Handle type="source" position={Position.Bottom} isConnectable={isConnectable}/>
    </div>
  )
}
