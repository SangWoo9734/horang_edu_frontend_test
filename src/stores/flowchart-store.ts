import { create } from 'zustand'
import type { Node, Edge } from '@xyflow/react'
import type { FlowNodeData } from '../types/flowchart'

type FlowNode = Node<FlowNodeData>
type FlowEdge = Edge

interface FlowchartStore {
  nodes: FlowNode[]
  edges: FlowEdge[]
  executingNodeId: string | null
  setNodes: (nodes: FlowNode[]) => void
  setEdges: (edges: FlowEdge[]) => void
  setExecutingNodeId: (id: string | null) => void
  updateNode: (id: string, data: Partial<FlowNodeData>) => void
}

export const useFlowchartStore = create<FlowchartStore>((set) => ({
  nodes: [],
  edges: [],
  executingNodeId: null,
  setNodes: (nodes) => set({ nodes }),
  setEdges: (edges) => set({ edges }),
  setExecutingNodeId: (executingNodeId) => set({ executingNodeId }),
  updateNode: (id, data) =>
    set((state) => ({
      nodes: state.nodes.map((n) =>
        n.id === id ? { ...n, data: { ...n.data, ...data } } : n
      ),
    })),
}))
