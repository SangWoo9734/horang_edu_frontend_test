import { Handle, Position } from '@xyflow/react'
import type { NodeProps } from '@xyflow/react'
import type { AppFlowNode } from '../../../types/flowchart'


export default function FunctionNode({ data, isConnectable }: NodeProps<AppFlowNode>) {
  // 이중 테두리로 서브루틴 표현
  return (
    <div style={{
      padding: '10px 16px',
      background: '#7C3AED',
      color: '#fff',
      fontSize: '12px',
      fontFamily: "'JetBrains Mono', monospace",
      textAlign: 'center',
      minWidth: '120px',
      maxWidth: '200px',
      border: data.executing ? '2px solid #FDE68A' : '2px solid #A78BFA',
      boxShadow: data.executing
        ? '0 0 8px #FDE68A, inset 0 0 0 3px #7C3AED, inset 0 0 0 5px #A78BFA'
        : 'inset 0 0 0 3px #7C3AED, inset 0 0 0 5px #A78BFA',
      wordBreak: 'break-all',
    }}>
      <Handle type="target" position={Position.Top} isConnectable={isConnectable} />
      약속: {data.label}
      <Handle type="source" position={Position.Bottom} isConnectable={isConnectable} />
    </div>
  )
}
