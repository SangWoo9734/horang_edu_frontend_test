import type { Node } from "@xyflow/react";

export type FlowNodeType =
  | "terminal"
  | "process"
  | "decision"
  | "loop"
  | "output"
  | "function";

// loop 세부 유형
export type LoopVariant = "count" | "while" | "list";

// process 세부 유형
export type ProcessVariant = "assign" | "func-call";

export interface FlowNodeData extends Record<string, unknown> {
  label: string;
  nodeType: FlowNodeType;
  line?: number;
  astNodeId?: string;
  executing?: boolean;
  disconnected?: boolean; // 실행 흐름에서 끊긴 노드

  // 변수 할당 (process/assign)
  varName?: string;
  varValue?: string;

  // 출력 (output)
  outputContent?: string;
  outputType?: "string" | "expr"; // 'string': 따옴표 감싸기, 'expr': 변수/식 그대로

  // 조건문 (decision)
  condition?: string;

  // 반복 공통
  loopVariant?: LoopVariant;

  // 횟수 반복 (loop/count)
  loopCount?: number;

  // 조건 반복 (loop/while)
  loopCondition?: string;

  // 리스트 반복 (loop/list)
  listVar?: string;
  itemVar?: string;

  // 함수 선언 (function)
  funcName?: string;
  funcParams?: string; // "(A), (B)" 형태

  // 함수 호출 (process/func-call)
  funcCallName?: string;
  funcCallArgs?: string; // 인자들 콤마 구분

  // process 세부 유형
  processVariant?: ProcessVariant;
}

// React Flow NodeProps 제네릭에 사용하는 완전한 노드 타입
export type AppFlowNode = Node<FlowNodeData>;
