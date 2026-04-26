# 달빛흐름 — 기능 요구사항 명세

> 기반 문서: `docs/agent/상세-기획서.md`, `docs/agent/01-초기-아이디에이션-및-방향-설정.md`  
> ID 형식: `REQ-{영역}-{번호}`

---

## 영역 목록

| 영역 | 코드 | 설명 |
|------|------|------|
| 레이아웃 | LAY | 전체 화면 구성 |
| 코드 에디터 | EDT | Monaco 에디터 통합 |
| 코드→순서도 | C2F | AST 파싱 및 노드 변환 (정방향) |
| 순서도 렌더링 | FLW | React Flow 캔버스 |
| 실행 엔진 | RUN | YaksokSession 연동 |
| 실행 시각화 | VIZ | 하이라이트, 콘솔, 변수 패널 |
| 순서도→코드 | F2C | 역방향 코드 생성 |
| 양방향 동기화 | SYN | 충돌 없는 상태 동기화 |
| 인터랙션 | UX | 클릭, 드래그, 키보드 |
| 예제 프리셋 | EXP | 샘플 코드 |
| 상태 관리 | STR | Zustand 스토어 |
| 공통 타입 | TYP | TypeScript 타입 정의 |

---

## 구현 순서

의존 관계 기준으로 정리한 구현 순서. 각 단계는 이전 단계 완료 후 진행.

### Phase 1 — 기반 (타입·스토어·레이아웃)

| 순서 | 영역 | 대상 요구사항 | 비고 |
|------|------|-------------|------|
| 1 | TYP | REQ-TYP-01, 02 | 모든 구현의 기반, 가장 먼저 |
| 2 | STR | REQ-STR-01 ~ 04 | 타입 정의 후 스토어 골격 작성 |
| 3 | LAY | REQ-LAY-01 ~ 03 | 빈 패널 분할 + 헤더 버튼 배치 |

### Phase 2 — 코드 에디터

| 순서 | 영역 | 대상 요구사항 | 비고 |
|------|------|-------------|------|
| 4 | EDT | REQ-EDT-01 | Monaco 마운트, 다크 테마 |
| 5 | EDT | REQ-EDT-02 | 달빛약속 언어 등록·구문 강조 |
| 6 | EDT | REQ-EDT-05 | onChange → editor-store 연결 |

### Phase 3 — 코드 → 순서도 (정방향)

| 순서 | 영역 | 대상 요구사항 | 비고 |
|------|------|-------------|------|
| 7 | C2F | REQ-C2F-01 | parse / parseOptimistically 호출 |
| 8 | C2F | REQ-C2F-02 | AST 노드 → RF 노드 변환 기본 (process, output, terminal) |
| 9 | FLW | REQ-FLW-01, 02 | React Flow 캔버스 + 기본 커스텀 노드 렌더링 확인 |
| 10 | C2F | REQ-C2F-04 | dagre 자동 배치 |
| 11 | C2F | REQ-C2F-03, 05 | 엣지 생성 + 중첩 구조 (decision, loop, function) |
| 12 | FLW | REQ-FLW-03 | AnimatedEdge (label 포함) |

### Phase 4 — 실행 엔진 + 시각화

| 순서 | 영역 | 대상 요구사항 | 비고 |
|------|------|-------------|------|
| 13 | RUN | REQ-RUN-01, 02, 03 | YaksokSession 생성, validate, stdout |
| 14 | RUN | REQ-RUN-04 | 실행/정지 제어, AbortSignal |
| 15 | VIZ | REQ-VIZ-04 | 콘솔 패널 출력 |
| 16 | EDT | REQ-EDT-04 | runningCode → 에디터 줄 하이라이트 |
| 17 | VIZ | REQ-VIZ-01, 02 | runningCode → 순서도 노드 하이라이트 + 엣지 애니메이션 |
| 18 | VIZ | REQ-VIZ-03 | variableSet → 변수 패널 |
| 19 | RUN | REQ-RUN-05 | 실행 속도 슬라이더 |

