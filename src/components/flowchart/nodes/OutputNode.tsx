import { Handle, Position } from '@xyflow/react'
import type { NodeProps } from '@xyflow/react'
import type { FlowNodeData, AppFlowNode } from '../../../types/flowchart'

const col = '#8B5CF6'
export default function OutputNode({ data, isConnectable }: NodeProps<AppFlowNode>) {
  const d = data as FlowNodeData
  return (
    <div style={{ position: 'relative', padding: '0 8px' }}>
      <Handle type="target" position={Position.Top} isConnectable={isConnectable}/>
      <div style={{
        padding: '10px 20px',
        background: d.executing ? `${col}20` : '#fff',
        color: d.executing ? col : '#1A1A2E',
        fontSize: 11.5, fontFamily: "'JetBrains Mono', monospace", fontWeight: 600,
        textAlign: 'center', minWidth: 120, maxWidth: 200,
        transform: 'skewX(-10deg)',
        border: `${d.executing ? 2.5 : 1.5}px solid ${col}`,
        boxShadow: d.executing ? `0 0 10px ${col}50` : `0 2px 8px ${col}20`,
        wordBreak: 'break-all',
      }}>
        <span style={{ display: 'inline-block', transform: 'skewX(10deg)' }}>
          <span style={{ fontSize: 8, color: col, display: 'block', fontWeight: 700, opacity: 0.65, marginBottom: 2 }}>출력</span>
          {d.label}
        </span>
      </div>
      <Handle type="source" position={Position.Bottom} isConnectable={isConnectable}/>
    </div>
  )
}
