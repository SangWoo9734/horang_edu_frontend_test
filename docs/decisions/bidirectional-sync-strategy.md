# 양방향 동기화 전략 — 의사결정 기록

> 날짜: 2026-04-26  
> 관련 파일: `src/lib/flowchart/sync.ts`, `src/components/flowchart/hooks/useFlowSync.ts`, `src/components/editor/editor-ref.ts`

---

## 문제 상황

코드 에디터와 순서도 캔버스가 서로를 업데이트할 수 있는 구조에서, 한쪽이 변경되면 다른 쪽이 반응하고, 그 반응이 다시 원래 쪽을 업데이트하는 **무한 루프**가 발생했다.

```
코드 편집 → 순서도 갱신 → (순서도 변경 감지) → 코드 갱신 → (코드 변경 감지) → 순서도 갱신 → ...
```

---

## 검토한 선택지

### 선택지 1: debounce만으로 루프 억제
- 짧은 시간 내 연속 업데이트를 무시
- **기각 이유**: debounce는 빈도를 줄일 뿐, 근본적으로 루프를 차단하지 못함. 타이밍에 따라 여전히 루프 발생 가능.

### 선택지 2: 업데이트 중 플래그로 수신 차단
- `isUpdating` boolean으로 업데이트 중엔 반대 방향 무시
- **기각 이유**: 비동기 환경에서 플래그 해제 타이밍이 불확실하고, React의 배치 업데이트와 충돌 가능성 있음.

### 선택지 3: lastEditSource + isProgrammaticUpdateRef 조합 (채택)
- `lastEditSource`: 마지막으로 편집한 출처(`'code'` | `'flowchart'` | `'none'`)를 Zustand store에 저장
- `isProgrammaticUpdateRef`: Monaco의 `setValue()` 호출 중임을 나타내는 React ref

---

## 결정: lastEditSource + isProgrammaticUpdateRef 조합

### 근거

두 가지 상황을 정확히 구분해야 했다.

1. **F2C가 Monaco에 setValue할 때** → Monaco의 `onChange`가 동기적으로 즉시 호출됨 → `lastEditSource`를 setState로 막으면 너무 늦음 → ref(동기)가 필요
2. **사용자가 코드를 편집할 때** → 비동기 흐름이므로 Zustand store로 충분

```
F2C 실행
  → isProgrammaticUpdateRef = true  (ref, 동기)
  → Monaco.setValue()
      → onChange 즉시 호출
          → isProgrammaticUpdateRef가 true → lastEditSource 변경 안 함
  → isProgrammaticUpdateRef = false

사용자 타이핑
  → onChange 호출
      → isProgrammaticUpdateRef가 false → lastEditSource = 'code'
  → 300ms debounce → C2F 실행
      → lastEditSource === 'flowchart'이면 무시 (순서도 편집 중이면 갱신 안 함)
```

### 핵심 설계 원칙

- **ref**: Monaco의 동기 콜백 차단용 (setState보다 먼저 세팅되어야 함)
- **store**: 비동기 방향 추적용 (어느 쪽이 마지막으로 편집했는지)
- 두 가지를 혼용하지 않고 역할을 명확히 분리

---

## 결과

코드 ↔ 순서도 양방향 편집이 무한 루프 없이 안정적으로 동작. 300ms debounce와 조합하여 타이핑 중에도 성능 문제 없음.
