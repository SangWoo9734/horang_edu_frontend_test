import { Handle, Position } from '@xyflow/react'
import type { NodeProps } from '@xyflow/react'
import type { FlowNodeData, AppFlowNode } from '../../../types/flowchart'

const col = '#10B981'
export default function LoopNode({ data, isConnectable }: NodeProps<AppFlowNode>) {
  const d = data as FlowNodeData
  const outline = d.disconnected ? '1.5px dashed #F97316' : `${d.executing ? 2.5 : 1.5}px solid ${col}`
  const bg = d.disconnected ? '#FFF7ED' : d.executing ? `${col}20` : '#fff'
  return (
    <div style={{ padding: '10px 24px', background: bg, color: d.executing ? col : '#1A1A2E', fontSize: 11.5, fontFamily: "'JetBrains Mono', monospace", fontWeight: 600, textAlign: 'center', minWidth: 120, maxWidth: 200, clipPath: 'polygon(12% 0%, 88% 0%, 100% 50%, 88% 100%, 12% 100%, 0% 50%)', border: 'none', outline, boxShadow: d.disconnected ? 'none' : d.executing ? `0 0 10px ${col}50` : `0 2px 8px ${col}20`, wordBreak: 'break-all', opacity: d.disconnected ? 0.75 : 1 }}>
      <Handle type="target" position={Position.Top} isConnectable={isConnectable}/>
      <span style={{ fontSize: 8, color: d.disconnected ? '#F97316' : col, display: 'block', fontWeight: 700, opacity: 0.65, marginBottom: 2 }}>{d.disconnected ? '⚠️ 연결 끊김' : '반복'}</span>
      {d.label}
      <Handle type="source" position={Position.Bottom} isConnectable={isConnectable}/>
      <Handle type="source" position={Position.Left} id="back" isConnectable={isConnectable}/>
    </div>
  )
}
