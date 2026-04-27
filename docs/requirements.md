# 달빛흐름 — 기능 요구사항 명세

> 기반 문서: `docs/agent/상세-기획서.md`, `docs/agent/01-초기-아이디에이션-및-방향-설정.md`  
> ID 형식: `REQ-{영역}-{번호}`  
> 마지막 업데이트: 2026-04-27

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
| 상태 관리 | STR | Zustand 스토어 |
| 공통 타입 | TYP | TypeScript 타입 정의 |
| 테스트 | TST | 단위·통합 테스트 |

---

## REQ-LAY: 레이아웃

### REQ-LAY-01: 4분할 패널 구조
- 상단 헤더: 로고 + 실행 컨트롤 + 속도 4단계 버튼 + 도움말 버튼
- 좌상: 코드 에디터 (Monaco)
- 우상: 순서도 캔버스 (React Flow)
- 좌하: 실행 결과 콘솔
- 우하: 변수 현황판
- 데스크탑 전용 고정 레이아웃 (최소 1024px, 반응형 불필요)
- **탭 없음**: 학습/실습 탭은 제거. 단일 양방향 편집 화면.

### REQ-LAY-02: 패널 비율
- 좌/우 비율: 1:1 (각 flex: 1)
- 상(에디터/캔버스) : 하(콘솔/변수) = 약 7:3
- 콘솔 패널: flex: 1, 변수 패널: width 320px 고정

### REQ-LAY-03: 헤더
- 좌: 달빛약속 로고 + 서비스명 ("달빛흐름")
- 우 (3 그룹):
  1. **속도 그룹** (단계별 모드에서 숨김): 속도 레이블 + 느림/보통/빠름/매우빠름 4단계 토글 버튼
  2. **실행 제어 그룹**: [⏭ 다음] (단계별 모드 중만) [⏸ 멈춤/▶ 계속] (일반 모드만) [⏹ 정지]
  3. **시작 그룹**: [⏭ 단계별] [▶ 실행하기] + 상태 칩
  4. **유틸**: [예제 코드 ▾] [📖 사용 방법]
- 실행 중이 아닐 때: 멈춤·정지·다음 버튼 비활성화
- 실행 중일 때: 실행하기·단계별 버튼 비활성화
- 상태 칩: idle/running/paused/stepping/done/error 6종

### REQ-LAY-04: 양방향 동기화 표시 배지 (SyncBadge)
- 에디터/순서도 패널 사이 정중앙에 절대 위치
- 코드 편집 → `코드 → 순서도` pill 1.5초 표시 후 사라짐
- 순서도 편집 → `순서도 → 코드` pill 1.5초 표시 후 사라짐
- `opacity` 트랜지션으로 부드럽게 등장/소멸

### REQ-LAY-05: 테마
- 라이트 테마 (기본)
- 배경: `#F3F2FA`, 패널: `#fff`, 테두리: `#EEEDF8`
- 프라이머리: `#4F46E5`, UI 폰트: Pretendard, 코드 폰트: JetBrains Mono

---

## REQ-EDT: 코드 에디터

### REQ-EDT-01: Monaco 에디터 마운트
- `@monaco-editor/react`로 에디터 렌더링
- 라이트 테마 `dalbit-light` (배경 `#FFFFFF`)
- 폰트: JetBrains Mono 14px
- `wordWrap: on`, minimap 비활성화

### REQ-EDT-02: 달빛약속 언어 등록
- `@dalbit-yaksok/monaco-language-provider`의 `DalbitYaksokApplier` 사용
- 언어 ID: `LANG_ID = 'dalbityaksok'`
- 구문 강조 토큰 색상:
  - `keyword` (만약·이면·아니면·반복·약속·반환): `#4F46E5` bold
  - `tag` (FunctionInvoke/CALLABLE - 보여주기 등): `#4F46E5` bold
  - `string`: `#059669`
  - `number`: `#DC2626`

### REQ-EDT-03: 실시간 에러 마커
- 코드 변경 후 300ms debounce로 `validate()` 호출
- 에러 위치에 Monaco `setModelMarkers`로 빨간 밑줄 표시
- 에러 없을 시 마커 전체 제거

