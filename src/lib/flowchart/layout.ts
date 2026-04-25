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

export function applyLayout(
  nodes: RFNode<FlowNodeData>[],
  edges: RFEdge[],
): { nodes: RFNode<FlowNodeData>[]; edges: RFEdge[] } {
  const g = new dagre.graphlib.Graph()
  g.setDefaultEdgeLabel(() => ({}))
  g.setGraph({ rankdir: 'TB', nodesep: 60, ranksep: 80, edgesep: 20 })

  for (const node of nodes) {
    const size = NODE_SIZES[node.type ?? ''] ?? { width: NODE_WIDTH, height: NODE_HEIGHT }
    g.setNode(node.id, { width: size.width, height: size.height })
  }

  for (const edge of edges) {
    g.setEdge(edge.source, edge.target)
  }

  dagre.layout(g)

  const layoutedNodes = nodes.map((node) => {
    const { x, y, width, height } = g.node(node.id)
    return {
      ...node,
      position: { x: x - width / 2, y: y - height / 2 },
    }
  })

  return { nodes: layoutedNodes, edges }
}
