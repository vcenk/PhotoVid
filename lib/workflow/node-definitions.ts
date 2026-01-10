import {
  Type,
  Image as ImageIcon,
  Video,
  Music,
  Mic2,
  Wand2,
  ZoomIn,
  Paintbrush,
  Download,
  FileInput
} from 'lucide-react';
import { NodeDefinition } from './types';

// Node Definitions Registry
export const NODE_DEFINITIONS: Record<string, NodeDefinition> = {
  // ===== INPUT NODES =====
  'input-prompt': {
    type: 'input-prompt',
    category: 'input',
    label: 'Prompt Input',
    description: 'Text prompt for AI generation',
    icon: Type,
    color: 'emerald',
    inputs: [],
    outputs: [
      { id: 'prompt', label: 'Prompt', type: 'prompt' }
    ],
    parameters: [
      {
        id: 'text',
        label: 'Prompt',
        type: 'text',
        defaultValue: ''
      }
    ]
  },

  'input-image': {
    type: 'input-image',
    category: 'input',
    label: 'Image Input',
    description: 'Upload or select an image',
    icon: ImageIcon,
    color: 'blue',
    inputs: [],
    outputs: [
      { id: 'image', label: 'Image', type: 'image' }
    ],
    parameters: []
  },

  'input-video': {
    type: 'input-video',
    category: 'input',
    label: 'Video Input',
    description: 'Upload or select a video',
    icon: Video,
    color: 'purple',
    inputs: [],
    outputs: [
      { id: 'video', label: 'Video', type: 'video' }
    ],
    parameters: []
  },

  'input-audio': {
    type: 'input-audio',
    category: 'input',
    label: 'Audio Input',
    description: 'Upload or select audio',
    icon: Music,
    color: 'pink',
    inputs: [],
    outputs: [
      { id: 'audio', label: 'Audio', type: 'audio' }
    ],
    parameters: []
  },

  // ===== PROCESSING NODES =====
  'gen-text-to-image': {
    type: 'gen-text-to-image',
    category: 'processing',
    label: 'Text to Image',
    description: 'Generate image from text using Flux',
    icon: Wand2,
    color: 'indigo',
    inputs: [
      { id: 'prompt', label: 'Prompt', type: 'prompt', required: true }
    ],
    outputs: [
      { id: 'image', label: 'Image', type: 'image' }
    ],
    parameters: [
      {
        id: 'model',
        label: 'Model',
        type: 'select',
        defaultValue: 'flux-dev',
        options: [
          { value: 'flux-dev', label: 'Flux Dev' },
          { value: 'flux-pro', label: 'Flux Pro' },
          { value: 'flux-schnell', label: 'Flux Schnell' }
        ]
      },
      {
        id: 'width',
        label: 'Width',
        type: 'select',
        defaultValue: '1024',
        options: [
          { value: '512', label: '512px' },
          { value: '768', label: '768px' },
          { value: '1024', label: '1024px' },
          { value: '1536', label: '1536px' }
        ]
      },
      {
        id: 'height',
        label: 'Height',
        type: 'select',
        defaultValue: '1024',
        options: [
          { value: '512', label: '512px' },
          { value: '768', label: '768px' },
          { value: '1024', label: '1024px' },
          { value: '1536', label: '1536px' }
        ]
      },
      {
        id: 'steps',
        label: 'Steps',
        type: 'slider',
        defaultValue: 28,
        min: 1,
        max: 50,
        step: 1
      }
    ]
  },

  'gen-image-to-video': {
    type: 'gen-image-to-video',
    category: 'processing',
    label: 'Image to Video',
    description: 'Animate image using Kling AI',
    icon: Video,
    color: 'violet',
    inputs: [
      { id: 'image', label: 'Image', type: 'image', required: true },
      { id: 'prompt', label: 'Motion Prompt', type: 'prompt' }
    ],
    outputs: [
      { id: 'video', label: 'Video', type: 'video' }
    ],
    parameters: [
      {
        id: 'duration',
        label: 'Duration',
        type: 'select',
        defaultValue: '5',
        options: [
          { value: '5', label: '5 seconds' },
          { value: '10', label: '10 seconds' }
        ]
      },
      {
        id: 'aspect_ratio',
        label: 'Aspect Ratio',
        type: 'select',
        defaultValue: '16:9',
        options: [
          { value: '16:9', label: '16:9' },
          { value: '9:16', label: '9:16 (Vertical)' },
          { value: '1:1', label: '1:1 (Square)' }
        ]
      }
    ]
  },

  'gen-upscale': {
    type: 'gen-upscale',
    category: 'processing',
    label: 'Upscale Image',
    description: 'Enhance image resolution',
    icon: ZoomIn,
    color: 'cyan',
    inputs: [
      { id: 'image', label: 'Image', type: 'image', required: true }
    ],
    outputs: [
      { id: 'image', label: 'Upscaled', type: 'image' }
    ],
    parameters: [
      {
        id: 'scale',
        label: 'Scale Factor',
        type: 'select',
        defaultValue: '2',
        options: [
          { value: '2', label: '2x' },
          { value: '4', label: '4x' }
        ]
      }
    ]
  },

  'gen-inpaint': {
    type: 'gen-inpaint',
    category: 'processing',
    label: 'Inpaint',
    description: 'Edit parts of an image',
    icon: Paintbrush,
    color: 'amber',
    inputs: [
      { id: 'image', label: 'Image', type: 'image', required: true },
      { id: 'prompt', label: 'Edit Prompt', type: 'prompt', required: true }
    ],
    outputs: [
      { id: 'image', label: 'Edited Image', type: 'image' }
    ],
    parameters: []
  },

  'gen-lipsync': {
    type: 'gen-lipsync',
    category: 'processing',
    label: 'Lipsync',
    description: 'Sync lips to audio',
    icon: Mic2,
    color: 'rose',
    inputs: [
      { id: 'image', label: 'Portrait', type: 'image' },
      { id: 'video', label: 'Video', type: 'video' },
      { id: 'audio', label: 'Audio', type: 'audio' }
    ],
    outputs: [
      { id: 'video', label: 'Synced Video', type: 'video' }
    ],
    parameters: [
      {
        id: 'model',
        label: 'Model',
        type: 'select',
        defaultValue: 'sync-labs',
        options: [
          { value: 'sync-labs', label: 'Sync Labs 2.0' },
          { value: 'kling-lipsync', label: 'Kling LipSync' }
        ]
      }
    ]
  },

  // ===== OUTPUT NODES =====
  'output-preview': {
    type: 'output-preview',
    category: 'output',
    label: 'Preview',
    description: 'Preview and download result',
    icon: Download,
    color: 'zinc',
    inputs: [
      { id: 'image', label: 'Image', type: 'image' },
      { id: 'video', label: 'Video', type: 'video' },
      { id: 'audio', label: 'Audio', type: 'audio' }
    ],
    outputs: [],
    parameters: []
  }
};

// Helper to get nodes by category
export const getNodesByCategory = (category: 'input' | 'processing' | 'output') => {
  return Object.values(NODE_DEFINITIONS).filter(node => node.category === category);
};

// Helper to get node definition
export const getNodeDefinition = (type: string): NodeDefinition | undefined => {
  return NODE_DEFINITIONS[type];
};
