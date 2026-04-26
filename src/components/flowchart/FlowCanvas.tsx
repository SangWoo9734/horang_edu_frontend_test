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
import { editorInstanceRef, isProgrammaticUpdate } from '../editor/editor-ref'
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
    setLastEditSource('flowchart')
    isProgrammaticUpdate.current = true
    editorInstanceRef.current?.setValue(generated)  // onChange 동기 발생 → flag가 막음
    isProgrammaticUpdate.current = false
    setCode(generated)
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

      const loopVariant = (e.dataTransfer.getData('loopVariant') || undefined) as import('../../types/flowchart').LoopVariant | undefined
      const processVariant = (e.dataTransfer.getData('processVariant') || undefined) as import('../../types/flowchart').ProcessVariant | undefined
      const position = screenToFlowPosition({ x: e.clientX, y: e.clientY })
      const id = `user-${Date.now()}`
      const newNode: (typeof nodes)[0] = {
        id,
        type: nodeType,
        position,
        data: { label: '...', nodeType, loopVariant, processVariant },
      }
      setNodes([...nodes, newNode])
      openModal(id)
    },
    [nodes, setNodes, openModal, screenToFlowPosition],
  )

  return (
    <>
      {/* 카드 헤더 */}
      <div style={{
        height: 40, display: 'flex', alignItems: 'center',
        padding: '0 14px', gap: 8,
        borderBottom: '1px solid #F3F2FA', flexShrink: 0,
      }}>
        <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#10B981', flexShrink: 0 }}/>
        <span style={{ fontSize: 12, fontWeight: 700, color: '#4B4B6B' }}>순서도</span>
        <span style={{ marginLeft: 'auto', fontSize: 10, color: '#B0AECF' }}>
          {nodes.filter(n => n.data.nodeType !== 'terminal').length}개 노드
        </span>
      </div>

      <div style={{ display: 'flex', flex: 1, overflow: 'hidden', minHeight: 0, position: 'relative' }}>
        <NodePalette />
        <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
          {nodes.length === 0 && (
            <div style={{
              position: 'absolute', inset: 0, zIndex: 1,
              display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center',
              gap: 10, pointerEvents: 'none',
            }}>
              <div style={{ fontSize: 44, animation: 'float 3s ease-in-out infinite' }}>🌙</div>
              <p style={{ color: '#C4B5FD', fontSize: 12, fontWeight: 600, textAlign: 'center', lineHeight: 1.7 }}>
                왼쪽에서 코드를 쓰면<br/>순서도가 짠! 하고 나와요
              </p>
            </div>
          )}
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
            <Background
              color="#D4CFFE"
              gap={24}
              size={1.2}
              variant={'dots' as import('@xyflow/react').BackgroundVariant}
            />
            <Controls />
          </ReactFlow>
        </div>
      </div>
      <NodeEditModal />
      <style>{`@keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-7px)}}`}</style>
    </>
  )
}

export default function FlowCanvas() {
  return (
    <ReactFlowProvider>
      <FlowCanvasInner />
    </ReactFlowProvider>
  )
}
