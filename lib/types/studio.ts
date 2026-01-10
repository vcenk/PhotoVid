import { LucideIcon } from 'lucide-react';

export type IndustryId = 'real-estate' | 'ecommerce' | 'restaurant' | 'agency' | 'creator' | 'architecture' | 'automotive' | 'fitness';
export type WorkflowId = string;
export type TemplateId = string;

export type MotionStyle = 'slow-zoom-in' | 'slow-zoom-out' | 'dolly-forward' | 'dolly-backward' | 'pan-left' | 'pan-right' | 'orbit-360' | 'parallax' | 'tilt-up' | 'tilt-down' | 'dramatic-reveal' | 'cinematic-sweep';

export type StylePreset = 'cinematic' | 'modern' | 'luxury' | 'minimal' | 'vibrant' | 'moody' | 'warm' | 'cool' | 'professional' | 'dramatic';

export interface WorkflowStep {
  id: string;
  title: string;
  description: string;
  type: 'upload' | 'configure' | 'generate' | 'review';
}

export interface Workflow {
  id: WorkflowId;
  name: string;
  description: string;
  industryId: IndustryId;
  icon: LucideIcon;
  steps: WorkflowStep[];
  requiredFiles: number;
  estimatedCredits: number;
  previewImage?: string;
}

export interface Industry {
  id: IndustryId;
  name: string;
  icon: LucideIcon;
  description: string;
  workflows: Workflow[];
  color?: string;
  gradient?: string;
}

export interface Project {
  id: string;
  name: string;
  userId: string;
  industryId: IndustryId;
  mode: 'wizard' | 'canvas';
  createdAt: string;
  updatedAt: string;
}

export interface Template {
  id: TemplateId;
  name: string;
  description: string;
  industryId: IndustryId;
  category: string;
  thumbnailUrl: string;
  beforeImageUrl: string;
  afterVideoUrl: string;
  prompt: string;
  negativePrompt?: string;
  motionStyle: MotionStyle;
  stylePreset: StylePreset;
  duration: number;
  credits: number;
  isPremium: boolean;
  isNew: boolean;
  isTrending: boolean;
  usageCount: number;
  rating: number;
  tags: string[];
}

export interface PromptSuggestion {
  id: string;
  industryId: IndustryId;
  category: string;
  title: string;
  prompt: string;
  icon: string;
  description: string;
}

export interface BeforeAfterCard {
  id: string;
  title: string;
  industryId: IndustryId;
  beforeUrl: string;
  afterUrl: string;
  description: string;
  templateId?: TemplateId;
}

export interface TemplateFilters {
  industry?: IndustryId;
  category?: string;
  stylePreset?: StylePreset;
  motionStyle?: MotionStyle;
  isPremium?: boolean;
  sortBy?: 'popular' | 'newest' | 'rating';
}
