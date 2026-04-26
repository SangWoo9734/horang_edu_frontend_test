import { useState } from 'react'

interface HelpModalProps {
  onClose: () => void
}

const TABS = ['시작하기', '노드 종류', '코드 작성', '자주 묻는 질문'] as const
type Tab = typeof TABS[number]

// ── 각 탭 콘텐츠 ─────────────────────────────
// 내용은 사용자가 추가 예정 — 구조/UI만 완성

const NODE_TYPES = [
  { emoji: '📦', name: '변수', color: '#3B82F6', example: '나이 = 12', desc: '값을 저장하는 상자예요. 이름을 붙이고 숫자나 글자를 넣을 수 있어요.' },
  { emoji: '📢', name: '출력', color: '#8B5CF6', example: '"안녕!" 보여주기', desc: '화면에 글자나 숫자를 보여줄 때 써요.' },
  { emoji: '🔀', name: '조건', color: '#F59E0B', example: '만약 나이 >= 14 이면', desc: '어떤 조건이 맞을 때만 실행할 코드를 고를 수 있어요.' },
  { emoji: '🔄', name: '횟수 반복', color: '#10B981', example: '반복 5번', desc: '정해진 횟수만큼 같은 코드를 반복해요.' },
  { emoji: '♾️', name: '조건 반복', color: '#10B981', example: '반복 카운트 < 10 동안', desc: '조건이 맞는 동안 계속 반복해요.' },
  { emoji: '📋', name: '목록 반복', color: '#10B981', example: '반복 과일들 의 과일 마다', desc: '목록에 있는 항목을 하나씩 꺼내며 반복해요.' },
  { emoji: '📝', name: '함수 선언', color: '#6366F1', example: '약속, (이름) 인사하기', desc: '자주 쓰는 코드 묶음에 이름을 붙여두는 거예요.' },
  { emoji: '📞', name: '함수 호출', color: '#6366F1', example: '"철수" 에게 인사하기', desc: '만들어 둔 약속(함수)을 불러서 실행해요.' },
]

const FAQ = [
  { q: '순서도에서 노드를 연결하려면 어떻게 해요?', a: '노드 가장자리에 있는 동그란 점에서 드래그해서 다른 노드로 연결하면 돼요.' },
  { q: '노드를 지우고 싶어요.', a: '노드를 클릭해서 선택한 다음 키보드의 Delete 키를 누르면 지워져요.' },
  { q: '노드 값을 바꾸고 싶어요.', a: '노드를 더블클릭하면 수정 창이 열려요.' },
  { q: '코드와 순서도가 함께 바뀌어요?', a: '네! 코드를 고치면 순서도가 바뀌고, 순서도를 고치면 코드가 바뀌어요.' },
  { q: '실행 속도를 조절할 수 있나요?', a: '위쪽 속도 슬라이더로 빠르거나 느리게 바꿀 수 있어요.' },
]