### REQ-EDT-04: 실행 중 줄 하이라이트
- `runningCode` 이벤트 수신 시 해당 줄에 `deltaDecorations`로 배경 적용 (`#EEF0FF`)
- 왼쪽에 `#4F46E5` 3px border-left
- 항상 1개만 활성, 실행 종료 시 제거

### REQ-EDT-05: 코드 변경 이벤트
- Monaco `onChange` 콜백 → `editor-store.code` 업데이트
- programmatic 업데이트 여부: `isProgrammaticUpdateRef.current` flag로 구분
  - `true`이면 `lastEditSource` 변경하지 않음 (F2C가 setValue 시 사용)

---

## REQ-C2F: 코드 → 순서도 변환 (정방향)

### REQ-C2F-01: AST 파싱
- `parseOptimistically(code)` 호출 (타이핑 중 불완전 코드도 허용)
- `CodeFile(code, 'main').parseOptimistically()` 방식 사용
- 파싱 실패 시 `null` 반환 → 마지막 유효 순서도 유지

### REQ-C2F-02: AST 노드 → React Flow 노드 변환 (`ast-to-flow.ts`)

| AST 노드 | RF 노드 타입 | label |
|----------|------------|-------|
| Block 최상위 시작 | `terminal` | "시작" |
| Block 최상위 끝 | `terminal` | "끝" |
| SetVariable | `process` | `변수명 = 값` |
| IfStatement | `decision` | 조건식 문자열 |
| CountLoop | `loop` | `N번 반복` |
| ConditionalLoop | `loop` | `조건 동안` |
| ListLoop | `loop` | `목록변수 의 항목변수` |
| FunctionInvoke("보여주기") | `output` | 인자 문자열 |
| FunctionInvoke(기타) | `process`/func-call | `함수명 인자` |
| DeclareFunction | `function` | `약속: 함수이름` |
| Return | `terminal` | "반환" |

- 각 노드에 원본 코드 줄 번호(`line`) 포함
- **output 노드**: 인자가 `"..."` 형식이면 `outputType: 'string'`, 변수/식이면 `outputType: 'expr'`

### REQ-C2F-03: 엣지 생성 규칙

| 상황 | edgeType | 색상 | 스타일 |
|------|----------|------|--------|
| 순차 실행 | `default` | `#94A3B8` | 실선 |
| IfStatement 참 | `true` | `#4ADE80` | 실선 |
| IfStatement 거짓 | `false` | `#F87171` | 점선 |
| 반복 본문 진입 | `body` | `#94A3B8` | 실선 |
| 반복 복귀 | `back` | — | **렌더링 안 함** (RF state는 유지) |
| 함수 선언 본문 | `funcbody` | `#C4B5FD` | 보라 점선 bezier |

- `back` 엣지는 `AnimatedEdge`에서 `return null` 처리 → flow-to-code 동작용으로만 존재
- `funcbody` 엣지는 dagre 배치에서 제외; body 노드는 함수 노드 왼쪽에 수동 배치
- `funcbody` 엣지는 "소속" 관계를 표현하며 순차 흐름으로 해석하지 않음

### REQ-C2F-04: 루프 엣지 구조
- Loop 노드에서 body 노드로: `edgeType: 'body'`
- body 마지막 노드에서 loop 노드로: `edgeType: 'back'`
- **loop 노드는 `bodyTails`를 반환** → 다음 문장이 body tail에서 직접 연결됨
  - loop → body → exit (직선 구조, loop → exit 엣지 없음)

### REQ-C2F-05: dagre 자동 배치 (`layout.ts`)
- `dagre`로 노드 위치(x, y) 자동 계산 (`rankdir: 'TB'`)
- `back` 엣지만 제외하고 dagre에 전달
- body tail → exit 구조 덕분에 반복 노드가 직선 배치됨

### REQ-C2F-06: 팬텀 노드 방지
- 인식 안 되는 AST 노드 처리 시:
  - 토큰에 `보여주기` 포함 → output 노드로 fallback
  - 빈 레이블 (`''`) → 노드 생성하지 않고 `fromIds` 그대로 반환

---

## REQ-FLW: 순서도 렌더링

