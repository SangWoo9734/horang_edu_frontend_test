import { Handle, Position } from '@xyflow/react'
import type { NodeProps } from '@xyflow/react'
import type { FlowNodeData, AppFlowNode } from '../../../types/flowchart'

const col = '#6366F1'
export default function FunctionNode({ data, isConnectable }: NodeProps<AppFlowNode>) {
  const d = data as FlowNodeData
  const border = d.disconnected ? '1.5px dashed #F97316' : `${d.executing ? 2.5 : 1.5}px solid ${col}`
  const bg = d.disconnected ? '#FFF7ED' : d.executing ? `${col}20` : '#fff'
  return (
    <div style={{ padding: '10px 16px', borderRadius: 4, background: bg, color: d.executing ? col : '#1A1A2E', fontSize: 11.5, fontFamily: "'JetBrains Mono', monospace", fontWeight: 600, textAlign: 'center', minWidth: 120, maxWidth: 200, border, boxShadow: d.disconnected ? 'none' : d.executing ? `0 0 10px ${col}50, inset 0 0 0 3px #fff, inset 0 0 0 5px ${col}30` : `0 2px 8px ${col}20, inset 0 0 0 3px #fff, inset 0 0 0 5px ${col}20`, wordBreak: 'break-all', opacity: d.disconnected ? 0.75 : 1 }}>
      <Handle type="target" position={Position.Top} isConnectable={isConnectable}/>
      <span style={{ fontSize: 8, color: d.disconnected ? '#F97316' : col, display: 'block', fontWeight: 700, opacity: 0.65, marginBottom: 2 }}>{d.disconnected ? '⚠️ 연결 끊김' : '약속'}</span>
      {d.label}
      <Handle type="source" position={Position.Bottom} isConnectable={isConnectable}/>
    </div>
  )
}