### Phase 5 — 순서도 → 코드 (역방향)

| 순서 | 영역 | 대상 요구사항 | 비고 |
|------|------|-------------|------|
| 20 | FLW | REQ-FLW-04, 05 | 노드 팔레트 + NodeEditModal |
| 21 | F2C | REQ-F2C-01 ~ 04 | flowToCode 알고리즘 |
| 22 | FLW | REQ-FLW-06 | 노드·엣지 연결/삭제 |

### Phase 6 — 양방향 동기화

| 순서 | 영역 | 대상 요구사항 | 비고 |
|------|------|-------------|------|
| 23 | SYN | REQ-SYN-01 ~ 04 | lastEditSource 추적 + 루프 방지 |
| 24 | EDT | REQ-EDT-03 | validate → 에디터 에러 마커 (동기화 완성 후) |

### Phase 7 — 마무리

| 순서 | 영역 | 대상 요구사항 | 비고 |
|------|------|-------------|------|
| 25 | EXP | REQ-EXP-01, 02 | 예제 코드 데이터 + 드롭다운 |
| 26 | UX | REQ-UX-01 | 노드 클릭 → 에디터 이동 |
| 27 | UX | REQ-UX-02, 03, 04 | 더블클릭 수정, 삭제, fitView |

---

## REQ-LAY: 레이아웃

### REQ-LAY-01: 4분할 패널 구조
- 상단 헤더: 타이틀 + 실행 컨트롤 버튼
- 좌상: 코드 에디터 (Monaco)
- 우상: 순서도 캔버스 (React Flow)
- 좌하: 실행 결과 콘솔
- 우하: 변수 상태 패널
- 하단 푸터: 실행 속도 슬라이더 + 예제 드롭다운
- 데스크탑 전용 고정 레이아웃 (최소 1024px, 반응형 불필요)

### REQ-LAY-02: 패널 비율
- 좌/우 비율: 1:1 (각 50vw)
- 상(에디터/캔버스) : 하(콘솔/변수) = 약 7:3
- 좌상과 우상은 같은 높이, 좌하와 우하는 같은 높이

### REQ-LAY-03: 헤더
- 좌: "달빛흐름" 서비스명
- 우: [▶ 실행] [⏸ 일시정지] [⏹ 정지] 버튼
- 실행 중이 아닐 때: 일시정지·정지 버튼 비활성화
- 실행 중일 때: 실행 버튼 비활성화

---

## REQ-EDT: 코드 에디터

### REQ-EDT-01: Monaco 에디터 마운트
- `@monaco-editor/react`로 에디터 렌더링
- 다크 테마 (배경 `#161625`)
- 폰트: JetBrains Mono 14px
- 초기값: 첫 번째 예제 코드

### REQ-EDT-02: 달빛약속 언어 등록
- Monaco에 `dalbit-yaksok` 언어 ID 등록
- `tokenize()` 결과를 Monaco 토큰 프로바이더로 연결하여 구문 강조
- 키워드 색상 지정 (만약, 이면, 아니면, 반복, 약속, 반환, 보여주기 등)

### REQ-EDT-03: 실시간 에러 마커
- 코드 변경 후 300ms debounce로 `validate()` 호출
- 에러 위치에 Monaco `setModelMarkers`로 빨간 밑줄 표시
- 에러 없을 시 마커 전체 제거

### REQ-EDT-04: 실행 중 줄 하이라이트
- `runningCode` 이벤트 수신 시 해당 줄에 Monaco `deltaDecorations`로 노란 배경(`#FDE68A`) 적용
- 항상 1개만 활성 (이전 하이라이트 제거 후 새 것 적용)
- 실행 종료 시 전체 하이라이트 제거

### REQ-EDT-05: 코드 변경 이벤트
- Monaco `onChange` 콜백 → `editor-store.code` 업데이트
- 상태 변경이 `SYN` 동기화 흐름을 트리거

