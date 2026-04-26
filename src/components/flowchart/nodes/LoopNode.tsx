import { Handle, Position } from '@xyflow/react'
import type { NodeProps } from '@xyflow/react'
import type { FlowNodeData, AppFlowNode } from '../../../types/flowchart'

const col = '#10B981'
const W = 180
const H = 70
const INDENT = 20  // 육각형 좌우 들여쓰기

// 육각형 꼭짓점: 상단 좌우 + 우측 중간 + 하단 좌우 + 좌측 중간
const POINTS = [
  `${INDENT},4`,
  `${W - INDENT},4`,
  `${W - 4},${H / 2}`,
  `${W - INDENT},${H - 4}`,
  `${INDENT},${H - 4}`,
  `4,${H / 2}`,
].join(' ')

export default function LoopNode({ data, isConnectable }: NodeProps<AppFlowNode>) {
  const d = data as FlowNodeData
  const stroke = d.disconnected ? '#F97316' : col
  const strokeW = d.executing ? 2.5 : 1.5
  const fill = d.disconnected ? '#FFF7ED' : d.executing ? `${col}20` : '#fff'
  const dash = d.disconnected ? '6 3' : undefined

  return (
    <div style={{ position: 'relative', width: W, height: H, opacity: d.disconnected ? 0.75 : 1 }}>
      <Handle type="target" position={Position.Top} isConnectable={isConnectable}/>
      <svg width={W} height={H} style={{ position: 'absolute', inset: 0, overflow: 'visible' }}>
        <polygon
          points={POINTS}
          fill={fill}
          stroke={stroke}
          strokeWidth={strokeW}
          strokeDasharray={dash}
          filter={d.executing ? `drop-shadow(0 0 8px ${col}60)` : `drop-shadow(0 2px 6px ${col}20)`}
        />
      </svg>
      <div style={{
        position: 'absolute', inset: 0,
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        pointerEvents: 'none',
        padding: `0 ${INDENT + 8}px`,
      }}>
        <span style={{ fontSize: 8, color: d.disconnected ? '#F97316' : col, fontWeight: 700, opacity: 0.65 }}>
          {d.disconnected ? '⚠️ 연결 끊김' : '반복'}
        </span>
        <span style={{
          fontSize: 11.5, fontFamily: "'JetBrains Mono', monospace",
          fontWeight: 600, color: d.executing ? col : '#1A1A2E',
          textAlign: 'center', wordBreak: 'break-all', lineHeight: 1.3,
        }}>
          {d.label}
        </span>
      </div>
      <Handle type="source" position={Position.Bottom} isConnectable={isConnectable}/>
      <Handle type="source" position={Position.Left} id="back" isConnectable={isConnectable}/>
    </div>
  )
}
