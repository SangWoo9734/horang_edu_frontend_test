import { describe, it, expect } from 'vitest'
import { parseAndConvert } from '../../lib/flowchart/ast-to-flow'
import { flowToCode } from '../../lib/flowchart/flow-to-code'

// code → flow → code 왕복 후 동등한 코드가 나오는지 검증
function roundtrip(code: string): string {
  const graph = parseAndConvert(code)
  if (!graph) throw new Error('parseAndConvert returned null')
  return flowToCode(graph.nodes, graph.edges)
}

describe('코드 → 순서도 → 코드 (roundtrip)', () => {
  it('변수 할당', () => {
    const code = '나이 = 10'
    expect(roundtrip(code)).toBe(code)
  })

  it('문자열 출력', () => {
    const code = '"안녕하세요" 보여주기'
    expect(roundtrip(code)).toBe(code)
  })

  it('변수 출력', () => {
    const code = '합계 = 0\n합계 보여주기'
    expect(roundtrip(code)).toBe(code)
  })

  it('횟수 반복', () => {
    const code = '반복 3번\n\t"안녕" 보여주기'
    expect(roundtrip(code)).toBe(code)
  })

  it('복합: 합산 후 출력', () => {
    const code = '합계 = 0\n반복 5번\n\t합계 = 합계 + 1\n합계 보여주기'
    expect(roundtrip(code)).toBe(code)
  })

  it('조건문 (else 포함)', () => {
    const code = '나이 = 15\n만약 나이 >= 14 이면\n\t"중학생" 보여주기\n아니면\n\t"초등학생" 보여주기'
    const result = roundtrip(code)
    // 완전 동일하지 않아도 핵심 키워드가 포함되어 있어야 함
    expect(result).toContain('만약 나이 >= 14 이면')
    expect(result).toContain('아니면')
    expect(result).toContain('"중학생" 보여주기')
    expect(result).toContain('"초등학생" 보여주기')
  })
})
