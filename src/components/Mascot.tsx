import { css } from 'styled-system/css'
import type { ExecutionStatus } from '../types/execution'

interface MascotProps {
  status: ExecutionStatus
  currentLine?: string
}

const S = {
  root: css({
    display: 'flex',
    alignItems: 'center',
    gap: '3',
    px: '1',
  }),
  avatar: css({ flexShrink: '0' }),
  bubble: css({
    bg: 'bgActive',
    borderRadius: '12px 12px 12px 2px',
    px: '3',
    py: '2',
    fontSize: '12px',
    color: 'textMid',
    fontWeight: '500',
    border: '1.5px solid',
    borderColor: 'accent',
    lineHeight: '1.5',
  }),
}

export default function Mascot({ status, currentLine }: MascotProps) {
  let msg = ''
  if (status === 'idle') msg = '코드를 쓰고 <b>▶ 실행하기</b>를 눌러봐요!'
  else if (status === 'running' && currentLine) msg = `지금 실행 중: <b>${currentLine}</b>`
  else if (status === 'running') msg = '열심히 실행 중이에요! 🚀'
  else if (status === 'paused') msg = '잠깐 멈췄어요. 계속하려면 ▶를 누르세요!'
  else if (status === 'done') msg = '🎉 실행이 끝났어요! 결과를 확인해봐요.'
  else if (status === 'error') msg = '❗ 오류가 생겼어요. 코드를 다시 확인해봐요!'

  return (
    <div className={S.root}>
      <svg width="42" height="42" viewBox="0 0 42 42" fill="none" className={S.avatar}>
        <ellipse cx="21" cy="26" rx="13" ry="12" fill="#C4B5FD"/>
        <ellipse cx="21" cy="22" rx="11" ry="11" fill="#A78BFA"/>
        <ellipse cx="17" cy="19" rx="3" ry="4" fill="#7C3AED"/>
        <ellipse cx="25" cy="19" rx="3" ry="4" fill="#7C3AED"/>
        <circle cx="17" cy="20" r="1.5" fill="#fff"/>
        <circle cx="25" cy="20" r="1.5" fill="#fff"/>
        <ellipse cx="21" cy="24" rx="3" ry="2" fill="#EDE9FE"/>
        <path d="M19 25.5 Q21 27 23 25.5" stroke="#7C3AED" strokeWidth="1" fill="none" strokeLinecap="round"/>
        <ellipse cx="13" cy="14" rx="4" ry="5" fill="#A78BFA" transform="rotate(-20 13 14)"/>
        <ellipse cx="29" cy="14" rx="4" ry="5" fill="#A78BFA" transform="rotate(20 29 14)"/>
        <line x1="14" y1="23" x2="8" y2="25" stroke="#7C3AED" strokeWidth="1"/>
        <line x1="14" y1="25" x2="8" y2="27" stroke="#7C3AED" strokeWidth="1"/>
        <line x1="28" y1="23" x2="34" y2="25" stroke="#7C3AED" strokeWidth="1"/>
        <line x1="28" y1="25" x2="34" y2="27" stroke="#7C3AED" strokeWidth="1"/>
      </svg>

      <div className={S.bubble} dangerouslySetInnerHTML={{ __html: msg }} />
    </div>
  )
}