### REQ-FLW-01: React Flow 캔버스 마운트
- `@xyflow/react` `ReactFlow` 컴포넌트 사용
- 줌/패닝 활성화, `Delete` 키로 노드/엣지 삭제
- 배경: `#FAFAFE` dot pattern

### REQ-FLW-02: 커스텀 노드 타입 등록

| 타입 | 컴포넌트 | 모양 | 색상 | 상단 뱃지 |
|------|----------|------|------|-----------|
| `terminal` | TerminalNode | 둥근 사각형 | `#6366F1` (반환: `#F87171`) | "단말" |
| `process`/assign | ProcessNode | 사각형 | `#3B82F6` | "변수" |
| `process`/func-call | ProcessNode | 사각형 | `#3B82F6` | "호출" |
| `decision` | DecisionNode | 마름모 (SVG) | `#F59E0B` | "조건" |
| `loop` | LoopNode | 육각형 (SVG) | `#10B981` | "반복" |
| `output` | OutputNode | 평행사변형 | `#8B5CF6` | "출력" |
| `function` | FunctionNode | 이중 테두리 사각형 | `#6366F1` | "약속" |

- 실행 중(`executing: true`): 테두리 굵어짐 + glow 효과
- 미연결(`disconnected: true`): 주황 점선 테두리 + `⚠️ 연결 끊김` 뱃지 + 0.75 opacity
- **호버 시 핸들 방향 힌트 표시**: 각 노드 호버 시 연결 방향 레이블 노출
  - ProcessNode/OutputNode/FunctionNode/TerminalNode: `↑ 이전 노드` / `↓ 다음 노드`
  - DecisionNode: `참` (Left) / `거짓` (Right)
  - LoopNode: `반복 복귀` (Left)

### REQ-FLW-03: Decision 노드 핸들
- 입력: Top
- 참(true) 출력: **Left** 꼭짓점 (`Position.Left`, id="true")
- 거짓(false) 출력: **Right** 꼭짓점 (`Position.Right`, id="false")
- 두 브랜치가 다이아몬드 좌우에서 대칭으로 분기

### REQ-FLW-04: 커스텀 엣지 (`AnimatedEdge.tsx`)
- 직선(`getStraightPath`) 렌더링
- `back` edgeType → `return null` (렌더링 안 함)
- `false` edgeType → 점선 (`strokeDasharray: '6 4'`)
- 실행 중인 엣지: `animated` class 적용
- 엣지 중간에 참/거짓 label 표시 (pill 스타일)

### REQ-FLW-05: 노드 팔레트 (`NodePalette.tsx`)
캔버스 좌측 고정, 8가지 드래그 가능 항목:

| 항목 | nodeType | variant |
|------|----------|---------|
| 📦 변수 | `process` | assign |
| 📢 출력 | `output` | — |
| 🔀 조건 | `decision` | — |
| 🔄 횟수반복 | `loop` | count |
| ♾️ 조건반복 | `loop` | while |
| 📋 목록반복 | `loop` | list |
| 📝 함수선언 | `function` | — |
| 📞 함수호출 | `process` | func-call |

- HTML5 drag API → 드롭 시 해당 위치에 노드 생성 → `NodeEditModal` 즉시 오픈

### REQ-FLW-06: NodeEditModal (`NodeEditModal.tsx`)
- 노드 드롭 또는 기존 노드 더블클릭 시 열림
- `useReducer`로 폼 상태 일괄 관리 (12개 필드)
- 노드 타입별 입력 필드:

| 타입 | 필드 |
|------|------|
| 변수 할당 | 변수 이름 (식별자 검증), 값 |
| 출력 | **📝 문자열 / 📦 변수·식 토글** + 출력 내용 |
| 조건 | 조건식 |
| 횟수 반복 | 반복 횟수 (양의 정수, 1~1000) |
| 조건 반복 | 반복 조건 |
| 목록 반복 | 목록 변수, 항목 변수 |
| 함수 선언 | 함수 이름, 매개변수 (선택) |
| 함수 호출 | 함수 이름, 인자 (선택) |

