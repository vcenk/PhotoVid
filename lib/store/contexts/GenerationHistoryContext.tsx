import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { createClient } from '../../database/client';

export interface Generation {
  id: string;
  tool: string;
  toolName: string;
  model: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  inputImageUrl?: string;
  outputUrl?: string;
  thumbnailUrl?: string;
  creditsUsed: number;
  settings?: Record<string, any>;
  errorMessage?: string;
  createdAt: string;
  completedAt?: string;
}

interface GenerationHistoryContextType {
  generations: Generation[];
  loading: boolean;
  addGeneration: (generation: Omit<Generation, 'id' | 'createdAt'>) => Promise<string>;
  updateGeneration: (id: string, updates: Partial<Generation>) => Promise<void>;
  fetchGenerations: () => Promise<void>;
  getRecentGenerations: (limit?: number) => Generation[];
  getGenerationsByTool: (tool: string) => Generation[];
  getStats: () => { total: number; completed: number; failed: number; creditsUsed: number };
}

const GenerationHistoryContext = createContext<GenerationHistoryContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY = 'photovid_generation_history';

function getLocalGenerations(): Generation[] {
  try {
    const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function saveLocalGenerations(generations: Generation[]) {
  try {
    // Keep only the last 100 generations in local storage
    const toSave = generations.slice(0, 100);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(toSave));
  } catch (e) {
    console.warn('Failed to save local generations:', e);
  }
}

// Human-readable tool names
const TOOL_NAMES: Record<string, string> = {
  'virtual-staging': 'Virtual Staging',
  'photo-enhancement': 'Photo Enhancement',
  'sky-replacement': 'Sky Replacement',
  'twilight': 'Day to Twilight',
  'item-removal': 'Item Removal',
  'lawn-enhancement': 'Lawn Enhancement',
  'declutter': 'Declutter',
  'room-tour': 'Room Tour Video',
  'virtual-renovation': 'Virtual Renovation',
  'wall-color': 'Wall Color Change',
  'floor-replacement': 'Floor Replacement',
  'rain-to-shine': 'Rain to Shine',
  'night-to-day': 'Night to Day',
  'changing-seasons': 'Changing Seasons',
  'pool-enhancement': 'Pool Enhancement',
  'watermark-removal': 'Watermark Removal',
  'headshot-retouching': 'Headshot Retouching',
  'hdr-merge': 'HDR Merge',
  'floor-plan': 'Floor Plan',
  '360-staging': '360° Staging',
  'background-swap': 'Background Swap',
  'auto-enhance': 'Auto Enhance',
  'blemish-removal': 'Blemish Removal',
  'reflection-fix': 'Reflection Fix',
  'interior-enhance': 'Interior Enhance',
  'license-blur': 'License Blur',
  'vehicle-360': 'Vehicle 360°',
  'window-tint': 'Window Tint',
  'paint-color': 'Paint Color',
  'text-to-image': 'Text to Image',
  'image-to-video': 'Image to Video',
  'lipsync': 'Lipsync',
};

export function GenerationHistoryProvider({ children }: { children: ReactNode }) {
  const [generations, setGenerations] = useState<Generation[]>([]);
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  const fetchGenerations = useCallback(async () => {
    setLoading(true);

    if (!supabase) {
      setGenerations(getLocalGenerations());
      setLoading(false);
      return;
    }

    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        setGenerations(getLocalGenerations());
        setLoading(false);
        return;
      }

      // Try to fetch from database
      const { data, error } = await supabase
        .from('generations')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (!error && data) {
        const mapped = data.map((g: any) => ({
          id: g.id,
          tool: g.tool,
          toolName: TOOL_NAMES[g.tool] || g.tool,
          model: g.model,
          status: g.status,
          inputImageUrl: g.input?.imageUrl,
          outputUrl: g.output?.url,
          thumbnailUrl: g.output?.thumbnailUrl,
          creditsUsed: g.credits_used || 0,
          settings: g.input?.options,
          errorMessage: g.error_message,
          createdAt: g.created_at,
          completedAt: g.completed_at,
        }));
        setGenerations(mapped);
      } else {
        // Fall back to local storage
        setGenerations(getLocalGenerations());
      }
    } catch (error) {
      console.error('Error fetching generations:', error);
      setGenerations(getLocalGenerations());
    }

    setLoading(false);
  }, [supabase]);

  const addGeneration = useCallback(async (generation: Omit<Generation, 'id' | 'createdAt'>): Promise<string> => {
    const id = `gen_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const newGeneration: Generation = {
      ...generation,
      id,
      toolName: TOOL_NAMES[generation.tool] || generation.tool,
      createdAt: new Date().toISOString(),
    };

    // Update local state immediately
    setGenerations(prev => [newGeneration, ...prev]);

    // Save to local storage
    const localGens = getLocalGenerations();
    saveLocalGenerations([newGeneration, ...localGens]);

    // If we have supabase, also save there
    if (supabase) {
      try {
        const { data: userData } = await supabase.auth.getUser();
        if (userData.user) {
          await supabase.from('generations').insert({
            id,
            user_id: userData.user.id,
            tool: generation.tool,
            model: generation.model,
            status: generation.status,
            input: {
              imageUrl: generation.inputImageUrl,
              options: generation.settings,
            },
            output: generation.outputUrl ? { url: generation.outputUrl } : null,
            credits_used: generation.creditsUsed,
            error_message: generation.errorMessage,
            created_at: newGeneration.createdAt,
          });
        }
      } catch (error) {
        console.error('Error saving generation to database:', error);
      }
    }

    return id;
  }, [supabase]);

  const updateGeneration = useCallback(async (id: string, updates: Partial<Generation>) => {
    setGenerations(prev =>
      prev.map(g =>
        g.id === id
          ? { ...g, ...updates, toolName: updates.tool ? (TOOL_NAMES[updates.tool] || updates.tool) : g.toolName }
          : g
      )
    );

    // Update local storage
    const localGens = getLocalGenerations().map(g =>
      g.id === id ? { ...g, ...updates } : g
    );
    saveLocalGenerations(localGens);

    // Update in database if available
    if (supabase) {
      try {
        const { data: userData } = await supabase.auth.getUser();
        if (userData.user) {
          const dbUpdates: Record<string, any> = {};
          if (updates.status) dbUpdates.status = updates.status;
          if (updates.outputUrl) dbUpdates.output = { url: updates.outputUrl, thumbnailUrl: updates.thumbnailUrl };
          if (updates.errorMessage) dbUpdates.error_message = updates.errorMessage;
          if (updates.completedAt) dbUpdates.completed_at = updates.completedAt;
          if (updates.creditsUsed !== undefined) dbUpdates.credits_used = updates.creditsUsed;

          await supabase.from('generations').update(dbUpdates).eq('id', id);
        }
      } catch (error) {
        console.error('Error updating generation in database:', error);
      }
    }
  }, [supabase]);

  const getRecentGenerations = useCallback((limit = 10): Generation[] => {
    return generations.slice(0, limit);
  }, [generations]);

  const getGenerationsByTool = useCallback((tool: string): Generation[] => {
    return generations.filter(g => g.tool === tool);
  }, [generations]);

  const getStats = useCallback(() => {
    return {
      total: generations.length,
      completed: generations.filter(g => g.status === 'completed').length,
      failed: generations.filter(g => g.status === 'failed').length,
      creditsUsed: generations.reduce((sum, g) => sum + (g.creditsUsed || 0), 0),
    };
  }, [generations]);

  useEffect(() => {
    fetchGenerations();
  }, []);

  return (
    <GenerationHistoryContext.Provider
      value={{
        generations,
        loading,
        addGeneration,
        updateGeneration,
        fetchGenerations,
        getRecentGenerations,
        getGenerationsByTool,
        getStats,
      }}
    >
      {children}
    </GenerationHistoryContext.Provider>
  );
}

export function useGenerationHistory() {
  const context = useContext(GenerationHistoryContext);
  if (context === undefined) {
    throw new Error('useGenerationHistory must be used within a GenerationHistoryProvider');
  }
  return context;
}
