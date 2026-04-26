import type { Node as RFNode, Edge as RFEdge } from '@xyflow/react'
import type { FlowNodeData } from '../../types/flowchart'

type FlowNode = RFNode<FlowNodeData>
type EdgeData = { edgeType?: 'true' | 'false' | 'back' | 'body' | 'default' }
type FlowEdge = RFEdge<EdgeData>

function buildMaps(nodes: FlowNode[], edges: FlowEdge[]) {
  const nodeMap = new Map<string, FlowNode>()
  const outgoing = new Map<string, FlowEdge[]>()
  const incoming = new Map<string, FlowEdge[]>()

  for (const n of nodes) {
    nodeMap.set(n.id, n)
    outgoing.set(n.id, [])
    incoming.set(n.id, [])
  }
  for (const e of edges) {
    outgoing.get(e.source)?.push(e)
    incoming.get(e.target)?.push(e)
  }
  return { nodeMap, outgoing, incoming }
}

// BFS로 decision 이후 두 브랜치가 합류하는 첫 번째 노드를 찾는다
function findMergeNode(
  decisionId: string,
  outgoing: Map<string, FlowEdge[]>,
  incoming: Map<string, FlowEdge[]>,
): string | null {
  const visited = new Set<string>([decisionId])
  const queue: string[] = [decisionId]

  while (queue.length > 0) {
    const id = queue.shift()!
    for (const edge of outgoing.get(id) ?? []) {
      const t = edge.target
      if (visited.has(t)) continue
      visited.add(t)

      const inEdges = (incoming.get(t) ?? []).filter(
        (e) => (e.data as EdgeData)?.edgeType !== 'back',
      )
      if (inEdges.length >= 2) return t

      queue.push(t)
    }
  }
  return null
}

function nodeToCodeLine(node: FlowNode, depth: number): string {
  const indent = '\t'.repeat(depth)
  const d = node.data

  if (d.nodeType === 'process') {
    if (d.processVariant === 'func-call') {
      const args = d.funcCallArgs ? ` ${d.funcCallArgs}` : ''
      return `${indent}${d.funcCallName ?? d.label}${args}`
    }
    // 변수 할당 (assign)
    return `${indent}${d.varName != null ? `${d.varName} = ${d.varValue ?? ''}` : d.label}`
  }
  if (d.nodeType === 'output') {
    const content = d.outputContent != null ? d.outputContent : d.label
    const isExpr = d.outputType === 'expr' || content.startsWith('"')
    const formatted = isExpr ? content : `"${content}"`
    return `${indent}${formatted} 보여주기`
  }
  if (d.nodeType === 'decision') {
    const cond = d.condition != null ? d.condition : d.label
    return `${indent}만약 ${cond} 이면`
  }
  if (d.nodeType === 'loop') {
    const variant = d.loopVariant ?? 'count'
    if (variant === 'while') {
      const cond = d.loopCondition ?? d.label.replace(/ 동안$/, '').trim()
      return `${indent}반복 ${cond} 동안`
    }
    if (variant === 'list') {
      return `${indent}반복 ${d.listVar ?? '목록'} 의 ${d.itemVar ?? '항목'} 마다`
    }
    // count (기본)
    const count = d.loopCount != null ? d.loopCount : d.label.replace(/번 반복$/, '').trim()
    return `${indent}반복 ${count}번`
  }
  if (d.nodeType === 'function') {
    const name = d.funcName ?? d.label.replace(/^약속: /, '')
    const params = d.funcParams ? `, (${d.funcParams})` : ''
    return `${indent}약속,${params} ${name}`
  }
  return ''
}

