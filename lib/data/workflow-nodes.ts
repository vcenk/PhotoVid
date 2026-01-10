import { Node, Edge } from '@xyflow/react';
import { Upload, Wand2, Palette, Image, Video, Download, FileImage, Sliders, Sparkles } from 'lucide-react';

/**
 * Node Types for Workflow Editor
 * Inspired by Rivet's visual programming approach
 */

export type NodeType =
  | 'input'        // Image/Video upload
  | 'prompt'       // Text prompt input
  | 'model'        // AI model selection
  | 'style'        // Style preset application
  | 'parameters'   // Fine-tune parameters
  | 'enhance'      // Enhancement node (HDR, upscale, etc.)
  | 'output';      // Final output/download

export type DataType = 'image' | 'video' | 'text' | 'parameters' | 'style' | 'any';

export interface NodePort {
  id: string;
  label: string;
  type: DataType;
  required?: boolean;
}

export interface WorkflowNodeData {
  label: string;
  description?: string;
  icon: any;
  inputs: NodePort[];
  outputs: NodePort[];
  config?: Record<string, any>;
  status?: 'idle' | 'processing' | 'completed' | 'error';
  progress?: number;
}

export interface WorkflowNode extends Node {
  type: NodeType;
  data: WorkflowNodeData;
}

// NODE TYPE DEFINITIONS

export const NODE_DEFINITIONS: Record<NodeType, Omit<WorkflowNodeData, 'status' | 'progress'>> = {
  input: {
    label: 'Image/Video Input',
    description: 'Upload or select media files',
    icon: Upload,
    inputs: [],
    outputs: [
      { id: 'media', label: 'Media', type: 'image' }
    ],
    config: {
      acceptedTypes: ['image/png', 'image/jpeg', 'video/mp4'],
      maxFiles: 10,
      files: [],
    },
  },

  prompt: {
    label: 'Prompt',
    description: 'Describe what you want to generate or modify',
    icon: FileImage,
    inputs: [],
    outputs: [
      { id: 'text', label: 'Prompt Text', type: 'text' }
    ],
    config: {
      prompt: '',
      negativePrompt: '',
    },
  },

  model: {
    label: 'AI Model',
    description: 'Select AI model for generation',
    icon: Sparkles,
    inputs: [
      { id: 'media', label: 'Input Media', type: 'image', required: false },
      { id: 'prompt', label: 'Prompt', type: 'text', required: true },
      { id: 'style', label: 'Style', type: 'style', required: false },
    ],
    outputs: [
      { id: 'result', label: 'Generated Media', type: 'image' }
    ],
    config: {
      modelId: 'flux-dev',
      mode: 'image',
      strength: 0.8,
    },
  },

  style: {
    label: 'Style Preset',
    description: 'Apply industry-specific styling',
    icon: Palette,
    inputs: [
      { id: 'base', label: 'Base Input', type: 'any', required: false },
    ],
    outputs: [
      { id: 'styled', label: 'Styled Output', type: 'style' }
    ],
    config: {
      presetId: null,
      industry: 'real-estate',
      customModifiers: '',
    },
  },

  parameters: {
    label: 'Parameters',
    description: 'Fine-tune generation settings',
    icon: Sliders,
    inputs: [],
    outputs: [
      { id: 'params', label: 'Parameters', type: 'parameters' }
    ],
    config: {
      steps: 30,
      guidance_scale: 7.5,
      seed: null,
      aspectRatio: '16:9',
    },
  },

  enhance: {
    label: 'Enhance',
    description: 'Upscale, denoise, or enhance quality',
    icon: Wand2,
    inputs: [
      { id: 'media', label: 'Input Media', type: 'image', required: true },
    ],
    outputs: [
      { id: 'enhanced', label: 'Enhanced Media', type: 'image' }
    ],
    config: {
      enhanceType: 'upscale',
      scale: 2,
      denoise: 0.5,
    },
  },

  output: {
    label: 'Output',
    description: 'Final result and download',
    icon: Download,
    inputs: [
      { id: 'final', label: 'Final Media', type: 'any', required: true },
    ],
    outputs: [],
    config: {
      format: 'png',
      quality: 95,
      downloadReady: false,
    },
  },
};

