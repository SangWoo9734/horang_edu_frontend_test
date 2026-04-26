export interface LessonItem {
  id: string
  label: string
  code: string
}

export interface LessonSection {
  id: string
  title: string
  items: LessonItem[]
}

export const LESSONS: LessonSection[] = [
  {
    id: 'output', title: '출력하기',
    items: [
      { id: 'ex1', label: '첫째마당 — 안녕!', code: `"안녕하세요! 반갑습니다 :)" 보여주기\n"달빛약속으로 코딩해요!" 보여주기` },
      { id: 'ex2', label: '실습 — 자기소개', code: `"저는 달빛초등학교 학생이에요" 보여주기\n"코딩이 재미있어요!" 보여주기` },
    ],
  },
  {
    id: 'var', title: '변수',
    items: [
      { id: 'ex3', label: '변수란 무엇일까?', code: `나이 = 12\n"내 나이는" 보여주기\n나이 보여주기` },
      { id: 'ex4', label: '실습 — 나이 조건문', code: `나이 = 12\n만약 나이 >= 14 이면\n\t"중학생이에요!" 보여주기\n아니면\n\t"초등학생이에요!" 보여주기` },
    ],
  },
  {
    id: 'op', title: '연산자',
    items: [
      { id: 'ex5', label: '곱셈 계산기', code: `가격 = 500\n수량 = 4\n총액 = 가격 * 수량\n총액 보여주기` },
    ],
  },
  {
    id: 'cond', title: '조건문',
    items: [
      { id: 'ex6', label: '점수별 등급', code: `점수 = 85\n만약 점수 >= 90 이면\n\t"A 등급이에요!" 보여주기\n아니면\n\t만약 점수 >= 80 이면\n\t\t"B 등급이에요!" 보여주기\n\t아니면\n\t\t"C 등급이에요!" 보여주기` },
    ],
  },
  {
    id: 'loop', title: '반복문',
    items: [
      { id: 'ex7', label: '반복 — 합계 구하기', code: `합계 = 0\n반복 5번\n\t합계 = 합계 + 1\n합계 보여주기` },
      { id: 'ex8', label: '반복 — 카운터', code: `카운트 = 0\n반복 4번\n\t카운트 = 카운트 + 10\n\t카운트 보여주기` },
    ],
  },
]
