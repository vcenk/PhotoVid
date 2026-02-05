/**
 * EditorLayout
 * Full-screen editor: Header | Sidebar + Preview/Timeline + Inspector
 * Designed to fit exactly in viewport without overflow
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Film,
  Download,
  Undo2,
  Redo2,
  Monitor,
  Square,
  Smartphone,
  PanelLeftClose,
  PanelLeftOpen,
} from 'lucide-react';
import { useVideoEditor } from '../VideoEditorContext';
import { AssetSidebar } from './AssetSidebar';
import { PreviewPanel } from './PreviewPanel';
import { ClipInspector } from './ClipInspector';
import { NavigationRail } from '@/components/dashboard/navigation/NavigationRail';
import type { ExportFormat } from '@/lib/types/video-editor';

const FORMAT_OPTIONS: { id: ExportFormat; label: string; icon: React.ReactNode }[] = [
  { id: 'landscape', label: '16:9', icon: <Monitor size={14} /> },
  { id: 'square', label: '1:1', icon: <Square size={14} /> },
  { id: 'vertical', label: '9:16', icon: <Smartphone size={14} /> },
];

export const EditorLayout: React.FC = () => {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [navHidden, setNavHidden] = useState(false);
  const { project, setFormat, setProjectName, canUndo, canRedo, undo, redo } = useVideoEditor();

  // Undo/Redo keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement || e.target instanceof HTMLSelectElement || (e.target as HTMLElement).isContentEditable) return;

      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        undo();
      } else if ((e.ctrlKey || e.metaKey) && e.key === 'z' && e.shiftKey) {
        e.preventDefault();
        redo();
      } else if ((e.ctrlKey || e.metaKey) && e.key === 'y') {
        e.preventDefault();
        redo();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [undo, redo]);

  return (
    <div className="h-screen w-screen flex bg-[#050505] overflow-hidden selection:bg-purple-500/30">
      {/* Background Gradients */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[30%] h-[30%] bg-purple-600/10 rounded-full blur-[120px] opacity-40" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[30%] h-[30%] bg-indigo-600/10 rounded-full blur-[120px] opacity-40" />
      </div>

      {/* Navigation Rail - hideable */}
      {!navHidden && (
        <div className="relative z-20">
          <NavigationRail isMobileOpen={mobileMenuOpen} onMobileClose={() => setMobileMenuOpen(false)} />
        </div>
      )}

      {/* Main Content - takes remaining space after nav rail */}
      <div className={`flex-1 flex flex-col min-h-0 min-w-0 relative z-10 transition-all duration-500 ${navHidden ? '' : 'ml-0 lg:ml-16'}`}>
        {/* ===== TOP HEADER BAR (compact h-12) ===== */}
        <header className="h-12 flex-shrink-0 bg-zinc-900/40 backdrop-blur-xl border-b border-white/5 flex items-center justify-between px-4 shadow-lg shadow-black/20 relative z-30">
          {/* Left: Back + Project Name */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setNavHidden(!navHidden)}
              className="p-2 hover:bg-white/10 rounded-xl transition-all group"
              title={navHidden ? 'Show sidebar' : 'Hide sidebar'}
            >
              {navHidden ? (
                <PanelLeftOpen size={18} className="text-zinc-400 group-hover:text-white transition-colors" />
              ) : (
                <PanelLeftClose size={18} className="text-zinc-400 group-hover:text-white transition-colors" />
              )}
            </button>
            <div className="w-px h-5 bg-white/10" />
            <button
              onClick={() => navigate('/studio/real-estate')}
              className="p-2 hover:bg-white/10 rounded-xl transition-all group"
              title="Back"
            >
              <ArrowLeft size={18} className="text-zinc-400 group-hover:text-white transition-colors" />
            </button>
            
            <div className="flex items-center gap-2 px-3 py-1 bg-white/5 rounded-full border border-white/5">
                <Film size={16} className="text-purple-400" />
                <input
                type="text"
                value={project.name}
                onChange={(e) => setProjectName(e.target.value)}
                className="bg-transparent text-white font-semibold text-sm focus:outline-none w-40 placeholder-zinc-600"
                placeholder="Untitled Project"
                />
            </div>
          </div>

          {/* Center: Format Selector */}
          <div className="flex items-center p-1 bg-black/40 backdrop-blur-md rounded-xl border border-white/5 shadow-inner shadow-black/50">
            {FORMAT_OPTIONS.map((format) => (
              <button
                key={format.id}
                onClick={() => setFormat(format.id)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold tracking-tight transition-all duration-300 ${
                  project.format === format.id
                    ? 'bg-purple-600 text-white shadow-lg shadow-purple-900/40'
                    : 'text-zinc-500 hover:text-zinc-300 hover:bg-white/5'
                }`}
              >
                {format.icon}
                {format.label}
              </button>
            ))}
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-2">
            <div className="flex items-center bg-black/20 rounded-xl p-1 border border-white/5">
                <button
                onClick={undo}
                disabled={!canUndo}
                className="p-1.5 hover:bg-white/10 rounded-lg transition-all disabled:opacity-20 disabled:cursor-not-allowed group"
                title="Undo (Ctrl+Z)"
                >
                <Undo2 size={16} className="text-zinc-400 group-hover:text-white transition-colors" />
                </button>
                <button
                onClick={redo}
                disabled={!canRedo}
                className="p-1.5 hover:bg-white/10 rounded-lg transition-all disabled:opacity-20 disabled:cursor-not-allowed group"
                title="Redo (Ctrl+Shift+Z)"
                >
                <Redo2 size={16} className="text-zinc-400 group-hover:text-white transition-colors" />
                </button>
            </div>
            
            <button className="group flex items-center gap-2 px-4 py-1.5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-xs font-bold rounded-xl hover:from-purple-500 hover:to-indigo-500 transition-all shadow-lg shadow-purple-900/20 hover:shadow-purple-600/40 hover:-translate-y-0.5 relative">
              <Download size={16} className="group-hover:scale-110 transition-transform" />
              Export
              <span className="absolute -top-1.5 -right-1.5 text-[7px] bg-amber-500 text-black px-1.5 py-0.5 rounded-full font-black leading-none uppercase tracking-tighter shadow-md">
                Beta
              </span>
            </button>
          </div>
        </header>

        {/* ===== EDITOR BODY ===== */}
        <div className="flex-1 flex overflow-hidden min-h-0 relative z-20">
          {/* Asset Sidebar (left) */}
          <AssetSidebar />

          {/* Preview + Timeline (center) */}
          <PreviewPanel />

          {/* Inspector (right, conditional on clip selection) */}
          <ClipInspector />
        </div>
      </div>
    </div>
  );
};
