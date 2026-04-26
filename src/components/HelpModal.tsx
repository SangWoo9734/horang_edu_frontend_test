import { useState } from 'react'
import { css } from 'styled-system/css'

interface HelpModalProps { onClose: () => void }

const TABS = ['시작하기', '노드 종류', '코드 작성', '자주 묻는 질문'] as const
type Tab = typeof TABS[number]

const NODE_TYPES = [
  { emoji: '📦', name: '변수',    color: '#3B82F6', example: '나이 = 12',                    desc: '값을 저장하는 상자예요. 이름을 붙이고 숫자나 글자를 넣을 수 있어요.' },
  { emoji: '📢', name: '출력',    color: '#8B5CF6', example: '"안녕!" 보여주기',              desc: '화면에 글자나 숫자를 보여줄 때 써요.' },
  { emoji: '🔀', name: '조건',    color: '#F59E0B', example: '만약 나이 >= 14 이면',          desc: '어떤 조건이 맞을 때만 실행할 코드를 고를 수 있어요.' },
  { emoji: '🔄', name: '횟수 반복', color: '#10B981', example: '반복 5번',                   desc: '정해진 횟수만큼 같은 코드를 반복해요.' },
  { emoji: '♾️', name: '조건 반복', color: '#10B981', example: '반복 카운트 < 10 동안',      desc: '조건이 맞는 동안 계속 반복해요.' },
  { emoji: '📋', name: '목록 반복', color: '#10B981', example: '반복 과일들 의 과일 마다',    desc: '목록에 있는 항목을 하나씩 꺼내며 반복해요.' },
  { emoji: '📝', name: '함수 선언', color: '#6366F1', example: '약속, (이름) 인사하기',       desc: '자주 쓰는 코드 묶음에 이름을 붙여두는 거예요.' },
  { emoji: '📞', name: '함수 호출', color: '#6366F1', example: '"철수" 에게 인사하기',        desc: '만들어 둔 약속(함수)을 불러서 실행해요.' },
]

const FAQ = [
  { q: '순서도에서 노드를 연결하려면 어떻게 해요?', a: '노드 가장자리에 있는 동그란 점에서 드래그해서 다른 노드로 연결하면 돼요.' },
  { q: '노드를 지우고 싶어요.', a: '노드를 클릭해서 선택한 다음 키보드의 Delete 키를 누르면 지워져요.' },
  { q: '노드 값을 바꾸고 싶어요.', a: '노드를 더블클릭하면 수정 창이 열려요.' },
  { q: '코드와 순서도가 함께 바뀌어요?', a: '네! 코드를 고치면 순서도가 바뀌고, 순서도를 고치면 코드가 바뀌어요.' },
  { q: '실행 속도를 조절할 수 있나요?', a: '위쪽 속도 슬라이더로 빠르거나 느리게 바꿀 수 있어요.' },
]

