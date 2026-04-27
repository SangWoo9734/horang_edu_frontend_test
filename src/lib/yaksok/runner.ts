import { flushSync } from 'react-dom'
import { YaksokSession } from '@dalbit-yaksok/core'
import { StandardExtension } from '@dalbit-yaksok/standard'
import { useEditorStore } from '../../stores/editor-store'
import { useExecutionStore } from '../../stores/execution-store'
import { useFlowchartStore } from '../../stores/flowchart-store'
import { findNodeIdByLine, findDisconnectedNodeIds } from '../flowchart/highlight'

let abortController: AbortController | null = null
let currentSession: YaksokSession | null = null
let cleanupTimer: ReturnType<typeof setTimeout> | null = null

function buildSession(stepMode = false): YaksokSession {
  const { appendConsole, setVariable } = useExecutionStore.getState()
  const { setExecutingNodeId } = useFlowchartStore.getState()
  const { setExecutingLine } = useEditorStore.getState()

  const session = new YaksokSession({
    stdout: (msg) => appendConsole(msg),
    stderr: (_msg, err) => appendConsole(`오류: ${err.message}`),
    signal: abortController!.signal,
    events: {
      runningCode: (start) => {
        flushSync(() => {
          setExecutingLine(start.line)
          const nodes = useFlowchartStore.getState().nodes
          setExecutingNodeId(findNodeIdByLine(nodes, start.line))
        })
        // 스텝 모드에서는 runningCode 발생 시 stepping 상태로 전환
        if (stepMode) {
          useExecutionStore.getState().setStatus('stepping')
        }
      },
      variableSet: ({ name, value }) => {
        setVariable(name, value.toPrint())
      },
    },
  })

  if (stepMode) session.stepByStep = true

  return session
}

function setupDisconnected() {
  const { nodes, edges, setNodes } = useFlowchartStore.getState()
  const disconnectedIds = findDisconnectedNodeIds(nodes, edges)
  if (disconnectedIds.size > 0) {
    setNodes(nodes.map((n) => ({
      ...n,
      data: { ...n.data, disconnected: disconnectedIds.has(n.id) },
    })))
  }
}

function markErrorNode() {
  const { executingNodeId, nodes, setNodes } = useFlowchartStore.getState()
  if (!executingNodeId) return
  setNodes(nodes.map((n) => ({
    ...n,
    data: { ...n.data, error: n.id === executingNodeId },
  })))
}

function clearErrorNodes() {
  const { nodes, setNodes } = useFlowchartStore.getState()
  if (nodes.some((n) => n.data.error)) {
    setNodes(nodes.map((n) => ({ ...n, data: { ...n.data, error: false } })))
  }
}

function scheduleCleanup(executionDelay: number) {
  const { setExecutingNodeId } = useFlowchartStore.getState()
  useEditorStore.getState().setExecutingLine(null)
  currentSession = null

  cleanupTimer = setTimeout(() => {
    cleanupTimer = null
    setExecutingNodeId(null)
    const { nodes, setNodes } = useFlowchartStore.getState()
    setNodes(nodes.map((n) => ({ ...n, data: { ...n.data, disconnected: false } })))
    useExecutionStore.getState().setIsStepMode(false)
  }, executionDelay)
}

export async function startExecution(): Promise<void> {
  const { code } = useEditorStore.getState()
  const { executionDelay, setStatus, clearRuntime } = useExecutionStore.getState()

  clearRuntime()
  clearErrorNodes()
  if (cleanupTimer !== null) { clearTimeout(cleanupTimer); cleanupTimer = null }
  setupDisconnected()

  abortController = new AbortController()
  const session = buildSession(false)
  await session.extend(new StandardExtension())
  session.addModule('main', code, { executionDelay })
  currentSession = session

  setStatus('running')
  try {
    await session.runModule('main')
    setStatus('done')
  } catch (e) {
    const isAbort = e instanceof Error && (e.name === 'AbortError' || e.name === 'Abort')
    if (isAbort) setStatus('idle')
    else {
      markErrorNode()
      useExecutionStore.getState().appendConsole(`실행 오류: ${e instanceof Error ? e.message : String(e)}`)
      setStatus('error')
    }
  } finally {
    scheduleCleanup(executionDelay)
  }
}

export async function startStepExecution(): Promise<void> {
  const { code } = useEditorStore.getState()
  const { setStatus, clearRuntime, setIsStepMode } = useExecutionStore.getState()

  clearRuntime()
  clearErrorNodes()
  if (cleanupTimer !== null) { clearTimeout(cleanupTimer); cleanupTimer = null }
  setupDisconnected()
  setIsStepMode(true)

  abortController = new AbortController()
  const session = buildSession(true)
  await session.extend(new StandardExtension())
  // 스텝 모드는 delay 없이 — 사용자가 직접 속도를 제어
  session.addModule('main', code, { executionDelay: 0 })
  currentSession = session

  setStatus('stepping')
  try {
    await session.runModule('main')
    setStatus('done')
  } catch (e) {
    const isAbort = e instanceof Error && (e.name === 'AbortError' || e.name === 'Abort')
    if (isAbort) setStatus('idle')
    else {
      markErrorNode()
      useExecutionStore.getState().appendConsole(`실행 오류: ${e instanceof Error ? e.message : String(e)}`)
      setStatus('error')
    }
  } finally {
    scheduleCleanup(0)
  }
}

export function stopExecution(): void {
  abortController?.abort()
  abortController = null
}

export function pauseExecution(): void {
  currentSession?.pause()
  useExecutionStore.getState().setStatus('paused')
}

export function resumeExecution(): Promise<void> {
  useExecutionStore.getState().setStatus('running')
  return currentSession?.resume() ?? Promise.resolve()
}

// 스텝 모드: 다음 한 단계 실행
export function stepNext(): Promise<void> {
  // 다음 runningCode 이벤트까지 실행 → 자동으로 stepping 상태로 전환됨
  return currentSession?.resume() ?? Promise.resolve()
}