// WORKFLOW TEMPLATES

export interface WorkflowTemplate {
  id: string;
  name: string;
  description: string;
  industry: 'real-estate' | 'hospitality' | 'retail' | 'all';
  nodes: WorkflowNode[];
  edges: Edge[];
  thumbnail?: string;
}

export const WORKFLOW_TEMPLATES: WorkflowTemplate[] = [
  {
    id: 'simple-generation',
    name: 'Simple Generation',
    description: 'Basic text-to-image workflow',
    industry: 'all',
    nodes: [
      {
        id: 'prompt-1',
        type: 'prompt',
        position: { x: 100, y: 200 },
        data: {
          ...NODE_DEFINITIONS.prompt,
          status: 'idle',
        },
      },
      {
        id: 'model-1',
        type: 'model',
        position: { x: 400, y: 200 },
        data: {
          ...NODE_DEFINITIONS.model,
          status: 'idle',
        },
      },
      {
        id: 'output-1',
        type: 'output',
        position: { x: 700, y: 200 },
        data: {
          ...NODE_DEFINITIONS.output,
          status: 'idle',
        },
      },
    ],
    edges: [
      { id: 'e1-2', source: 'prompt-1', target: 'model-1', sourceHandle: 'text', targetHandle: 'prompt' },
      { id: 'e2-3', source: 'model-1', target: 'output-1', sourceHandle: 'result', targetHandle: 'final' },
    ],
  },

  {
    id: 'styled-generation',
    name: 'Styled Generation',
    description: 'Generate with industry-specific style presets',
    industry: 'all',
    nodes: [
      {
        id: 'prompt-1',
        type: 'prompt',
        position: { x: 100, y: 150 },
        data: {
          ...NODE_DEFINITIONS.prompt,
          status: 'idle',
        },
      },
      {
        id: 'style-1',
        type: 'style',
        position: { x: 100, y: 300 },
        data: {
          ...NODE_DEFINITIONS.style,
          status: 'idle',
        },
      },
      {
        id: 'model-1',
        type: 'model',
        position: { x: 400, y: 200 },
        data: {
          ...NODE_DEFINITIONS.model,
          status: 'idle',
        },
      },
      {
        id: 'output-1',
        type: 'output',
        position: { x: 700, y: 200 },
        data: {
          ...NODE_DEFINITIONS.output,
          status: 'idle',
        },
      },
    ],
    edges: [
      { id: 'e1-3', source: 'prompt-1', target: 'model-1', sourceHandle: 'text', targetHandle: 'prompt' },
      { id: 'e2-3', source: 'style-1', target: 'model-1', sourceHandle: 'styled', targetHandle: 'style' },
      { id: 'e3-4', source: 'model-1', target: 'output-1', sourceHandle: 'result', targetHandle: 'final' },
    ],
  },

  {
    id: 'image-to-image',
    name: 'Image to Image',
    description: 'Transform existing images with AI',
    industry: 'all',
    nodes: [
      {
        id: 'input-1',
        type: 'input',
        position: { x: 100, y: 100 },
        data: {
          ...NODE_DEFINITIONS.input,
          status: 'idle',
        },
      },
      {
        id: 'prompt-1',
        type: 'prompt',
        position: { x: 100, y: 250 },
        data: {
          ...NODE_DEFINITIONS.prompt,
          status: 'idle',
        },
      },
      {
        id: 'model-1',
        type: 'model',
        position: { x: 400, y: 200 },
        data: {
          ...NODE_DEFINITIONS.model,
          config: {
            ...NODE_DEFINITIONS.model.config,
            mode: 'edit',
          },
          status: 'idle',
        },
      },
      {
        id: 'enhance-1',
        type: 'enhance',
        position: { x: 700, y: 200 },
        data: {
          ...NODE_DEFINITIONS.enhance,
          status: 'idle',
        },
      },
      {
        id: 'output-1',
        type: 'output',
        position: { x: 1000, y: 200 },
        data: {
          ...NODE_DEFINITIONS.output,
          status: 'idle',
        },
      },
    ],
    edges: [
      { id: 'e1-3', source: 'input-1', target: 'model-1', sourceHandle: 'media', targetHandle: 'media' },
      { id: 'e2-3', source: 'prompt-1', target: 'model-1', sourceHandle: 'text', targetHandle: 'prompt' },
      { id: 'e3-4', source: 'model-1', target: 'enhance-1', sourceHandle: 'result', targetHandle: 'media' },
      { id: 'e4-5', source: 'enhance-1', target: 'output-1', sourceHandle: 'enhanced', targetHandle: 'final' },
    ],
  },

  {
    id: 're-virtual-staging',
    name: 'Virtual Staging (Real Estate)',
    description: 'Add furniture to empty rooms',
    industry: 'real-estate',
    nodes: [
      {
        id: 'input-1',
        type: 'input',
        position: { x: 100, y: 150 },
        data: {
          ...NODE_DEFINITIONS.input,
          label: 'Empty Room Photo',
          status: 'idle',
        },
      },
      {
        id: 'prompt-1',
        type: 'prompt',
        position: { x: 100, y: 300 },
        data: {
          ...NODE_DEFINITIONS.prompt,
          config: {
            prompt: 'modern furniture, tasteful decor, staged home',
            negativePrompt: 'cluttered, outdated',
          },
          status: 'idle',
        },
      },
      {
        id: 'style-1',
        type: 'style',
        position: { x: 100, y: 450 },
        data: {
          ...NODE_DEFINITIONS.style,
          config: {
            presetId: 're-virtual-staging',
            industry: 'real-estate',
            customModifiers: '',
          },
          status: 'idle',
        },
      },
      {
        id: 'model-1',
        type: 'model',
        position: { x: 450, y: 250 },
        data: {
          ...NODE_DEFINITIONS.model,
          config: {
            modelId: 'flux-dev',
            mode: 'edit',
            strength: 0.9,
          },
          status: 'idle',
        },
      },
      {
        id: 'output-1',
        type: 'output',
        position: { x: 800, y: 250 },
        data: {
          ...NODE_DEFINITIONS.output,
          status: 'idle',
        },
      },
    ],
    edges: [
      { id: 'e1-4', source: 'input-1', target: 'model-1', sourceHandle: 'media', targetHandle: 'media' },
      { id: 'e2-4', source: 'prompt-1', target: 'model-1', sourceHandle: 'text', targetHandle: 'prompt' },
      { id: 'e3-4', source: 'style-1', target: 'model-1', sourceHandle: 'styled', targetHandle: 'style' },
      { id: 'e4-5', source: 'model-1', target: 'output-1', sourceHandle: 'result', targetHandle: 'final' },
    ],
  },
];

