import { create } from 'zustand'
import type { ExecutionStatus } from '../types/execution'

interface ExecutionStore {
  status: ExecutionStatus
  consoleOutput: string[]
  variables: Record<string, unknown>
  executionDelay: number
  setStatus: (status: ExecutionStatus) => void
  appendConsole: (line: string) => void
  setVariable: (name: string, value: unknown) => void
  setExecutionDelay: (ms: number) => void
  clearRuntime: () => void
}

export const useExecutionStore = create<ExecutionStore>((set) => ({
  status: 'idle',
  consoleOutput: [],
  variables: {},
  executionDelay: 500,
  setStatus: (status) => set({ status }),
  appendConsole: (line) =>
    set((state) => ({ consoleOutput: [...state.consoleOutput, line] })),
  setVariable: (name, value) =>
    set((state) => ({ variables: { ...state.variables, [name]: value } })),
  setExecutionDelay: (executionDelay) => set({ executionDelay }),
  clearRuntime: () => set({ consoleOutput: [], variables: {} }),
}))