function generateBlock(
  startId: string,
  outgoing: Map<string, FlowEdge[]>,
  incoming: Map<string, FlowEdge[]>,
  nodeMap: Map<string, FlowNode>,
  depth: number,
  visited: Set<string>,
  stopIds: Set<string>,
): string[] {
  let currentId: string | null = startId
  const lines: string[] = []

  while (currentId && !visited.has(currentId) && !stopIds.has(currentId)) {
    visited.add(currentId)
    const node = nodeMap.get(currentId)
    if (!node) break

    const { nodeType } = node.data
    const outEdges: FlowEdge[] = outgoing.get(currentId) ?? []

    if (nodeType === 'terminal') {
      // 시작/끝 노드는 코드 생성 없이 다음으로
    } else if (nodeType === 'process' || nodeType === 'output') {
      const line = nodeToCodeLine(node, depth)
      if (line) lines.push(line)
    } else if (nodeType === 'decision') {
      lines.push(nodeToCodeLine(node, depth))

      const trueEdge = outEdges.find((e) => (e.data as EdgeData)?.edgeType === 'true' || e.label === '참')
      const falseEdge = outEdges.find((e) => (e.data as EdgeData)?.edgeType === 'false' || e.label === '거짓')
      const mergeId = findMergeNode(currentId, outgoing, incoming)
      const mergeStop = new Set([...stopIds, ...(mergeId ? [mergeId] : [])])

      if (trueEdge) {
        lines.push(...generateBlock(trueEdge.target, outgoing, incoming, nodeMap, depth + 1, new Set(visited), mergeStop))
      }
      if (falseEdge) {
        lines.push('\t'.repeat(depth) + '아니면')
        lines.push(...generateBlock(falseEdge.target, outgoing, incoming, nodeMap, depth + 1, new Set(visited), mergeStop))
      }

      if (mergeId) {
        currentId = mergeId
        continue
      }
      break
    } else if (nodeType === 'loop') {
      lines.push(nodeToCodeLine(node, depth))

      // 'body' 태그 우선, 없으면 첫 번째 비-back 엣지 (사용자가 직접 그린 경우 fallback)
      const bodyEdge =
        outEdges.find((e) => (e.data as EdgeData)?.edgeType === 'body') ??
        outEdges.find((e) => (e.data as EdgeData)?.edgeType !== 'back')
      if (bodyEdge) {
        lines.push(...generateBlock(bodyEdge.target, outgoing, incoming, nodeMap, depth + 1, new Set(visited), new Set([...stopIds, currentId])))
      }
    } else if (nodeType === 'function') {
      lines.push(nodeToCodeLine(node, depth))

      const bodyEdge =
        outEdges.find((e) => (e.data as EdgeData)?.edgeType === 'body') ??
        outEdges.find((e) => (e.data as EdgeData)?.edgeType !== 'back')
      if (bodyEdge) {
        lines.push(...generateBlock(bodyEdge.target, outgoing, incoming, nodeMap, depth + 1, new Set(visited), new Set([...stopIds, currentId])))
      }
      lines.push('') // 함수 선언 뒤 빈 줄
    }

    // 다음 순차 엣지 탐색 (back/true/false/body 제외)
    const nextEdge: FlowEdge | undefined = outEdges.find((e) => {
      const et = (e.data as EdgeData)?.edgeType
      return et !== 'back' && et !== 'true' && et !== 'false' && et !== 'body'
    })
    currentId = nextEdge?.target ?? null
  }

  return lines
}

export function flowToCode(nodes: FlowNode[], edges: FlowEdge[]): string {
  if (nodes.length === 0) return ''

  const { nodeMap, outgoing, incoming } = buildMaps(nodes, edges)

  // 1) AST→Flow가 만든 "시작" terminal 우선
  // 2) 없으면 incoming 비-back 엣지가 없는 노드를 루트로 사용 (팔레트로 직접 만든 순서도)
  let startId: string | undefined = nodes.find(
    (n) => n.data.nodeType === 'terminal' && n.data.label === '시작',
  )?.id

  if (!startId) {
    startId = nodes.find((n) => {
      const inEdges = (incoming.get(n.id) ?? []).filter(
        (e) => (e.data as EdgeData)?.edgeType !== 'back',
      )
      return inEdges.length === 0
    })?.id
  }

  if (!startId) return ''

  const lines = generateBlock(startId, outgoing, incoming, nodeMap, 0, new Set(), new Set())
  return lines.filter((l) => l !== undefined).join('\n').trimEnd()
}
