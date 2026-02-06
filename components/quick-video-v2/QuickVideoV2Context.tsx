/**
 * QuickVideoV2Context - State management for AI-powered property videos
 *
 * Manages:
 * - Image uploads and ordering
 * - Template and format selection
 * - AI script generation
 * - Voice synthesis
 * - Playback controls
 * - Export pipeline
 */

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useRef,
  ReactNode,
} from 'react';
import type {
  QuickVideoV2Project,
  VideoTemplateV2,
  VideoDuration,
  PropertyScript,
  ScriptSegment,
  VoiceConfig,
  SynthesizedVoice,
  ProjectStatus,
  VoiceLanguage,
} from '@/lib/types/quick-video-v2';
import {
  createDefaultProject,
  generateId,
  AVAILABLE_VOICES,
  VIDEO_V2_CONFIG,
} from '@/lib/types/quick-video-v2';
import type { VideoImage, AgentBranding, ExportFormat } from '@/lib/types/video-project';
import { getTemplateV2 } from '@/lib/data/video-templates-v2';
import { generatePropertyScript } from '@/lib/api/script';
import { synthesizeVoice as synthesizeVoiceApi } from '@/lib/api/voice';

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Convert a blob URL or image URL to base64 data URL
 * This is needed for OpenAI Vision API which requires accessible URLs or base64
 */
async function imageUrlToBase64(url: string): Promise<string> {
  try {
    const response = await fetch(url);
    const blob = await response.blob();

    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.error('Failed to convert image to base64:', error);
    return url; // Return original URL as fallback
  }
}

/**
 * Convert multiple image URLs to base64 (with progress callback)
 */
async function convertImagesToBase64(
  images: { url: string }[],
  onProgress?: (current: number, total: number) => void
): Promise<string[]> {
  const results: string[] = [];

  for (let i = 0; i < images.length; i++) {
    const base64 = await imageUrlToBase64(images[i].url);
    results.push(base64);
    onProgress?.(i + 1, images.length);
  }

  return results;
}

// ============================================================================
// Context Types
// ============================================================================

interface QuickVideoV2State {
  project: QuickVideoV2Project;

  // UI state
  isGeneratingScript: boolean;
  isSynthesizingVoice: boolean;
  isExporting: boolean;

  // Playback
  isPlaying: boolean;
  currentTime: number;        // In seconds
  totalDuration: number;      // In seconds

  // Errors
  error: string | null;
}

interface QuickVideoV2Actions {
  // Image management
  addImages: (files: File[]) => Promise<void>;
  removeImage: (id: string) => void;
  reorderImages: (fromIndex: number, toIndex: number) => void;
  updateImageLabel: (id: string, label: string) => void;

  // Template & Format
  setTemplate: (templateId: VideoTemplateV2) => void;
  setFormat: (format: ExportFormat) => void;
  setDuration: (duration: VideoDuration) => void;
  setLanguage: (language: VoiceLanguage) => void;

  // Property data
  setPropertyHighlights: (highlights: string[]) => void;
  addHighlight: (highlight: string) => void;
  removeHighlight: (highlight: string) => void;

  // Agent branding
  setAgentBranding: (branding: AgentBranding | null) => void;
  updateAgentBranding: (data: Partial<AgentBranding>) => void;

  // Script generation
  generateScript: () => Promise<void>;
  updateScriptSegment: (segmentId: string, text: string) => void;
  regenerateScript: () => Promise<void>;

  // Voice synthesis
  selectVoice: (voice: VoiceConfig) => void;
  synthesizeVoice: () => Promise<void>;
  clearVoice: () => void;

  // Music
  setMusicVolume: (volume: number) => void;

  // Playback
  play: () => void;
  pause: () => void;
  togglePlayback: () => void;
  seekTo: (time: number) => void;
  setTotalDuration: (duration: number) => void;

  // Project
  resetProject: () => void;
  setProjectName: (name: string) => void;