// ── 스타일 ────────────────────────────────────
const S = {
  overlay: css({
    position: 'fixed', inset: 0,
    background: 'token(colors.textPrimary)/18',
    backdropFilter: 'blur(4px)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    zIndex: 200,
  }),
  modal: css({
    bg: 'white', border: '1.5px solid', borderColor: 'accent',
    borderRadius: '20px', width: '560px', maxHeight: '85vh',
    display: 'flex', flexDirection: 'column',
    boxShadow: '0 24px 64px token(colors.primary)/14',
    overflow: 'hidden',
  }),
  modalHeader: css({
    paddingX: '6', paddingTop: '5', paddingBottom: '0',
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    flexShrink: 0,
  }),
  modalTitle: css({ fontSize: '18px', fontWeight: '800', color: 'textPrimary', fontFamily: 'ui' }),
  modalSubtitle: css({ fontSize: '11.5px', color: 'textMuted', marginTop: '0.5', fontFamily: 'ui' }),
  closeBtn: css({
    width: '32px', height: '32px', borderRadius: 'full',
    border: '1.5px solid', borderColor: 'border',
    bg: 'bgSubtle', cursor: 'pointer',
    fontSize: '16px', color: 'textSub',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  }),
  tabBar: css({
    display: 'flex', paddingX: '6', paddingTop: '3',
    gap: '0.5', borderBottom: '1px solid', borderColor: 'border',
    flexShrink: 0,
  }),
  tab: css({
    paddingX: '3.5', paddingY: '1.5',
    borderRadius: '8px 8px 0 0', border: 'none',
    fontSize: '12px', fontWeight: '500', cursor: 'pointer',
    fontFamily: 'ui', bg: 'transparent', color: 'textMuted',
    borderBottom: '2px solid transparent',
    position: 'relative', bottom: '-1px',
    transition: 'all 0.15s',
  }),
  tabActive: css({
    paddingX: '3.5', paddingY: '1.5',
    borderRadius: '8px 8px 0 0', border: 'none',
    fontSize: '12px', fontWeight: '700', cursor: 'pointer',
    fontFamily: 'ui', bg: 'white', color: 'primary',
    borderBottom: '2px solid', borderBottomColor: 'primary',
    position: 'relative', bottom: '-1px',
  }),
  body: css({ flex: 1, overflowY: 'auto', paddingX: '6', paddingY: '5' }),
  // StartingTab
  welcomeBox: css({
    bg: 'bgBase', borderRadius: '12px', paddingX: '5', paddingY: '4',
    border: '1.5px solid', borderColor: 'accent',
  }),
  welcomeTitle: css({ fontSize: '14px', fontWeight: '700', color: 'textPrimary', marginBottom: '1.5', fontFamily: 'ui' }),
  welcomeDesc: css({ fontSize: '12.5px', color: 'textMid', lineHeight: '1.8', fontFamily: 'ui' }),
  sectionLabel: css({ fontSize: '13px', fontWeight: '700', color: 'textMid', fontFamily: 'ui' }),
  stepRow: css({ display: 'flex', gap: '3', alignItems: 'flex-start' }),
  stepBadge: css({
    width: '28px', height: '28px', borderRadius: 'full',
    bg: 'primary', color: 'white',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: '12px', fontWeight: '700', flexShrink: 0, marginTop: '0.5',
  }),
  stepTitle: css({ fontSize: '13px', fontWeight: '700', color: 'textPrimary', marginBottom: '0.5', fontFamily: 'ui' }),
  stepDesc: css({ fontSize: '12px', color: 'textSub', lineHeight: '1.7', fontFamily: 'ui' }),
  // NodeTypesTab
  nodeRow: css({
    display: 'flex', alignItems: 'flex-start', gap: '3',
    paddingX: '3.5', paddingY: '2.5',
    bg: 'bgSubtle', borderRadius: '10px',
  }),
  nodeNameRow: css({ display: 'flex', alignItems: 'center', gap: '2', marginBottom: '0.5' }),
  nodeDesc: css({ fontSize: '11.5px', color: 'textSub', lineHeight: '1.6', fontFamily: 'ui' }),
  // CodeWritingTab
  tipBox: css({
    bg: '#FFF7ED', border: '1.5px solid #FED7AA',
    borderRadius: '10px', paddingX: '4', paddingY: '3',
  }),
  tipTitle: css({ fontSize: '12px', fontWeight: '700', color: '#92400E', marginBottom: '1', fontFamily: 'ui' }),
  tipDesc: css({ fontSize: '11.5px', color: '#78350F', lineHeight: '1.8', fontFamily: 'ui' }),
  codeBlock: css({ border: '1px solid', borderColor: 'border', borderRadius: '10px', overflow: 'hidden' }),
  codeBlockHeader: css({
    paddingX: '3.5', paddingY: '2',
    bg: '#F8F7FF', fontSize: '12px', fontWeight: '700',
    color: 'textMid', borderBottom: '1px solid', borderColor: 'border',
    fontFamily: 'ui',
  }),
  codePre: css({
    margin: '0', paddingX: '3.5', paddingY: '2.5',
    fontFamily: 'code', fontSize: '11.5px', color: 'textPrimary',
    bg: 'white', lineHeight: '1.7',
  }),
  codeBlockFooter: css({
    paddingX: '3.5', paddingY: '1.5',
    bg: '#F8F7FF', fontSize: '11px', color: 'textMuted',
    borderTop: '1px solid', borderColor: 'border', fontFamily: 'ui',
  }),
  // FaqTab
  faqItem: css({ border: '1.5px solid', borderColor: 'border', borderRadius: '10px', overflow: 'hidden' }),
  faqQ: css({
    paddingX: '3.5', paddingY: '2.5',
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    cursor: 'pointer', fontSize: '12.5px', fontWeight: '600',
    color: 'textPrimary', fontFamily: 'ui',
  }),
  faqA: css({
    paddingX: '3.5', paddingY: '2.5',
    bg: '#F8F7FF', fontSize: '12px', color: 'textMid',
    lineHeight: '1.7', borderTop: '1px solid', borderColor: 'border',
    fontFamily: 'ui',
  }),
}

// ── 탭 콘텐츠 ────────────────────────────────
function StartingTab() {
  return (
    <div className={css({ display: 'flex', flexDirection: 'column', gap: '4' })}>
      <div className={S.welcomeBox}>
        <div style={{ fontSize: 28, marginBottom: 8 }}>👋</div>
        <div className={S.welcomeTitle}>달빛흐름에 오신 것을 환영해요!</div>
        <div className={S.welcomeDesc}>
          달빛흐름은 코드를 쓰면 순서도가 자동으로 만들어지고,<br/>
          순서도로 코드를 만들 수도 있는 도구예요.<br/>
          코드가 어떻게 실행되는지 눈으로 볼 수 있어요! 🌙
        </div>
      </div>

      <div className={S.sectionLabel}>이렇게 사용해요</div>

      {[
        { step: '1', icon: '✏️', title: '코드 쓰기', desc: '왼쪽 코드 창에 달빛약속 코드를 써요. 오른쪽에 순서도가 바로 나타나요.' },
        { step: '2', icon: '▶️', title: '실행하기', desc: '위쪽 ▶ 실행하기 버튼을 누르면 코드가 실행되고, 실행 중인 부분이 표시돼요.' },
        { step: '3', icon: '🔧', title: '순서도로 코드 만들기', desc: '오른쪽 순서도 창에서 왼쪽 팔레트의 노드를 드래그해서 코드를 만들 수 있어요.' },
      ].map(({ step, icon, title, desc }) => (
        <div key={step} className={S.stepRow}>
          <div className={S.stepBadge}>{step}</div>
          <div>
            <div className={S.stepTitle}>{icon} {title}</div>
            <div className={S.stepDesc}>{desc}</div>
          </div>
        </div>
      ))}
    </div>
  )
}

