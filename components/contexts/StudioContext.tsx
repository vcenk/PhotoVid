import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Industry, Workflow, IndustryId } from '../../lib/types/studio';
import { INDUSTRIES } from '../../lib/data/workflows';

type StudioView = 'dashboard' | 'wizard' | 'canvas' | 'assets';

interface StudioContextType {
  currentView: StudioView;
  selectedIndustry: Industry | null;
  selectedWorkflow: Workflow | null;
  selectIndustry: (id: IndustryId) => void;
  selectWorkflow: (workflow: Workflow) => void;
  goHome: () => void;
  openCanvas: () => void;
  openAssets: () => void;
}

const StudioContext = createContext<StudioContextType | undefined>(undefined);

export function StudioProvider({ children }: { children: ReactNode }) {
  const [currentView, setCurrentView] = useState<StudioView>('dashboard');
  const [selectedIndustry, setSelectedIndustry] = useState<Industry | null>(null);
  const [selectedWorkflow, setSelectedWorkflow] = useState<Workflow | null>(null);

  const selectIndustry = (id: IndustryId) => {
    const industry = INDUSTRIES.find(i => i.id === id) || null;
    setSelectedIndustry(industry);
  };

  const selectWorkflow = (workflow: Workflow) => {
    setSelectedWorkflow(workflow);
    setCurrentView('wizard');
  };

  const goHome = () => {
    setCurrentView('dashboard');
    setSelectedWorkflow(null);
    setSelectedIndustry(null);
  };

  const openCanvas = () => {
    setCurrentView('canvas');
    setSelectedWorkflow(null);
  };

  const openAssets = () => {
    setCurrentView('assets');
    setSelectedWorkflow(null);
  };

  return (
    <StudioContext.Provider value={{
      currentView,
      selectedIndustry,
      selectedWorkflow,
      selectIndustry,
      selectWorkflow,
      goHome,
      openCanvas,
      openAssets
    }}>
      {children}
    </StudioContext.Provider>
  );
}

export function useStudio() {
  const context = useContext(StudioContext);
  if (context === undefined) {
    throw new Error('useStudio must be used within a StudioProvider');
  }
  return context;
}
