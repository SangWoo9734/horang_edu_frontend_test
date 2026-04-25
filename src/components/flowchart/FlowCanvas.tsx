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
  applyNodeChanges,
  applyEdgeChanges,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'

import TerminalNode from './nodes/TerminalNode'
import ProcessNode from './nodes/ProcessNode'
import DecisionNode from './nodes/DecisionNode'
import LoopNode from './nodes/LoopNode'
import OutputNode from './nodes/OutputNode'
import FunctionNode from './nodes/FunctionNode'
import AnimatedEdge from './edges/AnimatedEdge'

import { useEditorStore } from '../../stores/editor-store'
import { useFlowchartStore } from '../../stores/flowchart-store'
import { parseAndConvert } from '../../lib/flowchart/ast-to-flow'
import { applyLayout } from '../../lib/flowchart/layout'

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
  const { fitView } = useReactFlow()

  const code = useEditorStore((s) => s.code)
  const { nodes, edges, setNodes, setEdges } = useFlowchartStore()

  // 코드 변경 시 순서도 업데이트 (Phase 6 SYN으로 debounce 추가 예정)
  useEffect(() => {
    if (!code) {
      setNodes([])
      setEdges([])
      return
    }
    const graph = parseAndConvert(code)
    if (!graph) return

    const { nodes: layoutNodes, edges: layoutEdges } = applyLayout(graph.nodes, graph.edges)
    setNodes(layoutNodes)
    setEdges(layoutEdges)

    setTimeout(() => fitView({ padding: 0.2, duration: 300 }), 50)
  }, [code, setNodes, setEdges, fitView])

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
      setEdges([...edges, { ...connection, id: `e-${connection.source}-${connection.target}` }])
    },
    [edges, setEdges],
  )

  return (
    <div style={{ width: '100%', height: '100%', background: '#0F0F1A' }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        fitView
        proOptions={{ hideAttribution: true }}
      >
        <Background color="#2A2A3E" gap={20} />
        <Controls />
      </ReactFlow>
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