function NodeTypesTab() {
  return (
    <div className={css({ display: 'flex', flexDirection: 'column', gap: '2' })}>
      <div className={css({ fontSize: '12px', color: 'textMuted', marginBottom: '1', fontFamily: 'ui' })}>
        순서도 왼쪽 팔레트에서 드래그해서 캔버스에 놓으면 돼요!
      </div>
      {NODE_TYPES.map(({ emoji, name, color, example, desc }) => (
        <div key={name} className={S.nodeRow} style={{ border: `1.5px solid ${color}30` }}>
          <div style={{ fontSize: 22, flexShrink: 0 }}>{emoji}</div>
          <div style={{ flex: 1 }}>
            <div className={S.nodeNameRow}>
              <span style={{ fontSize: 12, fontWeight: 700, color, fontFamily: 'ui' }}>{name}</span>
              <code style={{ fontSize: 10.5, background: `${color}15`, color, padding: '1px 6px', borderRadius: 4, fontFamily: 'JetBrains Mono, monospace' }}>
                {example}
              </code>
            </div>
            <div className={S.nodeDesc}>{desc}</div>
          </div>
        </div>
      ))}
    </div>
  )
}

function CodeWritingTab() {
  return (
    <div className={css({ display: 'flex', flexDirection: 'column', gap: '3.5' })}>
      <div className={S.tipBox}>
        <div className={S.tipTitle}>💡 달빛약속 코드 작성 팁</div>
        <div className={S.tipDesc}>
          들여쓰기(탭)로 코드 블록을 구분해요.<br/>
          조건문이나 반복문 안쪽 코드는 한 칸 안으로 들여써야 해요.
        </div>
      </div>

      {[
        { title: '변수 만들기', code: '나이 = 12\n이름 = "달빛"', tip: '= 왼쪽은 이름, 오른쪽은 값이에요' },
        { title: '조건문 쓰기', code: '만약 나이 >= 14 이면\n\t"중학생이에요!" 보여주기\n아니면\n\t"초등학생이에요!" 보여주기', tip: '아니면 은 선택 사항이에요' },
        { title: '반복문 쓰기', code: '합계 = 0\n반복 5번\n\t합계 = 합계 + 1\n합계 보여주기', tip: '반복 안쪽 코드는 탭으로 들여쓰세요' },
      ].map(({ title, code, tip }) => (
        <div key={title} className={S.codeBlock}>
          <div className={S.codeBlockHeader}>{title}</div>
          <pre className={S.codePre}>{code}</pre>
          <div className={S.codeBlockFooter}>💡 {tip}</div>
        </div>
      ))}
    </div>
  )
}

function FaqTab() {
  const [open, setOpen] = useState<number | null>(null)
  return (
    <div className={css({ display: 'flex', flexDirection: 'column', gap: '1.5' })}>
      {FAQ.map(({ q, a }, i) => (
        <div key={i} className={S.faqItem}>
          <div
            className={S.faqQ}
            onClick={() => setOpen(open === i ? null : i)}
            style={{ background: open === i ? '#F3F2FA' : '#fff' }}
          >
            <span>Q. {q}</span>
            <span style={{ color: '#C4B5FD', fontSize: 11, display: 'inline-block', transform: open === i ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>▾</span>
          </div>
          {open === i && <div className={S.faqA}>A. {a}</div>}
        </div>
      ))}
    </div>
  )
}

// ── 메인 모달 ────────────────────────────────
export default function HelpModal({ onClose }: HelpModalProps) {
  const [activeTab, setActiveTab] = useState<Tab>('시작하기')

  const tabContent: Record<Tab, React.ReactNode> = {
    '시작하기': <StartingTab />,
    '노드 종류': <NodeTypesTab />,
    '코드 작성': <CodeWritingTab />,
    '자주 묻는 질문': <FaqTab />,
  }

  return (
    <div className={S.overlay} onClick={onClose}>
      <div className={S.modal} onClick={(e) => e.stopPropagation()}>
        <div className={S.modalHeader}>
          <div>
            <div className={S.modalTitle}>📖 사용 방법</div>
            <div className={S.modalSubtitle}>달빛흐름 사용 가이드</div>
          </div>
          <button className={S.closeBtn} onClick={onClose}>×</button>
        </div>

        <div className={S.tabBar}>
          {TABS.map((tab) => (
            <button
              key={tab}
              className={activeTab === tab ? S.tabActive : S.tab}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className={S.body}>{tabContent[activeTab]}</div>
      </div>
    </div>
  )
}
