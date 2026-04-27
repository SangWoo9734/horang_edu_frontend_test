# 달빛흐름 — 아키텍처 문서

## 전체 구조

```
코드 에디터 (Monaco)  ←──────────────────────────────→  순서도 캔버스 (React Flow)
        │                                                           │
        │  onChange                                     노드/엣지 변경
        ▼                                                           ▼
  editor-store                                           flowchart-store
  (code, errors,                                         (nodes, edges,
   executingLine)                                         executingNodeId)
        │                                                           │
        │  parseOptimistically()                    flowToCode()    │
        └──────────────── ast-to-flow.ts ──────────────────────────┘
                                  ▲
                          양방향 동기화 (sync.ts)
                          lastEditSource 추적

                                  │
                           실행 엔진 (runner.ts)
                           YaksokSession
                                  │
                          execution-store
                          (status, consoleOutput,
                           variables, isStepMode)
```

---

## 양방향 동기화 메커니즘

핵심 과제: 코드와 순서도가 동시에 편집 가능할 때 무한 루프를 방지하면서 동기화.

### 방향 추적 (`ui-store.lastEditSource`)

```
'none'     초기값 / 무시 상태
'code'     Monaco 에디터에서 사용자가 직접 입력
'flowchart' 순서도에서 노드/엣지를 변경
```

### 코드 → 순서도 흐름 (C2F)

```
사용자 타이핑
    │
    ▼
editor-store.code 변경
    │
    ▼ (300ms debounce, useFlowSync 내 useEffect)
lastEditSource === 'flowchart'? → 무시 (순서도 편집 중)
    │ 아니면
    ▼
parseOptimistically(code) → AST
    │
    ▼
ast-to-flow.ts → nodes[], edges[]
    │
    ▼
applyLayout(dagre) → 위치 계산
    │
    ▼
flowchart-store.setNodes / setEdges
    │
    ▼
fitView(300ms duration)
```

### 순서도 → 코드 흐름 (F2C)

```
노드 드롭 / 엣지 연결 / NodeEditModal 저장
    │
    ▼
triggerF2C()
    ├── lastEditSource = 'flowchart'
    ├── isProgrammaticUpdateRef.current = true  ← 루프 방지 플래그
    ├── Monaco.setValue(generated)
    │       │
    │       ▼ (onChange 발생하지만...)
    │   isProgrammaticUpdateRef === true → lastEditSource 변경 안 함
    ├── isProgrammaticUpdateRef.current = false
    └── editor-store.setCode(generated)
```

### 루프 방지 핵심

```
isProgrammaticUpdateRef (ref, 동기)
    Monaco.setValue()가 onChange를 동기적으로 호출하기 때문에
    ref를 사용해야 setState(비동기)보다 먼저 플래그가 세팅됨
```

---

## 상태 흐름 (4개 Zustand 스토어)

### editor-store
```
code            현재 에디터 코드 (C2F 트리거 소스)
errors          Monaco 에러 마커
executingLine   실행 중인 줄 번호 (에디터 하이라이트용)
```

### flowchart-store
```
nodes           React Flow 노드 배열
edges           React Flow 엣지 배열
executingNodeId 실행 중인 노드 ID (노드 glow 효과, 엣지 애니메이션)
```

### execution-store
```
status          idle | running | paused | stepping | done | error
consoleOutput   stdout 줄 배열
variables       { 변수명: toPrint() 결과 }
executionDelay  실행 속도 (ms)
isStepMode      단계별 실행 여부 (헤더 UI 분기)
```

### ui-store
```
lastEditSource  'code' | 'flowchart' | 'none'  ← 동기화 방향 추적
modalOpen       NodeEditModal 표시 여부
modalNodeId     편집 중인 노드 ID
```

---

## 실행 엔진 흐름

### 일반 실행 (`startExecution`)

```
[▶ 실행하기] 클릭
    │
    ▼
buildSession()
    ├── new YaksokSession({ executionDelay, signal })
    ├── session.stdout = appendConsole
    ├── session.events.on('runningCode') → setExecutingNodeId + setExecutingLine
    └── session.events.on('variableSet') → setVariable(name, value.toPrint())
    │
    ▼
setupDisconnected()  ← 미연결 노드 주황 경고 표시
    │
    ▼
session.runModule('main')  [비동기]
    │
    ├── 각 노드 실행 전: runningCode 이벤트 → 하이라이트 갱신
    ├── stdout: appendConsole
    └── 완료/오류: finally에서 setTimeout(executionDelay)로 하이라이트 해제
                   └─ 마지막 노드가 페인트될 macrotask 경계 확보
```

