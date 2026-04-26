import type { Node as RFNode } from '@xyflow/react'
import type { FlowNodeData } from '../../types/flowchart'

export function findNodeIdByLine(nodes: RFNode<FlowNodeData>[], line: number): string | null {
  const node = nodes.find((n) => n.data.line === line)
  return node?.id ?? null
}
