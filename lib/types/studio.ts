import { LucideIcon } from 'lucide-react';

export type IndustryId = 'real-estate' | 'ecommerce' | 'restaurant' | 'agency' | 'creator';
export type WorkflowId = string;

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
