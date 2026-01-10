import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Industry, Workflow, IndustryId, Template } from '../../types/studio';
import { INDUSTRIES } from '../../data/workflows';

type StudioView = 'dashboard' | 'wizard' | 'canvas' | 'assets';

interface StudioContextType {
  currentView: StudioView;
  selectedIndustry: Industry | null;
  selectedWorkflow: Workflow | null;
  selectedTemplate: Template | null;
  selectIndustry: (id: IndustryId) => void;
  selectWorkflow: (workflow: Workflow) => void;
  selectTemplate: (template: Template) => void;
  openWizardWithTemplate: (template: Template) => void;
  goHome: () => void;
  openCanvas: () => void;
  openAssets: () => void;
}

const StudioContext = createContext<StudioContextType | undefined>(undefined);

export function StudioProvider({ children }: { children: ReactNode }) {
  const [currentView, setCurrentView] = useState<StudioView>('dashboard');
  const [selectedIndustry, setSelectedIndustry] = useState<Industry | null>(null);
  const [selectedWorkflow, setSelectedWorkflow] = useState<Workflow | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);

  const selectIndustry = (id: IndustryId) => {
    const industry = INDUSTRIES.find(i => i.id === id) || null;
    setSelectedIndustry(industry);
  };

  const selectWorkflow = (workflow: Workflow) => {
    setSelectedWorkflow(workflow);
    setCurrentView('wizard');
  };

  const selectTemplate = (template: Template) => {
    setSelectedTemplate(template);
  };

  // Open wizard with a specific template pre-configured
  const openWizardWithTemplate = (template: Template) => {
    // Find a matching workflow for this template's industry
    const industry = INDUSTRIES.find(i => i.id === template.industryId);
    if (industry && industry.workflows.length > 0) {
      // Use the first workflow of the matching industry
      const workflow = industry.workflows[0];
      setSelectedIndustry(industry);
      setSelectedWorkflow(workflow);
      setSelectedTemplate(template);
      setCurrentView('wizard');
    }
  };

  const goHome = () => {
    setCurrentView('dashboard');
    setSelectedWorkflow(null);
    setSelectedIndustry(null);
    setSelectedTemplate(null);
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
      selectedTemplate,
      selectIndustry,
      selectWorkflow,
      selectTemplate,
      openWizardWithTemplate,
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

