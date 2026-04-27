import { useState, useEffect, useReducer } from 'react'
import { useUiStore } from '../../../stores/ui-store'
import { useFlowchartStore } from '../../../stores/flowchart-store'
import { useEditorStore } from '../../../stores/editor-store'
import { editorInstanceRef, isProgrammaticUpdateRef } from '../../editor/editor-ref'
import { flowToCode } from '../../../lib/flowchart/flow-to-code'
import type { FlowNodeData, LoopVariant, ProcessVariant } from '../../../types/flowchart'

// ── 레이블 생성 ─────────────────────────────
export function buildLabel(data: Partial<FlowNodeData>): string {
  const { nodeType, loopVariant, processVariant } = data
  if (nodeType === 'process') {
    if (processVariant === 'func-call') {
      const args = data.funcCallArgs ? ` ${data.funcCallArgs}` : ''
      return `${data.funcCallName ?? ''}${args}`
    }
    return `${data.varName ?? ''} = ${data.varValue ?? ''}`
  }
  if (nodeType === 'output') return data.outputContent ?? ''
  if (nodeType === 'decision') return data.condition ?? ''
  if (nodeType === 'loop') {
    if (loopVariant === 'while') return `${data.loopCondition ?? ''} 동안`
    if (loopVariant === 'list') return `${data.listVar ?? ''} 의 ${data.itemVar ?? ''}`
    return `${data.loopCount ?? ''}번 반복`
  }
  if (nodeType === 'function') return `약속: ${data.funcName ?? ''}`
  return ''
}

// ── 모달 제목 ────────────────────────────────
export function getTitle(nodeType: string, loopVariant?: string, processVariant?: string): string {
  if (nodeType === 'process' && processVariant === 'func-call') return '함수 호출'
  if (nodeType === 'process') return '변수 할당'
  if (nodeType === 'output') return '출력'
  if (nodeType === 'decision') return '조건문'
  if (nodeType === 'loop' && loopVariant === 'while') return '조건 반복'
  if (nodeType === 'loop' && loopVariant === 'list') return '목록 반복'
  if (nodeType === 'loop') return '횟수 반복'
  if (nodeType === 'function') return '함수 선언'
  return '노드 추가'
}

// ── 유효성 검사 ─────────────────────────────
const ID_RE = /^[가-힣a-zA-Z_][가-힣a-zA-Z_0-9]*$/

export function validateIdentifier(v: string): string | null {
  if (!v.trim()) return '이름을 입력해 주세요'
  if (!ID_RE.test(v.trim())) return '한글·영문·밑줄로만 이름을 만들 수 있어요'
  return null
}

export function validateRequired(v: string, label: string): string | null {
  if (!v.trim()) return `${label}을(를) 입력해 주세요`
  return null
}

export function validatePositiveInt(v: string): string | null {
  const n = Number(v)
  if (!v.trim() || isNaN(n)) return '숫자를 입력해 주세요'
  if (n <= 0 || !Number.isInteger(n)) return '1 이상의 정수를 입력해 주세요'
  if (n > 1000) return '너무 크면 오래 걸려요! 1000 이하로 입력해 주세요'
  return null
}

// ── 폼 상태 ──────────────────────────────────
export type FormState = {
  varName: string; varValue: string; condition: string
  outputContent: string; outputType: 'string' | 'expr'
  loopCount: string; loopCondition: string; listVar: string; itemVar: string
  funcName: string; funcParams: string; funcCallName: string; funcCallArgs: string
}

const FORM_INIT: FormState = {
  varName: '', varValue: '', condition: '',
  outputContent: '', outputType: 'string',
  loopCount: '5', loopCondition: '', listVar: '', itemVar: '',
  funcName: '', funcParams: '', funcCallName: '', funcCallArgs: '',
}

function formReducer(state: FormState, patch: Partial<FormState>): FormState {
  return { ...state, ...patch }
}

// ── F2C 코드 동기화 헬퍼 ─────────────────────
function syncCodeFromFlow(nextNodes: Parameters<typeof flowToCode>[0], nextEdges: Parameters<typeof flowToCode>[1]) {
  const generated = flowToCode(nextNodes, nextEdges)
  if (!generated) return
  useUiStore.getState().setLastEditSource('flowchart')
  isProgrammaticUpdateRef.current = true
  editorInstanceRef.current?.setValue(generated)
  isProgrammaticUpdateRef.current = false
  useEditorStore.getState().setCode(generated)
}

