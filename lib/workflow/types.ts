// Workflow and Node Type Definitions for ComfyUI-style system

export type NodeDataType = 'prompt' | 'image' | 'video' | 'audio' | 'number' | 'boolean' | 'any';

export interface NodePort {
  id: string;
  label: string;
  type: NodeDataType;
  required?: boolean;
}

export interface NodeDefinition {
  type: string;
  category: 'input' | 'processing' | 'output';
  label: string;
  description: string;
  icon: any; // Lucide icon component
  color: string; // Tailwind color class
  inputs: NodePort[];
  outputs: NodePort[];
  parameters?: NodeParameter[];
}

export interface NodeParameter {
  id: string;
  label: string;
  type: 'text' | 'number' | 'select' | 'slider' | 'boolean';
  defaultValue: any;
  options?: { value: string; label: string }[];
  min?: number;
  max?: number;
  step?: number;
}

export interface WorkflowNode {
  id: string;
  type: string;
  position: { x: number; y: number };
  data: {
    label: string;
    parameters: Record<string, any>;
    status?: 'idle' | 'running' | 'completed' | 'error';
    output?: any;
    error?: string;
  };
}

export interface WorkflowEdge {
  id: string;
  source: string;
  sourceHandle: string;
  target: string;
  targetHandle: string;
  type?: string;
}

export interface Workflow {
  id: string;
  name: string;
  description: string;
  thumbnail?: string;
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
  createdAt: string;
  updatedAt: string;
}

export interface WorkflowTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  thumbnail: string;
  nodes: Omit<WorkflowNode, 'id'>[];
  edges: Omit<WorkflowEdge, 'id'>[];
  tags: string[];
}

// Execution types
export interface NodeExecutionContext {
  inputs: Record<string, any>;
  parameters: Record<string, any>;
  onProgress?: (progress: number) => void;
}

export interface NodeExecutionResult {
  outputs: Record<string, any>;
  error?: string;
}
