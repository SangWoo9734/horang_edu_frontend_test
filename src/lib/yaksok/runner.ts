import { YaksokSession } from '@dalbit-yaksok/core'
import { StandardExtension } from '@dalbit-yaksok/standard'
import { useEditorStore } from '../../stores/editor-store'
import { useExecutionStore } from '../../stores/execution-store'
import { useFlowchartStore } from '../../stores/flowchart-store'
import { findNodeIdByLine } from '../flowchart/highlight'

let abortController: AbortController | null = null
let currentSession: YaksokSession | null = null

export async function startExecution(): Promise<void> {
  const { code } = useEditorStore.getState()
  const { executionDelay, setStatus, appendConsole, setVariable, clearRuntime } =
    useExecutionStore.getState()
  const { setExecutingNodeId } = useFlowchartStore.getState()
  const { setExecutingLine } = useEditorStore.getState()

  clearRuntime()
  abortController = new AbortController()

  const session = new YaksokSession({
    stdout: (msg) => appendConsole(msg),
    stderr: (_msg, err) => appendConsole(`오류: ${err.message}`),
    signal: abortController.signal,
    events: {
      runningCode: (start) => {
        setExecutingLine(start.line)
        const nodes = useFlowchartStore.getState().nodes
        const nodeId = findNodeIdByLine(nodes, start.line)
        setExecutingNodeId(nodeId)
      },
      variableSet: ({ name, value }) => {
        setVariable(name, value.toString())
      },
    },
  })

  await session.extend(new StandardExtension())
  session.addModule('main', code, { executionDelay })
  currentSession = session

  setStatus('running')
  try {
    await session.runModule('main')
    setStatus('done')
  } catch (e) {
    const isAbort = e instanceof Error && (e.name === 'AbortError' || e.name === 'Abort')
    if (isAbort) {
      setStatus('idle')
    } else {
      appendConsole(`실행 오류: ${e instanceof Error ? e.message : String(e)}`)
      setStatus('error')
    }
  } finally {
    setExecutingLine(null)
    setExecutingNodeId(null)
    currentSession = null
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
