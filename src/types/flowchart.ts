import type { Node } from '@xyflow/react'

export type FlowNodeType =
  | 'terminal'
  | 'process'
  | 'decision'
  | 'loop'
  | 'output'
  | 'function'

export interface FlowNodeData extends Record<string, unknown> {
  label: string
  nodeType: FlowNodeType
  line?: number
  astNodeId?: string
  executing?: boolean
  // 역방향 노드 전용
  varName?: string
  varValue?: string
  condition?: string
  outputContent?: string
  loopCount?: number
}

// React Flow NodeProps 제네릭에 사용하는 완전한 노드 타입
export type AppFlowNode = Node<FlowNodeData>
