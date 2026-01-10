import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Mode = 'image' | 'video' | 'edit';
export type Industry = 'real-estate' | 'hospitality' | 'retail';
export type WorkflowFilter = 'all' | 'virtual-staging' | 'menu-design' | 'product-photography';

export interface Generation {
  id: string;
  prompt: string;
  mode: Mode;
  industry: Industry;
  thumbnailUrl: string;
  createdAt: string;
  type: 'image' | 'video';
}

interface DashboardState {
  promptDraft: string;
  selectedMode: Mode;
  activeIndustry: Industry;
  selectedWorkflowFilter: WorkflowFilter;
  recentGenerations: Generation[];

  setPromptDraft: (value: string) => void;
  setSelectedMode: (value: Mode) => void;
  setActiveIndustry: (value: Industry) => void;
  setWorkflowFilter: (value: WorkflowFilter) => void;
  addGeneration: (gen: Generation) => void;
  loadFromStorage: () => void;
}

export const useDashboardStore = create<DashboardState>()(
  persist(
    (set, get) => ({
      promptDraft: '',
      selectedMode: 'image',
      activeIndustry: 'real-estate',
      selectedWorkflowFilter: 'all',
      recentGenerations: [],

      setPromptDraft: (value) => set({ promptDraft: value }),
      setSelectedMode: (value) => set({ selectedMode: value }),
      setActiveIndustry: (value) => set({ activeIndustry: value }),
      setWorkflowFilter: (value) => set({ selectedWorkflowFilter: value }),

      addGeneration: (gen) => set((state) => ({
        recentGenerations: [gen, ...state.recentGenerations].slice(0, 20)
      })),

      loadFromStorage: () => {
        // Already handled by persist middleware
      },
    }),
    {
      name: 'photovid.dashboard',
      partialize: (state) => ({
        promptDraft: state.promptDraft,
        selectedMode: state.selectedMode,
        activeIndustry: state.activeIndustry,
        recentGenerations: state.recentGenerations,
      }),
    }
  )
);
