import React, { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react';
import {
  VideoProject,
  VideoImage,
  VideoPropertyData,
  AgentBranding,
  VideoTemplate,
  ExportFormat,
  RenderStatus,
  DEFAULT_VIDEO_PROJECT,
  DEFAULT_IMAGE_DURATION,
} from '../../types/video-project';

interface VideoProjectContextType {
  // Project state
  project: VideoProject | null;
  loading: boolean;
  saving: boolean;

  // Project CRUD
  createProject: (name?: string) => void;
  loadProject: (id: string) => Promise<void>;
  saveProject: () => Promise<boolean>;
  clearProject: () => void;

  // Images
  images: VideoImage[];
  addImages: (files: File[]) => Promise<void>;
  removeImage: (id: string) => void;
  reorderImages: (fromIndex: number, toIndex: number) => void;
  updateImageDuration: (id: string, duration: number) => void;
  updateImageLabel: (id: string, label: string) => void;

  // Property data
  propertyData: VideoPropertyData;
  updatePropertyData: (data: Partial<VideoPropertyData>) => void;

  // Agent branding
  agentBranding: AgentBranding;
  updateAgentBranding: (data: Partial<AgentBranding>) => void;

  // Template
  selectedTemplate: VideoTemplate;
  setTemplate: (templateId: VideoTemplate) => void;

  // Export settings (for future use)
  selectedFormats: ExportFormat[];
  toggleFormat: (format: ExportFormat) => void;

  // Render status (for future Lambda integration)
  renderStatus: RenderStatus;

  // Computed values
  totalDuration: number;
  canPreview: boolean;
}

const VideoProjectContext = createContext<VideoProjectContextType | undefined>(undefined);

// Local storage key for persistence
const STORAGE_KEY = 'photovid_video_project';

export function VideoProjectProvider({ children }: { children: ReactNode }) {
  const [project, setProject] = useState<VideoProject | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [renderStatus, setRenderStatus] = useState<RenderStatus>('pending');

  // Load project from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        // Convert date strings back to Date objects
        parsed.createdAt = new Date(parsed.createdAt);
        parsed.updatedAt = new Date(parsed.updatedAt);
        setProject(parsed);
      } catch (e) {
        console.error('Error loading video project from localStorage:', e);
      }
    }
  }, []);

  // Save to localStorage whenever project changes
  useEffect(() => {
    if (project) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(project));
    }
  }, [project]);

  // Create a new video project
  const createProject = useCallback((name?: string) => {
    const newProject: VideoProject = {
      ...DEFAULT_VIDEO_PROJECT,
      id: `vp_${Date.now()}`,
      name: name || 'Untitled Video',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    setProject(newProject);
    setRenderStatus('pending');
  }, []);

  // Load project from storage or database
  const loadProject = useCallback(async (id: string) => {
    setLoading(true);

    // For MVP, load from localStorage
    const stored = localStorage.getItem(`video_project_${id}`);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        parsed.createdAt = new Date(parsed.createdAt);
        parsed.updatedAt = new Date(parsed.updatedAt);
        setProject(parsed);
      } catch (e) {
        console.error('Error loading video project:', e);
      }
    }

    setLoading(false);
  }, []);

  // Save project to storage
  const saveProject = useCallback(async (): Promise<boolean> => {
    if (!project) return false;

    setSaving(true);

    const updatedProject = {
      ...project,
      updatedAt: new Date(),
    };

    // For MVP, save to localStorage
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedProject));
    localStorage.setItem(`video_project_${project.id}`, JSON.stringify(updatedProject));

    setProject(updatedProject);
    setSaving(false);
    return true;
  }, [project]);

  // Clear current project
  const clearProject = useCallback(() => {
    setProject(null);
    localStorage.removeItem(STORAGE_KEY);
    setRenderStatus('pending');
  }, []);

  // Add images to the project
  const addImages = useCallback(async (files: File[]) => {
    if (!project) return;

    const newImages: VideoImage[] = await Promise.all(
      files.map(async (file, index) => {
        // Create blob URL for preview
        const url = URL.createObjectURL(file);

        return {
          id: `img_${Date.now()}_${index}`,
          order: project.images.length + index,
          url,
          duration: DEFAULT_IMAGE_DURATION,
        };
      })
    );

    setProject(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        images: [...prev.images, ...newImages],
        updatedAt: new Date(),
      };
    });
  }, [project]);

  // Remove an image
  const removeImage = useCallback((id: string) => {
    setProject(prev => {
      if (!prev) return prev;
      const images = prev.images
        .filter(img => img.id !== id)
        .map((img, index) => ({ ...img, order: index }));
      return {
        ...prev,
        images,
        updatedAt: new Date(),
      };
    });
  }, []);

  // Reorder images (drag and drop)
  const reorderImages = useCallback((fromIndex: number, toIndex: number) => {
    setProject(prev => {
      if (!prev) return prev;
      const images = [...prev.images];
      const [removed] = images.splice(fromIndex, 1);
      images.splice(toIndex, 0, removed);
      // Update order property
      const reorderedImages = images.map((img, index) => ({ ...img, order: index }));
      return {
        ...prev,
        images: reorderedImages,
        updatedAt: new Date(),
      };
    });
  }, []);

  // Update image duration
  const updateImageDuration = useCallback((id: string, duration: number) => {
    setProject(prev => {
      if (!prev) return prev;
      const images = prev.images.map(img =>
        img.id === id ? { ...img, duration } : img
      );
      return {
        ...prev,
        images,
        updatedAt: new Date(),
      };
    });
  }, []);

  // Update image label
  const updateImageLabel = useCallback((id: string, label: string) => {
    setProject(prev => {
      if (!prev) return prev;
      const images = prev.images.map(img =>
        img.id === id ? { ...img, label } : img
      );
      return {
        ...prev,
        images,
        updatedAt: new Date(),
      };
    });
  }, []);

  // Update property data
  const updatePropertyData = useCallback((data: Partial<VideoPropertyData>) => {
    setProject(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        propertyData: { ...prev.propertyData, ...data },
        updatedAt: new Date(),
      };
    });
  }, []);

  // Update agent branding
  const updateAgentBranding = useCallback((data: Partial<AgentBranding>) => {
    setProject(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        agentBranding: { ...prev.agentBranding, ...data },
        updatedAt: new Date(),
      };
    });
  }, []);

  // Set template
  const setTemplate = useCallback((templateId: VideoTemplate) => {
    setProject(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        templateId,
        updatedAt: new Date(),
      };
    });
  }, []);

  // Toggle export format selection
  const [selectedFormats, setSelectedFormats] = useState<ExportFormat[]>(['landscape']);

  const toggleFormat = useCallback((format: ExportFormat) => {
    setSelectedFormats(prev => {
      if (prev.includes(format)) {
        // Don't allow removing the last format
        if (prev.length === 1) return prev;
        return prev.filter(f => f !== format);
      }
      return [...prev, format];
    });
  }, []);

  // Computed values
  const images = project?.images || [];
  const propertyData = project?.propertyData || { address: '', features: [] };
  const agentBranding = project?.agentBranding || { name: '' };
  const selectedTemplate = project?.templateId || 'modern';

  // Calculate total duration based on images
  const totalDuration = images.reduce((sum, img) => sum + img.duration, 0);

  // Can preview if we have at least one image
  const canPreview = images.length > 0;

  return (
    <VideoProjectContext.Provider
      value={{
        project,
        loading,
        saving,
        createProject,
        loadProject,
        saveProject,
        clearProject,
        images,
        addImages,
        removeImage,
        reorderImages,
        updateImageDuration,
        updateImageLabel,
        propertyData,
        updatePropertyData,
        agentBranding,
        updateAgentBranding,
        selectedTemplate,
        setTemplate,
        selectedFormats,
        toggleFormat,
        renderStatus,
        totalDuration,
        canPreview,
      }}
    >
      {children}
    </VideoProjectContext.Provider>
  );
}

export function useVideoProject() {
  const context = useContext(VideoProjectContext);
  if (context === undefined) {
    throw new Error('useVideoProject must be used within a VideoProjectProvider');
  }
  return context;
}
