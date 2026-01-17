import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { createClient } from '../../database/client';
import {
  Storyboard,
  Scene,
  PropertyData,
  StoryboardSettings,
  StoryboardStatus,
  DEFAULT_STORYBOARD_SETTINGS,
  createEmptyScene,
  calculateTotalDuration,
} from '../../types/storyboard';
import { generateScenesFromProperty, SceneGenerationOptions } from '../../api/sceneGenerator';
import { generateRoomTourVideo } from '../../api/toolGeneration';
import { useCredits } from './CreditsContext';

interface StoryboardContextType {
  // Current storyboard
  storyboard: Storyboard | null;
  loading: boolean;
  saving: boolean;

  // CRUD operations
  createStoryboard: (name: string, propertyData?: Partial<PropertyData>) => void;
  createStoryboardWithAutoScenes: (name: string, propertyData: PropertyData, options?: Partial<SceneGenerationOptions>) => void;
  loadStoryboard: (id: string) => Promise<void>;
  saveStoryboard: () => Promise<boolean>;
  clearStoryboard: () => void;

  // Property data
  updatePropertyData: (data: Partial<PropertyData>) => void;

  // Scene management
  addScene: (scene?: Partial<Scene>) => void;
  addScenes: (scenes: Scene[]) => void;
  updateScene: (sceneId: string, updates: Partial<Scene>) => void;
  deleteScene: (sceneId: string) => void;
  reorderScenes: (startIndex: number, endIndex: number) => void;
  duplicateScene: (sceneId: string) => void;
  clearScenes: () => void;

  // Scene generation
  generateSceneVideo: (sceneId: string) => Promise<void>;
  generateAllVideos: () => Promise<void>;

  // Settings
  updateSettings: (settings: Partial<StoryboardSettings>) => void;

  // Status
  isGenerating: boolean;
  generatingSceneId: string | null;
}

const StoryboardContext = createContext<StoryboardContextType | undefined>(undefined);

// Default property data
const DEFAULT_PROPERTY_DATA: PropertyData = {
  address: '',
  propertyType: 'house',
  bedrooms: 3,
  bathrooms: 2,
  squareFeet: 2000,
  features: [],
  style: 'modern',
  description: '',
};

