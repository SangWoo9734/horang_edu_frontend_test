import { Handle, Position } from '@xyflow/react'
import type { NodeProps } from '@xyflow/react'
import type { FlowNodeData, AppFlowNode } from '../../../types/flowchart'

export default function TerminalNode({ data, isConnectable }: NodeProps<AppFlowNode>) {
  const d = data as FlowNodeData
  const stroke = d.label === '반환' ? '#F87171' : '#6366F1'
  const isEnd = d.label === '끝' || d.label === '반환'
  const border = d.disconnected ? '1.5px dashed #F97316' : `${d.executing ? 2.5 : 1.5}px solid ${stroke}`
  const bg = d.disconnected ? '#FFF7ED' : d.executing ? `${stroke}20` : '#fff'
  return (
    <div style={{ padding: '8px 20px', borderRadius: 20, background: bg, color: d.executing ? stroke : '#1A1A2E', fontSize: 12, fontFamily: "'JetBrains Mono', monospace", fontWeight: 700, border, boxShadow: d.disconnected ? 'none' : d.executing ? `0 0 10px ${stroke}50` : `0 2px 8px ${stroke}20`, minWidth: 80, textAlign: 'center', opacity: d.disconnected ? 0.75 : 1 }}>
      {!isEnd && <Handle type="source" position={Position.Bottom} isConnectable={isConnectable}/>}
      <span style={{ fontSize: 8, color: d.disconnected ? '#F97316' : stroke, display: 'block', fontWeight: 700, opacity: 0.65, marginBottom: 1 }}>
        {d.disconnected ? '⚠️ 연결 끊김' : '단말'}
      </span>
      {d.label}
      <Handle type="target" position={Position.Top} isConnectable={isConnectable}/>
    </div>
  )
}
