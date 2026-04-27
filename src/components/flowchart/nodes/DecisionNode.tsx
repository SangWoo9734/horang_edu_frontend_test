import { useState } from 'react'
import { Handle, Position } from '@xyflow/react'
import type { NodeProps } from '@xyflow/react'
import type { FlowNodeData, AppFlowNode } from '../../../types/flowchart'
import { css } from 'styled-system/css'

const col = '#F59E0B'

const textLayer = css({
  position: 'absolute', inset: 0,
  display: 'flex', flexDirection: 'column',
  alignItems: 'center', justifyContent: 'center',
  pointerEvents: 'none',
})
const badge = css({ fontSize: '8px', fontWeight: '700', opacity: 0.65 })
const label = css({
  fontSize: '11px', fontFamily: 'code', fontWeight: '600',
  textAlign: 'center', paddingX: '4', wordBreak: 'break-all', lineHeight: '1.2',
})

const OP_RE = /^(>=|<=|!=|==|>|<|[+\-*/])$/

function ConditionLabel({ text }: { text: string }) {
  const tokens = text.trim().split(/\s+/)
  return (
    <>
      {tokens.map((t, i) => {
        const color = OP_RE.test(t) ? '#9CA3AF'
          : /^-?\d+(\.\d+)?$/.test(t) ? '#DC2626'
          : t.startsWith('"') ? '#059669'
          : '#0369A1'
        const bold = !OP_RE.test(t)
        return <span key={i} style={{ color, fontWeight: bold ? 700 : 500 }}>{t}{i < tokens.length - 1 ? ' ' : ''}</span>
      })}
    </>
  )
}

const handleLabel = (bg: string) => ({
  position: 'absolute' as const,
  top: '50%', transform: 'translateY(-50%)',
  background: bg, color: 'white',
  fontSize: 9, fontWeight: 700,
  padding: '2px 6px', borderRadius: 4,
  whiteSpace: 'nowrap' as const,
  pointerEvents: 'none' as const,
  boxShadow: '0 1px 4px rgba(0,0,0,0.15)',
})

export default function DecisionNode({ data, isConnectable }: NodeProps<AppFlowNode>) {
  const d = data as FlowNodeData
  const [hovered, setHovered] = useState(false)
  const stroke = d.disconnected ? '#F97316' : d.error ? '#EF4444' : col
  const strokeW = d.executing || d.error ? 2.5 : 1.5
  const fill = d.disconnected ? '#FFF7ED' : d.error ? '#FEF2F2' : d.executing ? `${col}20` : '#fff'
  const dash = d.disconnected ? '6 3' : undefined

  return (
    <div
      style={{ position: 'relative', width: 160, height: 80, opacity: d.disconnected ? 0.75 : 1 }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <Handle type="target" position={Position.Top} isConnectable={isConnectable}/>
      <svg width="160" height="80" style={{ position: 'absolute', inset: 0, overflow: 'visible' }}>
        <polygon
          points="80,4 156,40 80,76 4,40"
          fill={fill} stroke={stroke} strokeWidth={strokeW} strokeDasharray={dash}
          filter={d.error ? 'drop-shadow(0 0 12px #EF444460)' : d.executing ? `drop-shadow(0 0 8px ${col}60)` : `drop-shadow(0 2px 6px ${col}20)`}
        />
      </svg>
      <div className={textLayer}>
        <span className={badge} style={{ color: d.disconnected ? '#F97316' : col }}>
          {d.disconnected ? '⚠️ 연결 끊김' : '조건'}
        </span>
        <span className={label} style={{ color: d.executing ? col : '#1A1A2E' }}>
          {d.condition ? <ConditionLabel text={d.condition}/> : d.label}
        </span>
      </div>

      {/* 핸들 레이블 — 호버 시 표시 */}
      {hovered && (
        <>
          <div style={{ ...handleLabel('#4ADE80'), right: '100%', marginRight: 6 }}>참</div>
          <div style={{ ...handleLabel('#F87171'), left: '100%', marginLeft: 6 }}>거짓</div>
        </>
      )}

      <Handle type="source" position={Position.Left} id="true" isConnectable={isConnectable}/>
      <Handle type="source" position={Position.Right} id="false" isConnectable={isConnectable}/>
    </div>
  )
}
