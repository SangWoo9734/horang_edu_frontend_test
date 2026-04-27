import { css, cx } from "styled-system/css";
import type { ReactNode } from "react";

interface LayoutProps {
  topNav: ReactNode;
  mascot: ReactNode;
  editor: ReactNode;
  flowchart: ReactNode;
  console: ReactNode;
  variables: ReactNode;
  syncBadge?: ReactNode;
}

// 에디터·순서도·콘솔·변수 패널에 공통으로 쓰이는 카드 스타일
const panelCard = css({
  bg: "bgPanel",
  borderRadius: "14px",
  border: "1px solid",
  borderColor: "border",
  boxShadow: "0 2px 12px token(colors.primary)/6",
  display: "flex",
  flexDirection: "column",
  overflow: "hidden",
});

export default function Layout({
  topNav,
  mascot,
  editor,
  flowchart,
  console: consolePanel,
  variables,
  syncBadge,
}: LayoutProps) {
  return (
    <div
      className={css({
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        bg: "bgBase",
        color: "textPrimary",
        fontFamily: "ui",
        minWidth: "1054px",
        overflow: "hidden",
      })}
    >
      <header className={css({ flexShrink: 0, zIndex: 20 })}>{topNav}</header>

      <div className={css({ display: "flex", flex: 1, overflow: "hidden" })}>
        <div
          className={css({
            flex: 1,
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            bg: "bgBase",
            p: "3",
            gap: "2",
          })}
        >
          <div className={css({ flexShrink: 0 })}>{mascot}</div>

          {/* 에디터 + 순서도 */}
          <div
            className={css({
              display: "flex",
              flex: 1,
              gap: "2",
              overflow: "hidden",
              minHeight: 0,
              position: "relative",
            })}
          >
            <div className={cx(panelCard, css({ flex: 1, minWidth: 0 }))}>
              {editor}
            </div>
            {syncBadge}
            <div className={cx(panelCard, css({ flex: 1, minWidth: 0 }))}>
              {flowchart}
            </div>
          </div>

          {/* 콘솔 + 변수 */}
          <div
            className={css({
              display: "flex",
              gap: "2",
              height: "160px",
              flexShrink: 0,
            })}
          >
            <div className={cx(panelCard, css({ flex: 1 }))}>
              {consolePanel}
            </div>
            <div
              className={cx(panelCard, css({ width: "320px", flexShrink: 0 }))}
            >
              {variables}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
