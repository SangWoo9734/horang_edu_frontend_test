# Rule Catalog — Business Logic

## AST → Flow 변환 시 노드 타입 매핑 누락

IsUrgent: True
Category: Business Logic

### Description

`ast-to-flow.ts`에서 AST 노드를 순서도 노드로 변환할 때, 지원하는 모든 AST 노드 타입을 처리해야 한다. 처리하지 않는 노드 타입이 있으면 순서도에서 누락되어 코드와 순서도가 불일치한다.

### Suggested Fix

switch/case 또는 매핑 객체에서 모든 AST 노드 타입을 커버하고, default 케이스에서 경고를 출력한다.

```ts
// ✅
const convertNode = (astNode: Node): FlowNode | null => {
  switch (astNode.constructor.name) {
    case "SetVariable":
      return createProcessNode(astNode);
    case "IfStatement":
      return createDecisionNode(astNode);
    case "CountLoop":
    case "ConditionalLoop":
    case "ListLoop":
      return createLoopNode(astNode);
    case "FunctionInvoke":
      return createOutputOrCallNode(astNode);
    case "DeclareFunction":
      return createFunctionNode(astNode);
    case "Return":
      return createTerminalNode(astNode);
    default:
      console.warn(`Unhandled AST node type: ${astNode.constructor.name}`);
      return null;
  }
};
```

## Flow → Code 생성 시 들여쓰기 오류

IsUrgent: True
Category: Business Logic

### Description

`flow-to-code.ts`에서 순서도를 달빛약속 코드로 변환할 때, 조건문/반복문 내부 블록의 들여쓰기가 올바르지 않으면 파싱 에러가 발생한다. 달빛약속은 들여쓰기 기반 블록 구조를 사용한다.

### Suggested Fix

들여쓰기 레벨을 추적하고, 분기/반복 노드 내부의 자식 노드에 레벨을 1 증가시켜 적용한다.

```ts
const generateCode = (node: FlowNode, indent: number = 0): string => {
  const prefix = "    ".repeat(indent);
  // 분기/반복 내부는 indent + 1
};
```

## 양방향 동기화 시 순환 업데이트 방지 누락

IsUrgent: True
Category: Business Logic

### Description

코드 변경 → 순서도 업데이트 → 코드 재생성 → 순서도 재업데이트... 의 무한 루프를 방지해야 한다. `lastEditSource`를 추적하여 마지막 편집이 어디서 왔는지 확인하고, 반대 방향으로만 동기화한다.

### Suggested Fix

```ts
// ✅ sync.ts
let lastEditSource: "code" | "flowchart" = "code";

// 코드 변경 시
if (lastEditSource === "code") {
  // 순서도만 업데이트, 코드 재생성 안 함
  updateFlowFromCode(code);
}

// 순서도 변경 시
if (lastEditSource === "flowchart") {
  // 코드만 업데이트, 순서도 재파싱 안 함
  updateCodeFromFlow(nodes, edges);
}
```

## YaksokSession 실행 시 AbortSignal 미설정

IsUrgent: True
Category: Business Logic

### Description

`YaksokSession`으로 코드를 실행할 때 `AbortSignal`을 반드시 설정해야 한다. 설정하지 않으면 무한루프 코드 실행 시 브라우저가 멈추고 사용자가 중단할 수 없다.

### Suggested Fix

```ts
// ✅
const controller = new AbortController()

const session = new YaksokSession({
  signal: controller.signal,
  stdout: (msg) => { ... },
})

// 정지 버튼 클릭 시
controller.abort()
```

## validate() 에러를 사용자에게 미표시

IsUrgent: False
Category: Business Logic

### Description

`validate()`로 발견된 문법 에러를 Monaco 에디터의 마커로 표시하거나 UI에 노출해야 한다. 에러를 무시하면 사용자가 잘못된 코드를 실행하게 된다.

### Suggested Fix

```ts
const { errors } = codeFile.validate();
errors.forEach((err) => {
  // Monaco 마커로 변환하여 에디터에 표시
  monaco.editor.setModelMarkers(model, "dalbit-yaksok", [
    {
      severity: monaco.MarkerSeverity.Error,
      message: err.message,
      startLineNumber: err.position?.line ?? 1,
      startColumn: err.position?.column ?? 1,
      endLineNumber: err.position?.line ?? 1,
      endColumn: err.position?.column ?? 1,
    },
  ]);
});
```

## executionDelay 값 검증 누락

IsUrgent: False
Category: Business Logic

### Description

사용자가 입력하는 `executionDelay` 값이 유효 범위(0~5000ms)인지 검증해야 한다. 음수나 극단적으로 큰 값은 실행 시각화를 깨뜨린다.

### Suggested Fix

```ts
const clampDelay = (value: number): number => {
  return Math.max(0, Math.min(5000, value));
};
```

Update this file when adding, editing, or removing Business Logic rules so the catalog remains accurate.
