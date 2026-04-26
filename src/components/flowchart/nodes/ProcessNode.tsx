import { Handle, Position } from '@xyflow/react'
import type { NodeProps } from '@xyflow/react'
import type { FlowNodeData, AppFlowNode } from '../../../types/flowchart'
import { css } from 'styled-system/css'

const col = '#3B82F6'

const base = css({
  paddingX: '4', paddingY: '2.5',
  borderRadius: '10px',
  fontSize: '11.5px', fontFamily: 'code', fontWeight: '600',
  minWidth: '120px', maxWidth: '200px',
  textAlign: 'center', wordBreak: 'break-all', position: 'relative',
})
const badge = css({ fontSize: '8px', display: 'block', fontWeight: '700', opacity: 0.65, marginBottom: '0.5' })

export default function ProcessNode({ data, isConnectable }: NodeProps<AppFlowNode>) {
  const d = data as FlowNodeData
  const label = d.processVariant === 'func-call' ? '호출' : '변수'
  return (
    <div
      className={base}
      style={{
        background: d.disconnected ? '#FFF7ED' : d.executing ? `${col}20` : '#fff',
        color: d.executing ? col : '#1A1A2E',
        border: d.disconnected ? '1.5px dashed #F97316' : `${d.executing ? 2.5 : 1.5}px solid ${col}`,
        boxShadow: d.disconnected ? 'none' : d.executing ? `0 0 10px ${col}50` : `0 2px 8px ${col}20`,
        opacity: d.disconnected ? 0.75 : 1,
      }}
    >
      <Handle type="target" position={Position.Top} isConnectable={isConnectable}/>
      <span className={badge} style={{ color: d.disconnected ? '#F97316' : col }}>
        {d.disconnected ? '⚠️ 연결 끊김' : label}
      </span>
      {d.label}
      <Handle type="source" position={Position.Bottom} isConnectable={isConnectable}/>
    </div>
  )
}
