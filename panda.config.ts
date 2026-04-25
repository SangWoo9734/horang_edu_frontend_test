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
          bgBase: { value: '#0F0F1A' },
          bgPanel: { value: '#1A1A2E' },
          bgCode: { value: '#161625' },

          // 브랜드
          primary: { value: '#706EEB' },

          // 노드
          nodeProcess: { value: '#3B82F6' },
          nodeDecision: { value: '#F59E0B' },
          nodeLoop: { value: '#10B981' },
          nodeOutput: { value: '#8B5CF6' },
          nodeTerminal: { value: '#6B7280' },

          // 실행
          highlight: { value: '#FDE68A' },
          edgeTrue: { value: '#4ADE80' },
          edgeFalse: { value: '#F87171' },

          // 텍스트
          textPrimary: { value: '#E2E8F0' },
          textSecondary: { value: '#94A3B8' },
        },
        fonts: {
          ui: { value: 'Pretendard, system-ui, sans-serif' },
          code: { value: "'JetBrains Mono', monospace" },
        },
      },
    },
  },
  outdir: 'styled-system',
})
