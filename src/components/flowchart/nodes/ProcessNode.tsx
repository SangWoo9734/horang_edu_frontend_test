import { Handle, Position } from '@xyflow/react'
import type { NodeProps } from '@xyflow/react'
import type { FlowNodeData, AppFlowNode } from '../../../types/flowchart'

const col = '#3B82F6'
export default function ProcessNode({ data, isConnectable }: NodeProps<AppFlowNode>) {
  const d = data as FlowNodeData
  const border = d.disconnected
    ? '1.5px dashed #F97316'
    : `${d.executing ? 2.5 : 1.5}px solid ${col}`
  const bg = d.disconnected ? '#FFF7ED' : d.executing ? `${col}20` : '#fff'
  const shadow = d.disconnected ? '0 0 0 0' : d.executing ? `0 0 10px ${col}50` : `0 2px 8px ${col}20`
  return (
    <div style={{ padding: '10px 16px', borderRadius: 10, background: bg, color: d.executing ? col : '#1A1A2E', fontSize: 11.5, fontFamily: "'JetBrains Mono', monospace", fontWeight: 600, minWidth: 120, maxWidth: 200, textAlign: 'center', border, boxShadow: shadow, wordBreak: 'break-all', opacity: d.disconnected ? 0.75 : 1, position: 'relative' }}>
      <Handle type="target" position={Position.Top} isConnectable={isConnectable}/>
      <span style={{ fontSize: 8, color: d.disconnected ? '#F97316' : col, display: 'block', fontWeight: 700, opacity: 0.65, marginBottom: 2 }}>
        {d.disconnected ? '⚠️ 연결 끊김' : '처리'}
      </span>
      {d.label}
      <Handle type="source" position={Position.Bottom} isConnectable={isConnectable}/>
    </div>
  )
}
