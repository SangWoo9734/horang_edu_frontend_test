import { useState, useEffect } from 'react'
import { useUiStore } from '../../stores/ui-store'
import { useFlowchartStore } from '../../stores/flowchart-store'
import type { FlowNodeType, FlowNodeData } from '../../types/flowchart'

const LABELS: Record<FlowNodeType, string> = {
  process: '처리 노드',
  output: '출력 노드',
  decision: '분기 노드',
  loop: '반복 노드',
  terminal: '터미널',
  function: '함수 노드',
}

export default function NodeEditModal() {
  const { modalOpen, modalNodeId, closeModal } = useUiStore()
  const { nodes, updateNode, setNodes } = useFlowchartStore()

  const node = modalNodeId ? nodes.find((n) => n.id === modalNodeId) : null
  const nodeType = node?.data.nodeType ?? 'process'

  const [varName, setVarName] = useState('')
  const [varValue, setVarValue] = useState('')
  const [condition, setCondition] = useState('')
  const [outputContent, setOutputContent] = useState('')
  const [loopCount, setLoopCount] = useState('1')

  // 기존 노드 수정 시 값 pre-fill
  useEffect(() => {
    if (!node) return
    const d = node.data
    setVarName(d.varName ?? '')
    setVarValue(d.varValue ?? '')
    setCondition(d.condition ?? '')
    setOutputContent(d.outputContent ?? '')
    setLoopCount(String(d.loopCount ?? 1))
  }, [modalNodeId, node])

  if (!modalOpen || !node) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    let data: Partial<FlowNodeData> = {}

    if (nodeType === 'process') {
      data = { varName, varValue, label: `${varName} = ${varValue}` }
    } else if (nodeType === 'output') {
      data = { outputContent, label: outputContent }
    } else if (nodeType === 'decision') {
      data = { condition, label: condition }
    } else if (nodeType === 'loop') {
      data = { loopCount: Number(loopCount), label: `${loopCount}번 반복` }
    }

    updateNode(node.id, data)
    closeModal()
  }

  const handleCancel = () => {
    // 새로 추가된 노드(빈 label)이면 삭제
    if (!node.data.varName && !node.data.condition && !node.data.outputContent && node.data.label === '...') {
      setNodes(nodes.filter((n) => n.id !== node.id))
    }
    closeModal()
  }

  return (
    <div
      style={{ position: 'fixed', inset: 0, background: '#1A1A2E20', backdropFilter: 'blur(3px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}
      onClick={handleCancel}
    >
      <div
        style={{ background: '#fff', border: '1.5px solid #E0DEFF', borderRadius: 16, padding: 24, minWidth: 320, boxShadow: '0 16px 48px #4F46E520' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ fontSize: 15, fontWeight: 700, color: '#1A1A2E', marginBottom: 4 }}>노드 추가</div>
        <div style={{ fontSize: 11, color: '#8B8B9E', marginBottom: 18 }}>{LABELS[nodeType]}</div>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column' }}>
          {nodeType === 'process' && (<><Field label="변수 이름" value={varName} onChange={setVarName} placeholder="예: 나이" autoFocus /><Field label="값" value={varValue} onChange={setVarValue} placeholder="예: 15" /></>)}
          {nodeType === 'output' && (<Field label="보여줄 내용" value={outputContent} onChange={setOutputContent} placeholder="예: 안녕하세요!" autoFocus />)}
          {nodeType === 'decision' && (<Field label="조건식" value={condition} onChange={setCondition} placeholder="예: 나이 >= 14" autoFocus />)}
          {nodeType === 'loop' && (<Field label="반복 횟수" value={loopCount} onChange={setLoopCount} placeholder="예: 5" type="number" autoFocus />)}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 20 }}>
            <button type="button" onClick={handleCancel} style={{ background: '#F3F2FA', color: '#6B6B8B', padding: '7px 18px', borderRadius: 99, border: 'none', fontSize: 13, fontWeight: 500, cursor: 'pointer', fontFamily: "'Noto Sans KR', sans-serif" }}>취소</button>
            <button type="submit" style={{ background: '#4F46E5', color: '#fff', padding: '7px 18px', borderRadius: 99, border: 'none', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: "'Noto Sans KR', sans-serif" }}>추가하기</button>
          </div>
        </form>
      </div>
    </div>
  )
}

function Field({
  label, value, onChange, placeholder, type = 'text', autoFocus,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  placeholder?: string
  type?: string
  autoFocus?: boolean
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginTop: 12 }}>
      <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#4B4B6B' }}>{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoFocus={autoFocus}
        style={{
          width: '100%', background: '#FAFAFE', border: '1.5px solid #EEEDF8',
          color: '#1A1A2E', borderRadius: 9, padding: '8px 12px',
          fontFamily: "'JetBrains Mono', monospace", fontSize: 12, outline: 'none',
        }}
        onFocus={(e) => { e.currentTarget.style.borderColor = '#4F46E5' }}
        onBlur={(e) => { e.currentTarget.style.borderColor = '#EEEDF8' }}
      />
    </div>
  )
}
