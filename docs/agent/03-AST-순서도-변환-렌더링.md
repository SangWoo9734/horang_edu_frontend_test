# 03. AST → 순서도 변환 + 순서도 렌더링

## 사용한 에이전트 도구

- Claude Code (CLI)

## 에이전트에게 위임한 작업의 범위

### 작업 범위

- `ast-to-flow.ts`: `@dalbit-yaksok/core` AST 노드 → React Flow 노드/엣지 변환 알고리즘
  - `SetVariable`, `IfStatement`, `CountLoop`, `ConditionalLoop`, `ListLoop`, `FunctionInvoke`, `DeclareFunction`, `ReturnStatement` 처리
  - dagre 자동 배치 (`layout.ts`)
- 커스텀 노드 컴포넌트 6종 (`ProcessNode`, `DecisionNode`, `LoopNode`, `OutputNode`, `TerminalNode`, `FunctionNode`)
- `AnimatedEdge`: edgeType별 색상/점선/애니메이션 처리
- `FlowCanvas.tsx`: React Flow 캔버스 마운트 + 코드 변경 시 C2F 자동 실행 (300ms debounce)
- 예제 코드 6종 + 드롭다운 연결

### 판단 근거

- AST 구조는 라이브러리 문서에 정의되어 있으므로 에이전트가 타입을 보고 매핑 로직을 작성하기 적합
- 노드 컴포넌트는 디자인 토큰(색상, 모양)을 CLAUDE.md에 명시했으므로 에이전트가 일관되게 구현 가능
- dagre 레이아웃은 알고리즘 자체보다 설정값이 중요하므로 에이전트 위임 후 결과 시각 확인

## 에이전트의 산출물을 검증한 방법

- 각 AST 노드 타입별로 예제 코드를 직접 입력하여 순서도 생성 결과 시각 확인
- 엣지 연결 방향(참/거짓 분기, 반복 back edge) 정합성 확인
- `npm run build` 타입 체크

## 에이전트가 잘못된 방향을 제시했을 때 교정한 방법

### 교정 1: 팬텀 "?" 노드 생성

에이전트가 작성한 catch-all 핸들러가 인식되지 않는 모든 AST 노드에 대해 빈 레이블(`?`)을 가진 노드를 생성함.

- **발견 경위**: `합계 보여주기` 코드 입력 시 순서도에 `?` 노드가 나타남
- **원인 분석**: `FunctionInvoke`가 `instanceof` 체크에서 실패하는 경우(`보여주기` 내장 함수)가 있었고, catch-all이 빈 레이블로 노드를 만들었음
- **교정**: 토큰에 `보여주기`가 포함된 경우 output 노드로 fallback, 빈 레이블이면 노드 생성 자체를 건너뜀

### 교정 2: 반복 노드 dagre 레이아웃 이상 (루프 브랜칭)

반복 노드가 조건 노드처럼 좌우로 분기하는 레이아웃이 나타남.

- **원인 분석**: 반복문의 `tails`로 loop 노드 자체를 반환해서, exit 연결과 back 연결이 같은 소스에서 나와 dagre가 두 방향으로 배치
- **교정**: loop가 `bodyTails`(본문 마지막 노드)를 반환하도록 변경. exit은 body tail에서 직접 연결, loop → exit 엣지 없음. dagre는 back 엣지만 제외하면 자연스러운 직선 배치

### 교정 3: LoopNode SVG 클립패스 문제

LoopNode를 CSS `clip-path`로 구현했으나 `outline`이 클립 영역을 무시해 사각형 테두리가 나타남.

- **교정**: SVG `<polygon>`으로 재구현 (DecisionNode와 동일한 방식)