### 단계별 실행 (`startStepExecution`)

```
[⏭ 단계별] 클릭
    │
    ▼
buildSession(stepByStep=true)
    └── session.stepByStep = true
    │
    ▼
session.runModule('main')
    │
    ├── runningCode 이벤트 → status = 'stepping' → 실행 일시정지
    │                                              (라이브러리가 resume() 대기)
    │
    └── [⏭ 다음] 클릭 → session.resume() → 다음 노드로 진행
```

---

## AST → 순서도 노드 매핑

| AST 노드 | RF 노드 타입 | 엣지 구조 |
|----------|------------|-----------|
| Block 루트 | terminal (시작/끝) | 순차 |
| SetVariable | process/assign | 순차 |
| IfStatement | decision | true(Left) / false(Right) → merge |
| CountLoop | loop/count | body 진입 → back 복귀 |
| ConditionalLoop | loop/while | body 진입 → back 복귀 |
| ListLoop | loop/list | body 진입 → back 복귀 |
| FunctionInvoke("보여주기") | output | 순차 |
| FunctionInvoke(기타) | process/func-call | 순차 |
| DeclareFunction | function | funcbody(본문 소속) + 순차(다음 문장) |
| Return | terminal/반환 | 없음 |

### 엣지 타입별 렌더링 정책

```
default   → 실선, 회색 (#94A3B8)
true      → 실선, 초록 (#4ADE80), "참" 레이블
false     → 점선, 빨강 (#F87171), "거짓" 레이블
body      → 실선, 회색 (반복 본문 진입)
back      → 렌더링 안 함 (flow-to-code용 메타 엣지)
funcbody  → 보라 점선 bezier (#C4B5FD), dagre 제외, 함수 노드 왼쪽 배치
```

### funcbody 설계 이유

함수 선언 본문은 "순차 실행 흐름"이 아닌 "소속 관계"이므로 일반 body 엣지와 분리:
- dagre에서 제외 → 함수 본문 노드가 메인 흐름을 방해하지 않음
- 시각적으로 보라 점선으로 구분 → "이 노드들은 함수 내부"임을 암시

---

## 컴포넌트 계층

```
App.tsx
├── TopNav (nav/TopNav.tsx)
│   ├── Logo
│   ├── StatusChip
│   ├── SyncBadge
│   ├── ExampleDropdown
│   └── 실행 제어 버튼들
├── Layout (app/layout.tsx)
│   ├── 에디터 영역
│   │   ├── CardHeader
│   │   └── CodeEditor (Monaco)
│   ├── 순서도 영역
│   │   └── FlowCanvas
│   │       ├── useFlowSync (훅: C2F, F2C, 이벤트 핸들러)
│   │       ├── useExecutionHighlight (훅: 노드 하이라이트)
│   │       ├── NodePalette (드래그 팔레트)
│   │       ├── 커스텀 노드 6종
│   │       └── NodeEditModal
│   │           └── useNodeForm (훅: 폼 상태, 유효성, F2C)
│   ├── ConsolePanel
│   ├── VariablePanel
│   └── Mascot
└── HelpModal
```

---

## 핵심 설계 결정 (ADR 요약)

### 마지막 노드 하이라이트 타이밍

**문제**: 마지막 실행 노드가 화면에 표시되지 않음  
**원인**: 브라우저는 macrotask 단위로 페인트. `setExecutingNodeId('last')` 후 `setExecutingNodeId(null)`이 같은 macrotask에서 실행되면 최종값(null)만 화면에 반영됨  
**해결**: `finally` 블록에서 null 처리를 `setTimeout(executionDelay)` 안으로 이동 → 별도 macrotask로 분리  
**상세**: `docs/decisions/execution-highlight-timing.md`

### funcbody 엣지 분리

**문제**: 함수 선언 본문 노드가 dagre에 의해 메인 흐름에 끼어들어 레이아웃이 어색해짐  
**해결**: `funcbody` 전용 엣지 타입 도입, dagre 제외, 수동 배치, 보라 점선으로 시각화  
**근거**: 함수 본문은 순차 실행 흐름이 아닌 "선언 범위" 개념이므로 별도 처리가 의미론적으로도 맞음