---

## REQ-C2F: 코드 → 순서도 변환 (정방향)

### REQ-C2F-01: AST 파싱
- 코드가 유효할 때: `parse(code)` 호출
- 타이핑 중 (불완전한 코드): `parseOptimistically(code)` 호출
- 파싱 실패 시 마지막으로 성공한 순서도 유지 (UI 깜빡임 방지)

### REQ-C2F-02: AST 노드 → React Flow 노드 변환 (`ast-to-flow.ts`)

| AST 노드 | RF 노드 타입 | label |
|----------|------------|-------|
| Block 최상위 시작 | `terminal` | "시작" |
| Block 최상위 끝 | `terminal` | "끝" |
| SetVariable | `process` | `변수명 = 값` |
| IfStatement | `decision` | 조건식 문자열 |
| CountLoop | `loop` | `N번 반복` |
| ConditionalLoop | `loop` | `조건 동안` |
| ListLoop | `loop` | `각 항목 반복` |
| FunctionInvoke("보여주기") | `output` | 인자 문자열 |
| FunctionInvoke(기타) | `process` | `함수명(인자)` |
| DeclareFunction | `function` | 함수 이름 |
| Return | `terminal` | "반환" |

- 각 노드에 원본 코드 줄 번호(`line`) 포함 → 에디터 이동용
- 각 노드에 AST 노드 식별자(`astNodeId`) 포함 → 실행 하이라이트 매핑용

### REQ-C2F-03: 엣지 생성 규칙

| 상황 | label | 색상 | 스타일 |
|------|-------|------|--------|
| 순차 실행 | 없음 | 기본 | 실선 |
| IfStatement 참 | "참" | `#4ADE80` | 실선 |
| IfStatement 거짓 | "거짓" | `#F87171` | 점선 |
| 반복 복귀 | 없음 | 기본 | 점선 (위 방향) |

### REQ-C2F-04: dagre 자동 배치 (`layout.ts`)
- `dagre`로 노드 위치(x, y) 자동 계산
- 방향: 위→아래 (`rankdir: 'TB'`)
- 노드 간격: 수직 80px, 수평 50px
- 변환 결과: `position` 포함된 RF 노드 배열 반환

### REQ-C2F-05: 중첩 구조 처리
- IfStatement: 참 브랜치·거짓 브랜치를 각각 재귀 변환
- Loop: 본문 노드 재귀 변환 후 복귀 엣지 연결
- DeclareFunction: 본문을 별도 노드 그룹으로 표현

---

## REQ-FLW: 순서도 렌더링

### REQ-FLW-01: React Flow 캔버스 마운트
- `@xyflow/react` `ReactFlow` 컴포넌트 사용
- 줌/패닝 활성화
- 배경: `#0F0F1A`

### REQ-FLW-02: 커스텀 노드 타입 등록

| 타입 | 컴포넌트 | 모양 | 색상 |
|------|----------|------|------|
| `terminal` | TerminalNode | 둥근 사각형 | `#6B7280` |
| `process` | ProcessNode | 사각형 | `#3B82F6` |
| `decision` | DecisionNode | 마름모 | `#F59E0B` |
| `loop` | LoopNode | 육각형 | `#10B981` |
| `output` | OutputNode | 평행사변형 | `#8B5CF6` |
| `function` | FunctionNode | 이중 사각형 | `#7C3AED` |

- 각 노드 내부에 label 텍스트 표시 (JetBrains Mono)
- `executing: true`일 때 노란 테두리(`#FDE68A`) + 글로우 효과

### REQ-FLW-03: 커스텀 엣지 (`AnimatedEdge.tsx`)
- 실행 중인 엣지에 흐름 애니메이션 표시
- 엣지 중간에 label 표시 ("참"/"거짓")

