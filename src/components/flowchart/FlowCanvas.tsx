import { css } from 'styled-system/css'
import {
  ReactFlow,
  Background,
  Controls,
  ReactFlowProvider,
  type NodeTypes,
  type EdgeTypes,
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

import { useFlowchartStore } from '../../stores/flowchart-store'
import { useFlowSync } from './hooks/useFlowSync'
import { useExecutionHighlight } from './hooks/useExecutionHighlight'

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
  const { nodes, edges } = useFlowchartStore()

  const {
    onNodesChange, onEdgesChange, onConnect,
    onNodesDelete, onEdgesDelete,
    onNodeClick, onNodeDoubleClick,
    onDragOver, onDrop,
  } = useFlowSync()

  useExecutionHighlight()

  return (
    <>
      <div className={css({
        height: '40px', display: 'flex', alignItems: 'center',
        paddingX: '3.5', gap: '2',
        borderBottom: '1px solid', borderColor: 'bgBase', flexShrink: 0,
      })}>
        <span className={css({ width: '7px', height: '7px', borderRadius: 'full', bg: 'nodeLoop', flexShrink: 0 })}/>
        <span className={css({ fontSize: '12px', fontWeight: '700', color: 'textMid', fontFamily: 'ui' })}>순서도</span>
        <span className={css({ marginLeft: 'auto', fontSize: '10px', color: 'accent', fontFamily: 'ui' })}>
          {nodes.filter(n => n.data.nodeType !== 'terminal').length}개 노드
        </span>
      </div>

      <div className={css({ display: 'flex', flex: 1, overflow: 'hidden', minHeight: 0, position: 'relative' })}>
        <NodePalette />
        <div className={css({ flex: 1, position: 'relative', overflow: 'hidden' })}>
          {nodes.length === 0 && (
            <div className={css({
              position: 'absolute', inset: 0, zIndex: 1,
              display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center',
              gap: '2.5', pointerEvents: 'none',
            })}>
              <div style={{ fontSize: 44, animation: 'float 3s ease-in-out infinite' }}>🌙</div>
              <p className={css({ color: 'accent', fontSize: '12px', fontWeight: '600', textAlign: 'center', lineHeight: '1.7', fontFamily: 'ui' })}>
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
            deleteKeyCode={['Delete', 'Backspace']}
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
