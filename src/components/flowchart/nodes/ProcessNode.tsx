import { Handle, Position } from '@xyflow/react'
import type { NodeProps } from '@xyflow/react'
import type { AppFlowNode } from '../../../types/flowchart'


export default function ProcessNode({ data, isConnectable }: NodeProps<AppFlowNode>) {
  return (
    <div style={{
      padding: '10px 16px',
      borderRadius: '4px',
      background: '#3B82F6',
      color: '#fff',
      fontSize: '12px',
      fontFamily: "'JetBrains Mono', monospace",
      minWidth: '120px',
      maxWidth: '200px',
      textAlign: 'center',
      border: data.executing ? '2px solid #FDE68A' : '2px solid transparent',
      boxShadow: data.executing ? '0 0 8px #FDE68A' : 'none',
      wordBreak: 'break-all',
    }}>
      <Handle type="target" position={Position.Top} isConnectable={isConnectable} />
      {data.label}
      <Handle type="source" position={Position.Bottom} isConnectable={isConnectable} />
    </div>
  )
}
