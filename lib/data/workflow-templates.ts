import { Node, Edge } from '@xyflow/react';
import {
  Type,
  Image,
  Video,
  Music,
  Wand2,
  Play,
  Maximize2,
  Paintbrush,
  Languages
} from 'lucide-react';

/**
 * Workflow Templates
 * Pre-configured workflows that users can start with
 */

export interface WorkflowTemplate {
  id: string;
  name: string;
  description: string;
  category: 'content-creation' | 'image-editing' | 'video-creation' | 'advanced';
  icon: any;
  nodes: Node[];
  edges: Edge[];
  thumbnail?: string;
}

export const WORKFLOW_TEMPLATES: WorkflowTemplate[] = [
  {
    id: 'text-to-video',
    name: 'Text to Video',
    description: 'Generate a video from a text prompt in two steps: text → image → video',
    category: 'content-creation',
    icon: Video,
    nodes: [
      {
        id: 'prompt-1',
        type: 'input-prompt',
        position: { x: 50, y: 200 },
        data: {
          label: 'Prompt Input',
          parameters: { text: 'A serene mountain landscape at sunset' },
          status: 'idle',
          onChange: () => {}
        }
      },
      {
        id: 'text-to-image-1',
        type: 'gen-text-to-image',
        position: { x: 350, y: 200 },
        data: {
          label: 'Text to Image',
          parameters: { model: 'flux-dev', size: 'landscape_16_9', steps: 28 },
          status: 'idle',
          onChange: () => {}
        }
      },
      {
        id: 'image-to-video-1',
        type: 'gen-image-to-video',
        position: { x: 700, y: 200 },
        data: {
          label: 'Image to Video',
          parameters: { duration: '5', aspect_ratio: '16:9' },
          status: 'idle',
          onChange: () => {}
        }
      },
      {
        id: 'preview-1',
        type: 'output-preview',
        position: { x: 1100, y: 200 },
        data: {
          label: 'Preview',
          parameters: {},
          status: 'idle',
          onChange: () => {}
        }
      }
    ],
    edges: [
      { id: 'e1-2', source: 'prompt-1', target: 'text-to-image-1', sourceHandle: 'prompt', targetHandle: 'prompt' },
      { id: 'e2-3', source: 'text-to-image-1', target: 'image-to-video-1', sourceHandle: 'image', targetHandle: 'image' },
      { id: 'e3-4', source: 'image-to-video-1', target: 'preview-1', sourceHandle: 'video', targetHandle: 'video' }
    ]
  },
  {
    id: 'image-upscale',
    name: 'Image Upscaler',
    description: 'Enhance and upscale an image with AI',
    category: 'image-editing',
    icon: Maximize2,
    nodes: [
      {
        id: 'image-input-1',
        type: 'input-image',
        position: { x: 50, y: 200 },
        data: {
          label: 'Image Input',
          parameters: {},
          status: 'idle',
          onChange: () => {}
        }
      },
      {
        id: 'upscale-1',
        type: 'gen-upscale',
        position: { x: 400, y: 200 },
        data: {
          label: 'Upscale',
          parameters: { scale: '4', model: 'clarity-upscaler' },
          status: 'idle',
          onChange: () => {}
        }
      },
      {
        id: 'preview-1',
        type: 'output-preview',
        position: { x: 750, y: 200 },
        data: {
          label: 'Preview',
          parameters: {},
          status: 'idle',
          onChange: () => {}
        }
      }
    ],
    edges: [
      { id: 'e1-2', source: 'image-input-1', target: 'upscale-1', sourceHandle: 'image', targetHandle: 'image' },
      { id: 'e2-3', source: 'upscale-1', target: 'preview-1', sourceHandle: 'image', targetHandle: 'image' }
    ]
  },
  {
    id: 'video-dubbing',
    name: 'Video Dubbing',
    description: 'Translate a video to another language with voice cloning',
    category: 'video-creation',
    icon: Languages,
    nodes: [
      {
        id: 'video-input-1',
        type: 'input-video',
        position: { x: 50, y: 250 },
        data: {
          label: 'Source Video',
          parameters: {},
          status: 'idle',
          onChange: () => {}
        }
      },
      {
        id: 'dubbing-1',
        type: 'gen-dubbing',
        position: { x: 400, y: 250 },
        data: {
          label: 'AI Dubbing',
          parameters: { targetLanguage: 'es' },
          status: 'idle',
          onChange: () => {}
        }
      },
      {
        id: 'preview-1',
        type: 'output-preview',
        position: { x: 750, y: 250 },
        data: {
          label: 'Preview',
          parameters: {},
          status: 'idle',
          onChange: () => {}
        }
      }
    ],
    edges: [
      { id: 'e1-2', source: 'video-input-1', target: 'dubbing-1', sourceHandle: 'video', targetHandle: 'video' },
      { id: 'e2-3', source: 'dubbing-1', target: 'preview-1', sourceHandle: 'video', targetHandle: 'video' }
    ]
  },
  {
    id: 'image-inpaint',
    name: 'AI Inpainting',
    description: 'Edit or replace parts of an image with AI',
    category: 'image-editing',
    icon: Paintbrush,
    nodes: [
      {
        id: 'image-input-1',
        type: 'input-image',
        position: { x: 50, y: 150 },
        data: {
          label: 'Image Input',
          parameters: {},
          status: 'idle',
          onChange: () => {}
        }
      },
      {
        id: 'prompt-1',
        type: 'input-prompt',
        position: { x: 50, y: 350 },
        data: {
          label: 'Inpaint Prompt',
          parameters: { text: 'A red sports car' },
          status: 'idle',
          onChange: () => {}
        }
      },
      {
        id: 'inpaint-1',
        type: 'gen-inpaint',
        position: { x: 400, y: 250 },
        data: {
          label: 'Inpaint',
          parameters: { strength: 0.8, guidance_scale: 7.5, mask_mode: 'auto' },
          status: 'idle',
          onChange: () => {}
        }
      },
      {
        id: 'preview-1',
        type: 'output-preview',
        position: { x: 750, y: 250 },
        data: {
          label: 'Preview',
          parameters: {},
          status: 'idle',
          onChange: () => {}
        }
      }
    ],
    edges: [
      { id: 'e1-3', source: 'image-input-1', target: 'inpaint-1', sourceHandle: 'image', targetHandle: 'image' },
      { id: 'e2-3', source: 'prompt-1', target: 'inpaint-1', sourceHandle: 'prompt', targetHandle: 'prompt' },
      { id: 'e3-4', source: 'inpaint-1', target: 'preview-1', sourceHandle: 'image', targetHandle: 'image' }
    ]
  },
  {
    id: 'complete-video-pipeline',
    name: 'Complete Video Pipeline',
    description: 'Full pipeline: prompt → image → upscale → video',
    category: 'advanced',
    icon: Wand2,
    nodes: [
      {
        id: 'prompt-1',
        type: 'input-prompt',
        position: { x: 50, y: 200 },
        data: {
          label: 'Scene Prompt',
          parameters: { text: 'Cinematic shot of a luxury modern home exterior' },
          status: 'idle',
          onChange: () => {}
        }
      },
      {
        id: 'text-to-image-1',
        type: 'gen-text-to-image',
        position: { x: 350, y: 200 },
        data: {
          label: 'Generate Image',
          parameters: { model: 'flux-dev', size: 'landscape_16_9', steps: 28 },
          status: 'idle',
          onChange: () => {}
        }
      },
      {
        id: 'upscale-1',
        type: 'gen-upscale',
        position: { x: 650, y: 200 },
        data: {
          label: 'Upscale',
          parameters: { scale: '2', model: 'clarity-upscaler' },
          status: 'idle',
          onChange: () => {}
        }
      },
      {
        id: 'video-1',
        type: 'gen-image-to-video',
        position: { x: 950, y: 200 },
        data: {
          label: 'Generate Video',
          parameters: { duration: 5, motion: 'smooth' },
          status: 'idle',
          onChange: () => {}
        }
      },
      {
        id: 'preview-1',
        type: 'output-preview',
        position: { x: 1250, y: 200 },
        data: {
          label: 'Final Preview',
          parameters: {},
          status: 'idle',
          onChange: () => {}
        }
      }
    ],
    edges: [
      { id: 'e1-2', source: 'prompt-1', target: 'text-to-image-1', sourceHandle: 'prompt', targetHandle: 'prompt' },
      { id: 'e2-3', source: 'text-to-image-1', target: 'upscale-1', sourceHandle: 'image', targetHandle: 'image' },
      { id: 'e3-4', source: 'upscale-1', target: 'video-1', sourceHandle: 'image', targetHandle: 'image' },
      { id: 'e4-5', source: 'video-1', target: 'preview-1', sourceHandle: 'video', targetHandle: 'video' }
    ]
  }
];

// Helper function to get templates by category
export function getTemplatesByCategory(category: WorkflowTemplate['category']): WorkflowTemplate[] {
  return WORKFLOW_TEMPLATES.filter(t => t.category === category);
}

// Helper function to create a deep copy of a template (for loading into canvas)
export function cloneTemplate(template: WorkflowTemplate): { nodes: Node[]; edges: Edge[] } {
  return {
    nodes: JSON.parse(JSON.stringify(template.nodes)),
    edges: JSON.parse(JSON.stringify(template.edges))
  };
}
