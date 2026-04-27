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
[delay(setTimeout)] → reportRunningCode(노드) → child.execute()
```

### 왜 대부분의 노드는 정상적으로 하이라이트되나

`나이 = 20` (SetVariable)이 하이라이트되는 이유:

```
[macrotask 경계] setExecutingNodeId('n2')  ← SetVariable 보고
                 execute('나이 = 20')
[macrotask 경계] setExecutingNodeId('n3')  ← 다음 노드(IfStatement) 진입 전 delay
```

executionDelay의 `setTimeout`이 **다음 노드 진입 전에** macrotask 경계를 만든다.  
브라우저는 macrotask 사이에 페인트하므로, 이전 노드의 하이라이트가 화면에 보일 기회를 얻는다.

### 마지막 노드에서 실패하는 이유

```
[macrotask 경계]
    reportRunningCode('성인입니다' 보여주기)
        → setExecutingNodeId('n4')
    execute('성인입니다' 보여주기)   ← microtask 체인으로 빠르게 완료
    if-body Block 종료
    IfStatement 종료
    외부 Block 종료
    session.runModule() resolve
    finally: setExecutingNodeId(null)
[macrotask 종료 → 브라우저 페인트: null 상태만 봄]
```

마지막 노드 이후에는 "다음 노드"가 없으므로 delay가 발생하지 않는다.  
`setExecutingNodeId('n4')`와 `setExecutingNodeId(null)`이 **같은 macrotask 안**에 있어  
브라우저가 n4 하이라이트 상태를 페인트할 기회가 없다.

> 핵심: React 배치처리가 문제가 아니라, **브라우저가 JavaScript 실행 중에는 페인트하지 않는** 브라우저 렌더링 모델의 제약이다.

---

## 검토한 대안들

### ① `setTimeout(0)` — finally 클리어를 다음 macrotask로 지연

```typescript
finally {
    cleanupTimer = setTimeout(() => {
        setExecutingNodeId(null)
        // disconnected 플래그 초기화
    }, 0)
}
```

- **동작 방식**: null 클리어를 다음 macrotask로 미뤄 브라우저 페인트 기회를 만든다.
  executionDelay가 노드 사이에 macrotask 경계를 만드는 것과 **같은 원리**를 마지막 노드 이후에도 적용.
- **우려 사항**: 실행 흐름을 인위적으로 비튼다는 인상. 타이밍 문제마다 반복하면 코드가 취약해질 수 있음.
- **재검토**: executionDelay의 setTimeout은 "지연"이 목적이고 macrotask 경계는 부수효과지만,  
  이 setTimeout(0)은 macrotask 경계 자체가 목적이다. 성격이 다른 사용.

### ② `flushSync` — React 공식 동기 렌더링 API

```typescript
import { flushSync } from 'react-dom'

runningCode: (start) => {
    flushSync(() => {
        setExecutingLine(start.line)
        setExecutingNodeId(findNodeIdByLine(nodes, start.line))
    })
}
```

- **동작 방식**: 콜백 안의 상태 변경을 React가 즉시 DOM에 커밋.
- **실제 검증 결과: 동작하지 않음.**  
  `flushSync`는 React가 DOM에 커밋하는 것만 강제하고, 브라우저가 화면에 페인트하는 것은 강제하지 못한다.  
  브라우저는 여전히 현재 macrotask가 끝난 후에만 페인트한다.  
  → n4 설정과 null 클리어가 같은 macrotask 안에 있는 구조적 원인을 해결하지 못함.
- **기각**

### ③ 각 노드 컴포넌트가 `executingNodeId`를 직접 구독

```typescript
const executing = useFlowchartStore(s => s.executingNodeId === props.id)
```

- **동작 방식**: `executing` 플래그를 node data에 담지 않고 Zustand에서 직접 읽어 불필요한 setNodes 재생성 제거.
- **기각 이유**: 구조 개선 효과는 있으나, macrotask 경계가 없는 근본 원인을 해결하지 못함.

### ④ 라이브러리 타이밍과 독립적인 별도 하이라이트 컨텍스트

- **기각 이유**: `runningCode` 이벤트가 "지금 이 줄이 실행 중"이라는 유일한 동기화 지점.  
  이를 사용하지 않으면 더 복잡한 동기화 메커니즘이 필요하고 정확도도 떨어짐.

### ⑤ `pnpm patch`로 라이브러리 `base.ts` 수정

라이브러리 `node/base.ts`의 `onRunChild`에서 delay 위치를 reporting 앞에서 뒤로 이동:

```typescript
// 현재 (라이브러리)
await delay()
reportRunningCode(tokens)  ← setExecutingNodeId
await child.execute()

// 패치 후
reportRunningCode(tokens)  ← setExecutingNodeId
await child.execute()
await delay()              ← 실행 후 delay → 브라우저 페인트 기회
```

- **장점**: 가장 근본적인 해결. 모든 노드가 동일한 메커니즘으로 처리되고, 우리 코드에 setTimeout 불필요.
- **성능 차이**: 노드당 총 소요 시간은 `delay + execute`로 동일. 차이 없음.
- **기각 이유**: 라이브러리 업데이트마다 패치를 재적용해야 하는 유지보수 비용.  
  반면 현재 방식(setTimeout in runner.ts)은 우리 코드에만 있어 라이브러리 업데이트에 영향받지 않음.

---

## 최종 결정: `setTimeout(executionDelay)` 채택 ✅

| 항목 | 내용 |
|------|------|
| 적용 위치 | `src/lib/yaksok/runner.ts` — `finally` 블록 |
| 이유 | 브라우저 페인트 모델상 macrotask 경계가 유일한 해법. 라이브러리 패치 대비 유지보수 비용 없음. |
| delay 값 | `executionDelay` — 다른 노드와 동일한 하이라이트 지속 시간 |
| race condition 방지 | `cleanupTimer`로 새 실행 시작 시 이전 타이머를 취소 |

### 채택 이유 상세

- 모든 대안(`flushSync`, 직접 구독, 별도 컨텍스트)이 macrotask 경계 없이는 근본 원인을 해결하지 못함을 검증
- 라이브러리 패치(⑤)가 가장 근본적이지만, 업데이트마다 재적용 필요 — 유지보수 비용 대비 이득이 크지 않음
- `setTimeout(executionDelay)`는 우리 코드에만 존재하며 라이브러리 업데이트에 영향받지 않음
- 이 패턴이 확산되지 않도록 사용처를 이 한 곳으로 한정하고, 의도를 코드 주석과 이 문서에 명시함
