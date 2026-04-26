// 양방향 동기화 가드 유틸리티
// lastEditSource: 'code' | 'flowchart' | 'none'
// - 'code'    : 에디터에서 사용자가 직접 입력 → 순서도 업데이트
// - 'flowchart': 팔레트/편집으로 순서도 변경 → 코드 업데이트
// 같은 방향의 반응이 다시 반대 방향 변환을 트리거하지 않도록 막는다.

export const SYNC_DEBOUNCE_MS = 300