export function StoryboardProvider({ children }: { children: ReactNode }) {
  const [storyboard, setStoryboard] = useState<Storyboard | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatingSceneId, setGeneratingSceneId] = useState<string | null>(null);

  const supabase = createClient();
  const { deductCredits, hasEnoughCredits } = useCredits();

  // Create a new storyboard
  const createStoryboard = useCallback((name: string, propertyData?: Partial<PropertyData>) => {
    const newStoryboard: Storyboard = {
      id: `sb_${Date.now()}`,
      userId: 'local',
      name,
      propertyData: { ...DEFAULT_PROPERTY_DATA, ...propertyData },
      scenes: [createEmptyScene(0)],
      settings: { ...DEFAULT_STORYBOARD_SETTINGS },
      totalDuration: 5,
      status: 'draft',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    setStoryboard(newStoryboard);
  }, []);

  // Create storyboard with auto-generated scenes based on property data
  const createStoryboardWithAutoScenes = useCallback((
    name: string,
    propertyData: PropertyData,
    options?: Partial<SceneGenerationOptions>
  ) => {
    // Generate scenes using the scene generator
    const result = generateScenesFromProperty({
      propertyData,
      maxScenes: options?.maxScenes || 10,
      includeAerial: options?.includeAerial ?? true,
      includeNeighborhood: options?.includeNeighborhood ?? false,
      customRooms: options?.customRooms,
    });

    const newStoryboard: Storyboard = {
      id: `sb_${Date.now()}`,
      userId: 'local',
      name,
      propertyData,
      scenes: result.scenes,
      settings: {
        ...DEFAULT_STORYBOARD_SETTINGS,
        musicTrack: result.suggestedMusic[0] || undefined,
      },
      totalDuration: result.totalDuration,
      status: 'draft',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    setStoryboard(newStoryboard);
  }, []);

  // Load storyboard from database
  const loadStoryboard = useCallback(async (id: string) => {
    setLoading(true);

    if (!supabase) {
      // Load from local storage for demo
      const stored = localStorage.getItem(`storyboard_${id}`);
      if (stored) {
        setStoryboard(JSON.parse(stored));
      }
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('storyboards')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;

      if (data) {
        setStoryboard({
          id: data.id,
          userId: data.user_id,
          projectId: data.project_id,
          name: data.name,
          propertyData: data.property_data,
          scenes: data.scenes,
          settings: data.settings,
          totalDuration: data.total_duration,
          status: data.status,
          outputUrl: data.output_url,
          createdAt: new Date(data.created_at),
          updatedAt: new Date(data.updated_at),
        });
      }
    } catch (error) {
      console.error('Error loading storyboard:', error);
    }

    setLoading(false);
  }, [supabase]);

  // ============================================
  // SECURE: Save storyboard via Edge Function
  // ============================================
  const saveStoryboard = useCallback(async (): Promise<boolean> => {
    if (!storyboard) return false;

    setSaving(true);

    // Update timestamp
    const updatedStoryboard = {
      ...storyboard,
      updatedAt: new Date(),
      totalDuration: calculateTotalDuration(storyboard.scenes),
    };

    if (!supabase) {
      // Save to local storage for demo
      localStorage.setItem(`storyboard_${storyboard.id}`, JSON.stringify(updatedStoryboard));
      setStoryboard(updatedStoryboard);
      setSaving(false);
      return true;
    }

    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        // Not logged in, save locally
        localStorage.setItem(`storyboard_${storyboard.id}`, JSON.stringify(updatedStoryboard));
        setStoryboard(updatedStoryboard);
        setSaving(false);
        return true;
      }

      // SECURE: Call Edge Function instead of direct database write
      const { data: response, error } = await supabase.functions.invoke('save-storyboard', {
        body: {
          id: storyboard.id,
          projectId: storyboard.projectId,
          name: storyboard.name,
          propertyData: storyboard.propertyData,
          scenes: storyboard.scenes,
          settings: storyboard.settings,
          totalDuration: updatedStoryboard.totalDuration,
          status: storyboard.status,
          outputUrl: storyboard.outputUrl,
        },
      });

      if (error) {
        console.error('Error saving storyboard via Edge Function:', error);
        // Fallback to local storage
        localStorage.setItem(`storyboard_${storyboard.id}`, JSON.stringify(updatedStoryboard));
        setStoryboard(updatedStoryboard);
        setSaving(false);
        return true;
      }

      if (response?.error) {
        console.error('Edge Function error:', response.error);
        return false;
      }

      setStoryboard(updatedStoryboard);
      return true;
    } catch (error) {
      console.error('Error saving storyboard:', error);
      return false;
    } finally {
      setSaving(false);
    }
  }, [storyboard, supabase]);

  // Clear current storyboard
  const clearStoryboard = useCallback(() => {
    setStoryboard(null);
  }, []);

  // Update property data
  const updatePropertyData = useCallback((data: Partial<PropertyData>) => {
    setStoryboard(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        propertyData: { ...prev.propertyData, ...data },
        updatedAt: new Date(),
      };
    });
  }, []);

  // Add a new scene
  const addScene = useCallback((scene?: Partial<Scene>) => {
    setStoryboard(prev => {
      if (!prev) return prev;
      const newScene = {
        ...createEmptyScene(prev.scenes.length),
        ...scene,
      };
      const scenes = [...prev.scenes, newScene];
      return {
        ...prev,
        scenes,
        totalDuration: calculateTotalDuration(scenes),
        updatedAt: new Date(),
      };
    });
  }, []);

  // Add multiple scenes at once
  const addScenes = useCallback((newScenes: Scene[]) => {
    setStoryboard(prev => {
      if (!prev) return prev;
      const startIndex = prev.scenes.length;
      const scenesWithOrder = newScenes.map((scene, index) => ({
        ...scene,
        order: startIndex + index,
      }));
      const scenes = [...prev.scenes, ...scenesWithOrder];
      return {
        ...prev,
        scenes,
        totalDuration: calculateTotalDuration(scenes),
        updatedAt: new Date(),
      };
    });
  }, []);

  // Clear all scenes
  const clearScenes = useCallback(() => {
    setStoryboard(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        scenes: [],
        totalDuration: 0,
        updatedAt: new Date(),
      };
    });
  }, []);

  // Update a scene
  const updateScene = useCallback((sceneId: string, updates: Partial<Scene>) => {
    setStoryboard(prev => {
      if (!prev) return prev;
      const scenes = prev.scenes.map(scene =>
        scene.id === sceneId ? { ...scene, ...updates } : scene
      );
      return {
        ...prev,
        scenes,
        totalDuration: calculateTotalDuration(scenes),
        updatedAt: new Date(),
      };
    });
  }, []);

  // Delete a scene
  const deleteScene = useCallback((sceneId: string) => {
    setStoryboard(prev => {
      if (!prev) return prev;
      const scenes = prev.scenes
        .filter(scene => scene.id !== sceneId)
        .map((scene, index) => ({ ...scene, order: index }));
      return {
        ...prev,
        scenes,
        totalDuration: calculateTotalDuration(scenes),
        updatedAt: new Date(),
      };
    });
  }, []);

  // Reorder scenes (drag and drop)
  const reorderScenes = useCallback((startIndex: number, endIndex: number) => {
    setStoryboard(prev => {
      if (!prev) return prev;
      const scenes = [...prev.scenes];
      const [removed] = scenes.splice(startIndex, 1);
      scenes.splice(endIndex, 0, removed);
      // Update order property
      const reorderedScenes = scenes.map((scene, index) => ({ ...scene, order: index }));
      return {
        ...prev,
        scenes: reorderedScenes,
        updatedAt: new Date(),
      };
    });
  }, []);

  // Duplicate a scene
  const duplicateScene = useCallback((sceneId: string) => {
    setStoryboard(prev => {
      if (!prev) return prev;
      const sceneIndex = prev.scenes.findIndex(s => s.id === sceneId);
      if (sceneIndex === -1) return prev;

      const originalScene = prev.scenes[sceneIndex];
      const duplicatedScene: Scene = {
        ...originalScene,
        id: `scene_${Date.now()}_dup`,
        order: prev.scenes.length,
        videoUrl: null, // Reset video URL for duplicated scene
        status: 'pending',
      };

      const scenes = [...prev.scenes, duplicatedScene];
      return {
        ...prev,
        scenes,
        totalDuration: calculateTotalDuration(scenes),
        updatedAt: new Date(),
      };
    });
  }, []);

  // Generate video for a single scene
  const generateSceneVideo = useCallback(async (sceneId: string) => {
    if (!storyboard) return;

    const scene = storyboard.scenes.find(s => s.id === sceneId);
    if (!scene || !scene.imageUrl) return;

    // Check credits
    if (!hasEnoughCredits('room-tour')) {
      throw new Error('Not enough credits to generate video');
    }

    setIsGenerating(true);
    setGeneratingSceneId(sceneId);

    // Update scene status
    updateScene(sceneId, { status: 'generating' });

    try {
      // Deduct credits
      await deductCredits('room-tour', undefined, 'Storyboard scene video');

      // Create a File object from the image URL (for R2 upload)
      // In production, we'd need to fetch the image and convert it
      const response = await fetch(scene.imageUrl);
      const blob = await response.blob();
      const file = new File([blob], 'scene.jpg', { type: 'image/jpeg' });

      const videoUrl = await generateRoomTourVideo(
        file,
        {
          motionStyle: scene.motionStyle === 'ken-burns' ? 'cinematic' :
                       scene.motionStyle.includes('pan') ? 'smooth-pan' :
                       scene.motionStyle.includes('zoom') ? 'zoom-in' :
                       scene.motionStyle === 'orbit' ? 'orbit' : 'cinematic',
          duration: scene.duration as 3 | 5 | 8 | 10,
        },
        (progress, status) => {
          console.log(`Scene ${sceneId}: ${progress}% - ${status}`);
        }
      );

      updateScene(sceneId, {
        videoUrl,
        status: 'completed',
      });
    } catch (error) {
      console.error('Error generating scene video:', error);
      updateScene(sceneId, {
        status: 'failed',
        errorMessage: error instanceof Error ? error.message : 'Generation failed',
      });
    } finally {
      setIsGenerating(false);
      setGeneratingSceneId(null);
    }
  }, [storyboard, updateScene, hasEnoughCredits, deductCredits]);

  // Generate videos for all scenes with images
  const generateAllVideos = useCallback(async () => {
    if (!storyboard) return;

    const scenesWithImages = storyboard.scenes.filter(
      s => s.imageUrl && s.status !== 'completed'
    );

    for (const scene of scenesWithImages) {
      await generateSceneVideo(scene.id);
    }
  }, [storyboard, generateSceneVideo]);

  // Update settings
  const updateSettings = useCallback((settings: Partial<StoryboardSettings>) => {
    setStoryboard(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        settings: { ...prev.settings, ...settings },
        updatedAt: new Date(),
      };
    });
  }, []);

  return (
    <StoryboardContext.Provider
      value={{
        storyboard,
        loading,
        saving,
        createStoryboard,
        createStoryboardWithAutoScenes,
        loadStoryboard,
        saveStoryboard,
        clearStoryboard,
        updatePropertyData,
        addScene,
        addScenes,
        updateScene,
        deleteScene,
        reorderScenes,
        duplicateScene,
        clearScenes,
        generateSceneVideo,
        generateAllVideos,
        updateSettings,
        isGenerating,
        generatingSceneId,
      }}
    >
      {children}
    </StoryboardContext.Provider>
  );
}

export function useStoryboard() {
  const context = useContext(StoryboardContext);
  if (context === undefined) {
    throw new Error('useStoryboard must be used within a StoryboardProvider');
  }
  return context;
}
