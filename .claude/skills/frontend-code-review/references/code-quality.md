# Rule Catalog — Code Quality

## TypeScript strict 타입 사용

IsUrgent: True
Category: Code Quality

### Description

`any` 타입 사용을 금지한다. 대신 `unknown`을 사용하고 타입 가드로 좁힌다. 컴포넌트 Props는 반드시 `interface`로 명시적으로 정의한다.

### Suggested Fix

```ts
// ❌
const handleNode = (data: any) => { ... }

// ✅
const handleNode = (data: unknown) => {
  if (isFlowNodeData(data)) { ... }
}
```

## PandaCSS 스타일링 사용

IsUrgent: True
Category: Code Quality

### Description

스타일링은 PandaCSS를 사용한다. 인라인 style 객체, 별도 CSS 파일, 또는 직접 className 문자열 조합 대신 PandaCSS의 `css()` 함수와 디자인 토큰을 활용한다.

### Suggested Fix

```tsx
// ❌
<div style={{ backgroundColor: '#0F0F1A', padding: '16px' }}>

// ✅
import { css } from 'styled-system/css'

<div className={css({ bg: 'background', p: '4' })}>
```

## className 조합 시 유틸리티 함수 사용

IsUrgent: False
Category: Code Quality

### Description

조건부 className 조합이 필요할 때 삼항 연산자나 템플릿 리터럴 대신 유틸리티 함수를 사용한다.

### Suggested Fix

```tsx
// ❌
className={`${baseClass} ${isActive ? 'active' : ''}`}

// ✅
import { cx } from 'styled-system/css'
className={cx(baseClass, isActive && 'active')}
```

## 사용하지 않는 import/변수 제거

IsUrgent: False
Category: Code Quality

### Description

사용하지 않는 import, 변수, 함수를 제거한다. ESLint의 `no-unused-vars` 규칙을 따른다.

## console.log 잔존 금지

IsUrgent: True
Category: Code Quality

### Description

프로덕션 코드에 `console.log`를 남기지 않는다. 디버깅 목적이면 개발 후 반드시 제거한다.

## 매직 넘버/문자열 상수화

IsUrgent: False
Category: Code Quality

### Description

반복되는 숫자나 문자열은 의미 있는 이름의 상수로 추출한다.

### Suggested Fix

```ts
// ❌
session.addModule("main", code, { executionDelay: 500 });

// ✅
const DEFAULT_EXECUTION_DELAY = 500;
session.addModule("main", code, { executionDelay: DEFAULT_EXECUTION_DELAY });
```

## 에러 핸들링 누락

IsUrgent: True
Category: Code Quality

### Description

비동기 작업(YaksokSession 실행, parse 등)에는 반드시 try-catch를 사용하고 사용자에게 에러를 표시한다.

### Suggested Fix

```ts
// ❌
await session.runModule("main");

// ✅
try {
  await session.runModule("main");
} catch (e) {
  if (e.name !== "AbortError") {
    setError(e instanceof Error ? e.message : "알 수 없는 에러");
  }
}
```

Update this file when adding, editing, or removing Code Quality rules so the catalog remains accurate.
