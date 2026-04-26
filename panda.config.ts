import { defineConfig } from '@pandacss/dev'

export default defineConfig({
  preflight: true,
  include: ['./src/**/*.{js,jsx,ts,tsx}'],
  exclude: [],
  theme: {
    extend: {
      tokens: {
        colors: {
          // 배경
          bgBase:    { value: '#F3F2FA' },
          bgPanel:   { value: '#ffffff' },
          bgSubtle:  { value: '#FAFAFE' },
          bgHover:   { value: '#F8F7FF' },
          bgActive:  { value: '#EEF0FF' },

          // 테두리
          border:    { value: '#EEEDF8' },

          // 브랜드
          primary:   { value: '#4F46E5' },
          primaryDark: { value: '#4338CA' },
          primaryLight: { value: '#EEF0FF' },
          accent:    { value: '#C4B5FD' },
          accentHover: { value: '#9B8EFA' },

          // 노드
          nodeTerminal: { value: '#6366F1' },
          nodeProcess:  { value: '#3B82F6' },
          nodeDecision: { value: '#F59E0B' },
          nodeLoop:     { value: '#10B981' },
          nodeOutput:   { value: '#8B5CF6' },

          // 실행
          highlight:  { value: '#EEF0FF' },
          highlightBorder: { value: '#4F46E5' },
          edgeTrue:   { value: '#34D399' },
          edgeFalse:  { value: '#F87171' },
          edgeDefault: { value: '#C4B5FD' },

          // 텍스트
          textPrimary:  { value: '#1A1A2E' },
          textMid:      { value: '#4B4B6B' },
          textSub:      { value: '#6B6B8B' },
          textMuted:    { value: '#8B8B9E' },
          textAccent:   { value: '#C4B5FD' },
        },
        fonts: {
          ui:   { value: "'Noto Sans KR', system-ui, sans-serif" },
          code: { value: "'JetBrains Mono', monospace" },
        },
      },
    },
  },
  outdir: 'styled-system',
})
