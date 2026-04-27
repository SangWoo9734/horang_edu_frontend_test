import { css } from 'styled-system/css'

const S = {
  cardHeader: css({
    height: '40px', display: 'flex', alignItems: 'center',
    paddingX: '3.5', gap: '2',
    borderBottom: '1px solid', borderColor: 'bgBase', flexShrink: '0',
  }),
  cardTitle: css({
    fontSize: '12px', fontWeight: '700',
    color: 'textMid', fontFamily: 'ui',
    display: 'flex', alignItems: 'center', gap: '1.5',
  }),
  cardActions: css({
    marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '1.5',
  }),
  smallBtn: css({
    fontSize: '10px', paddingX: '2', paddingY: '0.5',
    borderRadius: '6px', border: '1px solid', borderColor: 'border',
    bg: 'bgSubtle', color: 'textMid', fontFamily: 'ui', cursor: 'pointer',
  }),
}

interface CardHeaderProps {
  dotColor: string
  title: string
  meta?: string
  actions?: React.ReactNode
}

export function CardHeader({ dotColor, title, meta, actions }: CardHeaderProps) {
  return (
    <div className={S.cardHeader}>
      <span style={{ width: 7, height: 7, borderRadius: '50%', background: dotColor, flexShrink: 0 }}/>
      <span className={S.cardTitle}>{title}</span>
      {meta && (
        <span className={css({ marginLeft: '2', fontSize: '10px', color: 'textMuted', fontWeight: '500', fontFamily: 'ui' })}>
          {meta}
        </span>
      )}
      {actions && <div className={S.cardActions}>{actions}</div>}
    </div>
  )
}

interface SmallBtnProps {
  onClick: () => void
  children: React.ReactNode
}

export function SmallBtn({ onClick, children }: SmallBtnProps) {
  return (
    <button className={S.smallBtn} onClick={onClick}>{children}</button>
  )
}
