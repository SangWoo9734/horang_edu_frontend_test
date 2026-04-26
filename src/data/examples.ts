export interface Example {
  id: string
  title: string
  code: string
}

export const EXAMPLES: Example[] = [
  {
    id: 'hello',
    title: '기본 출력',
    code: '"안녕하세요!" 보여주기',
  },
  {
    id: 'age-check',
    title: '변수와 조건문',
    code: `나이 = 20
만약 나이 >= 18 이면
\t"성인입니다" 보여주기
아니면
\t"미성년자입니다" 보여주기`,
  },
  {
    id: 'sum-loop',
    title: '반복문 합계',
    code: `합계 = 0
반복 10번
\t합계 = 합계 + 1
합계 보여주기`,
  },
  {
    id: 'grade',
    title: '중첩 조건문',
    code: `점수 = 85
만약 점수 >= 90 이면
\t"A등급" 보여주기
아니면
\t만약 점수 >= 80 이면
\t\t"B등급" 보여주기
\t아니면
\t\t"C등급" 보여주기`,
  },
  {
    id: 'function',
    title: '함수 선언과 호출',
    code: `약속, (이름) 에게 인사하기
\t이름 + "님, 안녕하세요!" 보여주기

"철수" 에게 인사하기
"영희" 에게 인사하기`,
  },
  {
    id: 'list-loop',
    title: '리스트 반복',
    code: `과일들 = ["사과", "바나나", "딸기"]
반복 과일들 의 과일 마다
\t과일 보여주기`,
  },
]
