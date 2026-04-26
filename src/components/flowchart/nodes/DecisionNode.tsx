import { Handle, Position } from '@xyflow/react'
import type { NodeProps } from '@xyflow/react'
import type { FlowNodeData, AppFlowNode } from '../../../types/flowchart'

const col = '#F59E0B'
export default function DecisionNode({ data, isConnectable }: NodeProps<AppFlowNode>) {
  const d = data as FlowNodeData
  const stroke = d.disconnected ? '#F97316' : col
  const strokeW = d.executing ? 2.5 : 1.5
  const fill = d.disconnected ? '#FFF7ED' : d.executing ? `${col}20` : '#fff'
  const dash = d.disconnected ? '6 3' : undefined
  return (
    <div style={{ position: 'relative', width: 160, height: 80, opacity: d.disconnected ? 0.75 : 1 }}>
      <Handle type="target" position={Position.Top} isConnectable={isConnectable}/>
      <svg width="160" height="80" style={{ position: 'absolute', inset: 0, overflow: 'visible' }}>
        <polygon points="80,4 156,40 80,76 4,40" fill={fill} stroke={stroke} strokeWidth={strokeW} strokeDasharray={dash} filter={d.executing ? `drop-shadow(0 0 8px ${col}60)` : `drop-shadow(0 2px 6px ${col}20)`}/>
      </svg>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
        <span style={{ fontSize: 8, color: d.disconnected ? '#F97316' : col, fontWeight: 700, opacity: 0.65 }}>{d.disconnected ? '⚠️ 연결 끊김' : '판단'}</span>
        <span style={{ fontSize: 11, fontFamily: "'JetBrains Mono', monospace", fontWeight: 600, color: d.executing ? col : '#1A1A2E', textAlign: 'center', padding: '0 16px', wordBreak: 'break-all', lineHeight: 1.2 }}>{d.label}</span>
      </div>
      <Handle type="source" position={Position.Left} id="true" isConnectable={isConnectable}/>
      <Handle type="source" position={Position.Right} id="false" isConnectable={isConnectable}/>
    </div>
  )
}
