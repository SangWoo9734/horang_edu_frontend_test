import { useState } from 'react'
import { Handle, Position } from '@xyflow/react'
import type { NodeProps } from '@xyflow/react'
import type { FlowNodeData, AppFlowNode } from '../../../types/flowchart'
import { css } from 'styled-system/css'

const col = '#8B5CF6'

const outer = css({ position: 'relative', paddingX: '2' })
const inner = css({
  paddingX: '5', paddingY: '2.5',
  fontSize: '11.5px', fontFamily: 'code', fontWeight: '600',
  textAlign: 'center', minWidth: '120px', maxWidth: '200px',
  transform: 'skewX(-10deg)', wordBreak: 'break-all',
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

export default function OutputNode({ data, isConnectable }: NodeProps<AppFlowNode>) {
  const d = data as FlowNodeData
  const [hovered, setHovered] = useState(false)

  return (
    <div
      className={outer}
      style={{ opacity: d.disconnected ? 0.75 : 1 }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <Handle type="target" position={Position.Top} isConnectable={isConnectable}/>
      {hovered && <div style={flowHint('top')}>↑ 이전 노드</div>}
      <div
        className={inner}
        style={{
          background: d.disconnected ? '#FFF7ED' : d.error ? '#FEF2F2' : d.executing ? `${col}20` : '#fff',
          color: d.error ? '#DC2626' : d.executing ? col : '#1A1A2E',
          border: d.disconnected ? '1.5px dashed #F97316' : d.error ? '2px solid #EF4444' : `${d.executing ? 2.5 : 1.5}px solid ${col}`,
          boxShadow: d.disconnected ? 'none' : d.error ? '0 0 12px #EF444460' : d.executing ? `0 0 10px ${col}50` : `0 2px 8px ${col}20`,
        }}
      >
        <span style={{ display: 'inline-block', transform: 'skewX(10deg)' }}>
          <span className={badge} style={{ color: d.disconnected ? '#F97316' : col }}>
            {d.disconnected ? '⚠️ 연결 끊김' : '출력'}
          </span>
          {d.outputContent
            ? d.outputType === 'string'
              ? <span style={{ color: '#059669' }}>{d.outputContent}</span>
              : <span style={{ color: '#0369A1', fontWeight: 800 }}>{d.outputContent}</span>
            : d.label
          }
        </span>
      </div>
      {hovered && <div style={flowHint('bottom')}>↓ 다음 노드</div>}
      <Handle type="source" position={Position.Bottom} isConnectable={isConnectable}/>
    </div>
  )
}
