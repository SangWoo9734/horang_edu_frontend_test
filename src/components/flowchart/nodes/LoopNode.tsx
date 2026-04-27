import { useState } from 'react'
import { Handle, Position } from '@xyflow/react'
import type { NodeProps } from '@xyflow/react'
import type { FlowNodeData, AppFlowNode } from '../../../types/flowchart'
import { css } from 'styled-system/css'

const col = '#10B981'
const W = 180
const H = 70
const INDENT = 20
const POINTS = [
  `${INDENT},4`, `${W - INDENT},4`, `${W - 4},${H / 2}`,
  `${W - INDENT},${H - 4}`, `${INDENT},${H - 4}`, `4,${H / 2}`,
].join(' ')

const textLayer = css({
  position: 'absolute', inset: 0,
  display: 'flex', flexDirection: 'column',
  alignItems: 'center', justifyContent: 'center',
  pointerEvents: 'none',
})
const badge = css({ fontSize: '8px', fontWeight: '700', opacity: 0.65 })
const label = css({
  fontSize: '11.5px', fontFamily: 'code', fontWeight: '600',
  textAlign: 'center', wordBreak: 'break-all', lineHeight: '1.3',
})

const kw = { color: '#6B7280', fontWeight: 500 } as const
const val = { color: '#0369A1', fontWeight: 800 } as const

function LoopLabel({ d }: { d: FlowNodeData }) {
  if (d.loopVariant === 'count' && d.loopCount != null) {
    return <><span style={{ color: '#DC2626', fontWeight: 800 }}>{d.loopCount}</span><span style={kw}>번 반복</span></>
  }
  if (d.loopVariant === 'while' && d.loopCondition) {
    return <><span>{d.loopCondition}</span><span style={kw}> 동안</span></>
  }
  if (d.loopVariant === 'list' && d.listVar) {
    return <><span style={val}>{d.listVar}</span><span style={kw}> 의 </span><span style={val}>{d.itemVar}</span></>
  }
  return <>{d.label}</>
}

export default function LoopNode({ data, isConnectable }: NodeProps<AppFlowNode>) {
  const d = data as FlowNodeData
  const [hovered, setHovered] = useState(false)
  const stroke = d.disconnected ? '#F97316' : d.error ? '#EF4444' : col
  const strokeW = d.executing || d.error ? 2.5 : 1.5
  const fill = d.disconnected ? '#FFF7ED' : d.error ? '#FEF2F2' : d.executing ? `${col}20` : '#fff'
  const dash = d.disconnected ? '6 3' : undefined

  return (
    <div
      style={{ position: 'relative', width: W, height: H, opacity: d.disconnected ? 0.75 : 1 }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <Handle type="target" position={Position.Top} isConnectable={isConnectable}/>
      <svg width={W} height={H} style={{ position: 'absolute', inset: 0, overflow: 'visible' }}>
        <polygon
          points={POINTS}
          fill={fill} stroke={stroke} strokeWidth={strokeW} strokeDasharray={dash}
          filter={d.error ? 'drop-shadow(0 0 12px #EF444460)' : d.executing ? `drop-shadow(0 0 8px ${col}60)` : `drop-shadow(0 2px 6px ${col}20)`}
        />
      </svg>
      <div className={textLayer} style={{ padding: `0 ${INDENT + 8}px` }}>
        <span className={badge} style={{ color: d.disconnected ? '#F97316' : col }}>
          {d.disconnected ? '⚠️ 연결 끊김' : '반복'}
        </span>
        <span className={label} style={{ color: d.executing ? col : '#1A1A2E' }}>
          <LoopLabel d={d}/>
        </span>
      </div>

      {hovered && (
        <div style={{
          position: 'absolute',
          top: '50%', right: '100%',
          transform: 'translateY(-50%)',
          marginRight: 6,
          background: col, color: 'white',
          fontSize: 9, fontWeight: 700,
          padding: '2px 6px', borderRadius: 4,
          whiteSpace: 'nowrap',
          pointerEvents: 'none',
          boxShadow: '0 1px 4px rgba(0,0,0,0.15)',
        }}>반복 복귀</div>
      )}

      <Handle type="source" position={Position.Bottom} isConnectable={isConnectable}/>
      <Handle type="source" position={Position.Left} id="back" isConnectable={isConnectable}/>
    </div>
  )
}