### REQ-FLW-04: 노드 팔레트 (역방향용, `NodePalette.tsx`)
- 캔버스 좌측에 고정 팔레트
- 항목: 처리(□), 분기(◇), 반복(⬡), 출력(▱)
- HTML5 drag API로 캔버스에 드롭 가능
- 드롭 시 해당 위치에 노드 생성 → `NodeEditModal` 즉시 오픈

### REQ-FLW-05: NodeEditModal (`NodeEditModal.tsx`)
- 노드 드롭 또는 기존 노드 더블클릭 시 열림
- 노드 타입별 입력 필드:
  - 처리: 변수명(text), 값(text)
  - 출력: 출력 내용(text)
  - 분기: 조건식(text)
  - 반복: 반복 횟수(number)
- 확인 → 노드 데이터 저장, 모달 닫기
- 취소 → 드롭된 노드 제거, 모달 닫기

### REQ-FLW-06: 노드·엣지 편집
- 노드 핸들 드래그 → 다른 노드에 연결하여 엣지 생성
- 노드/엣지 선택 후 `Delete` 키 → 삭제
- 노드 삭제 시 연결된 엣지도 함께 삭제

---

## REQ-RUN: 실행 엔진

### REQ-RUN-01: YaksokSession 생성
- [▶ 실행] 클릭 시 새 `YaksokSession` 인스턴스 생성
- `executionDelay` 슬라이더 값(ms)을 세션에 전달
- `@dalbit-yaksok/exts-standard` 표준 라이브러리 등록

### REQ-RUN-02: 실행 전 검증
- `validate(code)` 호출
- 에러 있으면 콘솔 패널에 빨간 메시지 출력 후 실행 중단
- 에러 없으면 세션 시작

### REQ-RUN-03: stdout 캡처
- `stdout` 콜백으로 출력 메시지 수집
- 콘솔 패널에 줄 단위로 append
- 실행 시작 시 콘솔 초기화

### REQ-RUN-04: 실행 제어
- [▶ 실행]: `runModule('main')` 비동기 실행, `status = 'running'`
- [⏸ 일시정지]: `pause()` 호출, `status = 'paused'`, 버튼 토글하여 [▶ 재개]로 변경
- [⏹ 정지]: `AbortSignal`로 실행 중단, `status = 'idle'`
- 실행 완료(정상/오류/중단) 후 `status` 업데이트, 실행 버튼 활성화

### REQ-RUN-05: 실행 속도 슬라이더
- 범위: 0ms ~ 2000ms (기본 500ms)
- 슬라이더 값 변경 시 `executionDelay` 실시간 반영 (실행 중 변경도 적용)
- 현재 값 레이블 표시 (예: "0.5초")

---

## REQ-VIZ: 실행 시각화

### REQ-VIZ-01: 순서도 노드 하이라이트
- `runningCode` 이벤트의 위치 정보로 해당 RF 노드의 `executing` prop을 true 설정
- 이전 하이라이트 노드의 `executing` 해제 (항상 1개만 활성)
- 실행 종료 시 전체 `executing` 해제

### REQ-VIZ-02: 실행 경로 애니메이션
- 실행된 엣지를 `animated: true`로 변경
- 실행 종료 시 모든 엣지 애니메이션 리셋

### REQ-VIZ-03: 변수 상태 패널 (`VariablePanel.tsx`)
- `variableSet` 이벤트 수신 시 `{ name, value }` 업데이트
- 변수명: 값 목록으로 표시
- 값 변경 시 잠깐 하이라이트 (변경 감지 피드백)
- 실행 시작 시 패널 초기화

### REQ-VIZ-04: 콘솔 패널 (`ConsolePanel.tsx`)
- `stdout` 출력을 줄 단위로 표시
- 최신 출력이 하단에 오도록 자동 스크롤
- 실행 에러 메시지는 빨간색으로 표시
- 실행 시작 시 초기화

---

## REQ-F2C: 순서도 → 코드 생성 (역방향)

