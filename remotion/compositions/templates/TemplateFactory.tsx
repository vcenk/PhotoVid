/**
 * TemplateFactory - Dynamic template selection for PropertyVideo
 * Returns the appropriate template wrapper component based on template ID
 */

import React from 'react';
import type { VideoTemplate, ExportFormat } from '../../../lib/types/video-project';
import { ModernTemplate, MODERN_COLORS, MODERN_FONTS } from './ModernTemplate';
import { LuxuryTemplate, LUXURY_COLORS, LUXURY_FONTS } from './LuxuryTemplate';
import { MinimalTemplate, MINIMAL_COLORS, MINIMAL_FONTS } from './MinimalTemplate';
import { BoldTemplate, BOLD_COLORS, BOLD_FONTS } from './BoldTemplate';
import { ElegantTemplate, ELEGANT_COLORS, ELEGANT_FONTS } from './ElegantTemplate';

// Template props interface
export interface TemplateProps {
  children: React.ReactNode;
  format: ExportFormat;
}

// Template component type
export type TemplateComponent = React.FC<TemplateProps>;

// Template colors interface
export interface TemplateColors {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  text: string;
  textMuted: string;
}

// Template fonts interface
export interface TemplateFonts {
  heading: string;
  body: string;
}

// Template config with component and styles
export interface TemplateConfig {
  component: TemplateComponent;
  colors: TemplateColors;
  fonts: TemplateFonts;
}

// Template registry
const TEMPLATE_REGISTRY: Record<VideoTemplate, TemplateConfig> = {
  modern: {
    component: ModernTemplate,
    colors: MODERN_COLORS,
    fonts: MODERN_FONTS,
  },
  luxury: {
    component: LuxuryTemplate,
    colors: LUXURY_COLORS,
    fonts: LUXURY_FONTS,
  },
  minimal: {
    component: MinimalTemplate,
    colors: MINIMAL_COLORS,
    fonts: MINIMAL_FONTS,
  },
  bold: {
    component: BoldTemplate,
    colors: BOLD_COLORS,
    fonts: BOLD_FONTS,
  },
  elegant: {
    component: ElegantTemplate,
    colors: ELEGANT_COLORS,
    fonts: ELEGANT_FONTS,
  },
};

/**
 * Get the template component for a given template ID
 */
export function getTemplate(templateId: VideoTemplate): TemplateComponent {
  const config = TEMPLATE_REGISTRY[templateId];
  return config?.component || ModernTemplate;
}

/**
 * Get the full template config (component + colors + fonts) for a given template ID
 */
export function getTemplateConfig(templateId: VideoTemplate): TemplateConfig {
  return TEMPLATE_REGISTRY[templateId] || TEMPLATE_REGISTRY.modern;
}

/**
 * Get template colors for a given template ID
 */
export function getTemplateColors(templateId: VideoTemplate): TemplateColors {
  const config = TEMPLATE_REGISTRY[templateId];
  return config?.colors || MODERN_COLORS;
}

/**
 * Get template fonts for a given template ID
 */
export function getTemplateFonts(templateId: VideoTemplate): TemplateFonts {
  const config = TEMPLATE_REGISTRY[templateId];
  return config?.fonts || MODERN_FONTS;
}

/**
 * Get all available template IDs
 */
export function getAvailableTemplates(): VideoTemplate[] {
  return Object.keys(TEMPLATE_REGISTRY) as VideoTemplate[];
}

/**
 * Check if a template exists
 */
export function isValidTemplate(templateId: string): templateId is VideoTemplate {
  return templateId in TEMPLATE_REGISTRY;
}

export default getTemplate;
