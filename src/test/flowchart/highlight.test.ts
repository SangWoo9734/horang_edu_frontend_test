import { describe, it, expect } from 'vitest'
import { findNodeIdByLine, findDisconnectedNodeIds } from '../../lib/flowchart/highlight'
import type { Node as RFNode, Edge as RFEdge } from '@xyflow/react'
import type { FlowNodeData } from '../../types/flowchart'

// ── 헬퍼 ──────────────────────────────────────────────────
function n(id: string, line?: number, nodeType: FlowNodeData['nodeType'] = 'process', label = ''): RFNode<FlowNodeData> {
  return { id, type: nodeType, position: { x: 0, y: 0 }, data: { label, nodeType, line } }
}

function e(source: string, target: string, edgeType?: string): RFEdge {
  return { id: `${source}-${target}`, source, target, data: { edgeType } }
}

// ── findNodeIdByLine ───────────────────────────────────────
describe('findNodeIdByLine', () => {
  it('해당 line을 가진 노드 ID를 반환한다', () => {
    const nodes = [n('a', 1), n('b', 2), n('c', 3)]
    expect(findNodeIdByLine(nodes, 2)).toBe('b')
  })

  it('없는 line이면 null 반환', () => {
    const nodes = [n('a', 1)]
    expect(findNodeIdByLine(nodes, 99)).toBeNull()
  })

  it('노드 배열이 비어있으면 null 반환', () => {
    expect(findNodeIdByLine([], 1)).toBeNull()
  })
})

// ── findDisconnectedNodeIds ────────────────────────────────
describe('findDisconnectedNodeIds: 기본', () => {
  it('노드가 없으면 빈 Set 반환', () => {
    expect(findDisconnectedNodeIds([], [])).toEqual(new Set())
  })

  it('모두 연결된 선형 그래프는 disconnected 없음', () => {
    const nodes = [
      n('s', undefined, 'terminal', '시작'),
      n('a'),
      n('e', undefined, 'terminal', '끝'),
    ]
    const edges = [e('s', 'a'), e('a', 'e')]
    expect(findDisconnectedNodeIds(nodes, edges).size).toBe(0)
  })

  it('루트에서 도달 불가한 노드는 disconnected', () => {
    const nodes = [
      n('s', undefined, 'terminal', '시작'),
      n('a'),
      n('orphan'), // 연결 없음
      n('e', undefined, 'terminal', '끝'),
    ]
    const edges = [e('s', 'a'), e('a', 'e')]
    const result = findDisconnectedNodeIds(nodes, edges)
    expect(result.has('orphan')).toBe(true)
    expect(result.has('a')).toBe(false)
  })
})

describe('findDisconnectedNodeIds: 특수 케이스', () => {
  it('"끝" terminal은 disconnected에서 제외', () => {
    const nodes = [
      n('s', undefined, 'terminal', '시작'),
      n('a'),
      n('e', undefined, 'terminal', '끝'), // '끝'은 별도 처리
    ]
    // '끝'으로 연결하는 엣지 없음
    const edges = [e('s', 'a')]
    const result = findDisconnectedNodeIds(nodes, edges)
    expect(result.has('e')).toBe(false)
  })

  it('"시작" terminal이 루트로 선택된다', () => {
    // incoming이 없는 노드가 2개 있을 때 '시작' terminal이 우선
    const nodes = [
      n('s', undefined, 'terminal', '시작'),
      n('orphan_root'), // incoming 없지만 '시작' 아님
      n('a'),
      n('e', undefined, 'terminal', '끝'),
    ]
    const edges = [e('s', 'a'), e('a', 'e')]
    const result = findDisconnectedNodeIds(nodes, edges)
    expect(result.has('orphan_root')).toBe(true)
    expect(result.has('a')).toBe(false)
  })

  it('back 엣지는 incoming count에서 제외된다', () => {
    // loop back 엣지가 있어도 loop 노드는 disconnected 처리되지 않음
    const nodes = [
      n('s', undefined, 'terminal', '시작'),
      n('loop', undefined, 'loop'),
      n('body'),
      n('e', undefined, 'terminal', '끝'),
    ]
    const edges = [
      e('s', 'loop'),
      e('loop', 'body'),
      e('body', 'loop', 'back'), // back 엣지
      e('loop', 'e'),
    ]
    const result = findDisconnectedNodeIds(nodes, edges)
    expect(result.size).toBe(0)
  })
})

// ── 복합: 조건 분기 ───────────────────────────────────────
describe('findDisconnectedNodeIds: 조건 분기', () => {
  it('decision의 양쪽 분기 노드는 disconnected가 아님', () => {
    const nodes = [
      n('s', undefined, 'terminal', '시작'),
      n('dec', undefined, 'decision'),
      n('t'),   // true 분기
      n('f'),   // false 분기
      n('merge'),
      n('e', undefined, 'terminal', '끝'),
    ]
    const edges = [
      e('s', 'dec'),
      e('dec', 't', 'true'),
      e('dec', 'f', 'false'),
      e('t', 'merge'),
      e('f', 'merge'),
      e('merge', 'e'),
    ]
    const result = findDisconnectedNodeIds(nodes, edges)
    expect(result.size).toBe(0)
  })
})
