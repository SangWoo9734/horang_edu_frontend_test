# Complexity Reduction Patterns

컴포넌트의 인지 복잡도를 낮추기 위한 패턴 모음.

## What Increases Complexity

| Pattern             | Complexity Impact    |
| ------------------- | -------------------- | -------- | --------------- |
| `if/else`           | +1 per branch        |
| Nested conditions   | +1 per nesting level |
| `switch/case`       | +1 per case          |
| `for/while/do`      | +1 per loop          |
| `&&`/`              |                      | ` chains | +1 per operator |
| Nested callbacks    | +1 per nesting level |
| `try/catch`         | +1 per catch         |
| Ternary expressions | +1 per nesting       |

## Pattern 1: Replace Conditionals with Lookup Tables

**Before** (complexity: ~15):

```typescript
const getNodeStyle = (nodeType: string) => {
  if (nodeType === "process") {
    return { color: "#3B82F6", shape: "rectangle" };
  } else if (nodeType === "decision") {
    return { color: "#F59E0B", shape: "diamond" };
  } else if (nodeType === "loop") {
    return { color: "#10B981", shape: "hexagon" };
  } else if (nodeType === "output") {
    return { color: "#8B5CF6", shape: "parallelogram" };
  } else if (nodeType === "terminal") {
    return { color: "#6B7280", shape: "rounded" };
  }
  return { color: "#6B7280", shape: "rectangle" };
};
```

**After** (complexity: ~1):

```typescript
const NODE_STYLES: Record<string, { color: string; shape: string }> = {
  process: { color: "#3B82F6", shape: "rectangle" },
  decision: { color: "#F59E0B", shape: "diamond" },
  loop: { color: "#10B981", shape: "hexagon" },
  output: { color: "#8B5CF6", shape: "parallelogram" },
  terminal: { color: "#6B7280", shape: "rounded" },
};

const getNodeStyle = (nodeType: string) => {
  return NODE_STYLES[nodeType] ?? { color: "#6B7280", shape: "rectangle" };
};
```

## Pattern 2: Use Early Returns

**Before** (complexity: ~10):

```typescript
const handleRun = async () => {
  if (code) {
    if (!isRunning) {
      if (isValid) {
        await execute(code);
      } else {
        showValidationError();
      }
    } else {
      showAlreadyRunningError();
    }
  } else {
    showEmptyCodeError();
  }
};
```

**After** (complexity: ~4):

```typescript
const handleRun = async () => {
  if (!code) {
    showEmptyCodeError();
    return;
  }
  if (isRunning) {
    showAlreadyRunningError();
    return;
  }
  if (!isValid) {
    showValidationError();
    return;
  }
  await execute(code);
};
```

## Pattern 3: Extract Complex Conditions

**Before**:

```typescript
const canExecute =
  code.trim().length > 0 &&
  !isRunning &&
  !hasValidationErrors &&
  (lastEditSource === "code" || lastEditSource === "flowchart") &&
  !isAborted;
```

**After**:

```typescript
const hasValidCode = () => code.trim().length > 0;
const isIdle = () => !isRunning && !isAborted;
const hasNoErrors = () => !hasValidationErrors;

const canExecute = hasValidCode() && isIdle() && hasNoErrors();
```

## Pattern 4: Replace Chained Ternaries

**Before**:

```typescript
const statusIcon = isRunning
  ? "⏳"
  : isPaused
    ? "⏸"
    : hasError
      ? "❌"
      : isComplete
        ? "✅"
        : "▶";
```

**After**:

```typescript
const getStatusIcon = () => {
  if (isRunning) return "⏳";
  if (isPaused) return "⏸";
  if (hasError) return "❌";
  if (isComplete) return "✅";
  return "▶";
};

const statusIcon = getStatusIcon();
```

## Pattern 5: Flatten Nested Loops

**Before**:

```typescript
const processNodes = (nodes: FlowNode[], edges: FlowEdge[]) => {
  const results: string[] = [];
  for (const node of nodes) {
    if (node.type === "decision") {
      for (const edge of edges) {
        if (edge.source === node.id) {
          if (edge.data?.label === "참") {
            results.push(`참: ${edge.target}`);
          }
        }
      }
    }
  }
  return results;
};
```

**After**:

```typescript
const processNodes = (nodes: FlowNode[], edges: FlowEdge[]) => {
  const decisionNodes = nodes.filter((n) => n.type === "decision");

  return decisionNodes.flatMap((node) =>
    edges
      .filter((e) => e.source === node.id && e.data?.label === "참")
      .map((e) => `참: ${e.target}`),
  );
};
```

## Pattern 6: Reduce Boolean Logic Complexity

**Before**:

```typescript
const isDisabled =
  !code ||
  isRunning ||
  hasErrors ||
  (lastEditSource === "flowchart" && !isSynced) ||
  executionDelay < 0 ||
  executionDelay > 5000;
```

**After**:

```typescript
const hasValidInput = () => !!code && !hasErrors;
const isReady = () => !isRunning;
const isSyncValid = () => lastEditSource !== "flowchart" || isSynced;
const isDelayValid = () => executionDelay >= 0 && executionDelay <= 5000;

const isDisabled =
  !hasValidInput() || !isReady() || !isSyncValid() || !isDelayValid();
```

## Pattern 7: Simplify useMemo/useCallback Dependencies

**Before**:

```typescript
const flowData = useMemo(() => {
  let nodes: FlowNode[] = [];
  let edges: FlowEdge[] = [];

  if (ast) {
    const result = astToFlowNodes(ast);
    nodes = result.nodes;
    edges = result.edges;

    if (highlightedNodeId) {
      nodes = nodes.map((n) => ({
        ...n,
        data: { ...n.data, highlighted: n.id === highlightedNodeId },
      }));
    }

    if (executionPath.length > 0) {
      edges = edges.map((e) => ({
        ...e,
        data: { ...e.data, animated: executionPath.includes(e.id) },
      }));
    }
  }

  return { nodes, edges };
}, [ast, highlightedNodeId, executionPath]);
```

**After**:

```typescript
const baseFlowData = useMemo(() => {
  if (!ast) return { nodes: [], edges: [] };
  return astToFlowNodes(ast);
}, [ast]);

const highlightedNodes = useMemo(() => {
  if (!highlightedNodeId) return baseFlowData.nodes;
  return baseFlowData.nodes.map((n) => ({
    ...n,
    data: { ...n.data, highlighted: n.id === highlightedNodeId },
  }));
}, [baseFlowData.nodes, highlightedNodeId]);

const animatedEdges = useMemo(() => {
  if (executionPath.length === 0) return baseFlowData.edges;
  return baseFlowData.edges.map((e) => ({
    ...e,
    data: { ...e.data, animated: executionPath.includes(e.id) },
  }));
}, [baseFlowData.edges, executionPath]);
```

## Target Metrics

| Metric                  | Target         |
| ----------------------- | -------------- |
| Max Function Complexity | < 30           |
| Function Length         | < 30 lines     |
| Nesting Depth           | ≤ 3 levels     |
| Conditional Chains      | ≤ 3 conditions |
