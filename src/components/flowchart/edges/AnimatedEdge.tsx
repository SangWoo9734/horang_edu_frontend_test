import { BaseEdge, EdgeLabelRenderer, getStraightPath, type EdgeProps } from '@xyflow/react'

export default function AnimatedEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  label,
  data,
  animated,
}: EdgeProps) {
  const edgeType = (data as { edgeType?: string } | undefined)?.edgeType ?? 'default'

  const isTrue = edgeType === 'true'
  const isFalse = edgeType === 'false'
  const isBack = edgeType === 'back'

  if (isBack) return null  // back 엣지는 렌더링하지 않음 (flow-to-code용으로 state만 유지)

  const stroke = isTrue ? '#4ADE80' : isFalse ? '#F87171' : '#94A3B8'
  const strokeDash = isFalse ? '6 4' : undefined

  const [edgePath, labelX, labelY] = getStraightPath({ sourceX, sourceY, targetX, targetY })

  return (
    <>
      <BaseEdge
        id={id}
        path={edgePath}
        style={{ stroke, strokeWidth: 1.5, strokeDasharray: strokeDash }}
        className={animated ? 'animated' : undefined}
      />
      {label && (
        <EdgeLabelRenderer>
          <div
            style={{
              position: 'absolute',
              transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
              background: '#1A1A2E',
              color: isTrue ? '#4ADE80' : isFalse ? '#F87171' : '#94A3B8',
              fontSize: '11px',
              fontFamily: "'JetBrains Mono', monospace",
              padding: '2px 6px',
              borderRadius: '3px',
              border: `1px solid ${isTrue ? '#4ADE80' : '#F87171'}`,
              pointerEvents: 'all',
            }}
            className="nodrag nopan"
          >
            {String(label)}
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  )
}
