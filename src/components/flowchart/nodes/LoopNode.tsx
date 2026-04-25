import { Handle, Position } from '@xyflow/react'
import type { NodeProps } from '@xyflow/react'
import type { AppFlowNode } from '../../../types/flowchart'


export default function LoopNode({ data, isConnectable }: NodeProps<AppFlowNode>) {
  // 육각형 (clip-path)
  return (
    <div style={{
      padding: '12px 24px',
      background: '#10B981',
      color: '#fff',
      fontSize: '12px',
      fontFamily: "'JetBrains Mono', monospace",
      textAlign: 'center',
      minWidth: '120px',
      maxWidth: '200px',
      clipPath: 'polygon(12% 0%, 88% 0%, 100% 50%, 88% 100%, 12% 100%, 0% 50%)',
      border: data.executing ? '2px solid #FDE68A' : '2px solid transparent',
      boxShadow: data.executing ? '0 0 8px #FDE68A' : 'none',
      wordBreak: 'break-all',
    }}>
      <Handle type="target" position={Position.Top} isConnectable={isConnectable} />
      {data.label}
      <Handle type="source" position={Position.Bottom} isConnectable={isConnectable} />
      <Handle type="source" position={Position.Left} id="back" isConnectable={isConnectable} />
    </div>
  )
}
