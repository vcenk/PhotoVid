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
    <div className="h-screen w-screen flex bg-[#0a0a0b] overflow-hidden">
      {/* Navigation Rail - hideable */}
      {!navHidden && (
        <>
          <NavigationRail isMobileOpen={mobileMenuOpen} onMobileClose={() => setMobileMenuOpen(false)} />
        </>
      )}

      {/* Main Content - takes remaining space after nav rail */}
      <div className={`flex-1 flex flex-col min-h-0 min-w-0 ${navHidden ? '' : 'ml-0 lg:ml-16'}`}>
        {/* ===== TOP HEADER BAR (compact h-11) ===== */}
        <header className="h-11 flex-shrink-0 bg-[#111113] border-b border-white/5 flex items-center justify-between px-3">
          {/* Left: Back + Project Name */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setNavHidden(!navHidden)}
              className="p-1.5 hover:bg-white/5 rounded-lg transition-colors"
              title={navHidden ? 'Show sidebar' : 'Hide sidebar'}
            >
              {navHidden ? (
                <PanelLeftOpen size={16} className="text-zinc-400" />
              ) : (
                <PanelLeftClose size={16} className="text-zinc-400" />
              )}
            </button>
            <div className="w-px h-4 bg-white/10" />
            <button
              onClick={() => navigate('/studio/real-estate')}
              className="p-1.5 hover:bg-white/5 rounded-lg transition-colors"
            >
              <ArrowLeft size={16} className="text-zinc-400" />
            </button>
            <Film size={16} className="text-purple-400" />
            <input
              type="text"
              value={project.name}
              onChange={(e) => setProjectName(e.target.value)}
              className="bg-transparent text-white font-medium text-sm focus:outline-none focus:bg-white/5 px-1.5 py-0.5 rounded w-48"
              placeholder="Untitled Project"
            />
          </div>

          {/* Center: Format Selector */}
          <div className="flex items-center gap-0.5 bg-zinc-900/50 rounded-lg p-0.5">
            {FORMAT_OPTIONS.map((format) => (
              <button
                key={format.id}
                onClick={() => setFormat(format.id)}
                className={`flex items-center gap-1 px-2.5 py-1 rounded text-xs font-medium transition-all ${
                  project.format === format.id
                    ? 'bg-purple-500/20 text-purple-400'
                    : 'text-zinc-500 hover:text-zinc-300 hover:bg-white/5'
                }`}
              >
                {format.icon}
                {format.label}
              </button>
            ))}
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={undo}
              disabled={!canUndo}
              className="p-1.5 hover:bg-white/5 rounded-lg transition-colors disabled:opacity-30"
              title="Undo (Ctrl+Z)"
            >
              <Undo2 size={14} className="text-zinc-400" />
            </button>
            <button
              onClick={redo}
              disabled={!canRedo}
              className="p-1.5 hover:bg-white/5 rounded-lg transition-colors disabled:opacity-30"
              title="Redo (Ctrl+Shift+Z)"
            >
              <Redo2 size={14} className="text-zinc-400" />
            </button>
            <button className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-xs font-medium rounded-lg hover:from-purple-500 hover:to-indigo-500 transition-all relative ml-1">
              <Download size={14} />
              Download
              <span className="absolute -top-1 -right-1 text-[8px] bg-amber-500 text-black px-1 py-px rounded-full font-bold leading-none">
                Soon
              </span>
            </button>
          </div>
        </header>

        {/* ===== EDITOR BODY ===== */}
        <div className="flex-1 flex overflow-hidden min-h-0">
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