### REQ-F2C-01: 지원 노드 타입 (MVP)
- 처리(`process`), 출력(`output`), 분기(`decision`), 반복(`loop`)
- `terminal` 노드는 코드 생성 대상에서 제외
- `function` 노드는 MVP 범위 외 (코드 생성 안 함)

### REQ-F2C-02: 노드 타입별 코드 생성 규칙

| 노드 타입 | 사용자 입력 | 생성 코드 |
|-----------|-----------|-----------|
| 처리 | 변수명, 값 | `변수명 = 값` |
| 출력 | 출력 내용 | `"내용" 보여주기` |
| 분기 | 조건식 | `만약 조건이면` / `아니면` |
| 반복 | 반복 횟수 N | `반복 N번` |

### REQ-F2C-03: flowToCode 알고리즘 (`flow-to-code.ts`)
1. `terminal` 노드(label="시작") 찾기
2. 엣지를 따라 위상 정렬 (topological sort)
3. 각 노드를 순서대로 순회하며 코드 생성:
   - `process` / `output`: 해당 코드 줄 추가
   - `decision`:
     ```
     만약 조건이면
         [참 엣지 하위 노드 재귀, 들여쓰기 +1]
     아니면
         [거짓 엣지 하위 노드 재귀, 들여쓰기 +1]
     ```
     거짓 엣지 없으면 `아니면` 블록 생략
   - `loop`:
     ```
     반복 N번
         [본문 노드 재귀, 들여쓰기 +1]
     ```
4. 들여쓰기: 탭 문자(`\t`) 사용
5. 최종 코드 문자열 반환

### REQ-F2C-04: 엣지 방향 해석 규칙
- `decision`에서 `label="참"` 엣지 → 참 브랜치
- `decision`에서 `label="거짓"` 또는 label 없는 엣지 → 거짓/다음 브랜치
- `loop`에서 loop-back 엣지가 아닌 엣지 → 본문

---

## REQ-SYN: 양방향 동기화

### REQ-SYN-01: lastEditSource 추적 (`sync.ts`)
- 상태: `'code' | 'flowchart' | 'none'`
- 코드 에디터 변경 시 → `lastEditSource = 'code'`
- 순서도 노드/엣지 변경 시 → `lastEditSource = 'flowchart'`

### REQ-SYN-02: 코드 편집 시 흐름
1. 코드 변경 → `lastEditSource = 'code'`
2. 300ms debounce 후 `parseOptimistically(code)` 실행
3. 성공 → `C2F` 변환 → `flowchart-store` 업데이트
4. 실패 → 마지막 유효 순서도 유지
5. `flowchart-store` 업데이트 자체는 역방향 루프를 트리거하지 않음

### REQ-SYN-03: 순서도 편집 시 흐름
1. 노드/엣지 변경 → `lastEditSource = 'flowchart'`
2. 300ms debounce 후 `flowToCode(nodes, edges)` 실행
3. 생성 코드를 `editor-store.code` 업데이트 + Monaco `setValue` 반영
4. 코드 업데이트 자체는 정방향 루프를 트리거하지 않음

### REQ-SYN-04: 루프 방지
- `lastEditSource` 확인으로 역방향 트리거 차단
- 동기화 처리 중 `isSyncing` flag로 재진입 방지

---

## REQ-UX: 인터랙션

### REQ-UX-01: 순서도 노드 클릭 → 에디터 이동
- RF 노드 클릭 시 노드의 `line` 정보로 Monaco `revealLine()` 호출
- 에디터 뷰를 해당 줄로 스크롤

### REQ-UX-02: 노드 더블클릭 → 값 수정
- 역방향으로 생성된 노드 더블클릭 → `NodeEditModal` 열림
- 기존 값 pre-fill

### REQ-UX-03: 노드/엣지 삭제
- 노드 선택 후 `Delete`/`Backspace` → 노드 및 연결된 엣지 삭제
- 엣지 선택 후 `Delete` → 엣지 삭제
- 삭제 후 `F2C` 동기화 트리거

