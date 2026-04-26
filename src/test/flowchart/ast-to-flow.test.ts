import { describe, it, expect } from 'vitest'
import { parseAndConvert } from '../../lib/flowchart/ast-to-flow'

// ── 헬퍼 ──────────────────────────────────────────────────
function getNodes(code: string) {
  const result = parseAndConvert(code)
  expect(result).not.toBeNull()
  return result!.nodes
}

function nodesByType(code: string, nodeType: string) {
  return getNodes(code).filter((n) => n.data.nodeType === nodeType)
}

// ── 기본 구조 ─────────────────────────────────────────────
describe('ast-to-flow: 기본 구조', () => {
  it('항상 시작/끝 terminal 노드가 생성된다', () => {
    const nodes = getNodes('나이 = 10')
    const terminals = nodes.filter((n) => n.data.nodeType === 'terminal')
    expect(terminals.find((n) => n.data.label === '시작')).toBeDefined()
    expect(terminals.find((n) => n.data.label === '끝')).toBeDefined()
  })

  it('빈 코드는 시작/끝만 반환한다', () => {
    const nodes = getNodes('')
    expect(nodes.length).toBe(2)
    expect(nodes.every((n) => n.data.nodeType === 'terminal')).toBe(true)
  })

  it('팬텀 "?" 노드가 생성되지 않는다', () => {
    const code = '합계 = 0\n반복 5번\n\t합계 = 합계 + 1\n합계 보여주기'
    const nodes = getNodes(code)
    const phantom = nodes.filter((n) => n.data.label === '?')
    expect(phantom).toHaveLength(0)
  })
})

// ── 변수 할당 ─────────────────────────────────────────────
describe('ast-to-flow: 변수 할당 (process)', () => {
  it('SetVariable → process 노드 생성', () => {
    const processes = nodesByType('나이 = 10', 'process')
    expect(processes).toHaveLength(1)
  })

  it('process 노드 label에 변수명과 값이 포함된다', () => {
    const nodes = getNodes('나이 = 10')
    const proc = nodes.find((n) => n.data.nodeType === 'process')
    expect(proc?.data.label).toContain('나이')
    expect(proc?.data.label).toContain('10')
  })

  it('line 정보가 기록된다', () => {
    const nodes = getNodes('나이 = 10')
    const proc = nodes.find((n) => n.data.nodeType === 'process')
    expect(proc?.data.line).toBe(1)
  })
})

// ── 출력 ──────────────────────────────────────────────────
describe('ast-to-flow: 출력 (output)', () => {
  it('문자열 출력 → output 노드 생성', () => {
    const outputs = nodesByType('"안녕하세요" 보여주기', 'output')
    expect(outputs).toHaveLength(1)
  })

  it('변수 출력 → process가 아닌 output 노드', () => {
    const code = '합계 = 0\n합계 보여주기'
    const nodes = getNodes(code)
    const outputNodes = nodes.filter((n) => n.data.nodeType === 'output')
    const processNodes = nodes.filter((n) => n.data.nodeType === 'process')
    expect(outputNodes).toHaveLength(1)
    expect(processNodes).toHaveLength(1) // 합계 = 0 만
  })

  it('문자열 출력의 outputType은 string', () => {
    const nodes = getNodes('"안녕" 보여주기')
    const output = nodes.find((n) => n.data.nodeType === 'output')
    expect(output?.data.outputType).toBe('string')
  })

  it('변수 출력의 outputType은 expr', () => {
    const code = '합계 = 0\n합계 보여주기'
    const nodes = getNodes(code)
    const output = nodes.find((n) => n.data.nodeType === 'output')
    expect(output?.data.outputType).toBe('expr')
  })
})

