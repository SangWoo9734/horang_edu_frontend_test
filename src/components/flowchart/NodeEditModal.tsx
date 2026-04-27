import { useState, useEffect, useReducer } from 'react'
import { css } from 'styled-system/css'
import { useUiStore } from '../../stores/ui-store'
import { useFlowchartStore } from '../../stores/flowchart-store'
import { useEditorStore } from '../../stores/editor-store'
import { editorInstanceRef, isProgrammaticUpdateRef } from '../editor/editor-ref'
import { flowToCode } from '../../lib/flowchart/flow-to-code'
import type { FlowNodeData, LoopVariant, ProcessVariant } from '../../types/flowchart'

// ── 레이블 생성 ─────────────────────────────
function buildLabel(data: Partial<FlowNodeData>): string {
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
function getTitle(nodeType: string, loopVariant?: string, processVariant?: string): string {
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

function validateIdentifier(v: string): string | null {
  if (!v.trim()) return '이름을 입력해 주세요'
  if (!ID_RE.test(v.trim())) return '한글·영문·밑줄로만 이름을 만들 수 있어요'
  return null
}

function validateRequired(v: string, label: string): string | null {
  if (!v.trim()) return `${label}을(를) 입력해 주세요`
  return null
}

function validatePositiveInt(v: string): string | null {
  const n = Number(v)
  if (!v.trim() || isNaN(n)) return '숫자를 입력해 주세요'
  if (n <= 0 || !Number.isInteger(n)) return '1 이상의 정수를 입력해 주세요'
  if (n > 1000) return '너무 크면 오래 걸려요! 1000 이하로 입력해 주세요'
  return null
}

// ── 모달 스타일 ──────────────────────────────
const M = {
  overlay: css({
    position: 'fixed', inset: 0,
    background: 'token(colors.textPrimary)/12',
    backdropFilter: 'blur(3px)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    zIndex: 100,
  }),
  panel: css({
    bg: 'white',
    border: '1.5px solid', borderColor: 'accent',
    borderRadius: '16px', padding: '6',
    minWidth: '340px', maxWidth: '400px',
    boxShadow: '0 16px 48px token(colors.primary)/12',
  }),
  panelTitle: css({
    fontSize: '15px', fontWeight: '700',
    color: 'textPrimary', marginBottom: '0.5', fontFamily: 'ui',
  }),
  fieldWrap: css({ display: 'flex', flexDirection: 'column', gap: '1', marginTop: '3' }),
  fieldLabelRow: css({ display: 'flex', alignItems: 'baseline', gap: '1.5' }),
  fieldLabel: css({ fontSize: '11px', fontWeight: '600', color: 'textMid', fontFamily: 'ui' }),
  fieldLabelError: css({ fontSize: '11px', fontWeight: '600', color: '#EF4444', fontFamily: 'ui' }),
  fieldHint: css({ fontSize: '10px', color: 'accent', fontFamily: 'ui' }),
  input: css({
    width: 'full', bg: 'bgSubtle',
    border: '1.5px solid', borderColor: 'border',
    color: 'textPrimary', borderRadius: '9px',
    paddingX: '3', paddingY: '2',
    fontFamily: 'code', fontSize: '12px', outline: 'none',
    transition: 'border-color 0.15s',
    _focus: { borderColor: 'primary' },
  }),
  inputError: css({
    width: 'full', bg: '#FFF5F5',
    border: '1.5px solid #FCA5A5',
    color: 'textPrimary', borderRadius: '9px',
    paddingX: '3', paddingY: '2',
    fontFamily: 'code', fontSize: '12px', outline: 'none',
    transition: 'border-color 0.15s',
    _focus: { borderColor: '#EF4444' },
  }),
  fieldError: css({
    display: 'flex', alignItems: 'center', gap: '1',
    fontSize: '11px', color: '#EF4444', fontWeight: '500', fontFamily: 'ui',
  }),
  codePreview: css({
    marginTop: '3.5', paddingX: '3', paddingY: '2',
    bg: '#F8F7FF', borderRadius: '8px',
    border: '1px solid', borderColor: 'accent',
    fontFamily: 'code', fontSize: '11.5px', color: 'primary',
    whiteSpace: 'pre',
  }),
  toggleRow: css({ display: 'flex', gap: '1.5', marginTop: '3' }),
  toggleBtn: css({
    flex: 1, paddingY: '1.5', borderRadius: '8px', cursor: 'pointer',
    fontSize: '11px', fontWeight: '600', fontFamily: 'ui',
    border: '1.5px solid', borderColor: 'border',
    bg: 'bgSubtle', color: 'textMuted', transition: 'all 0.15s',
  }),
  toggleBtnActive: css({
    flex: 1, paddingY: '1.5', borderRadius: '8px', cursor: 'pointer',
    fontSize: '11px', fontWeight: '600', fontFamily: 'ui',
    border: '1.5px solid', borderColor: 'primary',
    bg: 'primaryLight', color: 'primary', transition: 'all 0.15s',
  }),
  footer: css({ display: 'flex', alignItems: 'center', gap: '2', marginTop: '5' }),
  deleteBtn: css({
    bg: 'white', color: '#EF4444',
    paddingX: '3', paddingY: '1.5',
    borderRadius: '99px', border: '1.5px solid #FCA5A5',
    fontSize: '13px', fontWeight: '600',
    cursor: 'pointer', fontFamily: 'ui',
    marginRight: 'auto',
  }),
  cancelBtn: css({
    bg: 'bgBase', color: 'textSub',
    paddingX: '4.5', paddingY: '1.5',
    borderRadius: '99px', border: 'none',
    fontSize: '13px', fontWeight: '500',
    cursor: 'pointer', fontFamily: 'ui',
  }),
  submitBtn: css({
    bg: 'primary', color: 'white',
    paddingX: '4.5', paddingY: '1.5',
    borderRadius: '99px', border: 'none',
    fontSize: '13px', fontWeight: '700',
    cursor: 'pointer', fontFamily: 'ui',
  }),
}

// ── 필드 컴포넌트 ────────────────────────────
function Field({ label, value, onChange, placeholder, type = 'text', autoFocus, hint, error }: {
  label: string; value: string; onChange: (v: string) => void
  placeholder?: string; type?: string; autoFocus?: boolean; hint?: string; error?: string | null
}) {
  return (
    <div className={M.fieldWrap}>
      <div className={M.fieldLabelRow}>
        <label className={error ? M.fieldLabelError : M.fieldLabel}>{label}</label>
        {hint && !error && <span className={M.fieldHint}>{hint}</span>}
      </div>
      <input
        className={error ? M.inputError : M.input}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoFocus={autoFocus}
      />
      {error && (
        <div className={M.fieldError}><span>⚠️</span>{error}</div>
      )}
    </div>
  )
}

// ── 코드 미리보기 ────────────────────────────
function CodePreview({ code }: { code: string }) {
  if (!code.trim()) return null
  return <div className={M.codePreview}>{code}</div>
}

// ── 폼 상태 (useReducer) ─────────────────────
type FormState = {
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

// ── 메인 모달 ────────────────────────────────
export default function NodeEditModal() {
  const { modalOpen, modalNodeId, closeModal } = useUiStore()
  const { nodes, edges, updateNode, setNodes, setEdges } = useFlowchartStore()

  const node = modalNodeId ? nodes.find((n) => n.id === modalNodeId) : null
  const nodeType = node?.data.nodeType ?? 'process'
  const loopVariant: LoopVariant = (node?.data.loopVariant as LoopVariant) ?? 'count'
  const processVariant: ProcessVariant = (node?.data.processVariant as ProcessVariant) ?? 'assign'

  const [form, dispatch] = useReducer(formReducer, FORM_INIT)
  const [errors, setErrors] = useState<Record<string, string | null>>({})

  // 기존 노드 수정 시 pre-fill — 한 번의 dispatch로 모든 필드 초기화
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

  if (!modalOpen || !node) return null

  const { varName, varValue, condition, outputContent, outputType,
    loopCount, loopCondition, listVar, itemVar,
    funcName, funcParams, funcCallName, funcCallArgs } = form

  function setField<K extends keyof FormState>(key: K, value: FormState[K]) {
    dispatch({ [key]: value } as Partial<FormState>)
  }

  // 현재 입력값으로 데이터 조합
  function buildData(): Partial<FlowNodeData> {
    if (nodeType === 'process' && processVariant === 'func-call') {
      return { funcCallName, funcCallArgs, processVariant: 'func-call' }
    }
    if (nodeType === 'process') {
      return { varName, varValue, processVariant: 'assign' }
    }
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

  const previewData = { nodeType, loopVariant, processVariant, ...buildData() }
  const preview = (() => {
    if (nodeType === 'output') {
      const c = outputContent
      const isExpr = outputType === 'expr' || c.startsWith('"')
      return c ? `${isExpr ? c : `"${c}"`} 보여주기` : ''
    }
    return buildLabel(previewData)
  })()

  function validate(): Record<string, string | null> {
    const e: Record<string, string | null> = {}
    if (nodeType === 'process' && processVariant !== 'func-call') {
      e.varName = validateIdentifier(varName)
      e.varValue = validateRequired(varValue, '값')
    }
    if (nodeType === 'process' && processVariant === 'func-call') {
      e.funcCallName = validateRequired(funcCallName, '함수 이름')
    }
    if (nodeType === 'output') {
      e.outputContent = validateRequired(outputContent, '출력 내용')
    }
    if (nodeType === 'decision') {
      e.condition = validateRequired(condition, '조건식')
    }
    if (nodeType === 'loop' && loopVariant === 'count') {
      e.loopCount = validatePositiveInt(loopCount)
    }
    if (nodeType === 'loop' && loopVariant === 'while') {
      e.loopCondition = validateRequired(loopCondition, '반복 조건')
    }
    if (nodeType === 'loop' && loopVariant === 'list') {
      e.listVar = validateRequired(listVar, '목록 변수')
      e.itemVar = validateIdentifier(itemVar)
    }
    if (nodeType === 'function') {
      e.funcName = validateRequired(funcName, '함수 이름')
    }
    return e
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const errs = validate()
    setErrors(errs)
    if (Object.values(errs).some(Boolean)) return

    const data = buildData()
    updateNode(node.id, { ...data, label: buildLabel({ nodeType, loopVariant, processVariant, ...data }) })

    // updateNode는 동기 → 바로 최신 상태로 F2C 실행
    const { nodes: currentNodes, edges: currentEdges } = useFlowchartStore.getState()
    const generated = flowToCode(currentNodes, currentEdges)
    if (generated) {
      useUiStore.getState().setLastEditSource('flowchart')
      // eslint-disable-next-line react-hooks/immutability
      isProgrammaticUpdateRef.current = true
      editorInstanceRef.current?.setValue(generated)
      // eslint-disable-next-line react-hooks/immutability
      isProgrammaticUpdateRef.current = false
      useEditorStore.getState().setCode(generated)
    }

    closeModal()
  }

  const handleCancel = () => {
    if (node.data.label === '...') setNodes(nodes.filter((n) => n.id !== node.id))
    closeModal()
  }

  const handleDelete = () => {
    const nextNodes = nodes.filter((n) => n.id !== node.id)
    const nextEdges = edges.filter((e) => e.source !== node.id && e.target !== node.id)
    setNodes(nextNodes)
    setEdges(nextEdges)
    const generated = flowToCode(nextNodes, nextEdges)
    if (generated) {
      useUiStore.getState().setLastEditSource('flowchart')
      isProgrammaticUpdateRef.current = true
      editorInstanceRef.current?.setValue(generated)
      isProgrammaticUpdateRef.current = false
      useEditorStore.getState().setCode(generated)
    }
    closeModal()
  }

  return (
    <div className={M.overlay} onClick={handleCancel}>
      <div className={M.panel} onClick={(e) => e.stopPropagation()}>
        <div className={M.panelTitle}>{getTitle(nodeType, loopVariant, processVariant)}</div>

        <form onSubmit={handleSubmit}>
          {nodeType === 'process' && processVariant !== 'func-call' && (
            <>
              <Field label="변수 이름" value={varName} onChange={(v) => { setField('varName', v); setErrors(p => ({ ...p, varName: null })) }} placeholder="나이" autoFocus hint="예: 나이, 합계" error={errors.varName} />
              <Field label="값" value={varValue} onChange={(v) => { setField('varValue', v); setErrors(p => ({ ...p, varValue: null })) }} placeholder="20" hint="숫자, 문자열, 식" error={errors.varValue} />
            </>
          )}

          {nodeType === 'process' && processVariant === 'func-call' && (
            <>
              <Field label="함수 이름" value={funcCallName} onChange={(v) => { setField('funcCallName', v); setErrors(p => ({ ...p, funcCallName: null })) }} placeholder="인사하기" autoFocus error={errors.funcCallName} />
              <Field label="인자 (선택)" value={funcCallArgs} onChange={(v) => setField('funcCallArgs', v)} placeholder='"철수" 에게' hint='공백 구분' />
            </>
          )}

          {nodeType === 'output' && (
            <>
              <div className={M.toggleRow}>
                {(['string', 'expr'] as const).map((t) => (
                  <button
                    key={t} type="button"
                    className={outputType === t ? M.toggleBtnActive : M.toggleBtn}
                    onClick={() => setField('outputType', t)}
                  >
                    {t === 'string' ? '📝 문자열' : '📦 변수 / 식'}
                  </button>
                ))}
              </div>
              <Field
                label="출력 내용"
                value={outputContent}
                onChange={(v) => { setField('outputContent', v); setErrors(p => ({ ...p, outputContent: null })) }}
                placeholder={outputType === 'string' ? '안녕하세요!' : '합계'}
                autoFocus
                hint={outputType === 'string' ? '텍스트를 그대로 출력' : '변수명 또는 식을 입력'}
                error={errors.outputContent}
              />
            </>
          )}

          {nodeType === 'decision' && (
            <Field label="조건식" value={condition} onChange={(v) => { setField('condition', v); setErrors(p => ({ ...p, condition: null })) }} placeholder="나이 >= 14" autoFocus hint='비교 연산자 사용' error={errors.condition} />
          )}

          {nodeType === 'loop' && loopVariant === 'count' && (
            <Field label="반복 횟수" value={loopCount} onChange={(v) => { setField('loopCount', v); setErrors(p => ({ ...p, loopCount: null })) }} placeholder="5" type="number" autoFocus hint='정수 입력' error={errors.loopCount} />
          )}

          {nodeType === 'loop' && loopVariant === 'while' && (
            <Field label="반복 조건" value={loopCondition} onChange={(v) => { setField('loopCondition', v); setErrors(p => ({ ...p, loopCondition: null })) }} placeholder="카운트 < 10" autoFocus hint='참인 동안 반복' error={errors.loopCondition} />
          )}

          {nodeType === 'loop' && loopVariant === 'list' && (
            <>
              <Field label="목록 변수" value={listVar} onChange={(v) => { setField('listVar', v); setErrors(p => ({ ...p, listVar: null })) }} placeholder="과일들" autoFocus hint='리스트 변수명' error={errors.listVar} />
              <Field label="항목 변수" value={itemVar} onChange={(v) => { setField('itemVar', v); setErrors(p => ({ ...p, itemVar: null })) }} placeholder="과일" hint='각 항목을 담을 변수명' error={errors.itemVar} />
            </>
          )}

          {nodeType === 'function' && (
            <>
              <Field label="함수 이름" value={funcName} onChange={(v) => { setField('funcName', v); setErrors(p => ({ ...p, funcName: null })) }} placeholder="인사하기" autoFocus error={errors.funcName} />
              <Field label="매개변수 (선택)" value={funcParams} onChange={(v) => setField('funcParams', v)} placeholder="(이름)" hint='예: (A), (B)' />
            </>
          )}

          <CodePreview code={preview} />

          <div className={M.footer}>
            {node.data.label !== '...' && (
              <button type="button" className={M.deleteBtn} onClick={handleDelete}>삭제</button>
            )}
            <button type="button" className={M.cancelBtn} onClick={handleCancel}>취소</button>
            <button type="submit" className={M.submitBtn}>
              {node.data.label === '...' ? '추가하기' : '저장하기'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
