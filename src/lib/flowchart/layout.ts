import dagre from 'dagre'
import type { Node as RFNode, Edge as RFEdge } from '@xyflow/react'
import type { FlowNodeData } from '../../types/flowchart'

const NODE_WIDTH = 160
const NODE_HEIGHT = 60

const NODE_SIZES: Record<string, { width: number; height: number }> = {
  terminal: { width: 120, height: 40 },
  process: { width: 160, height: 60 },
  decision: { width: 160, height: 80 },
  loop: { width: 160, height: 60 },
  output: { width: 160, height: 60 },
  function: { width: 180, height: 60 },
}

type EdgeData = { edgeType?: string }

function nodeSize(type?: string) {
  return NODE_SIZES[type ?? ''] ?? { width: NODE_WIDTH, height: NODE_HEIGHT }
}

// 함수 노드별로 본문에 속하는 모든 노드 ID를 BFS로 수집
function collectBodyNodeIds(
  edges: RFEdge[],
): Map<string, Set<string>> {
  const funcBodyEdges = edges.filter((e) => (e.data as EdgeData)?.edgeType === 'funcbody')
  const result = new Map<string, Set<string>>()

  for (const fbe of funcBodyEdges) {
    const funcId = fbe.source
    if (!result.has(funcId)) result.set(funcId, new Set())
    const bodySet = result.get(funcId)!

    // BFS: funcbody 직접 자식에서 출발, back/funcbody 엣지는 따라가지 않음
    const queue = [fbe.target]
    const visited = new Set<string>([fbe.target])
    while (queue.length > 0) {
      const cur = queue.shift()!
      bodySet.add(cur)
      for (const e of edges) {
        const et = (e.data as EdgeData)?.edgeType
        if (e.source === cur && et !== 'back' && et !== 'funcbody' && !visited.has(e.target)) {
          visited.add(e.target)
          queue.push(e.target)
        }
      }
    }
  }

  return result
}

// 함수 본문 서브그래프를 dagre로 배치하여 함수 노드 왼쪽에 위치시킴
function layoutBodySubgraph(
  funcNodePos: { x: number; y: number },
  bodyNodeIds: Set<string>,
  nodes: RFNode<FlowNodeData>[],
  edges: RFEdge[],
): Map<string, { x: number; y: number }> {
  const bg = new dagre.graphlib.Graph()
  bg.setDefaultEdgeLabel(() => ({}))
  bg.setGraph({ rankdir: 'TB', nodesep: 40, ranksep: 60 })

  for (const id of bodyNodeIds) {
    const n = nodes.find((n) => n.id === id)
    if (!n) continue
    const { width, height } = nodeSize(n.type)
    bg.setNode(id, { width, height })
  }

  for (const e of edges) {
    const et = (e.data as EdgeData)?.edgeType
    if (et === 'back' || et === 'funcbody') continue
    if (bodyNodeIds.has(e.source) && bodyNodeIds.has(e.target)) {
      bg.setEdge(e.source, e.target)
    }
  }

  dagre.layout(bg)

  // 서브그래프 bounding box
  let minX = Infinity, maxX = -Infinity, minY = Infinity
  for (const id of bodyNodeIds) {
    const pos = bg.node(id)
    if (!pos) continue
    minX = Math.min(minX, pos.x - pos.width / 2)
    maxX = Math.max(maxX, pos.x + pos.width / 2)
    minY = Math.min(minY, pos.y - pos.height / 2)
  }
  const subW = maxX - minX

  const funcSize = nodeSize('function')
  const anchorX = funcNodePos.x - funcSize.width / 2 - subW - 80
  const anchorY = funcNodePos.y - funcSize.height / 2

  const positions = new Map<string, { x: number; y: number }>()
  for (const id of bodyNodeIds) {
    const pos = bg.node(id)
    if (!pos) continue
    positions.set(id, {
      x: anchorX + (pos.x - pos.width / 2) - minX,
      y: anchorY + (pos.y - pos.height / 2) - minY,
    })
  }
  return positions
}

export function applyLayout(
  nodes: RFNode<FlowNodeData>[],
  edges: RFEdge[],
): { nodes: RFNode<FlowNodeData>[]; edges: RFEdge[] } {
  const funcBodySets = collectBodyNodeIds(edges)
  const allBodyIds = new Set<string>()
  for (const s of funcBodySets.values()) for (const id of s) allBodyIds.add(id)

  // ── 메인 dagre (body 노드 제외) ──────────────────
  const g = new dagre.graphlib.Graph()
  g.setDefaultEdgeLabel(() => ({}))
  g.setGraph({ rankdir: 'TB', nodesep: 60, ranksep: 80, edgesep: 20 })

  for (const node of nodes) {
    if (allBodyIds.has(node.id)) continue
    const { width, height } = nodeSize(node.type)
    g.setNode(node.id, { width, height })
  }

  for (const edge of edges) {
    const et = (edge.data as EdgeData)?.edgeType
    if (et === 'back' || et === 'funcbody') continue
    if (allBodyIds.has(edge.source) || allBodyIds.has(edge.target)) continue
    g.setEdge(edge.source, edge.target)
  }

  dagre.layout(g)

  // ── 함수 본문 서브그래프 배치 ─────────────────────
  const bodyPositions = new Map<string, { x: number; y: number }>()
  for (const [funcId, bodySet] of funcBodySets.entries()) {
    const funcPos = g.node(funcId)
    if (!funcPos) continue
    const sub = layoutBodySubgraph(funcPos, bodySet, nodes, edges)
    for (const [id, pos] of sub) bodyPositions.set(id, pos)
  }

  // ── 최종 위치 적용 ────────────────────────────────
  const layoutedNodes = nodes.map((node) => {
    if (bodyPositions.has(node.id)) {
      return { ...node, position: bodyPositions.get(node.id)! }
    }
    const pos = g.node(node.id)
    if (!pos) return node
    return { ...node, position: { x: pos.x - pos.width / 2, y: pos.y - pos.height / 2 } }
  })

  return { nodes: layoutedNodes, edges }
}