function StartingTab() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ background: '#F3F2FA', borderRadius: 12, padding: '16px 20px', border: '1.5px solid #E0DEFF' }}>
        <div style={{ fontSize: 28, marginBottom: 8 }}>👋</div>
        <div style={{ fontSize: 14, fontWeight: 700, color: '#1A1A2E', marginBottom: 6 }}>달빛흐름에 오신 것을 환영해요!</div>
        <div style={{ fontSize: 12.5, color: '#4B4B6B', lineHeight: 1.8 }}>
          {/* 사용자 콘텐츠 추가 예정 */}
          달빛흐름은 코드를 쓰면 순서도가 자동으로 만들어지고,<br/>
          순서도로 코드를 만들 수도 있는 도구예요.<br/>
          코드가 어떻게 실행되는지 눈으로 볼 수 있어요! 🌙
        </div>
      </div>

      <div style={{ fontSize: 13, fontWeight: 700, color: '#4B4B6B', marginBottom: -8 }}>이렇게 사용해요</div>

      {[
        { step: '1', icon: '✏️', title: '코드 쓰기', desc: '왼쪽 코드 창에 달빛약속 코드를 써요. 오른쪽에 순서도가 바로 나타나요.' },
        { step: '2', icon: '▶️', title: '실행하기', desc: '위쪽 ▶ 실행하기 버튼을 누르면 코드가 실행되고, 실행 중인 부분이 노란색으로 표시돼요.' },
        { step: '3', icon: '🔧', title: '순서도로 코드 만들기', desc: '오른쪽 순서도 창에서 왼쪽 팔레트의 노드를 드래그해서 코드를 만들 수 있어요.' },
      ].map(({ step, icon, title, desc }) => (
        <div key={step} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
          <div style={{ width: 28, height: 28, borderRadius: '50%', background: '#4F46E5', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, flexShrink: 0, marginTop: 2 }}>
            {step}
          </div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#1A1A2E', marginBottom: 2 }}>{icon} {title}</div>
            <div style={{ fontSize: 12, color: '#6B6B8B', lineHeight: 1.7 }}>{desc}</div>
          </div>
        </div>
      ))}
    </div>
  )
}

function NodeTypesTab() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <div style={{ fontSize: 12, color: '#8B8B9E', marginBottom: 4 }}>
        순서도 왼쪽 팔레트에서 드래그해서 캔버스에 놓으면 돼요!
      </div>
      {NODE_TYPES.map(({ emoji, name, color, example, desc }) => (
        <div key={name} style={{
          display: 'flex', alignItems: 'flex-start', gap: 12,
          padding: '10px 14px', background: '#FAFAFE',
          borderRadius: 10, border: `1.5px solid ${color}30`,
        }}>
          <div style={{ fontSize: 22, flexShrink: 0 }}>{emoji}</div>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
              <span style={{ fontSize: 12, fontWeight: 700, color }}>{name}</span>
              <code style={{ fontSize: 10.5, background: `${color}15`, color, padding: '1px 6px', borderRadius: 4, fontFamily: "'JetBrains Mono', monospace" }}>
                {example}
              </code>
            </div>
            <div style={{ fontSize: 11.5, color: '#6B6B8B', lineHeight: 1.6 }}>{desc}</div>
          </div>
        </div>
      ))}
    </div>
  )
}

function CodeWritingTab() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div style={{ background: '#FFF7ED', border: '1.5px solid #FED7AA', borderRadius: 10, padding: '12px 16px' }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: '#92400E', marginBottom: 4 }}>💡 달빛약속 코드 작성 팁</div>
        <div style={{ fontSize: 11.5, color: '#78350F', lineHeight: 1.8 }}>
          {/* 사용자 콘텐츠 추가 예정 */}
          들여쓰기(탭)로 코드 블록을 구분해요.<br/>
          조건문이나 반복문 안쪽 코드는 한 칸 안으로 들여써야 해요.
        </div>
      </div>

      {[
        { title: '변수 만들기', code: '나이 = 12\n이름 = "달빛"', tip: '= 왼쪽은 이름, 오른쪽은 값이에요' },
        { title: '조건문 쓰기', code: '만약 나이 >= 14 이면\n\t"중학생이에요!" 보여주기\n아니면\n\t"초등학생이에요!" 보여주기', tip: '아니면 은 선택 사항이에요' },
        { title: '반복문 쓰기', code: '합계 = 0\n반복 5번\n\t합계 = 합계 + 1\n합계 보여주기', tip: '반복 안쪽 코드는 탭으로 들여쓰세요' },
      ].map(({ title, code, tip }) => (
        <div key={title} style={{ border: '1px solid #EEEDF8', borderRadius: 10, overflow: 'hidden' }}>
          <div style={{ padding: '8px 14px', background: '#F8F7FF', fontSize: 12, fontWeight: 700, color: '#4B4B6B', borderBottom: '1px solid #EEEDF8' }}>
            {title}
          </div>
          <pre style={{ margin: 0, padding: '10px 14px', fontFamily: "'JetBrains Mono', monospace", fontSize: 11.5, color: '#1A1A2E', background: '#fff', lineHeight: 1.7 }}>
            {code}
          </pre>
          <div style={{ padding: '6px 14px', background: '#F8F7FF', fontSize: 11, color: '#8B8B9E', borderTop: '1px solid #EEEDF8' }}>
            💡 {tip}
          </div>
        </div>
      ))}
    </div>
  )
}

