import { useState } from 'react'
import { css } from 'styled-system/css'
import { LESSONS, type LessonItem } from '../data/lessons'

interface SidebarProps {
  activeId: string
  onSelect: (item: LessonItem) => void
  collapsed: boolean
  onToggle: () => void
}

export default function Sidebar({ activeId, onSelect, collapsed, onToggle }: SidebarProps) {
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({ output: true })

  const toggleSection = (id: string) =>
    setOpenSections((p) => ({ ...p, [id]: !p[id] }))

  return (
    <div style={{ position: 'relative', flexShrink: 0 }}>
      <div
        className={css({
          bg: 'bgPanel',
          borderRight: '1px solid',
          borderColor: 'border',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          transition: 'width 0.2s',
          flexShrink: 0,
        })}
        style={{ width: collapsed ? 0 : 228 }}
      >
        {/* 헤더 */}
        <div
          onClick={onToggle}
          className={css({
            height: '44px',
            display: 'flex',
            alignItems: 'center',
            px: '4',
            gap: '2',
            borderBottom: '1px solid',
            borderColor: 'border',
            flexShrink: 0,
            fontSize: '12px',
            fontWeight: '600',
            color: 'textMid',
            cursor: 'pointer',
            _hover: { color: 'primary' },
          })}
        >
          <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path d="M4 6h16M4 12h16M4 18h7" />
          </svg>
          강의 목록
        </div>

        {/* 섹션 목록 */}
        <div className={css({ flex: 1, overflowY: 'auto', py: '2' })}>
          {LESSONS.map((sec) => {
            const isActive = sec.items.some((it) => it.id === activeId)
            const isOpen = openSections[sec.id]
            return (
              <div key={sec.id} className={css({ borderBottom: '1px solid #F5F4FF' })}>
                <div
                  onClick={() => toggleSection(sec.id)}
                  className={css({
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    px: '4',
                    py: '3',
                    cursor: 'pointer',
                    fontSize: '13px',
                    fontWeight: '600',
                    color: isActive ? 'primary' : 'textPrimary',
                    bg: isActive ? 'bgActive' : 'transparent',
                    _hover: { bg: 'bgHover' },
                  })}
                >
                  <span>{sec.title}</span>
                  <span
                    className={css({ color: 'textAccent', fontSize: '11px', transition: 'transform 0.2s' })}
                    style={{ transform: isOpen ? 'rotate(180deg)' : 'none', display: 'inline-block' }}
                  >
                    ▾
                  </span>
                </div>

                {isOpen && (
                  <div className={css({ py: '1', pb: '2' })}>
                    {sec.items.map((it) => (
                      <div
                        key={it.id}
                        onClick={() => onSelect(it)}
                        className={css({
                          display: 'flex',
                          alignItems: 'center',
                          gap: '2',
                          px: '4',
                          pl: '7',
                          py: '2',
                          cursor: 'pointer',
                          fontSize: '12px',
                          color: it.id === activeId ? 'primary' : 'textSub',
                          fontWeight: it.id === activeId ? '600' : '400',
                          bg: it.id === activeId ? '#EEF0FF' : 'transparent',
                          _hover: { bg: 'bgHover', color: 'primary' },
                        })}
                      >
                        <span
                          className={css({ borderRadius: '50%', flexShrink: 0 })}
                          style={{
                            width: 5, height: 5,
                            background: it.id === activeId ? '#4F46E5' : '#C4B5FD',
                            borderRadius: '50%',
                          }}
                        />
                        {it.label}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* 접기/펴기 토글 버튼 */}
      <div
        onClick={onToggle}
        style={{
          position: 'absolute',
          left: collapsed ? 0 : 228,
          top: '50%',
          transform: 'translateY(-50%)',
          width: 16,
          height: 48,
          background: '#fff',
          border: '1px solid #EEEDF8',
          borderLeft: 'none',
          borderRadius: '0 6px 6px 0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          zIndex: 10,
          color: '#B0AECF',
          fontSize: 10,
          transition: 'left 0.2s',
        }}
      >
        {collapsed ? '›' : '‹'}
      </div>
    </div>
  )
}
