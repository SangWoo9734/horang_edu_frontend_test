import {
  CodeFile,
  Block,
  SetVariable,
  IfStatement,
  CountLoop,
  ConditionalLoop,
  ListLoop,
  FunctionInvoke,
  DeclareFunction,
  ReturnStatement,
  Node as AstNode,
} from '@dalbit-yaksok/core'
import type { Node as RFNode, Edge as RFEdge } from '@xyflow/react'
import type { FlowNodeData } from '../../types/flowchart'

type FlowNode = RFNode<FlowNodeData>
type FlowEdge = RFEdge

interface Ctx {
  nodes: FlowNode[]
  edges: FlowEdge[]
  counter: number
}

interface EdgeOpts {
  label?: string
  edgeType?: 'true' | 'false' | 'back'
}

function uid(ctx: Ctx): string {
  return `n${++ctx.counter}`
}

function addNode(ctx: Ctx, id: string, data: FlowNodeData): void {
  ctx.nodes.push({ id, type: data.nodeType, position: { x: 0, y: 0 }, data })
}

function addEdge(ctx: Ctx, source: string, target: string, opts: EdgeOpts = {}): void {
  ctx.edges.push({
    id: `e-${source}-${target}-${ctx.counter}`,
    source,
    target,
    label: opts.label,
    data: { edgeType: opts.edgeType ?? 'default' },
    animated: false,
  })
}

function tokenLabel(node: AstNode): string {
  return node.tokens.map((t) => t.value).join(' ').trim() || '?'
}

function getLine(node: AstNode): number | undefined {
  return node.tokens[0]?.position?.line
}

// Block의 자식 노드들을 순서대로 변환. fromIds: 이 블록으로 들어오는 노드 ID들.
// 반환값: 이 블록의 마지막 노드 ID들 (다음 노드와 연결할 "꼬리")
function convertBlock(block: Block, fromIds: string[], ctx: Ctx, entryOpts: EdgeOpts = {}): string[] {
  if (block.children.length === 0) return fromIds

  let tails = fromIds
  let isFirst = true

  for (const child of block.children) {
    tails = convertNode(child, tails, ctx, isFirst ? entryOpts : {})
    isFirst = false
  }
  return tails
}

function convertNode(node: AstNode, fromIds: string[], ctx: Ctx, edgeOpts: EdgeOpts = {}): string[] {
  if (node instanceof SetVariable) {
    const id = uid(ctx)
    addNode(ctx, id, {
      label: `${node.name} = ${tokenLabel(node.value)}`,
      nodeType: 'process',
      line: getLine(node),
      astNodeId: id,
    })
    for (const from of fromIds) addEdge(ctx, from, id, edgeOpts)
    return [id]
  }

  if (node instanceof FunctionInvoke) {
    const id = uid(ctx)
    const isOutput = node.name === '보여주기'
    const paramLabel = Object.values(node.params).map((p) => tokenLabel(p)).join(', ')
    addNode(ctx, id, {
      label: isOutput ? paramLabel : `${node.name}(${paramLabel})`,
      nodeType: isOutput ? 'output' : 'process',
      line: getLine(node),
      astNodeId: id,
    })
    for (const from of fromIds) addEdge(ctx, from, id, edgeOpts)
    return [id]
  }

  if (node instanceof IfStatement) {
    const decId = uid(ctx)
    const condLabel = node.cases[0]?.condition ? tokenLabel(node.cases[0].condition) : '?'
    addNode(ctx, decId, {
      label: condLabel,
      nodeType: 'decision',
      line: getLine(node),
      astNodeId: decId,
    })
    for (const from of fromIds) addEdge(ctx, from, decId, edgeOpts)

    const trueTails = convertBlock(node.cases[0].body, [decId], ctx, { label: '참', edgeType: 'true' })
    const elseCase = node.cases.find((c) => !c.condition)
    const falseTails = elseCase
      ? convertBlock(elseCase.body, [decId], ctx, { label: '거짓', edgeType: 'false' })
      : [decId]

    return [...trueTails, ...falseTails]
  }

  if (node instanceof CountLoop) {
    const id = uid(ctx)
    addNode(ctx, id, {
      label: `${tokenLabel(node.count)}번 반복`,
      nodeType: 'loop',
      line: getLine(node),
      astNodeId: id,
    })
    for (const from of fromIds) addEdge(ctx, from, id, edgeOpts)
    const bodyTails = convertBlock(node.body, [id], ctx)
    for (const tail of bodyTails) addEdge(ctx, tail, id, { edgeType: 'back' })
    return [id]
  }

  if (node instanceof ConditionalLoop) {
    const id = uid(ctx)
    addNode(ctx, id, {
      label: `${tokenLabel(node.condition)} 동안`,
      nodeType: 'loop',
      line: getLine(node),
      astNodeId: id,
    })
    for (const from of fromIds) addEdge(ctx, from, id, edgeOpts)
    const bodyTails = convertBlock(node.body, [id], ctx)
    for (const tail of bodyTails) addEdge(ctx, tail, id, { edgeType: 'back' })
    return [id]
  }

  if (node instanceof ListLoop) {
    const id = uid(ctx)
    addNode(ctx, id, {
      label: `${node.variableName}: ${tokenLabel(node.list)}`,
      nodeType: 'loop',
      line: getLine(node),
      astNodeId: id,
    })
    for (const from of fromIds) addEdge(ctx, from, id, edgeOpts)
    const bodyTails = convertBlock(node.body, [id], ctx)
    for (const tail of bodyTails) addEdge(ctx, tail, id, { edgeType: 'back' })
    return [id]
  }

  if (node instanceof DeclareFunction) {
    const id = uid(ctx)
    addNode(ctx, id, {
      label: node.name,
      nodeType: 'function',
      line: getLine(node),
      astNodeId: id,
    })
    for (const from of fromIds) addEdge(ctx, from, id, edgeOpts)
    return [id]
  }

  if (node instanceof ReturnStatement) {
    const id = uid(ctx)
    addNode(ctx, id, {
      label: '반환',
      nodeType: 'terminal',
      line: getLine(node),
      astNodeId: id,
    })
    for (const from of fromIds) addEdge(ctx, from, id, edgeOpts)
    return [id]
  }

  // 알 수 없는 노드 — 제네릭 process 노드로 표시
  const id = uid(ctx)
  addNode(ctx, id, {
    label: tokenLabel(node),
    nodeType: 'process',
    line: getLine(node),
    astNodeId: id,
  })
  for (const from of fromIds) addEdge(ctx, from, id, edgeOpts)
  return [id]
}

export interface FlowGraph {
  nodes: FlowNode[]
  edges: FlowEdge[]
}

export function convertAstToFlow(ast: Block): FlowGraph {
  const ctx: Ctx = { nodes: [], edges: [], counter: 0 }

  const startId = uid(ctx)
  addNode(ctx, startId, { label: '시작', nodeType: 'terminal' })

  const tails = convertBlock(ast, [startId], ctx)

  const endId = uid(ctx)
  addNode(ctx, endId, { label: '끝', nodeType: 'terminal' })
  for (const tail of tails) addEdge(ctx, tail, endId)

  return { nodes: ctx.nodes, edges: ctx.edges }
}

export function parseAndConvert(code: string): FlowGraph | null {
  try {
    const codeFile = new CodeFile(code, 'main')
    const ast = codeFile.parseOptimistically()
    return convertAstToFlow(ast)
  } catch {
    return null
  }
}
