import type { Node as RFNode, Edge as RFEdge } from '@xyflow/react'
import type { FlowNodeData } from '../../types/flowchart'

export function findNodeIdByLine(nodes: RFNode<FlowNodeData>[], line: number): string | null {
  const node = nodes.find((n) => n.data.line === line)
  return node?.id ?? null
}

// 실행 흐름(루트에서 도달 가능한 노드)에서 끊긴 노드 ID 목록 반환
export function findDisconnectedNodeIds(
  nodes: RFNode<FlowNodeData>[],
  edges: RFEdge[],
): Set<string> {
  if (nodes.length === 0) return new Set()

  // 인접 리스트 (back 엣지 포함 순방향)
  const outgoing = new Map<string, string[]>()
  for (const n of nodes) outgoing.set(n.id, [])
  for (const e of edges) {
    outgoing.get(e.source)?.push(e.target)
  }

  // 루트 찾기: "시작" terminal 우선, 없으면 incoming 없는 노드
  const incomingCount = new Map<string, number>()
  for (const n of nodes) incomingCount.set(n.id, 0)
  for (const e of edges) {
    if ((e.data as { edgeType?: string })?.edgeType !== 'back') {
      incomingCount.set(e.target, (incomingCount.get(e.target) ?? 0) + 1)
    }
  }

  const rootId =
    nodes.find((n) => n.data.nodeType === 'terminal' && n.data.label === '시작')?.id ??
    nodes.find((n) => (incomingCount.get(n.id) ?? 0) === 0)?.id

  if (!rootId) return new Set(nodes.map((n) => n.id))

  // BFS로 루트에서 도달 가능한 노드 집합
  const reachable = new Set<string>()
  const queue = [rootId]
  while (queue.length > 0) {
    const id = queue.shift()!
    if (reachable.has(id)) continue
    reachable.add(id)
    for (const next of outgoing.get(id) ?? []) {
      if (!reachable.has(next)) queue.push(next)
    }
  }

  // 도달 불가능한 노드 (terminal '끝' 제외)
  return new Set(
    nodes
      .filter((n) => !reachable.has(n.id) && !(n.data.nodeType === 'terminal' && n.data.label === '끝'))
      .map((n) => n.id),
  )
}