  // Export
  exportVideo: () => Promise<string | null>;

  // Errors
  setError: (error: string | null) => void;
  clearError: () => void;

  // Helpers
  canGenerateScript: () => boolean;
  canSynthesizeVoice: () => boolean;
  canExport: () => boolean;
  getVideoProps: () => {
    images: VideoImage[];
    script: PropertyScript | null;
    wordTimings: { word: string; start: number; end: number }[];
    template: ReturnType<typeof getTemplateV2>;
    format: ExportFormat;
    agentBranding: AgentBranding | null;
    musicVolume: number;
    showCaptions: boolean;
  };
}

type QuickVideoV2ContextType = QuickVideoV2State & QuickVideoV2Actions;

// ============================================================================
// Context Creation
// ============================================================================

const QuickVideoV2Context = createContext<QuickVideoV2ContextType | undefined>(undefined);

// ============================================================================
// Provider Component
// ============================================================================

interface QuickVideoV2ProviderProps {
  children: ReactNode;
}

export function QuickVideoV2Provider({ children }: QuickVideoV2ProviderProps) {
  const [project, setProject] = useState<QuickVideoV2Project>(createDefaultProject);
  const [isGeneratingScript, setIsGeneratingScript] = useState(false);
  const [isSynthesizingVoice, setIsSynthesizingVoice] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [totalDuration, setTotalDuration] = useState(0);
  const [error, setError] = useState<string | null>(null);

  // Refs for cleanup
  const blobUrlsRef = useRef<string[]>([]);

  // ============================================================================
  // Image Management
  // ============================================================================

  const addImages = useCallback(async (files: File[]) => {
    const validFiles = files.filter(
      (f) => f.type.startsWith('image/') && f.size < 20 * 1024 * 1024 // 20MB max
    );

    if (validFiles.length === 0) {
      setError('No valid image files selected');
      return;
    }

    const newImages: VideoImage[] = validFiles.map((file, idx) => {
      const blobUrl = URL.createObjectURL(file);
      blobUrlsRef.current.push(blobUrl);

      return {
        id: generateId(),
        order: project.images.length + idx,
        url: blobUrl,
        label: '',
        duration: 3, // Default 3 seconds per image
      };
    });

    setProject((prev) => ({
      ...prev,
      images: [...prev.images, ...newImages].slice(0, VIDEO_V2_CONFIG.maxImages),
      updatedAt: new Date(),
      // Reset script and voice when images change
      script: null,
      synthesizedVoice: null,
      status: 'draft',
    }));
  }, [project.images.length]);

  const removeImage = useCallback((id: string) => {
    setProject((prev) => {
      const imageToRemove = prev.images.find((img) => img.id === id);
      if (imageToRemove?.url.startsWith('blob:')) {
        URL.revokeObjectURL(imageToRemove.url);
      }

      const filteredImages = prev.images
        .filter((img) => img.id !== id)
        .map((img, idx) => ({ ...img, order: idx }));

      return {
        ...prev,
        images: filteredImages,
        updatedAt: new Date(),
        // Reset script and voice when images change
        script: null,
        synthesizedVoice: null,
        status: 'draft',
      };
    });
  }, []);

  const reorderImages = useCallback((fromIndex: number, toIndex: number) => {
    setProject((prev) => {
      const newImages = [...prev.images];
      const [movedItem] = newImages.splice(fromIndex, 1);
      newImages.splice(toIndex, 0, movedItem);
      const reordered = newImages.map((img, idx) => ({ ...img, order: idx }));

      return {
        ...prev,
        images: reordered,
        updatedAt: new Date(),
        // Reset script when order changes
        script: null,
        synthesizedVoice: null,
        status: 'draft',
      };
    });
  }, []);

  const updateImageLabel = useCallback((id: string, label: string) => {
    setProject((prev) => ({
      ...prev,
      images: prev.images.map((img) =>
        img.id === id ? { ...img, label } : img
      ),
      updatedAt: new Date(),
    }));
  }, []);

  // ============================================================================
  // Template & Format
  // ============================================================================

  const setTemplate = useCallback((templateId: VideoTemplateV2) => {
    setProject((prev) => ({
      ...prev,
      templateId,
      updatedAt: new Date(),
    }));
  }, []);

  const setFormat = useCallback((format: ExportFormat) => {
    setProject((prev) => ({
      ...prev,
      format,
      updatedAt: new Date(),
    }));
  }, []);

  const setDuration = useCallback((duration: VideoDuration) => {
    setProject((prev) => ({
      ...prev,
      duration,
      updatedAt: new Date(),
      // Reset script when duration changes
      script: null,
      synthesizedVoice: null,
      status: 'draft',
    }));
  }, []);

  const setLanguage = useCallback((language: VoiceLanguage) => {
    setProject((prev) => ({
      ...prev,
      language,
      updatedAt: new Date(),
      // Reset script and voice when language changes
      script: null,
      synthesizedVoice: null,
      selectedVoice: null,  // Clear voice selection since voices are language-specific
      status: 'draft',
    }));
  }, []);

  // ============================================================================
  // Property Highlights
  // ============================================================================

  const setPropertyHighlights = useCallback((highlights: string[]) => {
    setProject((prev) => ({
      ...prev,
      propertyHighlights: highlights,
      updatedAt: new Date(),
    }));
  }, []);

  const addHighlight = useCallback((highlight: string) => {
    if (!highlight.trim()) return;
    setProject((prev) => ({
      ...prev,
      propertyHighlights: [...prev.propertyHighlights, highlight.trim()],
      updatedAt: new Date(),
    }));
  }, []);

  const removeHighlight = useCallback((highlight: string) => {
    setProject((prev) => ({
      ...prev,
      propertyHighlights: prev.propertyHighlights.filter((h) => h !== highlight),
      updatedAt: new Date(),
    }));
  }, []);

  // ============================================================================
  // Agent Branding
  // ============================================================================

  const setAgentBranding = useCallback((branding: AgentBranding | null) => {
    setProject((prev) => ({
      ...prev,
      agentBranding: branding,
      updatedAt: new Date(),
    }));
  }, []);

  const updateAgentBranding = useCallback((data: Partial<AgentBranding>) => {
    setProject((prev) => ({
      ...prev,
      agentBranding: prev.agentBranding
        ? { ...prev.agentBranding, ...data }
        : { name: '', ...data },
      updatedAt: new Date(),
    }));
  }, []);

  // ============================================================================
  // Script Generation
  // ============================================================================

  const canGenerateScript = useCallback((): boolean => {
    return project.images.length >= VIDEO_V2_CONFIG.minImages && !isGeneratingScript;
  }, [project.images.length, isGeneratingScript]);

  const generateScript = useCallback(async () => {
    if (!canGenerateScript()) {
      setError(`Please add at least ${VIDEO_V2_CONFIG.minImages} images`);
      return;
    }

    setIsGeneratingScript(true);
    setError(null);
    setProject((prev) => ({ ...prev, status: 'generating-script' }));

    try {
      // Prepare request parameters
      const imageLabels = project.images.map(
        (img, idx) => img.label || ''  // Empty string - AI will describe what it sees
      );
      const imageIds = project.images.map((img) => img.id);

      // Convert images to base64 for AI vision analysis
      console.log('Converting images to base64 for AI vision...');
      const imageUrls = await convertImagesToBase64(
        project.images,
        (current, total) => console.log(`Converting image ${current}/${total}...`)
      );
      console.log(`Converted ${imageUrls.length} images to base64`);

      // Auto-calculate duration based on image count (~6-7 seconds per image)
      const autoTargetDuration = Math.max(30, project.images.length * 7);

      // Call the script generation API with vision-enabled image analysis
      const response = await generatePropertyScript(
        {
          imageCount: project.images.length,
          imageLabels,
          imageUrls,  // Base64 images for AI vision analysis
          templateStyle: project.templateId,
          propertyHighlights: project.propertyHighlights,
          targetDuration: autoTargetDuration,
          language: project.language,
        },
        imageIds
      );

      if (!response.success || !response.script) {
        throw new Error(response.error || 'Failed to generate script');
      }

      setProject((prev) => ({
        ...prev,
        script: response.script,
        status: 'draft',
        updatedAt: new Date(),
      }));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate script');
      setProject((prev) => ({ ...prev, status: 'error' }));
    } finally {
      setIsGeneratingScript(false);
    }
  }, [canGenerateScript, project.images, project.templateId, project.propertyHighlights, project.language]);

  const updateScriptSegment = useCallback((segmentId: string, text: string) => {
    setProject((prev) => {
      if (!prev.script) return prev;

      return {
        ...prev,
        script: {
          ...prev.script,
          segments: prev.script.segments.map((seg) =>
            seg.id === segmentId ? { ...seg, text } : seg
          ),
        },
        // Clear synthesized voice when script changes
        synthesizedVoice: null,
        updatedAt: new Date(),
      };
    });
  }, []);

  const regenerateScript = useCallback(async () => {
    await generateScript();
  }, [generateScript]);

  // ============================================================================
  // Voice Synthesis
  // ============================================================================

  const selectVoice = useCallback((voice: VoiceConfig) => {
    setProject((prev) => ({
      ...prev,
      selectedVoice: voice,
      // Clear synthesized voice when voice selection changes
      synthesizedVoice: null,
      updatedAt: new Date(),
    }));
  }, []);

  const canSynthesizeVoice = useCallback((): boolean => {
    return !!project.script && !!project.selectedVoice && !isSynthesizingVoice;
  }, [project.script, project.selectedVoice, isSynthesizingVoice]);

  const synthesizeVoice = useCallback(async () => {
    if (!canSynthesizeVoice() || !project.script || !project.selectedVoice) {
      setError('Please generate a script and select a voice first');
      return;
    }

    setIsSynthesizingVoice(true);
    setError(null);
    setProject((prev) => ({ ...prev, status: 'generating-voice' }));

    try {
      // Call the actual Deepgram voice synthesis API
      const response = await synthesizeVoiceApi({
        script: project.script,
        voiceId: project.selectedVoice.voiceId,
      });

      if (!response.success || !response.voice) {
        throw new Error('Failed to synthesize voice');
      }

      setProject((prev) => ({
        ...prev,
        synthesizedVoice: response.voice,
        status: 'ready',
        updatedAt: new Date(),
      }));

      setTotalDuration(response.voice.duration);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to synthesize voice');
      setProject((prev) => ({ ...prev, status: 'error' }));
    } finally {
      setIsSynthesizingVoice(false);
    }
  }, [canSynthesizeVoice, project.script, project.selectedVoice]);

  const clearVoice = useCallback(() => {
    setProject((prev) => ({
      ...prev,
      synthesizedVoice: null,
      status: 'draft',
      updatedAt: new Date(),
    }));
  }, []);

  // ============================================================================
  // Music
  // ============================================================================

  const setMusicVolume = useCallback((volume: number) => {
    setProject((prev) => ({
      ...prev,
      musicVolume: Math.max(0, Math.min(100, volume)),
      updatedAt: new Date(),
    }));
  }, []);

  // ============================================================================
  // Playback Controls
  // ============================================================================

  const play = useCallback(() => setIsPlaying(true), []);
  const pause = useCallback(() => setIsPlaying(false), []);
  const togglePlayback = useCallback(() => setIsPlaying((prev) => !prev), []);

  const seekTo = useCallback((time: number) => {
    setCurrentTime(Math.max(0, Math.min(time, totalDuration)));
  }, [totalDuration]);

  const setTotalDurationValue = useCallback((duration: number) => {
    setTotalDuration(duration);
  }, []);

  // ============================================================================
  // Project Management
  // ============================================================================

  const resetProject = useCallback(() => {
    // Clean up blob URLs
    blobUrlsRef.current.forEach((url) => URL.revokeObjectURL(url));
    blobUrlsRef.current = [];

    setProject(createDefaultProject());
    setIsPlaying(false);
    setCurrentTime(0);
    setTotalDuration(0);
    setError(null);
  }, []);

  const setProjectName = useCallback((name: string) => {
    setProject((prev) => ({
      ...prev,
      name,
      updatedAt: new Date(),
    }));
  }, []);

  // ============================================================================
  // Export
  // ============================================================================

  const canExport = useCallback((): boolean => {
    return (
      project.status === 'ready' &&
      !!project.synthesizedVoice &&
      project.images.length >= VIDEO_V2_CONFIG.minImages
    );
  }, [project.status, project.synthesizedVoice, project.images.length]);

  const exportVideo = useCallback(async (): Promise<string | null> => {
    if (!canExport()) {
      setError('Please complete all steps before exporting');
      return null;
    }

    setIsExporting(true);
    setError(null);
    setProject((prev) => ({ ...prev, status: 'exporting' }));

    try {
      // TODO: Implement actual export via Remotion Lambda
      await new Promise((resolve) => setTimeout(resolve, 5000));

      const outputUrl = 'https://example.com/exported-video.mp4';

      setProject((prev) => ({
        ...prev,
        status: 'completed',
        updatedAt: new Date(),
      }));

      return outputUrl;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to export video');
      setProject((prev) => ({ ...prev, status: 'error' }));
      return null;
    } finally {
      setIsExporting(false);
    }
  }, [canExport]);

  // ============================================================================
  // Error Handling
  // ============================================================================

  const clearError = useCallback(() => setError(null), []);

  // ============================================================================
  // Helpers
  // ============================================================================

  const getVideoProps = useCallback(() => {
    const template = getTemplateV2(project.templateId);

    return {
      images: project.images,
      script: project.script,
      wordTimings: project.synthesizedVoice?.wordTimings || [],
      template,
      format: project.format,
      agentBranding: project.agentBranding,
      musicVolume: project.musicVolume,
      showCaptions: true,
    };
  }, [project]);

  // ============================================================================
  // Context Value
  // ============================================================================

  const value: QuickVideoV2ContextType = {
    // State
    project,
    isGeneratingScript,
    isSynthesizingVoice,
    isExporting,
    isPlaying,
    currentTime,
    totalDuration,
    error,

    // Actions
    addImages,
    removeImage,
    reorderImages,
    updateImageLabel,
    setTemplate,
    setFormat,
    setDuration,
    setLanguage,
    setPropertyHighlights,
    addHighlight,
    removeHighlight,
    setAgentBranding,
    updateAgentBranding,
    generateScript,
    updateScriptSegment,
    regenerateScript,
    selectVoice,
    synthesizeVoice,
    clearVoice,
    setMusicVolume,
    play,
    pause,
    togglePlayback,
    seekTo,
    setTotalDuration: setTotalDurationValue,
    resetProject,
    setProjectName,
    exportVideo,
    setError,
    clearError,
    canGenerateScript,
    canSynthesizeVoice,
    canExport,
    getVideoProps,
  };

  return (
    <QuickVideoV2Context.Provider value={value}>
      {children}
    </QuickVideoV2Context.Provider>
  );
}

// ============================================================================
// Hook
// ============================================================================

export function useQuickVideoV2() {
  const context = useContext(QuickVideoV2Context);
  if (context === undefined) {
    throw new Error('useQuickVideoV2 must be used within a QuickVideoV2Provider');
  }
  return context;
}

export default QuickVideoV2Context;
