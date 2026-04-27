# 06. UI 품질 개선 + PandaCSS 마이그레이션

## 사용한 에이전트 도구

- Claude Code (CLI)

## 에이전트에게 위임한 작업의 범위

### 작업 범위

- 전체 컴포넌트 PandaCSS 마이그레이션 (인라인 스타일 → `css()` 클래스)
  - 마이그레이션 순서: `layout.tsx` → `ConsolePanel` → `VariablePanel` → `FlowCanvas`/`NodePalette`/`NodeEditModal` → 노드 6종 → `HelpModal` → `Mascot`
- `SyncBadge`: 양방향 편집 방향 시각 표시 pill (1.5초 노출)
- 예제 코드 드롭다운 (평가자 편의 목적)
- 패널 여백 축소 + 가독성 개선
- Decision 노드 핸들 위치 수정 (참: Left, 거짓: Right)

### 판단 근거

- PandaCSS 마이그레이션은 컴포넌트 수가 많아 에이전트 위임이 효율적
- 단, 마이그레이션 순서와 `token()` vs 실제 hex 값 사용 기준 등 원칙은 직접 설정 후 위임
- SyncBadge, 드롭다운 등 UI 컴포넌트는 스펙이 명확하므로 에이전트 위임

## 에이전트의 산출물을 검증한 방법

- 마이그레이션 후 `npm run lint` + `npm run build` 필수 확인
- 각 컴포넌트를 브라우저에서 시각적으로 확인 (레이아웃 깨짐, 색상 변화 없음)
- 실행 기능이 마이그레이션 후에도 동일하게 동작하는지 시나리오 테스트

## 에이전트가 잘못된 방향을 제시했을 때 교정한 방법

### 교정 1: PandaCSS 미사용 — 핵심 지적

구현 단계에서 에이전트가 PandaCSS가 설정되어 있음에도 전부 인라인 스타일로 컴포넌트를 작성함.

- **발견 경위**: 코드 리뷰 시 `style={{ ... }}`가 모든 컴포넌트에 산재되어 있음을 확인
- **교정**: PandaCSS 미사용 이유를 확인하고, 전면 마이그레이션 지시. 이후 작업부터는 인라인 스타일 금지 원칙 적용
- **원칙 설정**: 정적 스타일 → `css()`, 동적 값(executing/disconnected 상태에 따른 색상 등) → 인라인 스타일 허용

### 교정 2: `token()` 함수를 인라인 스타일에서 사용

에이전트가 인라인 스타일 안에서 `token('colors.primary')` 형태로 PandaCSS 토큰을 참조하려 했으나 이는 CSS 함수로 JS에서 동작하지 않음.

- **교정**: 인라인 스타일에서는 실제 hex 값 사용, `token()`은 `css()` 안에서만 사용하도록 지시

### 교정 3: OutputNode 직사각형 테두리 노출

OutputNode가 평행사변형으로 렌더링되어야 하는데 React Flow 기본 CSS가 `.react-flow__node-output` 선택자에 적용되어 직사각형 테두리가 겹쳐 보이는 문제.

- **원인**: React Flow 내장 노드 타입명(`output`)과 커스텀 노드 타입명이 충돌
- **교정**: `src/index.css`에 `.react-flow__node-output` 오버라이드 추가 지시
