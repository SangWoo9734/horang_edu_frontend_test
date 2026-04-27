import { useEffect, useCallback } from 'react'
import {
  useReactFlow,
  type OnConnect,
  type OnNodesChange,
  type OnEdgesChange,
  type OnNodesDelete,
  type OnEdgesDelete,
  applyNodeChanges,
  applyEdgeChanges,
  addEdge,
} from '@xyflow/react'
import { useEditorStore } from '../../../stores/editor-store'
import { useFlowchartStore } from '../../../stores/flowchart-store'
import { useUiStore } from '../../../stores/ui-store'
import { parseAndConvert } from '../../../lib/flowchart/ast-to-flow'
import { applyLayout } from '../../../lib/flowchart/layout'
import { flowToCode } from '../../../lib/flowchart/flow-to-code'
import { editorInstanceRef, isProgrammaticUpdateRef } from '../../editor/editor-ref'
import { SYNC_DEBOUNCE_MS } from '../../../lib/flowchart/sync'
import type { FlowNodeType, LoopVariant, ProcessVariant } from '../../../types/flowchart'

export function useFlowSync() {
  const { fitView, screenToFlowPosition } = useReactFlow()
  const code = useEditorStore((s) => s.code)
  const setCode = useEditorStore((s) => s.setCode)
  const { nodes, edges, setNodes, setEdges } = useFlowchartStore()
  const { openModal, setLastEditSource } = useUiStore()

  // 코드 → 순서도 동기화
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

  // 순서도 → 코드 변환
  const triggerF2C = useCallback((nextNodes = nodes, nextEdges = edges) => {
    const generated = flowToCode(nextNodes, nextEdges)
    if (!generated) return
    setLastEditSource('flowchart')
    isProgrammaticUpdateRef.current = true
    editorInstanceRef.current?.setValue(generated)
    isProgrammaticUpdateRef.current = false
    setCode(generated)
  }, [nodes, edges, setCode, setLastEditSource])

  const onNodesChange: OnNodesChange = useCallback(
    (changes) => setNodes(applyNodeChanges(changes, nodes) as typeof nodes),
    [nodes, setNodes],
  )

  const onEdgesChange: OnEdgesChange = useCallback(
    (changes) => setEdges(applyEdgeChanges(changes, edges)),
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

  const onNodeDoubleClick = useCallback(
    (_: React.MouseEvent, node: { id: string }) => openModal(node.id),
    [openModal],
  )

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }, [])

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      const nodeType = e.dataTransfer.getData('nodeType') as FlowNodeType
      if (!nodeType) return
      const loopVariant = (e.dataTransfer.getData('loopVariant') || undefined) as LoopVariant | undefined
      const processVariant = (e.dataTransfer.getData('processVariant') || undefined) as ProcessVariant | undefined
      const position = screenToFlowPosition({ x: e.clientX, y: e.clientY })
      const id = `user-${Date.now()}`
      const newNode: (typeof nodes)[0] = {
        id, type: nodeType, position,
        data: { label: '...', nodeType, loopVariant, processVariant },
      }
      setNodes([...nodes, newNode])
      openModal(id)
    },
    [nodes, setNodes, openModal, screenToFlowPosition],
  )

  return {
    onNodesChange, onEdgesChange, onConnect,
    onNodesDelete, onEdgesDelete,
    onNodeClick, onNodeDoubleClick,
    onDragOver, onDrop,
  }
}
