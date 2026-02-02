import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { NavigationRail } from '../dashboard/navigation/NavigationRail';
import { StoryboardProvider, useStoryboard } from '@/lib/store/contexts/StoryboardContext';
import { StoryboardEditor } from '../storyboard/StoryboardEditor';
import { PropertyInputForm } from '../storyboard/PropertyInputForm';
import { PropertyData } from '@/lib/types/storyboard';
import { Video, ArrowRight, Building2, Loader2, FileText, Wand2 } from 'lucide-react';

type CreationMode = 'select' | 'quick' | 'detailed';

// New Storyboard Creation Form
const NewStoryboardForm: React.FC = () => {
  const navigate = useNavigate();
  const { createStoryboard, createStoryboardWithAutoScenes } = useStoryboard();
  const [mode, setMode] = useState<CreationMode>('select');
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [creating, setCreating] = useState(false);

  const handleQuickCreate = () => {
    if (!name.trim()) return;
    setCreating(true);
    createStoryboard(name, { address });
  };

  const handleDetailedSubmit = (propertyData: PropertyData) => {
    const storyboardName = propertyData.address || 'Property Storyboard';
    createStoryboard(storyboardName, propertyData);
  };

  const handleAutoGenerate = (propertyData: PropertyData) => {
    setCreating(true);
    const storyboardName = propertyData.address || 'Property Storyboard';
    createStoryboardWithAutoScenes(storyboardName, propertyData);
  };

  // Mode Selection Screen
  if (mode === 'select') {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="max-w-2xl w-full">
          <div className="text-center mb-10">
            <div className="w-16 h-16 rounded-2xl bg-violet-500/20 flex items-center justify-center mx-auto mb-4">
              <Video size={32} className="text-violet-400" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">Create Property Storyboard</h1>
            <p className="text-zinc-400 text-sm">
              Build a cinematic video tour from photos of your property listing
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-8">
            {/* Quick Start Option */}
            <button
              onClick={() => setMode('quick')}
              className="p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-violet-500/50 hover:bg-violet-500/5 transition-all text-left group"
            >
              <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center mb-4 group-hover:bg-blue-500/30 transition-colors">
                <FileText size={24} className="text-blue-400" />
              </div>
              <h3 className="text-sm font-semibold text-white mb-2">Quick Start</h3>
              <p className="text-xs text-zinc-400">
                Start with a blank storyboard and add scenes manually as you upload photos.
              </p>
            </button>

            {/* AI Auto-Generate Option */}
            <button
              onClick={() => setMode('detailed')}
              className="p-6 rounded-2xl bg-gradient-to-br from-violet-500/10 to-purple-500/10 border border-violet-500/30 hover:border-violet-500/50 transition-all text-left group"
            >
              <div className="w-12 h-12 rounded-xl bg-violet-500/20 flex items-center justify-center mb-4 group-hover:bg-violet-500/30 transition-colors">
                <Wand2 size={24} className="text-violet-400" />
              </div>
              <h3 className="text-sm font-semibold text-white mb-2 flex items-center gap-2">
                AI Auto-Generate
                <span className="px-1.5 py-0.5 bg-violet-500/30 text-violet-300 rounded text-[10px] uppercase">Recommended</span>
              </h3>
              <p className="text-xs text-zinc-400">
                Enter property details and let AI generate an optimized scene list automatically.
              </p>
            </button>
          </div>

          <div className="p-4 rounded-xl bg-white/5 border border-white/10">
            <h3 className="text-sm font-medium text-white mb-3 flex items-center gap-2">
              <Building2 size={16} className="text-violet-400" />
              How it works
            </h3>
            <ol className="space-y-2 text-xs text-zinc-400">
              <li className="flex gap-2">
                <span className="w-5 h-5 rounded-full bg-violet-500/20 text-violet-400 flex items-center justify-center flex-shrink-0">1</span>
                Enter property details or start with a blank storyboard
              </li>
              <li className="flex gap-2">
                <span className="w-5 h-5 rounded-full bg-violet-500/20 text-violet-400 flex items-center justify-center flex-shrink-0">2</span>
                Upload photos of each room and area
              </li>
              <li className="flex gap-2">
                <span className="w-5 h-5 rounded-full bg-violet-500/20 text-violet-400 flex items-center justify-center flex-shrink-0">3</span>
                Generate AI-powered video clips with motion
              </li>
              <li className="flex gap-2">
                <span className="w-5 h-5 rounded-full bg-violet-500/20 text-violet-400 flex items-center justify-center flex-shrink-0">4</span>
                Preview and export your property tour
              </li>
            </ol>
          </div>
        </div>
      </div>
    );
  }

  // Quick Start Mode
  if (mode === 'quick') {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="max-w-md w-full">
          <button
            onClick={() => setMode('select')}
            className="mb-6 text-xs text-zinc-400 hover:text-white flex items-center gap-1"
          >
            <ArrowRight size={12} className="rotate-180" />
            Back
          </button>

          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-2xl bg-blue-500/20 flex items-center justify-center mx-auto mb-4">
              <FileText size={32} className="text-blue-400" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">Quick Start</h1>
            <p className="text-zinc-400 text-sm">
              Create a blank storyboard and add scenes as you go
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-xs font-medium text-zinc-400 uppercase tracking-wide mb-2 block">
                Storyboard Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., 123 Main Street Tour"
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-violet-500"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-zinc-400 uppercase tracking-wide mb-2 block">
                Property Address (optional)
              </label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="e.g., 123 Main Street, City, State"
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-violet-500"
              />
            </div>

            <button
              onClick={handleQuickCreate}
              disabled={!name.trim() || creating}
              className={`w-full py-3 rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-2 ${
                name.trim() && !creating
                  ? 'bg-blue-600 hover:bg-blue-500 text-white'
                  : 'bg-white/5 text-zinc-600 cursor-not-allowed'
              }`}
            >
              {creating ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <>
                  Create Storyboard
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Detailed Mode with PropertyInputForm
  return (
    <div className="flex-1 overflow-y-auto p-8">
      <div className="max-w-2xl mx-auto">
        <button
          onClick={() => setMode('select')}
          className="mb-6 text-xs text-zinc-400 hover:text-white flex items-center gap-1"
        >
          <ArrowRight size={12} className="rotate-180" />
          Back
        </button>

        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-violet-500/20 flex items-center justify-center mx-auto mb-4">
            <Wand2 size={32} className="text-violet-400" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">AI Auto-Generate Storyboard</h1>
          <p className="text-zinc-400 text-sm">
            Enter your property details and let AI create an optimized scene list
          </p>
        </div>

        <PropertyInputForm
          onSubmit={handleDetailedSubmit}
          onAutoGenerate={handleAutoGenerate}
          isGenerating={creating}
        />
      </div>
    </div>
  );
};

// Main Storyboard Page Content
const StoryboardPageContent: React.FC = () => {
  const { storyboard, loading } = useStoryboard();

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Loader2 size={32} className="text-violet-400 animate-spin" />
      </div>
    );
  }

  if (!storyboard) {
    return <NewStoryboardForm />;
  }

  return <StoryboardEditor />;
};

export const StoryboardPage: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <StoryboardProvider>
      <div className="h-screen flex bg-[#0a0a0b]">
        <NavigationRail isMobileOpen={mobileMenuOpen} onMobileClose={() => setMobileMenuOpen(false)} />
<div className="flex-1 flex flex-col ml-0 lg:ml-16">
          <StoryboardPageContent />
        </div>
      </div>
    </StoryboardProvider>
  );
};
