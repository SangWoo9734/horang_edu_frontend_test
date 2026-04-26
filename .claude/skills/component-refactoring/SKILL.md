---
name: component-refactoring
description: Refactor high-complexity React components. Use when a component exceeds 200 lines, has more than 5 useState/useEffect hooks, or mixes business logic with UI rendering. Also use when the user asks for code splitting, hook extraction, or complexity reduction. Avoid for simple components under 100 lines or third-party library wrappers.
---

# Component Refactoring

React 컴포넌트의 복잡도를 낮추고 관심사를 분리하는 리팩토링 가이드.

> 상세 패턴은 references/ 디렉토리의 문서를 참조합니다.

## When to Refactor

| 신호      | 기준                                             |
| --------- | ------------------------------------------------ |
| 라인 수   | 200줄 초과                                       |
| Hook 수   | useState/useEffect 5개 이상                      |
| 로직 혼재 | 비즈니스 로직과 UI 렌더링이 같은 컴포넌트에 존재 |
| 중첩 깊이 | JSX 조건부 렌더링 3단계 이상                     |
| Props 수  | 10개 이상                                        |

## Quick Reference

```bash
# 라인 수 확인
wc -l src/components/**/*.tsx

# useState/useEffect 수 확인
grep -c 'useState\|useEffect' src/components/**/*.tsx
```

## Core Patterns

### Pattern 1: 커스텀 훅 추출

상태 로직과 비즈니스 로직을 UI에서 분리. 상세 패턴은 [hook-extraction.md](references/hook-extraction.md) 참조.

**이 프로젝트에서 훅 추출이 필요한 곳:**

- `FlowCanvas.tsx` → `useFlowSync`, `useExecutionHighlight`
- `CodeEditor.tsx` → `useEditorSync`, `useEditorValidation`
- `ControlBar.tsx` → `useExecutionControl`
- `NodeEditModal.tsx` → `useNodeForm`

### Pattern 2: 서브컴포넌트 분리

하나의 컴포넌트가 여러 UI 섹션을 가질 때 분리. 상세 전략은 [component-splitting.md](references/component-splitting.md) 참조.

### Pattern 3: 조건부 렌더링 단순화

중첩 조건, 삼항 체인, 복잡한 boolean 로직 정리. 상세 패턴은 [complexity-patterns.md](references/complexity-patterns.md) 참조.

### Pattern 4: 이벤트 핸들러 추출

인라인 핸들러가 복잡할 때 훅이나 함수로 추출.

```typescript
// ❌ Before
<button onClick={async () => {
  const session = new YaksokSession({ ... })
  session.addModule('main', code)
  // 실행 로직 20줄...
}}>실행</button>

// ✅ After
const { handleRun } = useExecutionControl()
<button onClick={handleRun}>실행</button>
```

### Pattern 5: 노드 컴포넌트 구조화

React Flow 커스텀 노드는 순수 UI에 집중하고, 데이터 변환/이벤트 로직은 상위에서 처리.

```
components/flowchart/nodes/
├── ProcessNode.tsx          # UI만
├── DecisionNode.tsx         # UI만
├── LoopNode.tsx             # UI만
├── OutputNode.tsx           # UI만
├── TerminalNode.tsx         # UI만
├── FunctionNode.tsx         # UI만
├── node-styles.ts           # 공통 스타일/유틸
└── node-types.ts            # 노드 타입 레지스트리
```

## Refactoring Workflow

### Step 1: 현재 상태 파악

라인 수, hook 수, 중첩 깊이를 확인한다.

### Step 2: 계획 수립

| 감지된 패턴          | 리팩토링 액션                                                                   |
| -------------------- | ------------------------------------------------------------------------------- |
| useState 5개+        | 커스텀 훅 추출 ([hook-extraction.md](references/hook-extraction.md))            |
| useEffect 3개+       | 커스텀 훅 추출                                                                  |
| JSX 200줄+           | 서브컴포넌트 분리 ([component-splitting.md](references/component-splitting.md)) |
| 조건부 렌더링 3단계+ | 복잡도 감소 ([complexity-patterns.md](references/complexity-patterns.md))       |
| 인라인 핸들러 복잡   | 이벤트 핸들러 추출                                                              |

### Step 3: 점진적 실행

한 번에 하나씩 추출. 각 추출 후:

```bash
pnpm run type-check
pnpm test
# 브라우저에서 기능 확인
```

### Step 4: 검증

리팩토링 후 목표:

- 각 컴포넌트 200줄 이하
- useState/useEffect는 컴포넌트당 2-3개 이하
- 비즈니스 로직과 UI 렌더링 분리
- 컴포넌트 이름만 보고 역할 파악 가능

## Common Mistakes

### ❌ Over-Engineering

```typescript
// ❌ 너무 잘게 쪼갬
const useNodeColor = () => useState("#3B82F6");

// ✅ 관련 상태는 하나의 훅에
const useNodeState = () => {
  const [color, setColor] = useState("#3B82F6");
  const [label, setLabel] = useState("");
  return { color, setColor, label, setLabel };
};
```

### ❌ 단일 사용 코드의 섣부른 추상화

한 곳에서만 쓰이는 로직을 굳이 훅으로 빼지 않는다. 복잡도가 높을 때만 추출.

### ❌ Props Drilling 유발

서브컴포넌트 분리 시 Props가 3단계 이상 전달되면 Zustand 스토어 사용을 고려.
