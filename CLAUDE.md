# CLAUDE.md — 달빛흐름 (Dalbit-Flow) 에이전트 컨텍스트

## 프로젝트 개요

달빛약속 코드와 순서도를 **양방향**으로 실시간 변환하고, 실행 과정을 시각적으로 추적하는 도구.
- **코드 → 순서도**: 코드를 작성하면 AST를 파싱하여 순서도가 자동 생성
- **순서도 → 코드**: 순서도에서 노드를 추가/연결하면 달빛약속 코드가 자동 생성
- **실행 시각화**: 실행 시 현재 노드/줄이 하이라이트되고 변수 상태가 실시간 표시

## 기술 스택

- **빌드**: Vite 8 (필수)
- **프레임워크**: React SPA (필수)
- **스타일링**: PandaCSS (필수)
- **언어**: TypeScript
- **상태관리**: Zustand (4개 스토어: editor, flowchart, execution, ui)
- **순서도**: React Flow (@xyflow/react) + dagre (자동 배치)
- **코드 에디터**: Monaco Editor (@monaco-editor/react)
- **코드 실행**: @dalbit-yaksok/core, @dalbit-yaksok/exts-standard
- **애니메이션**: Framer Motion
- **패키지 매니저**: pnpm (런타임 수정 시 pnpm patch, Fork 금지)

## 달빛약속 API 활용

| API | 사용처 |
|-----|--------|
| `parse()` | 코드 → AST → 순서도 변환 |
| `parseOptimistically()` | 타이핑 중 실시간 순서도 업데이트 |
| `tokenize()` | 노드 내 코드 하이라이팅 |
| `validate()` | 에디터 에러 표시 |
| `YaksokSession` | 코드 실행 |
| `stdout` 콜백 | 실행 결과 캡처 |
| `executionDelay` | 실행 속도 조절 |
| `runningCode` 이벤트 | 현재 실행 노드/줄 하이라이트 |
| `variableSet` 이벤트 | 변수 상태 패널 |
| `AbortSignal` | 실행 취소 |

## AST → 순서도 매핑

| AST 노드 | 순서도 모양 | 색상 |
|----------|-----------|------|
| SetVariable | 사각형 | #3B82F6 파랑 |
| IfStatement | 마름모 | #F59E0B 노랑 |
| Loop계열 | 육각형 | #10B981 초록 |
| FunctionInvoke(보여주기) | 평행사변형 | #8B5CF6 보라 |
| DeclareFunction | 서브그래프 | 연보라 |
| Return | 둥근 사각형 | #F87171 빨강 |
| 시작/끝 | 둥근 사각형 | #6B7280 회색 |

## 프로젝트 구조

```
src/
├── app/                    # App.tsx, layout.tsx
├── components/
│   ├── editor/             # Monaco 에디터
│   ├── flowchart/
│   │   ├── FlowCanvas.tsx  # React Flow 래퍼
│   │   ├── NodePalette.tsx # 노드 추가 팔레트 (역방향)
│   │   ├── NodeEditModal.tsx # 노드 값 입력/수정
│   │   ├── nodes/          # 커스텀 노드 (Process, Decision, Loop, Output, Terminal, Function)
│   │   └── edges/          # 애니메이션 엣지
│   ├── panels/             # ConsolePanel, VariablePanel, ControlBar
│   └── ui/                 # 공통 UI
├── lib/
│   ├── yaksok/             # session.ts, runner.ts, validator.ts
│   └── flowchart/
│       ├── ast-to-flow.ts  # 코드 → 순서도 (정방향)
│       ├── flow-to-code.ts # 순서도 → 코드 (역방향)
│       ├── sync.ts         # 양방향 동기화
│       ├── layout.ts
│       └── highlight.ts
├── data/                   # examples.ts
├── stores/                 # editor, flowchart, execution, ui 스토어
├── types/                  # flowchart.ts, execution.ts
└── main.tsx
```

## 디자인 토큰 (다크 모드)

- 배경: #0F0F1A / 패널: #1A1A2E
- 프라이머리: #706EEB (호랑에듀)
- 실행 하이라이트: #FDE68A
- 엣지 참: #4ADE80 / 거짓: #F87171
- UI 폰트: Pretendard / 코드 폰트: JetBrains Mono

## 코드 컨벤션

- 컴포넌트: PascalCase
- 함수/변수: camelCase
- 파일명: kebab-case (컴포넌트는 PascalCase)
- Zustand 스토어: `use{Name}Store` 네이밍
- React Flow 노드 데이터: `FlowNodeData` 타입 통일
