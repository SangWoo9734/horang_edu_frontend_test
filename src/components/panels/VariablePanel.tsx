import { css } from 'styled-system/css'
import { useExecutionStore } from '../../stores/execution-store'

export default function VariablePanel() {
  const variables = useExecutionStore((s) => s.variables)
  const entries = Object.entries(variables)

  return (
    <div className={css({
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      bg: 'bgPanel',
      overflow: 'hidden',
    })}>
      <div className={css({
        px: '3',
        py: '1',
        fontSize: '11px',
        color: 'textSecondary',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        flexShrink: 0,
      })}>
        변수 상태
      </div>
      <div className={css({
        flex: 1,
        overflowY: 'auto',
        p: '3',
      })}>
        {entries.length === 0 ? (
          <span className={css({ fontSize: '12px', color: 'textSecondary' })}>
            실행 중 변수가 여기에 표시됩니다.
          </span>
        ) : (
          <table className={css({ width: '100%', borderCollapse: 'collapse' })}>
            <tbody>
              {entries.map(([name, value]) => (
                <tr key={name}>
                  <td className={css({
                    py: '1',
                    pr: '3',
                    fontFamily: 'code',
                    fontSize: '12px',
                    color: 'primary',
                    verticalAlign: 'top',
                    whiteSpace: 'nowrap',
                  })}>
                    {name}
                  </td>
                  <td className={css({
                    py: '1',
                    fontFamily: 'code',
                    fontSize: '12px',
                    color: 'textPrimary',
                    wordBreak: 'break-all',
                  })}>
                    {String(value)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