// NODE COLOR SCHEME
export const NODE_COLORS: Record<NodeType, { bg: string; border: string; text: string }> = {
  input: { bg: 'bg-blue-50 dark:bg-blue-950/30', border: 'border-blue-500', text: 'text-blue-700 dark:text-blue-400' },
  prompt: { bg: 'bg-purple-50 dark:bg-purple-950/30', border: 'border-purple-500', text: 'text-purple-700 dark:text-purple-400' },
  model: { bg: 'bg-violet-50 dark:bg-violet-950/30', border: 'border-violet-500', text: 'text-violet-700 dark:text-violet-400' },
  style: { bg: 'bg-pink-50 dark:bg-pink-950/30', border: 'border-pink-500', text: 'text-pink-700 dark:text-pink-400' },
  parameters: { bg: 'bg-amber-50 dark:bg-amber-950/30', border: 'border-amber-500', text: 'text-amber-700 dark:text-amber-400' },
  enhance: { bg: 'bg-emerald-50 dark:bg-emerald-950/30', border: 'border-emerald-500', text: 'text-emerald-700 dark:text-emerald-400' },
  output: { bg: 'bg-zinc-50 dark:bg-zinc-900', border: 'border-zinc-500', text: 'text-zinc-700 dark:text-zinc-400' },
};