### REQ-UX-04: 캔버스 fitView
- 정방향 변환으로 순서도가 새로 생성될 때 `fitView()` 호출
- 이후 사용자 줌/패닝 상태는 유지

---

## REQ-EXP: 예제 프리셋

### REQ-EXP-01: 예제 목록 (`data/examples.ts`)

| ID | 제목 | 핵심 AST 구조 |
|----|------|-------------|
| `hello` | 기본 출력 | FunctionInvoke(보여주기) |
| `age-check` | 변수와 조건문 | SetVariable + IfStatement |
| `sum-loop` | 반복문 합계 | CountLoop + SetVariable |
| `grade` | 중첩 조건문 | 중첩 IfStatement |
| `function` | 함수 선언과 호출 | DeclareFunction + FunctionInvoke |
| `list-loop` | 리스트 반복 | ListLoop |

### REQ-EXP-02: 예제 드롭다운
- 하단 푸터에 [예제 코드 ▾] 드롭다운
- 선택 시 `editor-store.code` 즉시 교체 → `SYN` 흐름 트리거
- 경고 없이 즉시 교체

---

## REQ-STR: 상태 관리 (Zustand 스토어)

### REQ-STR-01: editor-store
```typescript
{
  code: string
  errors: MonacoMarker[]
  executingLine: number | null
  setCode: (code: string) => void
  setErrors: (errors: MonacoMarker[]) => void
  setExecutingLine: (line: number | null) => void
}
```

### REQ-STR-02: flowchart-store
```typescript
{
  nodes: FlowNode[]
  edges: FlowEdge[]
  executingNodeId: string | null
  setNodes: (nodes: FlowNode[]) => void
  setEdges: (edges: FlowEdge[]) => void
  setExecutingNodeId: (id: string | null) => void
  updateNode: (id: string, data: Partial<FlowNodeData>) => void
}
```

### REQ-STR-03: execution-store
```typescript
{
  status: 'idle' | 'running' | 'paused' | 'done' | 'error'
  consoleOutput: string[]
  variables: Record<string, unknown>
  executionDelay: number        // ms, 0~2000, 기본 500
  setStatus: (status: ExecutionStatus) => void
  appendConsole: (line: string) => void
  setVariable: (name: string, value: unknown) => void
  clearRuntime: () => void      // consoleOutput + variables 초기화
  setExecutionDelay: (ms: number) => void
}
```

### REQ-STR-04: ui-store
```typescript
{
  lastEditSource: 'code' | 'flowchart' | 'none'
  isSyncing: boolean
  modalOpen: boolean
  modalNodeId: string | null    // null이면 새 노드 추가
  setLastEditSource: (src: 'code' | 'flowchart' | 'none') => void
  setIsSyncing: (v: boolean) => void
  openModal: (nodeId: string | null) => void
  closeModal: () => void
}
```

---

## REQ-TYP: 공통 타입 (`types/`)

### REQ-TYP-01: FlowNodeData
```typescript
interface FlowNodeData {
  label: string
  nodeType: 'terminal' | 'process' | 'decision' | 'loop' | 'output' | 'function'
  line?: number             // 원본 코드 줄 번호
  astNodeId?: string        // 원본 AST 노드 ID
  executing?: boolean       // 현재 실행 중 여부
  // 역방향 노드 전용 필드
  varName?: string
  varValue?: string
  condition?: string
  outputContent?: string
  loopCount?: number
}
```

### REQ-TYP-02: ExecutionStatus
```typescript
type ExecutionStatus = 'idle' | 'running' | 'paused' | 'done' | 'error'
```

---

## MVP 제외 범위

- 모바일/태블릿 반응형
- 라이트 모드
- 코드 저장/불러오기
- DeclareFunction 노드의 역방향 코드 생성
- `getAutocomplete()` 자동완성
- 노드 수동 위치 조정 및 persist
