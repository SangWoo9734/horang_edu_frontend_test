import { useEffect, useCallback } from 'react'
import {
  ReactFlow,
  Background,
  Controls,
  useReactFlow,
  ReactFlowProvider,
  type NodeTypes,
  type EdgeTypes,
  type OnConnect,
  type OnNodesChange,
  type OnEdgesChange,
  type OnNodesDelete,
  type OnEdgesDelete,
  applyNodeChanges,
  applyEdgeChanges,
  addEdge,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'

import TerminalNode from './nodes/TerminalNode'
import ProcessNode from './nodes/ProcessNode'
import DecisionNode from './nodes/DecisionNode'
import LoopNode from './nodes/LoopNode'
import OutputNode from './nodes/OutputNode'
import FunctionNode from './nodes/FunctionNode'
import AnimatedEdge from './edges/AnimatedEdge'
import NodePalette from './NodePalette'
import NodeEditModal from './NodeEditModal'

import { useEditorStore } from '../../stores/editor-store'
import { useFlowchartStore } from '../../stores/flowchart-store'
import { useUiStore } from '../../stores/ui-store'
import { parseAndConvert } from '../../lib/flowchart/ast-to-flow'
import { applyLayout } from '../../lib/flowchart/layout'
import { flowToCode } from '../../lib/flowchart/flow-to-code'
import { editorInstanceRef } from '../editor/editor-ref'
import { SYNC_DEBOUNCE_MS } from '../../lib/flowchart/sync'
import type { FlowNodeType } from '../../types/flowchart'

const nodeTypes: NodeTypes = {
  terminal: TerminalNode,
  process: ProcessNode,
  decision: DecisionNode,
  loop: LoopNode,
  output: OutputNode,
  function: FunctionNode,
}

const edgeTypes: EdgeTypes = {
  default: AnimatedEdge,
}

function FlowCanvasInner() {
  const { fitView, screenToFlowPosition } = useReactFlow()
  const code = useEditorStore((s) => s.code)
  const setCode = useEditorStore((s) => s.setCode)
  const { nodes, edges, executingNodeId, setNodes, setEdges } = useFlowchartStore()
  const { openModal, setLastEditSource } = useUiStore()

  // 코드 변경 시 정방향 변환 (debounce 300ms, lastEditSource === 'code' 일 때만)
  useEffect(() => {
    const timer = setTimeout(() => {
      const { lastEditSource } = useUiStore.getState()
      if (lastEditSource === 'flowchart') return

      if (!code) { setNodes([]); setEdges([]); return }
      const graph = parseAndConvert(code)
      if (!graph) return

      const { nodes: ln, edges: le } = applyLayout(graph.nodes, graph.edges)
      setNodes(ln)
      setEdges(le)
      setTimeout(() => fitView({ padding: 0.2, duration: 300 }), 50)
    }, SYNC_DEBOUNCE_MS)
    return () => clearTimeout(timer)
  }, [code, setNodes, setEdges, fitView])

  // 실행 중인 노드 하이라이트
  useEffect(() => {
    const current = useFlowchartStore.getState().nodes
    setNodes(current.map((n) => ({
      ...n,
      data: { ...n.data, executing: n.id === executingNodeId },
    })))
  }, [executingNodeId, setNodes])

  // 순서도 변경 시 역방향 변환 (코드 업데이트)
  const triggerF2C = useCallback((nextNodes = nodes, nextEdges = edges) => {
    const generated = flowToCode(nextNodes, nextEdges)
    if (!generated) return
    setLastEditSource('flowchart')  // onChange에서 lastEditSource 변경 차단
    setCode(generated)
    editorInstanceRef.current?.setValue(generated)
  }, [nodes, edges, setCode, setLastEditSource])

  const onNodesChange: OnNodesChange = useCallback(
    (changes) => {
      const next = applyNodeChanges(changes, nodes) as typeof nodes
      setNodes(next)
    },
    [nodes, setNodes],
  )

  const onEdgesChange: OnEdgesChange = useCallback(
    (changes) => {
      const next = applyEdgeChanges(changes, edges)
      setEdges(next)
    },
    [edges, setEdges],
  )

  const onConnect: OnConnect = useCallback(
    (connection) => {
      const next = addEdge({ ...connection, type: 'default' }, edges)
      setEdges(next)
      triggerF2C(nodes, next)
    },
    [edges, nodes, setEdges, triggerF2C],
  )

  const onNodesDelete: OnNodesDelete = useCallback(
    (deleted) => {
      const ids = new Set(deleted.map((n) => n.id))
      const next = nodes.filter((n) => !ids.has(n.id))
      const nextEdges = edges.filter((e) => !ids.has(e.source) && !ids.has(e.target))
      setNodes(next)
      setEdges(nextEdges)
      triggerF2C(next, nextEdges)
    },
    [nodes, edges, setNodes, setEdges, triggerF2C],
  )

  const onEdgesDelete: OnEdgesDelete = useCallback(
    (deleted) => {
      const ids = new Set(deleted.map((e) => e.id))
      const next = edges.filter((e) => !ids.has(e.id))
      setEdges(next)
      triggerF2C(nodes, next)
    },
    [edges, nodes, setEdges, triggerF2C],
  )

  // 노드 클릭 → 에디터 해당 줄로 이동
  const onNodeClick = useCallback(
    (_: React.MouseEvent, node: { id: string; data: unknown }) => {
      const data = node.data as { line?: number }
      if (data.line == null) return
      const editor = editorInstanceRef.current
      if (!editor) return
      editor.revealLineInCenter(data.line)
      editor.setPosition({ lineNumber: data.line, column: 1 })
    },
    [],
  )

  // 노드 더블클릭 → 수정 모달
  const onNodeDoubleClick = useCallback(
    (_: React.MouseEvent, node: { id: string }) => {
      openModal(node.id)
    },
    [openModal],
  )

  // 팔레트 드래그 드롭
  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }, [])

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      const nodeType = e.dataTransfer.getData('nodeType') as FlowNodeType
      if (!nodeType) return

      const position = screenToFlowPosition({ x: e.clientX, y: e.clientY })
      const id = `user-${Date.now()}`
      const newNode = {
        id,
        type: nodeType,
        position,
        data: { label: '...', nodeType },
      }
      setNodes([...nodes, newNode])
      openModal(id)
    },
    [nodes, setNodes, openModal, screenToFlowPosition],
  )

  return (
    <div style={{ width: '100%', height: '100%', background: '#0F0F1A', position: 'relative' }}>
      <NodePalette />
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodesDelete={onNodesDelete}
        onEdgesDelete={onEdgesDelete}
        onNodeClick={onNodeClick}
        onNodeDoubleClick={onNodeDoubleClick}
        onDragOver={onDragOver}
        onDrop={onDrop}
        fitView
        deleteKeyCode="Delete"
        proOptions={{ hideAttribution: true }}
      >
        <Background color="#2A2A3E" gap={20} />
        <Controls />
      </ReactFlow>
      <NodeEditModal />
    </div>
  )
}

export default function FlowCanvas() {
  return (
    <ReactFlowProvider>
      <FlowCanvasInner />
    </ReactFlowProvider>
  )
}
