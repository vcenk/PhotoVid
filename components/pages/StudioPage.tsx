import React from 'react';
import { StudioProvider, useStudio } from '../contexts/StudioContext';
import { WizardProvider } from '../contexts/WizardContext';
import { ProjectProvider, useProjects } from '../contexts/ProjectContext';
import { AssetProvider, useAssets } from '../contexts/AssetContext';
import { IndustrySelector } from '../studio/IndustrySelector';
import { WorkflowGrid } from '../studio/WorkflowGrid';
import { WizardContainer } from '../studio/wizard/WizardContainer';
import { CanvasEditor } from '../studio/nodes/CanvasEditor';
import { AssetLibrary } from '../studio/AssetLibrary';
import { LayoutDashboard, Folder, Settings, LogOut, Plus, ChevronLeft, GitGraph, Clock, Image as ImageIcon } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

const StudioContent: React.FC = () => {
  const { currentView, selectedWorkflow, goHome, openCanvas, openAssets } = useStudio();
  const { projects, loading } = useProjects();
  const navigate = useNavigate();

  return (
    <div className="flex h-screen bg-zinc-50 text-zinc-900 font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-zinc-200 flex flex-col hidden md:flex shrink-0">
        <div className="p-6 border-b border-zinc-100">
          <Link to="/" className="text-xl font-bold tracking-tighter">
            PHOTOVID.<span className="text-indigo-600 text-xs align-top">STUDIO</span>
          </Link>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          <div className="px-3 py-2 text-xs font-semibold text-zinc-400 uppercase tracking-wider">
            Workspace
          </div>
          <button 
            onClick={goHome}
            className={`
              w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-xl transition-all duration-200
              ${currentView === 'dashboard' ? 'bg-indigo-50 text-indigo-700 shadow-sm' : 'text-zinc-600 hover:bg-zinc-50'}
            `}
          >
            <LayoutDashboard size={18} />
            Dashboard
          </button>
          <button 
            onClick={openCanvas}
            className={`
              w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-xl transition-all duration-200
              ${currentView === 'canvas' ? 'bg-indigo-50 text-indigo-700 shadow-sm' : 'text-zinc-600 hover:bg-zinc-50'}
            `}
          >
            <GitGraph size={18} />
            Node Canvas
          </button>
          <button 
            onClick={openAssets}
            className={`
              w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-xl transition-all duration-200
              ${currentView === 'assets' ? 'bg-indigo-50 text-indigo-700 shadow-sm' : 'text-zinc-600 hover:bg-zinc-50'}
            `}
          >
            <ImageIcon size={18} />
            Media Library
          </button>
          <button className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-xl text-zinc-600 hover:bg-zinc-50 transition-all duration-200">
            <Folder size={18} />
            Projects ({projects.length})
          </button>
          <button className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-xl text-zinc-600 hover:bg-zinc-50 transition-all duration-200">
            <Settings size={18} />
            Settings
          </button>

          <div className="mt-8 px-3 py-2 text-xs font-semibold text-zinc-400 uppercase tracking-wider">
            Recent Projects
          </div>
          <div className="space-y-1">
            {projects.slice(0, 5).map(project => (
              <button key={project.id} className="w-full flex items-center gap-3 px-3 py-2 text-sm text-zinc-500 hover:bg-zinc-50 rounded-lg transition-all group">
                <div className="w-1 h-4 rounded-full bg-transparent group-hover:bg-indigo-500 transition-colors" />
                <span className="truncate">{project.name}</span>
              </button>
            ))}
            {projects.length === 0 && (
              <div className="px-3 py-2 text-sm text-zinc-400 italic">
                No projects yet
              </div>
            )}
          </div>
        </nav>

        <div className="p-4 border-t border-zinc-100">
          <button 
             onClick={() => navigate('/')}
             className="w-full flex items-center gap-2 px-3 py-2 text-sm text-zinc-600 hover:text-red-600 transition-colors rounded-xl"
          >
            <LogOut size={16} />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto flex flex-col relative">
        <header className="h-16 bg-white/80 backdrop-blur-md border-b border-zinc-200 flex items-center justify-between px-8 sticky top-0 z-10 shrink-0">
          <div className="flex items-center gap-4">
             {currentView === 'wizard' && (
               <button onClick={goHome} className="p-2 -ml-2 hover:bg-zinc-100 rounded-full text-zinc-500 transition-colors">
                 <ChevronLeft size={20} />
               </button>
             )}
             <h1 className="text-lg font-bold text-zinc-900 tracking-tight">
               {currentView === 'wizard' && selectedWorkflow 
                 ? selectedWorkflow.name 
                 : currentView === 'canvas' ? 'Node Editor' : 
                   currentView === 'assets' ? 'Media Library' : 'Studio Dashboard'}
             </h1>
          </div>
          <button className="bg-zinc-900 text-white px-5 py-2 rounded-xl text-sm font-bold hover:bg-zinc-800 transition-all active:scale-95 flex items-center gap-2 shadow-lg shadow-zinc-200">
            <Plus size={16} /> New Project
          </button>
        </header>

        <div className={`flex-1 ${currentView === 'canvas' ? 'p-0' : 'p-8 max-w-7xl mx-auto w-full'}`}>
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
                  <div className="mb-10">
                    <h2 className="text-4xl font-extrabold text-zinc-900 tracking-tight mb-3">Create something <span className="text-indigo-600">extraordinary.</span></h2>
                    <p className="text-lg text-zinc-500">Choose a professional workflow tailored to your industry.</p>
                  </div>

                  <IndustrySelector />
                  <WorkflowGrid />
                </>
              )}

              {currentView === 'wizard' && selectedWorkflow && (
                <WizardProvider workflow={selectedWorkflow}>
                    <WizardContainer />
                </WizardProvider>
              )}

              {currentView === 'canvas' && (
                <CanvasEditor />
              )}

              {currentView === 'assets' && (
                <AssetLibrary />
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
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