// ── 훅 ───────────────────────────────────────
export function useNodeForm() {
  const { modalNodeId, closeModal } = useUiStore()
  const { nodes, edges, updateNode, setNodes, setEdges } = useFlowchartStore()

  const node = modalNodeId ? nodes.find((n) => n.id === modalNodeId) : null
  const nodeType = node?.data.nodeType ?? 'process'
  const loopVariant: LoopVariant = (node?.data.loopVariant as LoopVariant) ?? 'count'
  const processVariant: ProcessVariant = (node?.data.processVariant as ProcessVariant) ?? 'assign'

  const [form, dispatch] = useReducer(formReducer, FORM_INIT)
  const [errors, setErrors] = useState<Record<string, string | null>>({})

  useEffect(() => {
    if (!node) return
    const d = node.data
    dispatch({
      varName: String(d.varName ?? ''),
      varValue: String(d.varValue ?? ''),
      condition: String(d.condition ?? ''),
      outputContent: String(d.outputContent ?? ''),
      outputType: (d.outputType as 'string' | 'expr') ?? 'string',
      loopCount: String(d.loopCount ?? '5'),
      loopCondition: String(d.loopCondition ?? ''),
      listVar: String(d.listVar ?? ''),
      itemVar: String(d.itemVar ?? ''),
      funcName: String(d.funcName ?? ''),
      funcParams: String(d.funcParams ?? ''),
      funcCallName: String(d.funcCallName ?? ''),
      funcCallArgs: String(d.funcCallArgs ?? ''),
    })
  }, [modalNodeId]) // eslint-disable-line react-hooks/exhaustive-deps

  function setField<K extends keyof FormState>(key: K, value: FormState[K]) {
    dispatch({ [key]: value } as Partial<FormState>)
  }

  function buildData(): Partial<FlowNodeData> {
    const { varName, varValue, condition, outputContent, outputType,
      loopCount, loopCondition, listVar, itemVar,
      funcName, funcParams, funcCallName, funcCallArgs } = form
    if (nodeType === 'process' && processVariant === 'func-call')
      return { funcCallName, funcCallArgs, processVariant: 'func-call' }
    if (nodeType === 'process')
      return { varName, varValue, processVariant: 'assign' }
    if (nodeType === 'output') return { outputContent, outputType }
    if (nodeType === 'decision') return { condition }
    if (nodeType === 'loop') {
      if (loopVariant === 'while') return { loopCondition, loopVariant: 'while' }
      if (loopVariant === 'list') return { listVar, itemVar, loopVariant: 'list' }
      return { loopCount: Number(loopCount), loopVariant: 'count' }
    }
    if (nodeType === 'function') return { funcName, funcParams }
    return {}
  }

  function validate(): Record<string, string | null> {
    const { varName, varValue, condition, outputContent,
      loopCount, loopCondition, listVar, itemVar, funcName, funcCallName } = form
    const e: Record<string, string | null> = {}
    if (nodeType === 'process' && processVariant !== 'func-call') {
      e.varName = validateIdentifier(varName)
      e.varValue = validateRequired(varValue, '값')
    }
    if (nodeType === 'process' && processVariant === 'func-call')
      e.funcCallName = validateRequired(funcCallName, '함수 이름')
    if (nodeType === 'output')
      e.outputContent = validateRequired(outputContent, '출력 내용')
    if (nodeType === 'decision')
      e.condition = validateRequired(condition, '조건식')
    if (nodeType === 'loop' && loopVariant === 'count')
      e.loopCount = validatePositiveInt(loopCount)
    if (nodeType === 'loop' && loopVariant === 'while')
      e.loopCondition = validateRequired(loopCondition, '반복 조건')
    if (nodeType === 'loop' && loopVariant === 'list') {
      e.listVar = validateRequired(listVar, '목록 변수')
      e.itemVar = validateIdentifier(itemVar)
    }
    if (nodeType === 'function')
      e.funcName = validateRequired(funcName, '함수 이름')
    return e
  }

  const preview = (() => {
    const data = buildData()
    const previewData = { nodeType, loopVariant, processVariant, ...data }
    if (nodeType === 'output') {
      const c = form.outputContent
      const isExpr = form.outputType === 'expr' || c.startsWith('"')
      return c ? `${isExpr ? c : `"${c}"`} 보여주기` : ''
    }
    return buildLabel(previewData)
  })()

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const errs = validate()
    setErrors(errs)
    if (Object.values(errs).some(Boolean) || !node) return

    const data = buildData()
    updateNode(node.id, { ...data, label: buildLabel({ nodeType, loopVariant, processVariant, ...data }) })

    const { nodes: cur, edges: cur2 } = useFlowchartStore.getState()
    syncCodeFromFlow(cur, cur2)
    closeModal()
  }

  function handleCancel() {
    if (node?.data.label === '...') setNodes(nodes.filter((n) => n.id !== node.id))
    closeModal()
  }

  function handleDelete() {
    if (!node) return
    const nextNodes = nodes.filter((n) => n.id !== node.id)
    const nextEdges = edges.filter((e) => e.source !== node.id && e.target !== node.id)
    setNodes(nextNodes)
    setEdges(nextEdges)
    syncCodeFromFlow(nextNodes, nextEdges)
    closeModal()
  }

  return {
    node, nodeType, loopVariant, processVariant,
    form, setField, errors, setErrors,
    preview, handleSubmit, handleCancel, handleDelete,
  }
}
