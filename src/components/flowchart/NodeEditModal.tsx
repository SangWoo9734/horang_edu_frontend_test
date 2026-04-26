import { useState, useEffect, useReducer } from 'react'
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

// ── 필드 컴포넌트 ────────────────────────────
function Field({ label, value, onChange, placeholder, type = 'text', autoFocus, hint, error }: {
  label: string; value: string; onChange: (v: string) => void
  placeholder?: string; type?: string; autoFocus?: boolean; hint?: string; error?: string | null
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginTop: 12 }}>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
        <label style={{ fontSize: 11, fontWeight: 600, color: error ? '#EF4444' : '#4B4B6B' }}>{label}</label>
        {hint && !error && <span style={{ fontSize: 10, color: '#B0AECF' }}>{hint}</span>}
      </div>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoFocus={autoFocus}
        style={{
          width: '100%', background: error ? '#FFF5F5' : '#FAFAFE',
          border: `1.5px solid ${error ? '#FCA5A5' : '#EEEDF8'}`,
          color: '#1A1A2E', borderRadius: 9, padding: '8px 12px',
          fontFamily: "'JetBrains Mono', monospace", fontSize: 12, outline: 'none',
          transition: 'border-color .15s',
        }}
        onFocus={(e) => { e.currentTarget.style.borderColor = error ? '#EF4444' : '#4F46E5' }}
        onBlur={(e) => { e.currentTarget.style.borderColor = error ? '#FCA5A5' : '#EEEDF8' }}
      />
      {error && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: '#EF4444', fontWeight: 500 }}>
          <span>⚠️</span>{error}
        </div>
      )}
    </div>
  )
}

// ── 코드 미리보기 ────────────────────────────
function CodePreview({ code }: { code: string }) {
  if (!code.trim()) return null
  return (
    <div style={{
      marginTop: 14, padding: '8px 12px',
      background: '#F8F7FF', borderRadius: 8,
      border: '1px solid #E0DEFF',
      fontFamily: "'JetBrains Mono', monospace",
      fontSize: 11.5, color: '#4F46E5',
      whiteSpace: 'pre',
    }}>
      {code}
    </div>
  )
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
  const { nodes, updateNode, setNodes } = useFlowchartStore()

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

  return (
    <div
      style={{ position: 'fixed', inset: 0, background: '#1A1A2E20', backdropFilter: 'blur(3px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}
      onClick={handleCancel}
    >
      <div
        style={{ background: '#fff', border: '1.5px solid #E0DEFF', borderRadius: 16, padding: 24, minWidth: 340, maxWidth: 400, boxShadow: '0 16px 48px #4F46E520' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ fontSize: 15, fontWeight: 700, color: '#1A1A2E', marginBottom: 2 }}>
          {getTitle(nodeType, loopVariant, processVariant)}
        </div>

        <form onSubmit={handleSubmit}>
          {/* 변수 할당 */}
          {nodeType === 'process' && processVariant !== 'func-call' && (
            <>
              <Field label="변수 이름" value={varName} onChange={(v) => { setField('varName', v); setErrors(p => ({ ...p, varName: null })) }} placeholder="나이" autoFocus hint="예: 나이, 합계" error={errors.varName} />
              <Field label="값" value={varValue} onChange={(v) => { setField('varValue', v); setErrors(p => ({ ...p, varValue: null })) }} placeholder="20" hint="숫자, 문자열, 식" error={errors.varValue} />
            </>
          )}

          {/* 함수 호출 */}
          {nodeType === 'process' && processVariant === 'func-call' && (
            <>
              <Field label="함수 이름" value={funcCallName} onChange={(v) => { setField('funcCallName', v); setErrors(p => ({ ...p, funcCallName: null })) }} placeholder="인사하기" autoFocus error={errors.funcCallName} />
              <Field label="인자 (선택)" value={funcCallArgs} onChange={(v) => setField('funcCallArgs', v)} placeholder='"철수" 에게' hint='공백 구분' />
            </>
          )}

          {/* 출력 */}
          {nodeType === 'output' && (
            <>
              <div style={{ display: 'flex', gap: 6, marginTop: 12 }}>
                {(['string', 'expr'] as const).map((t) => (
                  <button
                    key={t} type="button"
                    onClick={() => setField('outputType', t)}
                    style={{
                      flex: 1, padding: '6px 0', borderRadius: 8, cursor: 'pointer',
                      fontSize: 11, fontWeight: 600,
                      border: `1.5px solid ${outputType === t ? '#4F46E5' : '#EEEDF8'}`,
                      background: outputType === t ? '#EEF0FF' : '#FAFAFE',
                      color: outputType === t ? '#4F46E5' : '#8B8B9E',
                      transition: 'all .15s',
                    }}
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

          {/* 조건문 */}
          {nodeType === 'decision' && (
            <Field label="조건식" value={condition} onChange={(v) => { setField('condition', v); setErrors(p => ({ ...p, condition: null })) }} placeholder="나이 >= 14" autoFocus hint='비교 연산자 사용' error={errors.condition} />
          )}

          {/* 횟수 반복 */}
          {nodeType === 'loop' && loopVariant === 'count' && (
            <Field label="반복 횟수" value={loopCount} onChange={(v) => { setField('loopCount', v); setErrors(p => ({ ...p, loopCount: null })) }} placeholder="5" type="number" autoFocus hint='정수 입력' error={errors.loopCount} />
          )}

          {/* 조건 반복 */}
          {nodeType === 'loop' && loopVariant === 'while' && (
            <Field label="반복 조건" value={loopCondition} onChange={(v) => { setField('loopCondition', v); setErrors(p => ({ ...p, loopCondition: null })) }} placeholder="카운트 < 10" autoFocus hint='참인 동안 반복' error={errors.loopCondition} />
          )}

          {/* 목록 반복 */}
          {nodeType === 'loop' && loopVariant === 'list' && (
            <>
              <Field label="목록 변수" value={listVar} onChange={(v) => { setField('listVar', v); setErrors(p => ({ ...p, listVar: null })) }} placeholder="과일들" autoFocus hint='리스트 변수명' error={errors.listVar} />
              <Field label="항목 변수" value={itemVar} onChange={(v) => { setField('itemVar', v); setErrors(p => ({ ...p, itemVar: null })) }} placeholder="과일" hint='각 항목을 담을 변수명' error={errors.itemVar} />
            </>
          )}

          {/* 함수 선언 */}
          {nodeType === 'function' && (
            <>
              <Field label="함수 이름" value={funcName} onChange={(v) => { setField('funcName', v); setErrors(p => ({ ...p, funcName: null })) }} placeholder="인사하기" autoFocus error={errors.funcName} />
              <Field label="매개변수 (선택)" value={funcParams} onChange={(v) => setField('funcParams', v)} placeholder="(이름)" hint='예: (A), (B)' />
            </>
          )}

          {/* 코드 미리보기 */}
          <CodePreview code={preview} />

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 20 }}>
            <button type="button" onClick={handleCancel} style={{ background: '#F3F2FA', color: '#6B6B8B', padding: '7px 18px', borderRadius: 99, border: 'none', fontSize: 13, fontWeight: 500, cursor: 'pointer', fontFamily: "'Noto Sans KR', sans-serif" }}>취소</button>
            <button type="submit" style={{ background: '#4F46E5', color: '#fff', padding: '7px 18px', borderRadius: 99, border: 'none', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: "'Noto Sans KR', sans-serif" }}>추가하기</button>
          </div>
        </form>
      </div>
    </div>
  )
}
