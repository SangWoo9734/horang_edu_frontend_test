import { Handle, Position } from '@xyflow/react'
import type { NodeProps } from '@xyflow/react'
import type { AppFlowNode } from '../../../types/flowchart'


export default function TerminalNode({ data, isConnectable }: NodeProps<AppFlowNode>) {
  const isEnd = data.label === '끝' || data.label === '반환'
  const color = data.label === '반환' ? '#F87171' : '#6B7280'

  return (
    <div style={{
      padding: '8px 20px',
      borderRadius: '20px',
      background: color,
      color: '#fff',
      fontSize: '13px',
      fontFamily: "'JetBrains Mono', monospace",
      fontWeight: 'bold',
      border: data.executing ? '2px solid #FDE68A' : '2px solid transparent',
      boxShadow: data.executing ? '0 0 8px #FDE68A' : 'none',
      minWidth: '80px',
      textAlign: 'center',
    }}>
      {!isEnd && (
        <Handle type="source" position={Position.Bottom} isConnectable={isConnectable} />
      )}
      {data.label}
      {isEnd && (
        <Handle type="target" position={Position.Top} isConnectable={isConnectable} />
      )}
      {!isEnd && (
        <Handle type="target" position={Position.Top} isConnectable={isConnectable} />
      )}
    </div>
  )
}
