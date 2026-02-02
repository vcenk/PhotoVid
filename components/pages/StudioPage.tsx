import React, { useState } from 'react';
import { StudioProvider, useStudio } from '../../lib/store/contexts/StudioContext';
import { WizardProvider } from '../../lib/store/contexts/WizardContext';
import { ProjectProvider, useProjects } from '../../lib/store/contexts/ProjectContext';
import { AssetProvider } from '../../lib/store/contexts/AssetContext';
import { WizardContainer } from '../studio/wizard/WizardContainer';
import { AssetLibrary } from '../studio/shared/AssetLibrary';
import { NavigationRail } from '../dashboard/navigation/NavigationRail';
import { DashboardTopbar } from '../dashboard/navigation/DashboardTopbar';
import { ChevronLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { HeroComposer } from '../dashboard/home/HeroComposer';
import { RecentActivity } from '../dashboard/home/RecentActivity';
import { DashboardStats } from '../dashboard/home/DashboardStats';
import { IndustryFeaturedTools } from '../dashboard/home/IndustryFeaturedTools';
import { CategoryBrowser } from '../dashboard/home/CategoryBrowser';
import { AppGrid } from '../dashboard/home/AppGrid';
import { Template } from '../../lib/types/studio';

const StudioContent: React.FC = () => {
  const { currentView, selectedWorkflow, selectedTemplate, goHome, openWizardWithTemplate } = useStudio();
  const { projects } = useProjects();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const handleTemplateSelect = (template: Template) => {
    openWizardWithTemplate(template);
  };

  return (
    <div className="flex h-screen bg-white dark:bg-[#09090b] text-zinc-900 dark:text-white font-sans overflow-hidden">
      {/* Navigation Rail - Left Sidebar */}
      <NavigationRail
        isMobileOpen={mobileMenuOpen}
        onMobileClose={() => setMobileMenuOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden ml-0 lg:ml-16">
        {/* Topbar */}
        <DashboardTopbar onMenuClick={() => setMobileMenuOpen(true)} />

        {/* Main Scrollable Content */}
        <main className="flex-1 overflow-y-auto bg-white dark:bg-[#09090b]">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentView}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="h-full"
            >
              {currentView === 'dashboard' && (
                <>
                  {/* Compact Hero Banner */}
                  <HeroComposer />

                  <div className="max-w-7xl mx-auto px-6 space-y-8 pb-16">
                    {/* Quick Stats */}
                    <DashboardStats />

                    {/* Featured Applications Carousel */}
                    <IndustryFeaturedTools />

                    {/* Browse by Category */}
                    <CategoryBrowser
                      activeCategory={activeCategory}
                      onCategoryChange={setActiveCategory}
                    />

                    {/* All Apps Grid */}
                    <AppGrid category={activeCategory} />

                    {/* Recent Work */}
                    <RecentActivity />
                  </div>
                </>
              )}

              {currentView === 'wizard' && selectedWorkflow && (
                <div className="p-8 max-w-7xl mx-auto w-full">
                  <button
                    onClick={goHome}
                    className="mb-4 flex items-center gap-2 text-sm text-zinc-500 hover:text-zinc-900 transition-colors"
                  >
                    <ChevronLeft size={16} />
                    Back to Dashboard
                  </button>
                  <WizardProvider workflow={selectedWorkflow} template={selectedTemplate}>
                    <WizardContainer />
                  </WizardProvider>
                </div>
              )}

              {currentView === 'canvas' && (
                <div className="p-8 max-w-7xl mx-auto w-full text-center">
                  <div className="bg-indigo-50 dark:bg-indigo-950/30 rounded-2xl p-8 border border-indigo-200 dark:border-indigo-800">
                    <h3 className="text-lg font-bold text-zinc-900 dark:text-white mb-2">
                      Canvas Mode Moved!
                    </h3>
                    <p className="text-zinc-600 dark:text-zinc-400 mb-4">
                      The new ComfyUI-style workflow canvas is now available as a dedicated page.
                    </p>
                    <button
                      onClick={() => navigate('/studio/workflow')}
                      className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-colors"
                    >
                      Go to Workflow Canvas
                    </button>
                  </div>
                </div>
              )}

              {currentView === 'assets' && (
                <div className="p-8 max-w-7xl mx-auto w-full">
                  <AssetLibrary />
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
};

export const StudioPage: React.FC = () => {
  return (
    <AssetProvider>
      <ProjectProvider>
        <StudioProvider>
          <StudioContent />
        </StudioProvider>
      </ProjectProvider>
    </AssetProvider>
  );
};
