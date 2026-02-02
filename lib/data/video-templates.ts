/**
 * Video Template Configurations
 * Defines styling and theming for property video templates
 */

import { TemplateConfig, VideoTemplate } from '@/lib/types/video-project';

export const VIDEO_TEMPLATES: Record<VideoTemplate, TemplateConfig> = {
  modern: {
    id: 'modern',
    name: 'Modern',
    description: 'Clean, minimal design with contemporary styling',
    thumbnail: '/templates/modern-preview.jpg',
    colors: {
      primary: '#18181b',     // zinc-900
      secondary: '#27272a',   // zinc-800
      accent: '#8b5cf6',      // violet-500
      background: '#09090b',  // zinc-950
      text: '#fafafa',        // zinc-50
    },
    fonts: {
      heading: 'Inter',
      body: 'Inter',
    },
  },
  luxury: {
    id: 'luxury',
    name: 'Luxury',
    description: 'Elegant gold accents with refined typography',
    thumbnail: '/templates/luxury-preview.jpg',
    colors: {
      primary: '#1c1917',     // stone-900
      secondary: '#292524',   // stone-800
      accent: '#d4af37',      // gold
      background: '#0c0a09',  // stone-950
      text: '#fafaf9',        // stone-50
    },
    fonts: {
      heading: 'Playfair Display',
      body: 'Inter',
    },
  },
  minimal: {
    id: 'minimal',
    name: 'Minimal',
    description: 'Ultra-clean with maximum whitespace',
    thumbnail: '/templates/minimal-preview.jpg',
    colors: {
      primary: '#ffffff',
      secondary: '#f4f4f5',   // zinc-100
      accent: '#18181b',      // zinc-900
      background: '#ffffff',
      text: '#18181b',        // zinc-900
    },
    fonts: {
      heading: 'Inter',
      body: 'Inter',
    },
  },
  bold: {
    id: 'bold',
    name: 'Bold',
    description: 'High contrast with impactful typography',
    thumbnail: '/templates/bold-preview.jpg',
    colors: {
      primary: '#000000',
      secondary: '#18181b',
      accent: '#ef4444',      // red-500
      background: '#000000',
      text: '#ffffff',
    },
    fonts: {
      heading: 'Inter',
      body: 'Inter',
    },
  },
  elegant: {
    id: 'elegant',
    name: 'Elegant',
    description: 'Sophisticated serif fonts with navy tones',
    thumbnail: '/templates/elegant-preview.jpg',
    colors: {
      primary: '#1e3a5f',     // navy
      secondary: '#2c4a6e',
      accent: '#f5f0e1',      // cream
      background: '#0f172a',  // slate-900
      text: '#f8fafc',        // slate-50
    },
    fonts: {
      heading: 'Playfair Display',
      body: 'Inter',
    },
  },
};

// Get template config by ID
export function getTemplateConfig(templateId: VideoTemplate): TemplateConfig {
  return VIDEO_TEMPLATES[templateId] || VIDEO_TEMPLATES.modern;
}

// Get all templates as array for UI
export function getAllTemplates(): TemplateConfig[] {
  return Object.values(VIDEO_TEMPLATES);
}

// Get available template IDs
export function getTemplateIds(): VideoTemplate[] {
  return Object.keys(VIDEO_TEMPLATES) as VideoTemplate[];
}
