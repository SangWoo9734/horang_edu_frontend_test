---
name: test-driven-development
description: Use when implementing any feature or bugfix, before writing implementation code. Before every user request, ask the user whether to use this skill. Also use this skill when the user requests refactoring or code improvement. Also, use when the user wants to write tests for existing code. Use `pnpm test` to run tests.
---

# Test-Driven Development (TDD)

## Overview

Write the test first. Watch it fail. Write minimal code to pass.

**Core principle:** If you didn't watch the test fail, you don't know if it tests the right thing.

## When to Use

**Always (TDD 적용):**

- `lib/` 디렉토리의 순수 로직 (ast-to-flow.ts, flow-to-code.ts, sync.ts, layout.ts, highlight.ts)
- `lib/yaksok/` 디렉토리 (session.ts, runner.ts, validator.ts)
- `stores/` Zustand 스토어 로직
- 유틸리티 함수, 데이터 변환 로직
- 버그 수정

**Exceptions (TDD 제외 — 직접 확인 우선):**

- React 컴포넌트 렌더링 (FlowCanvas, CodeEditor, 커스텀 노드 등)
- React Flow / Monaco Editor 연동 코드
- Framer Motion 애니메이션
- PandaCSS 스타일링
- 설정 파일 (vite.config.ts, panda.config.ts)

> UI/통합 영역은 직접 브라우저에서 확인하는 것이 더 효율적. 순수 로직에 TDD를 집중하여 핵심 변환 로직의 신뢰성을 확보한다.

## Test Runner

**Vitest** 사용. Vite 기반 프로젝트와 네이티브 호환.

```bash
# 전체 테스트
pnpm test

# 특정 파일
pnpm test src/lib/flowchart/ast-to-flow.test.ts

# watch 모드
pnpm test --watch

# 커버리지
pnpm test --coverage
```

## 테스트 파일 위치

테스트 파일은 소스 파일 옆에 `.test.ts` 확장자로 배치:

```
src/lib/flowchart/
├── ast-to-flow.ts
├── ast-to-flow.test.ts      ← 여기
├── flow-to-code.ts
├── flow-to-code.test.ts     ← 여기
├── sync.ts
└── sync.test.ts             ← 여기
```

## The Iron Law

```
NO PRODUCTION CODE WITHOUT A FAILING TEST FIRST
```

Write code before the test? Delete it. Start over.

## Red-Green-Refactor

### RED - Write Failing Test

Write one minimal test showing what should happen.

```typescript
// ast-to-flow.test.ts
import { describe, it, expect } from "vitest";
import { astToFlowNodes } from "./ast-to-flow";

describe("astToFlowNodes", () => {
  it("converts SetVariable to process node", () => {
    const ast = createMockAST([
      { type: "SetVariable", name: "나이", value: "20" },
    ]);

    const { nodes, edges } = astToFlowNodes(ast);

    expect(nodes).toHaveLength(3); // 시작 + 처리 + 끝
    expect(nodes[1].type).toBe("process");
    expect(nodes[1].data.label).toBe("나이 = 20");
  });
});
```

### Verify RED

```bash
pnpm test src/lib/flowchart/ast-to-flow.test.ts
```

Confirm:

- Test fails (not errors)
- Failure message is expected
- Fails because feature missing (not typos)

### GREEN - Minimal Code

Write simplest code to pass the test. Don't over-engineer.

### Verify GREEN

```bash
pnpm test src/lib/flowchart/ast-to-flow.test.ts
```

Confirm:

- Test passes
- Other tests still pass

### REFACTOR - Clean Up

After green only. Remove duplication, improve names. Keep tests green.

## 이 프로젝트의 핵심 테스트 대상

### 1. AST → Flow 변환 (ast-to-flow.ts)

```typescript
describe('astToFlowNodes', () => {
  it('creates start and end nodes for empty code', () => { ... })
  it('converts SetVariable to process node', () => { ... })
  it('converts IfStatement to decision node with true/false edges', () => { ... })
  it('converts CountLoop to loop node', () => { ... })
  it('converts FunctionInvoke(보여주기) to output node', () => { ... })
  it('handles nested if statements', () => { ... })
  it('handles DeclareFunction as subgraph', () => { ... })
})
```

### 2. Flow → Code 생성 (flow-to-code.ts)

```typescript
describe('flowToCode', () => {
  it('generates variable assignment from process node', () => { ... })
  it('generates 보여주기 from output node', () => { ... })
  it('generates 만약/아니면 from decision node', () => { ... })
  it('applies correct indentation for nested blocks', () => { ... })
  it('generates 반복 from loop node', () => { ... })
  it('produces valid dalbit-yaksok code', () => { ... })
})
```

### 3. 양방향 동기화 (sync.ts)

```typescript
describe('sync', () => {
  it('tracks lastEditSource correctly', () => { ... })
  it('prevents circular update when code changes', () => { ... })
  it('prevents circular update when flowchart changes', () => { ... })
})
```

### 4. Zustand 스토어

```typescript
describe('useExecutionStore', () => {
  it('adds stdout output', () => { ... })
  it('updates variable state', () => { ... })
  it('resets execution state', () => { ... })
})
```

## Good Tests

| Quality       | Good                                | Bad                                          |
| ------------- | ----------------------------------- | -------------------------------------------- |
| **Minimal**   | One thing. "and" in name? Split it. | `test('converts and validates and renders')` |
| **Clear**     | Name describes behavior             | `test('test1')`                              |
| **Real code** | Uses actual AST/node structures     | Over-mocked everything                       |

## Common Rationalizations

| Excuse                  | Reality                                       |
| ----------------------- | --------------------------------------------- |
| "Too simple to test"    | Simple code breaks. Test takes 30 seconds.    |
| "I'll test after"       | Tests passing immediately prove nothing.      |
| "UI code, can't test"   | Extract logic to pure functions, test those.  |
| "Need to explore first" | Fine. Throw away exploration, start with TDD. |

## Verification Checklist

Before marking work complete:

- [ ] Every new function in `lib/` has a test
- [ ] Watched each test fail before implementing
- [ ] Wrote minimal code to pass each test
- [ ] All tests pass (`pnpm test`)
- [ ] Tests use real data structures (minimal mocks)
- [ ] Edge cases covered (empty code, invalid AST, circular refs)
