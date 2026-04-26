# Component Splitting Patterns

대규모 컴포넌트를 더 작고 집중된 컴포넌트로 분리하는 가이드.

## When to Split

1. **Multiple UI sections** — 서로 결합도가 낮은 독립적인 시각 영역
2. **Conditional rendering blocks** — 큰 `{condition && <JSX />}` 블록
3. **Repeated patterns** — 반복되는 유사 UI 구조
4. **200+ lines** — 컴포넌트가 관리 가능 크기를 초과
5. **Modal clusters** — 하나의 컴포넌트에서 여러 모달 렌더링

## Strategy 1: Section-Based Splitting

시각적 섹션별로 분리.

```typescript
// ❌ Before: 모든 패널이 하나의 컴포넌트에
const Layout: FC = () => {
  return (
    <div>
      {/* 에디터 영역 100줄 */}
      {/* 순서도 영역 100줄 */}
      {/* 콘솔 영역 50줄 */}
      {/* 변수 패널 50줄 */}
      {/* 컨트롤 바 50줄 */}
    </div>
  )
}

// ✅ After: 역할별 분리
const Layout: FC = () => {
  return (
    <PanelGroup direction="horizontal">
      <EditorPanel />
      <FlowchartPanel />
      <PanelGroup direction="vertical">
        <ConsolePanel />
        <VariablePanel />
      </PanelGroup>
      <ControlBar />
    </PanelGroup>
  )
}
```

## Strategy 2: Conditional Block Extraction

조건부 렌더링 블록을 별도 컴포넌트로 추출.

```typescript
// ❌ Before
const ControlBar: FC = () => {
  return (
    <div>
      {isRunning ? (
        <div>
          {/* 실행 중 UI 50줄 */}
        </div>
      ) : (
        <div>
          {/* 대기 중 UI 50줄 */}
        </div>
      )}
    </div>
  )
}

// ✅ After
const RunningControls: FC<ControlProps> = ({ onPause, onStop }) => (
  <div>
    <button onClick={onPause}>⏸ 일시정지</button>
    <button onClick={onStop}>⏹ 정지</button>
  </div>
)

const IdleControls: FC<ControlProps> = ({ onRun }) => (
  <div>
    <button onClick={onRun}>▶ 실행</button>
  </div>
)

const ControlBar: FC = () => {
  return (
    <div>
      {isRunning
        ? <RunningControls onPause={handlePause} onStop={handleStop} />
        : <IdleControls onRun={handleRun} />
      }
    </div>
  )
}
```

## Strategy 3: Modal Extraction

모달을 상태 관리와 함께 추출.

```typescript
// ❌ Before: 여러 모달 상태가 컴포넌트에 혼재
const FlowCanvas: FC = () => {
  const [showNodeEdit, setShowNodeEdit] = useState(false);
  const [showNodeDelete, setShowNodeDelete] = useState(false);
  const [editingNode, setEditingNode] = useState<FlowNode | null>(null);
  // ...
};

// ✅ After: 모달 매니저로 추출
type ModalType = "edit" | "delete" | null;

const useNodeModals = () => {
  const [activeModal, setActiveModal] = useState<ModalType>(null);
  const [targetNode, setTargetNode] = useState<FlowNode | null>(null);

  const openModal = useCallback((type: ModalType, node: FlowNode) => {
    setActiveModal(type);
    setTargetNode(node);
  }, []);

  const closeModal = useCallback(() => {
    setActiveModal(null);
    setTargetNode(null);
  }, []);

  return { activeModal, targetNode, openModal, closeModal };
};
```

## Strategy 4: List Item Extraction

반복 렌더링 아이템을 별도 컴포넌트로 추출.

```typescript
// ❌ Before: 인라인 리스트 렌더링
const ExampleSelector: FC = () => {
  return (
    <div>
      {examples.map(ex => (
        <div key={ex.id} className="example-item">
          <span>{ex.title}</span>
          <p>{ex.description}</p>
          <code>{ex.code.slice(0, 50)}...</code>
          <button onClick={() => loadExample(ex)}>불러오기</button>
        </div>
      ))}
    </div>
  )
}

// ✅ After: 아이템 컴포넌트 추출
const ExampleItem: FC<{ example: Example; onLoad: (ex: Example) => void }> = ({
  example,
  onLoad,
}) => (
  <div className="example-item">
    <span>{example.title}</span>
    <p>{example.description}</p>
    <code>{example.code.slice(0, 50)}...</code>
    <button onClick={() => onLoad(example)}>불러오기</button>
  </div>
)

const ExampleSelector: FC = () => {
  return (
    <div>
      {examples.map(ex => (
        <ExampleItem key={ex.id} example={ex} onLoad={loadExample} />
      ))}
    </div>
  )
}
```

## Directory Structure

### 이 프로젝트의 컴포넌트 구조

```
components/
├── editor/
│   └── CodeEditor.tsx
├── flowchart/
│   ├── FlowCanvas.tsx
│   ├── NodePalette.tsx
│   ├── NodeEditModal.tsx
│   ├── nodes/               # 커스텀 노드 (각각 순수 UI)
│   │   ├── ProcessNode.tsx
│   │   ├── DecisionNode.tsx
│   │   ├── LoopNode.tsx
│   │   ├── OutputNode.tsx
│   │   ├── TerminalNode.tsx
│   │   ├── FunctionNode.tsx
│   │   ├── node-styles.ts
│   │   └── node-types.ts
│   └── edges/
│       └── AnimatedEdge.tsx
├── panels/
│   ├── ConsolePanel.tsx
│   ├── VariablePanel.tsx
│   └── ControlBar.tsx
└── ui/                       # 공통 UI
```

## Props Design

### Minimal Props Principle

필요한 것만 전달:

```typescript
// ❌ 전체 객체 전달
<NodeDisplay node={flowNode} />

// ✅ 필요한 필드만
<NodeDisplay
  label={flowNode.data.label}
  type={flowNode.type}
  highlighted={flowNode.data.highlighted}
/>
```

### Props Drilling 방지

3단계 이상 전달이 필요하면 Zustand 스토어 사용:

```typescript
// ❌ Props drilling
<Layout>
  <FlowPanel executionState={...}>
    <FlowCanvas executionState={...}>
      <NodeComponent highlighted={executionState.currentNode === id} />

// ✅ Zustand 스토어
const useExecutionStore = create((set) => ({
  currentNodeId: null,
  setCurrentNodeId: (id) => set({ currentNodeId: id }),
}))

// NodeComponent에서 직접 구독
const NodeComponent = ({ id }) => {
  const isHighlighted = useExecutionStore(s => s.currentNodeId === id)
}
```
