import { useEffect } from 'react'
import { useFlowchartStore } from '../../../stores/flowchart-store'

export function useExecutionHighlight() {
  const executingNodeId = useFlowchartStore((s) => s.executingNodeId)
  const setNodes = useFlowchartStore((s) => s.setNodes)
  const setEdges = useFlowchartStore((s) => s.setEdges)

  useEffect(() => {
    const { nodes, edges } = useFlowchartStore.getState()
    setNodes(nodes.map((n) => ({
      ...n,
      data: { ...n.data, executing: n.id === executingNodeId },
    })))
    setEdges(edges.map((e) => ({
      ...e,
      animated: executingNodeId !== null && e.target === executingNodeId,
    })))
  }, [executingNodeId, setNodes, setEdges])
}
