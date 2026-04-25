import { css } from 'styled-system/css'
import type { ReactNode } from 'react'

interface LayoutProps {
  header: ReactNode
  editor: ReactNode
  flowchart: ReactNode
  console: ReactNode
  variables: ReactNode
  footer: ReactNode
}

export default function Layout({ header, editor, flowchart, console: consolePanel, variables, footer }: LayoutProps) {
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
      {/* 헤더 */}
      <header className={css({
        flexShrink: 0,
        height: '48px',
        bg: 'bgPanel',
        borderBottom: '1px solid',
        borderColor: 'rgba(255,255,255,0.08)',
        display: 'flex',
        alignItems: 'center',
        px: '4',
      })}>
        {header}
      </header>

      {/* 메인 패널 (상단 70%) */}
      <div className={css({
        flex: '7',
        display: 'flex',
        overflow: 'hidden',
      })}>
        {/* 좌상: 코드 에디터 */}
        <div className={css({
          flex: '1',
          borderRight: '1px solid',
          borderColor: 'rgba(255,255,255,0.08)',
          overflow: 'hidden',
        })}>
          {editor}
        </div>

        {/* 우상: 순서도 캔버스 */}
        <div className={css({ flex: '1', overflow: 'hidden' })}>
          {flowchart}
        </div>
      </div>

      {/* 하단 패널 (30%) */}
      <div className={css({
        flex: '3',
        display: 'flex',
        borderTop: '1px solid',
        borderColor: 'rgba(255,255,255,0.08)',
        overflow: 'hidden',
      })}>
        {/* 좌하: 콘솔 */}
        <div className={css({
          flex: '1',
          borderRight: '1px solid',
          borderColor: 'rgba(255,255,255,0.08)',
          overflow: 'hidden',
        })}>
          {consolePanel}
        </div>

        {/* 우하: 변수 패널 */}
        <div className={css({ flex: '1', overflow: 'hidden' })}>
          {variables}
        </div>
      </div>

      {/* 푸터 */}
      <footer className={css({
        flexShrink: 0,
        height: '44px',
        bg: 'bgPanel',
        borderTop: '1px solid',
        borderColor: 'rgba(255,255,255,0.08)',
        display: 'flex',
        alignItems: 'center',
        px: '4',
      })}>
        {footer}
      </footer>
    </div>
  )
}
