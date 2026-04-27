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

export function applyLayout(
  nodes: RFNode<FlowNodeData>[],
  edges: RFEdge[],
): { nodes: RFNode<FlowNodeData>[]; edges: RFEdge[] } {
  const g = new dagre.graphlib.Graph()
  g.setDefaultEdgeLabel(() => ({}))
  g.setGraph({ rankdir: 'TB', nodesep: 60, ranksep: 80, edgesep: 20 })

  // 함수 선언 본문 엣지(funcbody) — dagre에서 제외하고 함수 노드 옆에 수동 배치
  const funcBodyEdges = edges.filter((e) => {
    const et = (e.data as EdgeData)?.edgeType
    return et === 'funcbody'
  })
  const funcBodyTargetIds = new Set(funcBodyEdges.map((e) => e.target))

  for (const node of nodes) {
    // 함수 본문 노드는 dagre 배치에서 제외
    if (funcBodyTargetIds.has(node.id)) continue
    const size = NODE_SIZES[node.type ?? ''] ?? { width: NODE_WIDTH, height: NODE_HEIGHT }
    g.setNode(node.id, { width: size.width, height: size.height })
  }

  for (const edge of edges) {
    const et = (edge.data as EdgeData)?.edgeType
    if (et === 'back') continue
    // funcbody 엣지도 dagre에서 제외
    if (funcBodyTargetIds.has(edge.target)) continue
    g.setEdge(edge.source, edge.target)
  }

  dagre.layout(g)

  const layoutedNodes = nodes.map((node) => {
    // 함수 본문 노드: 해당 함수 선언 노드 왼쪽에 수동 배치
    if (funcBodyTargetIds.has(node.id)) {
      const funcEdge = funcBodyEdges.find((e) => e.target === node.id)
      const funcNodeDagre = funcEdge ? g.node(funcEdge.source) : null
      if (funcNodeDagre) {
        const funcSize = NODE_SIZES['function'] ?? { width: NODE_WIDTH, height: NODE_HEIGHT }
        const bodySize = NODE_SIZES[node.type ?? ''] ?? { width: NODE_WIDTH, height: NODE_HEIGHT }
        return {
          ...node,
          position: {
            x: funcNodeDagre.x - funcSize.width / 2 - bodySize.width - 60,
            y: funcNodeDagre.y - bodySize.height / 2,
          },
        }
      }
    }

    const pos = g.node(node.id)
    if (!pos) return node
    const { x, y, width, height } = pos
    return {
      ...node,
      position: { x: x - width / 2, y: y - height / 2 },
    }
  })

  return { nodes: layoutedNodes, edges }
}
