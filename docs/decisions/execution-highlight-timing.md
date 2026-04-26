# 실행 노드 하이라이트 타이밍 문제 — 의사결정 기록

> 날짜: 2026-04-26  
> 관련 파일: `src/lib/yaksok/runner.ts`, `src/components/flowchart/FlowCanvas.tsx`

---

## 문제 상황

코드 실행 시 순서도 노드에 실행 중인 노드를 하이라이트하는 기능에서,  
**if/else 분기 내 마지막으로 실행되는 노드가 화면에 표시되지 않는** 버그가 발견됐다.

예시 코드:
```
나이 = 20
만약 나이 >= 18 이면
    '성인입니다' 보여주기   ← 이 노드가 하이라이트되지 않음
아니면
    '미성년자입니다' 보여주기
```

---

## 원인 분석

### 라이브러리(`@dalbit-yaksok/core`)의 실행 타이밍 구조

라이브러리는 각 노드를 실행하기 **직전에** delay를 두고, 그 뒤에 `runningCode` 이벤트를 발생시킨다.

```
[delay] → reportRunningCode(노드) → child.execute()
```

### 실제 문제가 되는 실행 순서

```
macrotask 경계 (setTimeout)
    ↓
reportRunningCode('성인입니다' 보여주기)
    → setExecutingNodeId('n4')        ← Zustand 상태 변경
execute('성인입니다' 보여주기)          ← 빠르게 완료 (microtask)
if-body Block 종료
IfStatement 종료
외부 Block 종료
session.runModule() resolve
finally: setExecutingNodeId(null)     ← Zustand 상태 변경
```

`setExecutingNodeId('n4')`와 `setExecutingNodeId(null)` 사이에 **macrotask 경계가 없다.**  
React 18은 같은 macrotask 안의 상태 변경을 배치 처리하므로, 최종값인 `null`로만 렌더링된다.  
결과적으로 `n4`가 `executing: true` 상태로 화면에 나타날 기회가 없다.

### 왜 다른 노드는 정상적으로 하이라이트되나

`나이 = 20` (SetVariable)이 하이라이트되는 이유:

```
setExecutingNodeId('n2')        ← SetVariable 보고
execute('나이 = 20')
[다음 노드 진입 전 delay]        ← 이 시점에 React가 렌더링
setExecutingNodeId('n3')        ← IfStatement 보고
```

delay가 **다음 노드 진입 전**에 있으므로, 이전 노드의 하이라이트가 렌더될 기회를 얻는다.  
마지막 노드에는 "다음 노드"가 없으므로 이 기회가 존재하지 않는다.

---

## 검토한 대안들

### ① `setTimeout(0)` — finally 클리어를 다음 macrotask로 지연

```typescript
finally {
    setTimeout(() => setExecutingNodeId(null), 0)
}
```

- **동작 방식**: null 클리어를 다음 macrotask로 밀어 React 렌더 기회를 인위적으로 생성
- **기각 이유**: 실행 흐름을 억지로 비틂. 타이밍 문제가 생길 때마다 이 패턴을 반복하면 코드가 취약해지고, 실제로 새 실행이 시작되기 전에 이전 setTimeout이 실행되는 race condition도 잠재적으로 존재

### ② `flushSync` — React 공식 동기 렌더링 API ✅ 채택

```typescript
import { flushSync } from 'react-dom'

runningCode: (start) => {
    flushSync(() => {
        setExecutingLine(start.line)
        setExecutingNodeId(findNodeIdByLine(nodes, start.line))
    })
}
```

- **동작 방식**: `flushSync` 콜백 안의 상태 변경을 즉시 동기 렌더링. 라이브러리가 다음 코드로 넘어가기 전에 화면 갱신을 보장
- **장점**: React가 이 시나리오를 위해 설계한 API. 흐름을 비틀지 않고 근본 원인(배치처리)을 해결
- **주의점**: 매 노드마다 동기 렌더링이 발생하므로 성능 비용이 있다. 단, executionDelay가 이미 각 노드 사이에 delay를 두므로 실질적 영향은 미미함. `runningCode`는 React 렌더링 중이 아닌 라이브러리 비동기 콜백에서 호출되므로 안전

### ③ 각 노드 컴포넌트가 `executingNodeId`를 직접 구독

```typescript
// 노드 컴포넌트 내부
const executing = useFlowchartStore(s => s.executingNodeId === props.id)
```

- **동작 방식**: `executing` 플래그를 node data에 담지 않고 Zustand에서 직접 읽어 setNodes 재생성 제거
- **기각 이유**: 구조 개선 효과는 있으나 React 배치처리 문제는 동일하게 적용되어 근본 원인을 해결하지 못함. ②와 병행하면 추가 개선 가능하나 현재 우선순위 밖

### ④ 라이브러리 타이밍과 독립적인 별도 하이라이트 컨텍스트

- **기각 이유**: `runningCode` 이벤트가 "지금 이 줄이 실행 중"이라는 유일한 동기화 지점. 이를 사용하지 않으면 더 복잡한 동기화 메커니즘이 필요하고 정확도도 떨어짐

---

## 최종 결정: `flushSync` 채택

| 항목 | 내용 |
|------|------|
| 적용 위치 | `src/lib/yaksok/runner.ts` — `runningCode` 이벤트 핸들러 |
| 이유 | 근본 원인(React 배치처리) 해결, React 공식 API, 흐름 비틀지 않음 |
| 트레이드오프 | 노드 실행마다 동기 렌더 비용 — executionDelay가 이미 있으므로 실질 영향 미미 |
