/**
 * QuickVideoContext - State management for the Quick Video wizard
 * Manages the step-by-step flow for creating property videos
 */

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import type {
  VideoTemplate,
  ExportFormat,
  VideoPropertyData,
  VideoImage,
  AgentBranding,
} from '@/lib/types/video-project';

// Simple ID generator (no external dependencies)
const generateId = () => `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

// Step definitions
export type WizardStep = 1 | 2 | 3 | 4 | 5;

export const STEP_LABELS: Record<WizardStep, string> = {
  1: 'Template',
  2: 'Property',
  3: 'Images',
  4: 'Branding',
  5: 'Preview',
};

// Context state interface
interface QuickVideoState {
  // Wizard navigation
  currentStep: WizardStep;
  isLoading: boolean;
  error: string | null;

  // Video configuration
  templateId: VideoTemplate;
  format: ExportFormat;

  // Content
  propertyData: VideoPropertyData;
  images: VideoImage[];
  agentBranding: AgentBranding;

  // Audio
  musicTrackId: string | null;
  musicVolume: number;

  // Project tracking
  projectId: string | null;
  projectName: string;
  isDirty: boolean;
}

// Context actions interface
interface QuickVideoActions {
  // Navigation
  nextStep: () => void;
  prevStep: () => void;
  goToStep: (step: WizardStep) => void;
  canProceed: () => boolean;

  // Template & Format
  setTemplate: (templateId: VideoTemplate) => void;
  setFormat: (format: ExportFormat) => void;

  // Property Data
  updatePropertyData: (data: Partial<VideoPropertyData>) => void;
  addFeature: (feature: string) => void;
  removeFeature: (feature: string) => void;

  // Images
  addImages: (images: VideoImage[]) => void;
  removeImage: (id: string) => void;
  reorderImages: (fromIndex: number, toIndex: number) => void;
  updateImageLabel: (id: string, label: string) => void;
  updateImageDuration: (id: string, duration: number) => void;

  // Branding
  updateBranding: (data: Partial<AgentBranding>) => void;

  // Music
  setMusicTrack: (trackId: string | null) => void;
  setMusicVolume: (volume: number) => void;

  // Project
  setProjectName: (name: string) => void;
  resetProject: () => void;
  getVideoProps: () => {
    images: VideoImage[];
    propertyData: VideoPropertyData;
    agentBranding: AgentBranding;
    templateId: VideoTemplate;
    format: ExportFormat;
  };

  // Error handling
  setError: (error: string | null) => void;
  setLoading: (loading: boolean) => void;
}

// Combined context type
type QuickVideoContextType = QuickVideoState & QuickVideoActions;

// Initial state
const initialState: QuickVideoState = {
  currentStep: 1,
  isLoading: false,
  error: null,
  templateId: 'modern',
  format: 'vertical',
  propertyData: {
    address: '',
    features: [],
  },
  images: [],
  agentBranding: {
    name: '',
  },
  musicTrackId: null,
  musicVolume: 50,
  projectId: null,
  projectName: 'Untitled Video',
  isDirty: false,
};

// Create context
const QuickVideoContext = createContext<QuickVideoContextType | undefined>(undefined);

// Provider component
interface QuickVideoProviderProps {
  children: ReactNode;
}

export function QuickVideoProvider({ children }: QuickVideoProviderProps) {
  const [state, setState] = useState<QuickVideoState>(initialState);

  // Navigation actions
  const nextStep = useCallback(() => {
    setState(prev => ({
      ...prev,
      currentStep: Math.min(prev.currentStep + 1, 5) as WizardStep,
    }));
  }, []);

  const prevStep = useCallback(() => {
    setState(prev => ({
      ...prev,
      currentStep: Math.max(prev.currentStep - 1, 1) as WizardStep,
    }));
  }, []);

  const goToStep = useCallback((step: WizardStep) => {
    setState(prev => ({ ...prev, currentStep: step }));
  }, []);

  const canProceed = useCallback((): boolean => {
    const { currentStep, templateId, propertyData, images, agentBranding } = state;

    switch (currentStep) {
      case 1: // Template
        return !!templateId;
      case 2: // Property details
        return !!propertyData.address && propertyData.address.trim().length > 0;
      case 3: // Images
        return images.length >= 3; // Minimum 3 images
      case 4: // Branding
        return !!agentBranding.name && agentBranding.name.trim().length > 0;
      case 5: // Preview
        return true;
      default:
        return false;
    }
  }, [state]);

  // Template & Format
  const setTemplate = useCallback((templateId: VideoTemplate) => {
    setState(prev => ({ ...prev, templateId, isDirty: true }));
  }, []);

  const setFormat = useCallback((format: ExportFormat) => {
    setState(prev => ({ ...prev, format, isDirty: true }));
  }, []);

  // Property Data
  const updatePropertyData = useCallback((data: Partial<VideoPropertyData>) => {
    setState(prev => ({
      ...prev,
      propertyData: { ...prev.propertyData, ...data },
      isDirty: true,
    }));
  }, []);

  const addFeature = useCallback((feature: string) => {
    setState(prev => ({
      ...prev,
      propertyData: {
        ...prev.propertyData,
        features: [...prev.propertyData.features, feature],
      },
      isDirty: true,
    }));
  }, []);

  const removeFeature = useCallback((feature: string) => {
    setState(prev => ({
      ...prev,
      propertyData: {
        ...prev.propertyData,
        features: prev.propertyData.features.filter(f => f !== feature),
      },
      isDirty: true,
    }));
  }, []);

  // Images
  const addImages = useCallback((newImages: VideoImage[]) => {
    setState(prev => {
      const maxOrder = prev.images.reduce((max, img) => Math.max(max, img.order), 0);
      const imagesWithOrder = newImages.map((img, idx) => ({
        ...img,
        order: maxOrder + idx + 1,
      }));
      return {
        ...prev,
        images: [...prev.images, ...imagesWithOrder],
        isDirty: true,
      };
    });
  }, []);

  const removeImage = useCallback((id: string) => {
    setState(prev => ({
      ...prev,
      images: prev.images.filter(img => img.id !== id),
      isDirty: true,
    }));
  }, []);

  const reorderImages = useCallback((fromIndex: number, toIndex: number) => {
    setState(prev => {
      const newImages = [...prev.images];
      const [movedItem] = newImages.splice(fromIndex, 1);
      newImages.splice(toIndex, 0, movedItem);
      // Update order property
      const reordered = newImages.map((img, idx) => ({ ...img, order: idx }));
      return { ...prev, images: reordered, isDirty: true };
    });
  }, []);

  const updateImageLabel = useCallback((id: string, label: string) => {
    setState(prev => ({
      ...prev,
      images: prev.images.map(img =>
        img.id === id ? { ...img, label } : img
      ),
      isDirty: true,
    }));
  }, []);

  const updateImageDuration = useCallback((id: string, duration: number) => {
    setState(prev => ({
      ...prev,
      images: prev.images.map(img =>
        img.id === id ? { ...img, duration } : img
      ),
      isDirty: true,
    }));
  }, []);

  // Branding
  const updateBranding = useCallback((data: Partial<AgentBranding>) => {
    setState(prev => ({
      ...prev,
      agentBranding: { ...prev.agentBranding, ...data },
      isDirty: true,
    }));
  }, []);

  // Music
  const setMusicTrack = useCallback((trackId: string | null) => {
    setState(prev => ({ ...prev, musicTrackId: trackId, isDirty: true }));
  }, []);

  const setMusicVolume = useCallback((volume: number) => {
    setState(prev => ({ ...prev, musicVolume: Math.max(0, Math.min(100, volume)), isDirty: true }));
  }, []);

  // Project
  const setProjectName = useCallback((name: string) => {
    setState(prev => ({ ...prev, projectName: name, isDirty: true }));
  }, []);

  const resetProject = useCallback(() => {
    setState({
      ...initialState,
      projectId: generateId(),
    });
  }, []);

  const getVideoProps = useCallback(() => {
    return {
      images: state.images,
      propertyData: state.propertyData,
      agentBranding: state.agentBranding,
      templateId: state.templateId,
      format: state.format,
    };
  }, [state.images, state.propertyData, state.agentBranding, state.templateId, state.format]);

  // Error handling
  const setError = useCallback((error: string | null) => {
    setState(prev => ({ ...prev, error }));
  }, []);

  const setLoading = useCallback((loading: boolean) => {
    setState(prev => ({ ...prev, isLoading: loading }));
  }, []);

  const value: QuickVideoContextType = {
    ...state,
    nextStep,
    prevStep,
    goToStep,
    canProceed,
    setTemplate,
    setFormat,
    updatePropertyData,
    addFeature,
    removeFeature,
    addImages,
    removeImage,
    reorderImages,
    updateImageLabel,
    updateImageDuration,
    updateBranding,
    setMusicTrack,
    setMusicVolume,
    setProjectName,
    resetProject,
    getVideoProps,
    setError,
    setLoading,
  };

  return (
    <QuickVideoContext.Provider value={value}>
      {children}
    </QuickVideoContext.Provider>
  );
}

// Custom hook
export function useQuickVideo() {
  const context = useContext(QuickVideoContext);
  if (context === undefined) {
    throw new Error('useQuickVideo must be used within a QuickVideoProvider');
  }
  return context;
}

export default QuickVideoContext;
