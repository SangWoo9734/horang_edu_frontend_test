import { Handle, Position } from '@xyflow/react'
import type { NodeProps } from '@xyflow/react'
import type { FlowNodeData, AppFlowNode } from '../../../types/flowchart'

const col = '#3B82F6'
export default function ProcessNode({ data, isConnectable }: NodeProps<AppFlowNode>) {
  const d = data as FlowNodeData
  return (
    <div style={{
      padding: '10px 16px', borderRadius: 10,
      background: d.executing ? `${col}20` : '#fff',
      color: d.executing ? col : '#1A1A2E',
      fontSize: 11.5, fontFamily: "'JetBrains Mono', monospace", fontWeight: 600,
      minWidth: 120, maxWidth: 200, textAlign: 'center',
      border: `${d.executing ? 2.5 : 1.5}px solid ${col}`,
      boxShadow: d.executing ? `0 0 10px ${col}50` : `0 2px 8px ${col}20`,
      wordBreak: 'break-all',
    }}>
      <Handle type="target" position={Position.Top} isConnectable={isConnectable}/>
      <span style={{ fontSize: 8, color: col, display: 'block', fontWeight: 700, opacity: 0.65, marginBottom: 2 }}>처리</span>
      {d.label}
      <Handle type="source" position={Position.Bottom} isConnectable={isConnectable}/>
    </div>
  )
}
