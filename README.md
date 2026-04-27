# 달빛흐름 — 달빛약속 코드 시각화 디버거

**🔗 배포 주소: https://horang-edu-frontend-test.vercel.app/**

달빛약속 코드와 순서도를 **양방향으로 실시간 변환**하고, 실행 과정을 단계별로 추적하는 웹 도구입니다.

## 주요 기능

### 양방향 실시간 동기화
- **코드 → 순서도**: 코드를 작성하면 AST를 파싱해 순서도가 자동 생성됩니다
- **순서도 → 코드**: 노드를 드래그하거나 편집하면 달빛약속 코드가 자동으로 갱신됩니다
- 300ms debounce + 충돌 방지 플래그로 무한 루프 없이 동기화

### 실행 시각화
- **노드 하이라이트**: 실행 중인 노드가 순서도에서 glow 효과로 강조됩니다
- **줄 하이라이트**: 에디터에서도 현재 실행 줄이 함께 표시됩니다
- **변수 현황판**: 실행 중 변수 값이 실시간으로 갱신되며, 변경된 변수는 노란 플래시로 구분됩니다
- **콘솔 패널**: 출력 결과와 오류 메시지를 실시간 확인

### 단계별 실행
- [⏭ 단계별] 버튼으로 한 노드씩 직접 진행하며 흐름을 추적할 수 있습니다
- 일반 실행은 느림/보통/빠름/매우빠름 4단계 속도 조절 가능

### 순서도 직접 편집
- 좌측 팔레트에서 노드를 드래그해 순서도에 배치
- 노드 더블클릭으로 값 수정, Delete/Backspace 또는 삭제 버튼으로 제거
- 노드 핸들 호버 시 연결 방향 힌트 표시

### 지원하는 달빛약속 문법

| 노드 | 문법 |
|------|------|
| 변수 할당 | `변수 = 값` |
| 출력 | `"텍스트" 보여주기` / `변수 보여주기` |
| 조건 | `만약 조건 이면 ... 아니면 ...` |
| 횟수 반복 | `반복 N번` |
| 조건 반복 | `반복 조건 동안` |
| 목록 반복 | `반복 목록 의 항목 마다` |
| 함수 선언 | `약속, 함수이름` |
| 함수 호출 | `함수이름 인자` |

## 기술 스택

| 역할 | 기술 |
|------|------|
| 프레임워크 | React 19 + TypeScript |
| 빌드 | Vite 8 |
| 스타일 | PandaCSS |
| 상태 관리 | Zustand (4개 스토어) |
| 순서도 | React Flow (@xyflow/react) + dagre |
| 코드 에디터 | Monaco Editor |
| 실행 엔진 | @dalbit-yaksok/core |
| 테스트 | Vitest + Testing Library |
| 배포 | Vercel |

## 로컬 실행

```bash
# 의존성 설치 (PandaCSS codegen 포함)
pnpm install

# 개발 서버 실행
pnpm dev

# 테스트
pnpm test

# 빌드
pnpm build
```

> Node.js 18 이상 필요. pnpm 패키지 매니저 사용.

## 프로젝트 구조

```
src/
├── app/                    # 레이아웃
├── components/
│   ├── editor/             # Monaco 에디터
│   ├── flowchart/
│   │   ├── FlowCanvas.tsx  # React Flow 캔버스
│   │   ├── NodePalette.tsx # 드래그 팔레트
│   │   ├── NodeEditModal.tsx
│   │   ├── hooks/          # useFlowSync, useExecutionHighlight, useNodeForm
│   │   ├── nodes/          # 커스텀 노드 6종
│   │   └── edges/          # 애니메이션 엣지
│   ├── nav/                # TopNav
│   ├── panels/             # ConsolePanel, VariablePanel
│   └── ui/                 # 공통 컴포넌트
├── lib/
│   ├── yaksok/             # 실행 엔진 (runner, session, validator)
│   └── flowchart/
│       ├── ast-to-flow.ts  # 코드 → 순서도
│       ├── flow-to-code.ts # 순서도 → 코드
│       ├── layout.ts       # dagre 자동 배치
│       └── highlight.ts    # 실행 노드 탐색
├── stores/                 # editor, flowchart, execution, ui
└── types/                  # flowchart.ts, execution.ts
docs/
├── requirements.md         # 기능 요구사항 명세
├── architecture.md         # 아키텍처 설계 문서
├── retrospective.md        # 프로젝트 회고
├── decisions/              # 주요 의사결정 기록 (ADR)
└── agent/                  # 에이전트 협업 기록 (01~07)
```

## 문서

- [기능 요구사항 명세](docs/requirements.md)
- [아키텍처 문서](docs/architecture.md)
- [프로젝트 회고](docs/retrospective.md)
- [실행 하이라이트 타이밍 ADR](docs/decisions/execution-highlight-timing.md)
- [에이전트 협업 기록](docs/agent/)
