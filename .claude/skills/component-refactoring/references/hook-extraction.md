# Hook Extraction Patterns

복잡한 컴포넌트에서 커스텀 훅을 추출하는 가이드.

## When to Extract

1. **Coupled state groups** — 항상 같이 쓰이는 여러 useState
2. **Complex effects** — 여러 의존성 또는 클린업 로직이 있는 useEffect
3. **Business logic** — 데이터 변환, 검증, 계산 로직
4. **Reusable patterns** — 여러 컴포넌트에서 반복되는 로직

## Extraction Process

### Step 1: 상태 그룹 식별

논리적으로 관련된 상태 변수를 찾는다:

```typescript
// ❌ 이 상태들은 함께 묶여야 함
const [nodes, setNodes] = useState<Node[]>([]);
const [edges, setEdges] = useState<Edge[]>([]);
const [lastEditSource, setLastEditSource] = useState<"code" | "flowchart">(
  "code",
);

// → useFlowSync 훅으로 추출
```

### Step 2: 관련 Effect 식별

그룹화된 상태를 변경하는 effect를 찾는다:

```typescript
// ❌ 이 effect는 위 상태와 함께 훅으로 들어가야 함
useEffect(() => {
  if (lastEditSource !== "code") return;
  const ast = parseOptimistically(code);
  const { nodes, edges } = astToFlowNodes(ast);
  setNodes(nodes);
  setEdges(edges);
}, [code, lastEditSource]);
```

### Step 3: 훅 생성

```typescript
// hooks/use-flow-sync.ts
interface UseFlowSyncParams {
  code: string;
}

interface UseFlowSyncReturn {
  nodes: Node[];
  edges: Edge[];
  setNodes: (nodes: Node[]) => void;
  setEdges: (edges: Edge[]) => void;
  lastEditSource: "code" | "flowchart";
  updateFromFlowchart: (nodes: Node[], edges: Edge[]) => void;
}

export const useFlowSync = ({ code }: UseFlowSyncParams): UseFlowSyncReturn => {
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [lastEditSource, setLastEditSource] = useState<"code" | "flowchart">(
    "code",
  );

  // 코드 → 순서도 동기화
  useEffect(() => {
    if (lastEditSource !== "code") return;
    const ast = parseOptimistically(code);
    const result = astToFlowNodes(ast);
    setNodes(result.nodes);
    setEdges(result.edges);
  }, [code, lastEditSource]);

  const updateFromFlowchart = useCallback(
    (newNodes: Node[], newEdges: Edge[]) => {
      setLastEditSource("flowchart");
      setNodes(newNodes);
      setEdges(newEdges);
    },
    [],
  );

  return {
    nodes,
    edges,
    setNodes,
    setEdges,
    lastEditSource,
    updateFromFlowchart,
  };
};
```

### Step 4: 컴포넌트 업데이트

```typescript
// Before: 50줄의 상태 관리 로직
const FlowCanvas: FC = () => {
  const [nodes, setNodes] = useState<Node[]>([])
  // ... 많은 관련 상태와 effect
}

// After: 깔끔한 컴포넌트
const FlowCanvas: FC = () => {
  const { nodes, edges, updateFromFlowchart } = useFlowSync({ code })
  const { highlightedId } = useExecutionHighlight(nodes)

  return <ReactFlow nodes={nodes} edges={edges} />
}
```

## Naming Conventions

### Hook Names

- `use` 접두사: `useFlowSync`, `useExecutionControl`
- 구체적으로: `useExecutionHighlight` not `useHighlight`
- 도메인 포함: `useEditorValidation`, `useNodeForm`

### File Names

- kebab-case: `use-flow-sync.ts`
- 여러 훅이 있으면 `hooks/` 디렉토리에 배치

### Type Names

- Return 타입: `UseFlowSyncReturn`
- Params 타입: `UseFlowSyncParams`

## 이 프로젝트의 핵심 훅 패턴

### 1. 실행 제어 훅

