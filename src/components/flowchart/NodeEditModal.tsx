import { useState, useEffect } from 'react'
import { css } from 'styled-system/css'
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
      className={css({
        position: 'fixed',
        inset: 0,
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bg: 'rgba(0,0,0,0.6)',
      })}
      onClick={handleCancel}
    >
      <div
        className={css({
          bg: 'bgPanel',
          border: '1px solid rgba(255,255,255,0.12)',
          borderRadius: '8px',
          p: '6',
          width: '320px',
          fontFamily: 'ui',
        })}
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className={css({ fontSize: '14px', fontWeight: 'bold', color: 'textPrimary', mb: '4' })}>
          {LABELS[nodeType]}
        </h3>

        <form onSubmit={handleSubmit} className={css({ display: 'flex', flexDirection: 'column', gap: '3' })}>
          {nodeType === 'process' && (
            <>
              <Field label="변수명" value={varName} onChange={setVarName} placeholder="나이" autoFocus />
              <Field label="값" value={varValue} onChange={setVarValue} placeholder="20" />
            </>
          )}
          {nodeType === 'output' && (
            <Field label="출력 내용" value={outputContent} onChange={setOutputContent} placeholder="안녕하세요" autoFocus />
          )}
          {nodeType === 'decision' && (
            <Field label="조건식" value={condition} onChange={setCondition} placeholder="나이 >= 18" autoFocus />
          )}
          {nodeType === 'loop' && (
            <Field label="반복 횟수" value={loopCount} onChange={setLoopCount} placeholder="10" type="number" autoFocus />
          )}

          <div className={css({ display: 'flex', gap: '2', justifyContent: 'flex-end', mt: '2' })}>
            <button
              type="button"
              onClick={handleCancel}
              className={css({
                px: '3', py: '1', fontSize: '12px', borderRadius: '4px',
                border: '1px solid rgba(255,255,255,0.15)',
                bg: 'transparent', color: 'textSecondary', cursor: 'pointer',
              })}
            >
              취소
            </button>
            <button
              type="submit"
              className={css({
                px: '3', py: '1', fontSize: '12px', borderRadius: '4px',
                border: '1px solid',
                borderColor: 'primary',
                bg: 'transparent', color: 'primary', cursor: 'pointer',
              })}
            >
              확인
            </button>
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
    <div className={css({ display: 'flex', flexDirection: 'column', gap: '1' })}>
      <label className={css({ fontSize: '11px', color: 'textSecondary' })}>{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoFocus={autoFocus}
        className={css({
          bg: 'bgBase',
          border: '1px solid rgba(255,255,255,0.15)',
          borderRadius: '4px',
          px: '3',
          py: '2',
          fontSize: '13px',
          fontFamily: 'code',
          color: 'textPrimary',
          outline: 'none',
          _focus: { borderColor: 'primary' },
        })}
      />
    </div>
  )
}
