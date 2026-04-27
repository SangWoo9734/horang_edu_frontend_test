import { css } from 'styled-system/css'
import { useUiStore } from '../../stores/ui-store'
import { useNodeForm, getTitle } from './hooks/useNodeForm'
import type { FormState } from './hooks/useNodeForm'

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

function CodePreview({ code }: { code: string }) {
  if (!code.trim()) return null
  return <div className={M.codePreview}>{code}</div>
}

// ── 메인 모달 ────────────────────────────────
export default function NodeEditModal() {
  const { modalOpen } = useUiStore()
  const {
    node, nodeType, loopVariant, processVariant,
    form, setField, errors, setErrors,
    preview, handleSubmit, handleCancel, handleDelete,
  } = useNodeForm()

  if (!modalOpen || !node) return null

  const { varName, varValue, condition, outputContent, outputType,
    loopCount, loopCondition, listVar, itemVar,
    funcName, funcParams, funcCallName, funcCallArgs } = form

  function field<K extends keyof FormState>(key: K, value: FormState[K]) {
    setField(key, value)
    setErrors((p) => ({ ...p, [key]: null }))
  }

  return (
    <div className={M.overlay} onClick={handleCancel}>
      <div className={M.panel} onClick={(e) => e.stopPropagation()}>
        <div className={M.panelTitle}>{getTitle(nodeType, loopVariant, processVariant)}</div>

        <form onSubmit={handleSubmit}>
          {nodeType === 'process' && processVariant !== 'func-call' && (
            <>
              <Field label="변수 이름" value={varName} onChange={(v) => field('varName', v)} placeholder="나이" autoFocus hint="예: 나이, 합계" error={errors.varName} />
              <Field label="값" value={varValue} onChange={(v) => field('varValue', v)} placeholder="20" hint="숫자, 문자열, 식" error={errors.varValue} />
            </>
          )}

          {nodeType === 'process' && processVariant === 'func-call' && (
            <>
              <Field label="함수 이름" value={funcCallName} onChange={(v) => field('funcCallName', v)} placeholder="인사하기" autoFocus error={errors.funcCallName} />
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
                onChange={(v) => field('outputContent', v)}
                placeholder={outputType === 'string' ? '안녕하세요!' : '합계'}
                autoFocus
                hint={outputType === 'string' ? '텍스트를 그대로 출력' : '변수명 또는 식을 입력'}
                error={errors.outputContent}
              />
            </>
          )}

          {nodeType === 'decision' && (
            <Field label="조건식" value={condition} onChange={(v) => field('condition', v)} placeholder="나이 >= 14" autoFocus hint='비교 연산자 사용' error={errors.condition} />
          )}

          {nodeType === 'loop' && loopVariant === 'count' && (
            <Field label="반복 횟수" value={loopCount} onChange={(v) => field('loopCount', v)} placeholder="5" type="number" autoFocus hint='정수 입력' error={errors.loopCount} />
          )}

          {nodeType === 'loop' && loopVariant === 'while' && (
            <Field label="반복 조건" value={loopCondition} onChange={(v) => field('loopCondition', v)} placeholder="카운트 < 10" autoFocus hint='참인 동안 반복' error={errors.loopCondition} />
          )}

          {nodeType === 'loop' && loopVariant === 'list' && (
            <>
              <Field label="목록 변수" value={listVar} onChange={(v) => field('listVar', v)} placeholder="과일들" autoFocus hint='리스트 변수명' error={errors.listVar} />
              <Field label="항목 변수" value={itemVar} onChange={(v) => field('itemVar', v)} placeholder="과일" hint='각 항목을 담을 변수명' error={errors.itemVar} />
            </>
          )}

          {nodeType === 'function' && (
            <>
              <Field label="함수 이름" value={funcName} onChange={(v) => field('funcName', v)} placeholder="인사하기" autoFocus error={errors.funcName} />
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