```typescript
// hooks/use-execution-control.ts
export const useExecutionControl = () => {
  const { code } = useEditorStore();
  const { setOutput, setVariables, setIsRunning, reset } = useExecutionStore();
  const controllerRef = useRef<AbortController | null>(null);

  const handleRun = useCallback(
    async (delay: number) => {
      reset();
      setIsRunning(true);
      controllerRef.current = new AbortController();

      const session = new YaksokSession({
        stdout: (msg) => setOutput((prev) => [...prev, msg]),
        signal: controllerRef.current.signal,
        events: {
          variableSet: ({ name, value }) =>
            setVariables((prev) => ({ ...prev, [name]: value })),
          runningCode: (start) => {
            /* 하이라이트 업데이트 */
          },
        },
      });

      session.addModule("main", code, { executionDelay: delay });
      try {
        await session.runModule("main");
      } catch (e) {
        if (e.name !== "AbortError")
          setOutput((prev) => [...prev, `에러: ${e.message}`]);
      } finally {
        setIsRunning(false);
      }
    },
    [code],
  );

  const handleStop = useCallback(() => {
    controllerRef.current?.abort();
  }, []);

  const handlePause = useCallback(() => {
    // session.pause() 활용
  }, []);

  return { handleRun, handleStop, handlePause };
};
```

### 2. 에디터 검증 훅

```typescript
// hooks/use-editor-validation.ts
export const useEditorValidation = (code: string) => {
  const [errors, setErrors] = useState<ValidationError[]>([]);

  useEffect(() => {
    const timer = setTimeout(() => {
      const codeFile = new CodeFile("main", code);
      const { errors: validationErrors } = codeFile.validate();
      setErrors(validationErrors);
    }, 300); // debounce

    return () => clearTimeout(timer);
  }, [code]);

  return { errors };
};
```

### 3. 노드 폼 훅

```typescript
// hooks/use-node-form.ts
type NodeFormType = "process" | "output" | "decision" | "loop";

interface NodeFormValues {
  type: NodeFormType;
  variableName?: string;
  value?: string;
  condition?: string;
  outputText?: string;
  loopCount?: number;
}

export const useNodeForm = (initialValues?: Partial<NodeFormValues>) => {
  const [values, setValues] = useState<NodeFormValues>({
    type: "process",
    ...initialValues,
  });

  const handleChange = useCallback(
    (field: keyof NodeFormValues, value: unknown) => {
      setValues((prev) => ({ ...prev, [field]: value }));
    },
    [],
  );

  const generateCode = useCallback((): string => {
    switch (values.type) {
      case "process":
        return `${values.variableName} = ${values.value}`;
      case "output":
        return `"${values.outputText}" 보여주기`;
      case "decision":
        return `만약 ${values.condition}이면`;
      case "loop":
        return `반복 ${values.loopCount}번`;
      default:
        return "";
    }
  }, [values]);

  const reset = useCallback(() => {
    setValues({ type: "process", ...initialValues });
  }, [initialValues]);

  return { values, handleChange, generateCode, reset };
};
```

### 4. Toggle/Boolean 훅

```typescript
// hooks/use-toggle.ts
export const useToggle = (initialValue = false) => {
  const [value, setValue] = useState(initialValue);

  const toggle = useCallback(() => setValue((v) => !v), []);
  const setTrue = useCallback(() => setValue(true), []);
  const setFalse = useCallback(() => setValue(false), []);

  return [value, { toggle, setTrue, setFalse, set: setValue }] as const;
};
```

## Testing Extracted Hooks

추출 후 반드시 훅을 독립적으로 테스트:

```typescript
// use-flow-sync.test.ts
import { renderHook, act } from "@testing-library/react";
import { useFlowSync } from "./use-flow-sync";

describe("useFlowSync", () => {
  it("should generate nodes from code", () => {
    const { result } = renderHook(() => useFlowSync({ code: "나이 = 20" }));
    expect(result.current.nodes.length).toBeGreaterThan(0);
    expect(result.current.lastEditSource).toBe("code");
  });

  it("should track edit source when flowchart updates", () => {
    const { result } = renderHook(() => useFlowSync({ code: "" }));

    act(() => {
      result.current.updateFromFlowchart(mockNodes, mockEdges);
    });

    expect(result.current.lastEditSource).toBe("flowchart");
  });
});
```
