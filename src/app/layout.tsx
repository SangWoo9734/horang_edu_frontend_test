import { css } from 'styled-system/css'
import type { ReactNode } from 'react'

interface LayoutProps {
  topNav: ReactNode
  mascot: ReactNode
  editor: ReactNode
  flowchart: ReactNode
  console: ReactNode
  variables: ReactNode
}

export default function Layout({ topNav, mascot, editor, flowchart, console: consolePanel, variables }: LayoutProps) {
  return (
    <div className={css({
      display: 'flex',
      flexDirection: 'column',
      height: '100vh',
      bg: 'bgBase',
      color: 'textPrimary',
      fontFamily: 'ui',
      minWidth: '1024px',
      overflow: 'hidden',
    })}>
      {/* 상단 네비 */}
      <header className={css({ flexShrink: 0, zIndex: 20 })}>
        {topNav}
      </header>

      {/* 바디 */}
      <div className={css({ display: 'flex', flex: 1, overflow: 'hidden' })}>
        {/* 메인 */}
        <div className={css({
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          bg: 'bgBase',
          p: '3',
          gap: '2',
        })}>
          {/* 마스코트 */}
          <div className={css({ flexShrink: 0 })}>{mascot}</div>

          {/* 에디터 + 순서도 */}
          <div className={css({
            display: 'flex',
            flex: 1,
            gap: '2',
            overflow: 'hidden',
            minHeight: 0,
          })}>
            <div className={css({
              flex: 1, minWidth: 0,
              bg: 'bgPanel',
              borderRadius: '14px',
              border: '1px solid',
              borderColor: 'border',
              boxShadow: '0 2px 12px token(colors.primary)10',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
            })}>
              {editor}
            </div>
            <div className={css({
              flex: 1, minWidth: 0,
              bg: 'bgPanel',
              borderRadius: '14px',
              border: '1px solid',
              borderColor: 'border',
              boxShadow: '0 2px 12px token(colors.primary)10',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
            })}>
              {flowchart}
            </div>
          </div>

          {/* 콘솔 + 변수 */}
          <div className={css({
            display: 'flex',
            gap: '2',
            height: '160px',
            flexShrink: 0,
          })}>
            <div className={css({
              flex: 1,
              bg: 'bgPanel',
              borderRadius: '14px',
              border: '1px solid',
              borderColor: 'border',
              boxShadow: '0 2px 12px token(colors.primary)10',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
            })}>
              {consolePanel}
            </div>
            <div className={css({
              width: '260px',
              flexShrink: 0,
              bg: 'bgPanel',
              borderRadius: '14px',
              border: '1px solid',
              borderColor: 'border',
              boxShadow: '0 2px 12px token(colors.primary)10',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
            })}>
              {variables}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
