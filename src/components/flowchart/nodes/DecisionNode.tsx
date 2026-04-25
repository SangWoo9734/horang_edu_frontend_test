import { Handle, Position } from '@xyflow/react'
import type { NodeProps } from '@xyflow/react'
import type { AppFlowNode } from '../../../types/flowchart'


export default function DecisionNode({ data, isConnectable }: NodeProps<AppFlowNode>) {
  return (
    <div style={{ position: 'relative', width: '160px', height: '80px' }}>
      <Handle type="target" position={Position.Top} isConnectable={isConnectable} />

      {/* 마름모 모양 */}
      <div style={{
        position: 'absolute',
        inset: 0,
        background: '#F59E0B',
        transform: 'rotate(45deg) scale(0.7)',
        borderRadius: '4px',
        border: data.executing ? '3px solid #FDE68A' : '2px solid transparent',
        boxShadow: data.executing ? '0 0 8px #FDE68A' : 'none',
      }} />
      <div style={{
        position: 'absolute',
        inset: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#fff',
        fontSize: '11px',
        fontFamily: "'JetBrains Mono', monospace",
        textAlign: 'center',
        padding: '0 16px',
        wordBreak: 'break-all',
      }}>
        {data.label}
      </div>

      {/* 참: 오른쪽, 거짓: 아래 */}
      <Handle type="source" position={Position.Right} id="true" isConnectable={isConnectable} />
      <Handle type="source" position={Position.Bottom} id="false" isConnectable={isConnectable} />
    </div>
  )
}
