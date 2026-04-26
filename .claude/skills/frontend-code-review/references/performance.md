# Rule Catalog — Performance

## React Flow 데이터 사용 패턴

IsUrgent: True
Category: Performance

### Description

React Flow 렌더링 시 `useNodes`/`useEdges` 훅을 사용하고, 콜백 내에서 상태를 변경할 때는 `useReactFlow`를 사용한다. React Flow 데이터를 이 훅들 외부에서 수동으로 관리하지 않는다.

### Suggested Fix

```tsx
// ❌
const [nodes, setNodes] = useState<Node[]>([]);
// React Flow와 별도로 노드 상태를 관리

// ✅
import { useNodesState, useEdgesState } from "@xyflow/react";
const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
```

## 복잡한 Props 메모이제이션

IsUrgent: True
Category: Performance

### Description

객체, 배열, 맵 등 복잡한 prop 값은 `useMemo`로 감싸서 안정적인 참조를 보장하고 불필요한 리렌더를 방지한다.

### Suggested Fix

```tsx
// ❌
<ReactFlow
  nodeTypes={{
    process: ProcessNode,
    decision: DecisionNode,
    loop: LoopNode,
  }}
/>

// ✅
const nodeTypes = useMemo(() => ({
  process: ProcessNode,
  decision: DecisionNode,
  loop: LoopNode,
}), [])

<ReactFlow nodeTypes={nodeTypes} />
```

## AST 파싱 debounce 적용

IsUrgent: True
Category: Performance

### Description

코드 변경 시 AST 파싱 및 순서도 업데이트에 debounce를 적용한다. 타이핑할 때마다 파싱하면 성능이 저하된다.

### Suggested Fix

```tsx
// ❌
useEffect(() => {
  const result = astToFlowNodes(parse(code));
  setNodes(result.nodes);
}, [code]); // 매 키 입력마다 실행

// ✅
useEffect(() => {
  const timer = setTimeout(() => {
    const result = astToFlowNodes(parse(code));
    setNodes(result.nodes);
  }, 300);
  return () => clearTimeout(timer);
}, [code]);
```

## useCallback/useMemo 누락

IsUrgent: False
Category: Performance

### Description

자식 컴포넌트에 전달되는 콜백 함수는 `useCallback`으로 감싼다. 특히 React Flow의 `onNodesChange`, `onEdgesChange`, `onConnect` 핸들러는 반드시 메모이제이션한다.

### Suggested Fix

```tsx
// ❌
const handleNodeClick = (event, node) => {
  setSelectedNode(node);
};

// ✅
const handleNodeClick = useCallback((event: React.MouseEvent, node: Node) => {
  setSelectedNode(node);
}, []);
```

## useEffect 의존성 배열 오류

IsUrgent: True
Category: Performance

### Description

`useEffect`의 의존성 배열이 누락되거나 불필요한 항목이 포함되면 무한 루프 또는 stale closure 버그가 발생한다. ESLint `react-hooks/exhaustive-deps` 규칙을 준수한다.

Update this file when adding, editing, or removing Performance rules so the catalog remains accurate.