function FaqTab() {
  const [open, setOpen] = useState<number | null>(null)
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      {FAQ.map(({ q, a }, i) => (
        <div key={i} style={{ border: '1.5px solid #EEEDF8', borderRadius: 10, overflow: 'hidden' }}>
          <div
            onClick={() => setOpen(open === i ? null : i)}
            style={{
              padding: '11px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              cursor: 'pointer', background: open === i ? '#F3F2FA' : '#fff',
              fontSize: 12.5, fontWeight: 600, color: '#1A1A2E',
            }}
          >
            <span>Q. {q}</span>
            <span style={{ color: '#C4B5FD', fontSize: 11, transition: 'transform 0.2s', display: 'inline-block', transform: open === i ? 'rotate(180deg)' : 'none' }}>▾</span>
          </div>
          {open === i && (
            <div style={{ padding: '10px 14px', background: '#F8F7FF', fontSize: 12, color: '#4B4B6B', lineHeight: 1.7, borderTop: '1px solid #EEEDF8' }}>
              A. {a}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

export default function HelpModal({ onClose }: HelpModalProps) {
  const [activeTab, setActiveTab] = useState<Tab>('시작하기')

  const tabContent: Record<Tab, React.ReactNode> = {
    '시작하기': <StartingTab />,
    '노드 종류': <NodeTypesTab />,
    '코드 작성': <CodeWritingTab />,
    '자주 묻는 질문': <FaqTab />,
  }

  return (
    <div
      style={{ position: 'fixed', inset: 0, background: '#1A1A2E30', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200 }}
      onClick={onClose}
    >
      <div
        style={{ background: '#fff', border: '1.5px solid #E0DEFF', borderRadius: 20, width: 560, maxHeight: '85vh', display: 'flex', flexDirection: 'column', boxShadow: '0 24px 64px #4F46E525', overflow: 'hidden' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* 헤더 */}
        <div style={{ padding: '20px 24px 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
          <div>
            <div style={{ fontSize: 18, fontWeight: 800, color: '#1A1A2E' }}>📖 사용 방법</div>
            <div style={{ fontSize: 11.5, color: '#8B8B9E', marginTop: 2 }}>달빛흐름 사용 가이드</div>
          </div>
          <button
            onClick={onClose}
            style={{ width: 32, height: 32, borderRadius: '50%', border: '1.5px solid #EEEDF8', background: '#FAFAFE', cursor: 'pointer', fontSize: 16, color: '#6B6B8B', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >×</button>
        </div>

        {/* 탭 */}
        <div style={{ display: 'flex', padding: '12px 24px 0', gap: 2, borderBottom: '1px solid #EEEDF8', flexShrink: 0 }}>
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                padding: '7px 14px', borderRadius: '8px 8px 0 0',
                border: 'none', fontSize: 12, fontWeight: activeTab === tab ? 700 : 500,
                cursor: 'pointer', fontFamily: "'Noto Sans KR', sans-serif",
                background: activeTab === tab ? '#fff' : 'transparent',
                color: activeTab === tab ? '#4F46E5' : '#8B8B9E',
                borderBottom: activeTab === tab ? '2px solid #4F46E5' : '2px solid transparent',
                position: 'relative', bottom: -1,
              }}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* 콘텐츠 */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px 24px' }}>
          {tabContent[activeTab]}
        </div>
      </div>
    </div>
  )
}
