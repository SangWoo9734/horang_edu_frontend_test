import { Handle, Position } from '@xyflow/react'
import type { NodeProps } from '@xyflow/react'
import type { AppFlowNode } from '../../../types/flowchart'


export default function OutputNode({ data, isConnectable }: NodeProps<AppFlowNode>) {
  // 평행사변형 (skew)
  return (
    <div style={{ position: 'relative', padding: '0 8px' }}>
      <Handle type="target" position={Position.Top} isConnectable={isConnectable} />
      <div style={{
        padding: '10px 20px',
        background: '#8B5CF6',
        color: '#fff',
        fontSize: '12px',
        fontFamily: "'JetBrains Mono', monospace",
        textAlign: 'center',
        minWidth: '120px',
        maxWidth: '200px',
        transform: 'skewX(-12deg)',
        border: data.executing ? '2px solid #FDE68A' : '2px solid transparent',
        boxShadow: data.executing ? '0 0 8px #FDE68A' : 'none',
        wordBreak: 'break-all',
      }}>
        <span style={{ display: 'inline-block', transform: 'skewX(12deg)' }}>
          {data.label}
        </span>
      </div>
      <Handle type="source" position={Position.Bottom} isConnectable={isConnectable} />
    </div>
  )
}
