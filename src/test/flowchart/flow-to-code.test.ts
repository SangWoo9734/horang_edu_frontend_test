import { describe, it, expect } from 'vitest'
import { flowToCode } from '../../lib/flowchart/flow-to-code'
import type { Node as RFNode, Edge as RFEdge } from '@xyflow/react'
import type { FlowNodeData } from '../../types/flowchart'

// ── 헬퍼 ──────────────────────────────────────────────────
let _id = 0
function node(
  id: string,
  data: Partial<FlowNodeData> & { nodeType: FlowNodeData['nodeType'] },
): RFNode<FlowNodeData> {
  return {
    id,
    type: data.nodeType,
    position: { x: 0, y: 0 },
    data: { label: '', ...data },
  }
}

function edge(
  source: string,
  target: string,
  edgeType?: string,
): RFEdge {
  return {
    id: `e-${source}-${target}-${_id++}`,
    source,
    target,
    data: { edgeType: edgeType ?? 'default' },
  }
}

function linear(...nodeList: RFNode<FlowNodeData>[]) {
  const edges: RFEdge[] = []
  for (let i = 0; i < nodeList.length - 1; i++) {
    edges.push(edge(nodeList[i].id, nodeList[i + 1].id))
  }
  return { nodes: nodeList, edges }
}

// ── 기본 ──────────────────────────────────────────────────
describe('flow-to-code: 기본', () => {
  it('빈 노드 배열은 빈 문자열 반환', () => {
    expect(flowToCode([], [])).toBe('')
  })

  it('terminal만 있으면 빈 문자열 반환', () => {
    const { nodes, edges } = linear(
      node('s', { nodeType: 'terminal', label: '시작' }),
      node('e', { nodeType: 'terminal', label: '끝' }),
    )
    expect(flowToCode(nodes, edges)).toBe('')
  })
})

// ── 변수 할당 ─────────────────────────────────────────────
describe('flow-to-code: 변수 할당', () => {
  it('assign process → 변수 = 값', () => {
    const { nodes, edges } = linear(
      node('s', { nodeType: 'terminal', label: '시작' }),
      node('n', { nodeType: 'process', label: '나이 = 10', processVariant: 'assign', varName: '나이', varValue: '10' }),
      node('e', { nodeType: 'terminal', label: '끝' }),
    )
    expect(flowToCode(nodes, edges)).toBe('나이 = 10')
  })

  it('여러 할당 → 줄바꿈 구분', () => {
    const { nodes, edges } = linear(
      node('s', { nodeType: 'terminal', label: '시작' }),
      node('n1', { nodeType: 'process', label: 'x = 1', processVariant: 'assign', varName: 'x', varValue: '1' }),
      node('n2', { nodeType: 'process', label: 'y = 2', processVariant: 'assign', varName: 'y', varValue: '2' }),
      node('e', { nodeType: 'terminal', label: '끝' }),
    )
    expect(flowToCode(nodes, edges)).toBe('x = 1\ny = 2')
  })
})

// ── 출력 ──────────────────────────────────────────────────
describe('flow-to-code: 출력', () => {
  it('outputType=string → 따옴표로 감싸서 보여주기', () => {
    const { nodes, edges } = linear(
      node('s', { nodeType: 'terminal', label: '시작' }),
      node('n', { nodeType: 'output', label: '안녕', outputContent: '안녕', outputType: 'string' }),
      node('e', { nodeType: 'terminal', label: '끝' }),
    )
    expect(flowToCode(nodes, edges)).toBe('"안녕" 보여주기')
  })

  it('outputType=expr → 따옴표 없이 보여주기', () => {
    const { nodes, edges } = linear(
      node('s', { nodeType: 'terminal', label: '시작' }),
      node('n', { nodeType: 'output', label: '합계', outputContent: '합계', outputType: 'expr' }),
      node('e', { nodeType: 'terminal', label: '끝' }),
    )
    expect(flowToCode(nodes, edges)).toBe('합계 보여주기')
  })

  it('outputContent가 이미 따옴표로 시작하면 그대로 출력', () => {
    const { nodes, edges } = linear(
      node('s', { nodeType: 'terminal', label: '시작' }),
      node('n', { nodeType: 'output', label: '"hi"', outputContent: '"hi"' }),
      node('e', { nodeType: 'terminal', label: '끝' }),
    )
    expect(flowToCode(nodes, edges)).toBe('"hi" 보여주기')
  })
})