- 필드별 실시간 유효성 검사 + 에러 메시지 표시
- 코드 미리보기: 입력값에서 생성될 달빛약속 코드 실시간 표시
- 취소 시 새로 드롭된 노드 제거
- 기존 노드 편집 시 [삭제] 버튼 표시 → 노드 및 연결 엣지 제거 후 F2C 동기화
- 저장 버튼 텍스트: 신규 드롭 시 "추가하기" / 기존 편집 시 "저장하기"

### REQ-FLW-07: 노드·엣지 편집
- 노드 핸들 드래그 → 엣지 생성 → F2C 동기화
- `Delete` 키 → 노드/엣지 삭제 → F2C 동기화
- 노드 삭제 시 연결된 엣지도 함께 삭제

---

## REQ-RUN: 실행 엔진

### REQ-RUN-01: YaksokSession 생성
- [▶ 실행하기] 클릭 시 새 `YaksokSession` 인스턴스 생성
- `@dalbit-yaksok/standard` `StandardExtension` 등록
- `executionDelay`, `signal` (AbortController), `stdout`, `stderr`, `events` 전달

### REQ-RUN-02: 실행 전 처리
- `clearRuntime()` 호출 (콘솔·변수 초기화)
- 미연결 노드 감지 → `disconnected: true` 시각 표시

### REQ-RUN-03: stdout 캡처
- `stdout` 콜백으로 출력 메시지 수집 → `appendConsole`
- `stderr` 콜백으로 오류 캡처 → `appendConsole("오류: ...")`

### REQ-RUN-04: 실행 제어
- [▶ 실행하기]: `runModule('main')`, `status = 'running'`
- [⏸ 멈춤] / [▶ 계속]: `pause()` / `resume()`, 버튼 토글
- [⏹ 정지]: `AbortController.abort()`, `status = 'idle'`
- 완료: `status = 'done'`, 오류: `status = 'error'`
- finally: `executingLine`, `executingNodeId` null 초기화, disconnected 플래그 해제

### REQ-RUN-05: 실행 속도 버튼
- 4단계 토글 버튼: 느림(1500ms) / 보통(700ms) / 빠름(300ms) / 매우빠름(80ms)
- 기본값: 보통 (700ms)
- 단계별 실행 모드(REQ-RUN-06)에서는 속도 버튼 그룹 숨김

### REQ-RUN-06: 단계별 실행
- [⏭ 단계별] 클릭 → `YaksokSession.stepByStep = true` 설정 후 실행 시작
- `runningCode` 이벤트 발생 시 `status = 'stepping'` → 실행 일시 정지 상태
- [⏭ 다음] 클릭 → `session.resume()` → 다음 노드로 진행
- `executionDelay: 0` (속도 제어는 사용자가 "다음" 클릭으로 직접 조절)
- `isStepMode: true`일 때 속도 그룹 숨김, 멈춤/계속 버튼 숨김

---

## REQ-VIZ: 실행 시각화

### REQ-VIZ-01: 순서도 노드 하이라이트
- `runningCode` 이벤트의 `start.line`으로 `findNodeIdByLine()` → `executingNodeId` 설정
- 해당 노드 `executing: true` → 노드 컴포넌트에서 색상/glow 처리

### REQ-VIZ-02: 실행 경로 엣지 애니메이션
- `executingNodeId` 변경 시 해당 노드로 들어오는 엣지에 `animated: true`
- 실행 종료 시 모든 엣지 `animated: false`

### REQ-VIZ-03: 변수 현황판 (`VariablePanel.tsx`)
- `variableSet` 이벤트 수신 → `value.toPrint()` 로 문자열 변환 (`.toString()` 아님)
- `변수명 = 값` 목록 표시
- 실행 시작 시 패널 초기화
- **갱신 플래시**: 값이 바뀐 변수 행에 650ms 동안 노란 배경(`#FEF9C3`) + 굵은 글씨 표시

### REQ-VIZ-04: 콘솔 패널 (`ConsolePanel.tsx`)
- 출력을 줄 단위로 표시, 최신이 하단
- 실행 오류 메시지는 별도 색상으로 표시
- 실행 시작 시 초기화

