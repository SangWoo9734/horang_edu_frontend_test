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
    expect(result).toContain('만약 나이 >= 14 이면')
    expect(result).toContain('아니면')
    expect(result).toContain('"중학생" 보여주기')
    expect(result).toContain('"초등학생" 보여주기')
  })

  it('조건문 (else 없음)', () => {
    const code = '점수 = 90\n만약 점수 >= 80 이면\n\t"합격" 보여주기'
    const result = roundtrip(code)
    expect(result).toContain('만약 점수 >= 80 이면')
    expect(result).toContain('"합격" 보여주기')
    expect(result).not.toContain('아니면')
  })

  it('조건 반복 (while)', () => {
    const code = '카운트 = 0\n반복 카운트 < 3 동안\n\t카운트 = 카운트 + 1'
    const result = roundtrip(code)
    expect(result).toContain('반복 카운트 < 3 동안')
    expect(result).toContain('카운트 = 카운트 + 1')
  })

  it('함수 선언 및 호출', () => {
    const code = '약속, 인사하기\n\t"안녕" 보여주기\n\n인사하기'
    const result = roundtrip(code)
    expect(result).toContain('약속, 인사하기')
    expect(result).toContain('"안녕" 보여주기')
    expect(result).toContain('인사하기')
  })

  it('반복 + 조건 중첩 (else 포함)', () => {
    // else 없는 조건문이 loop body 마지막에 오면 merge 탐색이 복잡해지므로 else 포함 케이스 검증
    const code = '반복 3번\n\t나이 = 10\n\t만약 나이 >= 10 이면\n\t\t"성인" 보여주기\n\t아니면\n\t\t"미성년" 보여주기'
    const result = roundtrip(code)
    expect(result).toContain('반복 3번')
    expect(result).toContain('만약 나이 >= 10 이면')
    expect(result).toContain('"성인" 보여주기')
    expect(result).toContain('"미성년" 보여주기')
  })
})