// ── 조건문 ────────────────────────────────────────────────
describe('flow-to-code: 조건문', () => {
  it('decision → 만약 ... 이면 / 아니면 블록', () => {
    const dec = node('dec', { nodeType: 'decision', label: 'x > 0', condition: 'x > 0' })
    const trueN = node('t', { nodeType: 'output', label: '양수', outputContent: '양수', outputType: 'string' })
    const falseN = node('f', { nodeType: 'output', label: '음수', outputContent: '음수', outputType: 'string' })
    const end = node('e', { nodeType: 'terminal', label: '끝' })
    const start = node('s', { nodeType: 'terminal', label: '시작' })

    const nodes = [start, dec, trueN, falseN, end]
    const edges: RFEdge[] = [
      edge('s', 'dec'),
      edge('dec', 't', 'true'),
      edge('dec', 'f', 'false'),
      edge('t', 'e'),
      edge('f', 'e'),
    ]

    const code = flowToCode(nodes, edges)
    expect(code).toContain('만약 x > 0 이면')
    expect(code).toContain('\t"양수" 보여주기')
    expect(code).toContain('아니면')
    expect(code).toContain('\t"음수" 보여주기')
  })
})

// ── 반복 ──────────────────────────────────────────────────
describe('flow-to-code: 반복', () => {
  it('count loop → 반복 N번 / 들여쓰기 본문', () => {
    const loopN = node('l', { nodeType: 'loop', label: '3번 반복', loopVariant: 'count', loopCount: 3 })
    const body = node('b', { nodeType: 'output', label: 'hi', outputContent: 'hi', outputType: 'string' })
    const start = node('s', { nodeType: 'terminal', label: '시작' })
    const end = node('e', { nodeType: 'terminal', label: '끝' })

    const nodes = [start, loopN, body, end]
    const edges: RFEdge[] = [
      edge('s', 'l'),
      edge('l', 'b'),
      edge('b', 'l', 'back'),
      edge('l', 'e'),
    ]

    const code = flowToCode(nodes, edges)
    expect(code).toContain('반복 3번')
    expect(code).toContain('\t"hi" 보여주기')
  })

  it('while loop → 반복 조건 동안', () => {
    const loopN = node('l', { nodeType: 'loop', label: 'x < 10 동안', loopVariant: 'while', loopCondition: 'x < 10' })
    const start = node('s', { nodeType: 'terminal', label: '시작' })
    const end = node('e', { nodeType: 'terminal', label: '끝' })

    const nodes = [start, loopN, end]
    const edges: RFEdge[] = [
      edge('s', 'l'),
      edge('l', 'l', 'back'),
      edge('l', 'e'),
    ]

    const code = flowToCode(nodes, edges)
    expect(code).toContain('반복 x < 10 동안')
  })
})

// ── 시작 노드 없을 때 fallback ─────────────────────────────
describe('flow-to-code: 루트 탐색', () => {
  it('"시작" terminal 없어도 incoming 없는 노드를 루트로 사용', () => {
    const n1 = node('n1', { nodeType: 'process', label: 'x = 1', processVariant: 'assign', varName: 'x', varValue: '1' })
    const n2 = node('n2', { nodeType: 'process', label: 'y = 2', processVariant: 'assign', varName: 'y', varValue: '2' })
    const edges = [edge('n1', 'n2')]
    expect(flowToCode([n1, n2], edges)).toBe('x = 1\ny = 2')
  })
})