### REQ-VIZ-05: 미연결 노드 강조
- 실행 전 `findDisconnectedNodeIds(nodes, edges)` 호출
- 루트("시작" terminal)에서 도달 불가한 노드: `disconnected: true`
- "끝" terminal 제외
- 실행 완료/종료 시 `disconnected: false` 초기화

---

## REQ-F2C: 순서도 → 코드 생성 (역방향)

### REQ-F2C-01: 지원 노드 타입
- `process` (assign, func-call), `output`, `decision`, `loop` (count/while/list), `function`
- `terminal` 노드: 코드 생성 대상 제외

### REQ-F2C-02: 노드 타입별 코드 생성 규칙

| 노드 타입 | 조건 | 생성 코드 |
|-----------|------|-----------|
| process/assign | — | `변수명 = 값` |
| process/func-call | — | `함수명 인자` |
| output | `outputType: 'string'` | `"내용" 보여주기` |
| output | `outputType: 'expr'` or 이미 `"` 시작 | `내용 보여주기` |
| decision | — | `만약 조건 이면` / `아니면` 블록 |
| loop/count | — | `반복 N번` |
| loop/while | — | `반복 조건 동안` |
| loop/list | — | `반복 목록 의 항목 마다` |
| function | — | `약속, 함수이름` |

### REQ-F2C-03: flowToCode 알고리즘 (`flow-to-code.ts`)
1. `terminal` 노드(label="시작") 우선 탐색; 없으면 incoming 비-back 엣지 없는 노드를 루트로
2. `generateBlock` 재귀 순회 (visited + stopIds로 무한루프 방지)
3. **loop 처리**:
   - `body` edgeType 엣지로 body 블록 진입 (depth+1)
   - incoming back 엣지 source = body tail
   - body tail의 non-back 출구 = exit 노드 → stopIds에 추가
   - body 블록 종료 후 exit 노드부터 outer depth로 계속
4. **decision 처리**:
   - `true`/`false` edgeType 엣지로 각 브랜치 재귀
   - BFS로 merge 노드 탐색 → 합류점에서 재개
5. 들여쓰기: 탭 문자(`\t`) 사용

### REQ-F2C-04: 루트 탐색 fallback
- "시작" terminal 없을 때 (팔레트로 직접 그린 순서도): incoming 비-back 엣지 없는 노드를 루트로 사용

---

## REQ-SYN: 양방향 동기화

### REQ-SYN-01: lastEditSource 추적
- 상태: `'code' | 'flowchart' | 'none'`
- 코드 에디터 onChange (programmatic이 아닐 때) → `lastEditSource = 'code'`
- 순서도 노드/엣지 변경 시 → `lastEditSource = 'flowchart'`

### REQ-SYN-02: 코드 편집 → 순서도 갱신 흐름
1. `lastEditSource !== 'flowchart'` 조건 확인 (flowchart 편집 중이면 무시)
2. 300ms debounce 후 `parseAndConvert(code)` 실행
3. 성공 → `applyLayout` → `setNodes` / `setEdges` → `fitView`

### REQ-SYN-03: 순서도 편집 → 코드 갱신 흐름
1. `lastEditSource = 'flowchart'`
2. `isProgrammaticUpdateRef.current = true` → Monaco `setValue(generated)` → flag 해제
3. flag가 true이면 `onChange`에서 `lastEditSource` 변경 안 함 (루프 방지)

### REQ-SYN-04: 동기화 딜레이
- 코드 변경 → 순서도 갱신: `SYNC_DEBOUNCE_MS = 300ms`
- NodeEditModal 저장: 즉시 F2C 실행 (debounce 없음)

---

## REQ-UX: 인터랙션

### REQ-UX-01: 순서도 노드 클릭 → 에디터 이동
- RF 노드 클릭 시 `data.line`으로 `revealLineInCenter()` + `setPosition()` 호출

### REQ-UX-02: 노드 더블클릭 → 값 수정
- 기존 값으로 pre-fill된 `NodeEditModal` 열림

### REQ-UX-03: 노드/엣지 삭제
- `Delete` 또는 `Backspace` 키 → 노드 및 연결 엣지 삭제 → F2C 동기화
- NodeEditModal 내 [삭제] 버튼 → 동일 동작 (기존 노드 편집 시에만 표시)