// ── 조건문 ────────────────────────────────────────────────
describe('ast-to-flow: 조건문 (decision)', () => {
  it('IfStatement → decision 노드 생성', () => {
    const code = '나이 = 15\n만약 나이 >= 14 이면\n\t"중학생" 보여주기'
    const decisions = nodesByType(code, 'decision')
    expect(decisions).toHaveLength(1)
  })

  it('참 분기 노드가 엣지로 연결된다', () => {
    const code = '만약 점수 >= 90 이면\n\t"A" 보여주기\n아니면\n\t"B" 보여주기'
    const result = parseAndConvert(code)!
    const trueEdge = result.edges.find((e) => (e.data as { edgeType?: string })?.edgeType === 'true')
    const falseEdge = result.edges.find((e) => (e.data as { edgeType?: string })?.edgeType === 'false')
    expect(trueEdge).toBeDefined()
    expect(falseEdge).toBeDefined()
  })
})

// ── 반복 ──────────────────────────────────────────────────
describe('ast-to-flow: 반복 (loop)', () => {
  it('CountLoop → loop 노드, loopVariant: count', () => {
    const loops = nodesByType('반복 5번\n\t"hi" 보여주기', 'loop')
    expect(loops).toHaveLength(1)
    expect(loops[0].data.loopVariant).toBe('count')
  })

  it('ConditionalLoop → loop 노드, loopVariant: while', () => {
    const code = '카운트 = 0\n반복 카운트 < 5 동안\n\t카운트 = 카운트 + 1'
    const loops = nodesByType(code, 'loop')
    expect(loops).toHaveLength(1)
    expect(loops[0].data.loopVariant).toBe('while')
  })

  it('반복 본문 마지막 노드에서 loop 노드로 back 엣지가 연결된다', () => {
    const result = parseAndConvert('반복 3번\n\t"hi" 보여주기')!
    const backEdge = result.edges.find((e) => (e.data as { edgeType?: string })?.edgeType === 'back')
    expect(backEdge).toBeDefined()
  })
})

// ── 함수 ──────────────────────────────────────────────────
describe('ast-to-flow: 함수 선언 (function)', () => {
  it('DeclareFunction → function 노드 생성', () => {
    const code = '약속, 인사하기\n\t"안녕" 보여주기'
    const funcs = nodesByType(code, 'function')
    expect(funcs).toHaveLength(1)
  })
})

// ── 복합 시나리오 ─────────────────────────────────────────
describe('ast-to-flow: 복합 시나리오', () => {
  it('합계 = 0 / 반복 5번 / 합계 += 1 / 합계 보여주기 → 4개 주요 노드 (terminal 제외)', () => {
    const code = '합계 = 0\n반복 5번\n\t합계 = 합계 + 1\n합계 보여주기'
    const nodes = getNodes(code)
    const main = nodes.filter((n) => n.data.nodeType !== 'terminal')
    // process(합계=0), loop(반복5번), process(합계=합계+1), output(합계)
    expect(main).toHaveLength(4)
    expect(main.some((n) => n.data.nodeType === 'output')).toBe(true)
    expect(main.filter((n) => n.data.nodeType === 'loop')).toHaveLength(1)
  })
})

// ── 조건문 내부 노드 line 번호 ───────────────────────────
describe('ast-to-flow: 조건문 내부 노드 line 번호', () => {
  const code = '나이 = 20\n만약 나이 >= 18 이면\n\t"성인입니다" 보여주기\n아니면\n\t"미성년자입니다" 보여주기'

  it('decision 노드 line은 2 (만약 줄)', () => {
    const nodes = getNodes(code)
    const dec = nodes.find((n) => n.data.nodeType === 'decision')
    console.log('decision line:', dec?.data.line)
    expect(dec?.data.line).toBe(2)
  })

  it('참 분기 output 노드 line은 3', () => {
    const nodes = getNodes(code)
    const outputs = nodes.filter((n) => n.data.nodeType === 'output')
    console.log('output nodes:', outputs.map((n) => ({ label: n.data.label, line: n.data.line })))
    const trueOutput = outputs.find((n) => String(n.data.label).includes('성인'))
    expect(trueOutput?.data.line).toBe(3)
  })

  it('거짓 분기 output 노드 line은 5', () => {
    const nodes = getNodes(code)
    const falseOutput = nodes.filter((n) => n.data.nodeType === 'output')
      .find((n) => String(n.data.label).includes('미성년'))
    expect(falseOutput?.data.line).toBe(5)
  })
})
