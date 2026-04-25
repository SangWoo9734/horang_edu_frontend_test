export type FlowNodeType =
  | 'terminal'
  | 'process'
  | 'decision'
  | 'loop'
  | 'output'
  | 'function'

export interface FlowNodeData {
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
  [key: string]: unknown
}