### REQ-UX-04: 캔버스 fitView
- 코드→순서도 변환 완료 후 `fitView({ padding: 0.2, duration: 300 })`

### REQ-UX-05: 도움말 모달
- **최초 방문 시 자동 표시** → `localStorage('dalbit-help-seen')` 없으면 자동 오픈
- 닫으면 `localStorage`에 기록 → 재방문 시 미표시
- [📖 사용 방법] 클릭으로도 언제든 열 수 있음
- 4개 탭: 시작하기, 노드 종류 (8가지), 코드 작성, 자주 묻는 질문

---

## REQ-STR: 상태 관리 (Zustand 스토어)

### REQ-STR-01: editor-store
```typescript
{
  code: string
  errors: MonacoMarker[]
  executingLine: number | null
  setCode, setErrors, setExecutingLine
}
```

### REQ-STR-02: flowchart-store
```typescript
{
  nodes: FlowNode[]
  edges: FlowEdge[]
  executingNodeId: string | null
  setNodes, setEdges, setExecutingNodeId, updateNode
}
```

### REQ-STR-03: execution-store
```typescript
{
  status: 'idle' | 'running' | 'paused' | 'stepping' | 'done' | 'error'
  consoleOutput: string[]
  variables: Record<string, string>   // value.toPrint() 결과
  executionDelay: number              // 기본 700ms (4단계 버튼으로 조절)
  isStepMode: boolean                 // 단계별 실행 모드 여부
  setStatus, appendConsole, setVariable, clearRuntime, setExecutionDelay, setIsStepMode
}
```

### REQ-STR-04: ui-store
```typescript
{
  lastEditSource: 'code' | 'flowchart' | 'none'
  isSyncing: boolean
  modalOpen: boolean
  modalNodeId: string | null
  setLastEditSource, setIsSyncing, openModal, closeModal
}
```

---

## REQ-TYP: 공통 타입

### REQ-TYP-01: FlowNodeData
```typescript
interface FlowNodeData extends Record<string, unknown> {
  label: string
  nodeType: 'terminal' | 'process' | 'decision' | 'loop' | 'output' | 'function'
  line?: number
  astNodeId?: string
  executing?: boolean
  disconnected?: boolean        // 실행 흐름에서 끊긴 노드

  // 변수 할당
  varName?: string
  varValue?: string

  // 출력
  outputContent?: string
  outputType?: 'string' | 'expr'  // 'string': 따옴표 감싸기, 'expr': 그대로

  // 조건문
  condition?: string

  // 반복 공통
  loopVariant?: 'count' | 'while' | 'list'
  loopCount?: number
  loopCondition?: string
  listVar?: string
  itemVar?: string

  // 함수 선언
  funcName?: string
  funcParams?: string

  // 함수 호출
  funcCallName?: string
  funcCallArgs?: string
  processVariant?: 'assign' | 'func-call'
}
```

### REQ-TYP-02: EdgeData
```typescript
type EdgeData = { edgeType?: 'true' | 'false' | 'back' | 'body' | 'funcbody' | 'default' }
```

---

## REQ-TST: 테스트

### REQ-TST-01: 단위 테스트 대상
- `ast-to-flow.ts`: 각 AST 노드 타입 → RF 노드 변환 정확성
- `flow-to-code.ts`: 노드/엣지 조합 → 코드 생성 정확성
- `highlight.ts`: disconnected 노드 감지, findNodeIdByLine

### REQ-TST-02: 통합 테스트 (roundtrip)
- `code → parseAndConvert → flowToCode → code` 왕복 동등성 검증
- 변수 할당, 문자열/변수 출력, 반복, 조건문 케이스 포함

### REQ-TST-03: 테스트 환경
- vitest + @testing-library/react, jsdom
- 순수 함수(ast-to-flow, flow-to-code, highlight) 위주로 작성

---

## MVP 제외 범위

- 모바일/태블릿 반응형
- 코드 저장/불러오기 (파일 시스템)
- `getAutocomplete()` 자동완성
- 노드 수동 위치 조정 및 persist
- 브레이크포인트 (특정 노드에서 자동 일시정지)
