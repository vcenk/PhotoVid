/**
 * QuickVideoV2Page - AI-Powered Property Video Creator
 *
 * 3-panel layout:
 * - Left: Upload + template + format + highlights
 * - Center: Live Remotion preview + controls
 * - Right: AI script + voice selection (expandable)
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Download,
  Loader2,
  X,
  ChevronRight,
  Sparkles,
  AlertCircle,
} from 'lucide-react';
import { NavigationRail } from '../dashboard/navigation/NavigationRail';
import { DashboardTopbar } from '../dashboard/navigation/DashboardTopbar';
import { QuickVideoV2Provider, useQuickVideoV2 } from './QuickVideoV2Context';
import { UploadPanel } from './components/UploadPanel';
import { PreviewPanel } from './components/PreviewPanel';
import { VoicePanel } from './components/VoicePanel';

// ============================================================================
// Header Component
// ============================================================================

function Header() {
  const {
    isExporting,
    canExport,
    exportVideo,
  } = useQuickVideoV2();

  const handleExport = async () => {
    const url = await exportVideo();
    if (url) {
      // TODO: Show success modal or redirect
      console.log('Exported:', url);
    }
  };

  return (
    <header className="flex-shrink-0 h-14 flex items-center justify-between px-6 border-b border-zinc-200 dark:border-white/5 bg-white/80 dark:bg-zinc-900/50 backdrop-blur-xl">
      {/* Spacer for layout balance */}
      <div className="w-24" />

      {/* Title */}
      <div className="flex flex-col items-center">
        <div className="flex items-center gap-2">
          <Sparkles size={18} className="text-emerald-500 dark:text-emerald-400" />
          <h1 className="text-lg font-semibold text-zinc-900 dark:text-white">Quick Property Video</h1>
        </div>
        <p className="text-xs text-zinc-500 dark:text-zinc-500">AI-Powered</p>
      </div>

      {/* Export Button */}
      <button
        onClick={handleExport}
        disabled={!canExport() || isExporting}
        className={`
          flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium transition-all duration-300
          ${canExport() && !isExporting
            ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white hover:from-emerald-500 hover:to-teal-500 shadow-lg shadow-emerald-600/25 dark:shadow-emerald-900/25'
            : 'bg-zinc-200 dark:bg-zinc-800 text-zinc-400 dark:text-zinc-500 cursor-not-allowed'
          }
        `}
      >
        {isExporting ? (
          <>
            <Loader2 size={18} className="animate-spin" />
            <span>Exporting...</span>
          </>
        ) : (
          <>
            <Download size={18} />
            <span>Export</span>
          </>
        )}
      </button>
    </header>
  );
}

// ============================================================================
// Error Banner
// ============================================================================

function ErrorBanner() {
  const { error, clearError } = useQuickVideoV2();

  if (!error) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="mx-6 mt-4"
    >
      <div className="flex items-center gap-3 p-4 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-xl">
        <AlertCircle size={18} className="text-red-500 dark:text-red-400 flex-shrink-0" />
        <p className="flex-1 text-sm text-red-700 dark:text-red-200">{error}</p>
        <button
          onClick={clearError}
          className="p-1 hover:bg-red-500/20 rounded-lg transition-colors"
        >
          <X size={16} className="text-red-400" />
        </button>
      </div>
    </motion.div>
  );
}

// ============================================================================
// Main Content
// ============================================================================

function MainContent() {
  const { project } = useQuickVideoV2();
  const [isVoicePanelOpen, setIsVoicePanelOpen] = useState(false);

  // Auto-open voice panel when script is generated
  React.useEffect(() => {
    if (project.script && !isVoicePanelOpen) {
      setIsVoicePanelOpen(true);
    }
  }, [project.script]);

  return (
    <div className="flex-1 flex min-h-0 overflow-hidden">
      {/* Left Panel - Upload */}
      <div className="w-[320px] flex-shrink-0 border-r border-zinc-200 dark:border-white/5 overflow-y-auto custom-scrollbar bg-white dark:bg-transparent">
        <UploadPanel />
      </div>

      {/* Center Panel - Preview */}
      <div className="flex-1 min-w-0 flex flex-col bg-zinc-50 dark:bg-transparent">
        <PreviewPanel />
      </div>

      {/* Right Panel - Voice (Collapsible) */}
      <AnimatePresence>
        {isVoicePanelOpen && (
          <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 340, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="flex-shrink-0 border-l border-zinc-200 dark:border-white/5 overflow-hidden bg-white dark:bg-transparent"
          >
            <VoicePanel onClose={() => setIsVoicePanelOpen(false)} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toggle Voice Panel Button (when closed) */}
      {!isVoicePanelOpen && project.script && (
        <button
          onClick={() => setIsVoicePanelOpen(true)}
          className="absolute right-0 top-1/2 -translate-y-1/2 z-10 p-2 bg-emerald-600 hover:bg-emerald-500 rounded-l-xl shadow-lg transition-colors"
        >
          <ChevronRight size={20} className="text-white rotate-180" />
        </button>
      )}
    </div>
  );
}

// ============================================================================
// Page Layout
// ============================================================================

function QuickVideoV2Layout({ onMenuClick }: { onMenuClick: () => void }) {
  return (
    <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
      {/* Background Gradients */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-emerald-600/10 rounded-full blur-[150px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-teal-600/10 rounded-full blur-[150px]" />
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col h-full">
        <DashboardTopbar onMenuClick={onMenuClick} />
        <Header />
        <ErrorBanner />
        <MainContent />
      </div>
    </div>
  );
}

// ============================================================================
// Page Export (with Provider)
// ============================================================================

export function QuickVideoV2Page() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <QuickVideoV2Provider>
      <div className="flex h-screen bg-white dark:bg-[#050505] text-zinc-900 dark:text-white font-[Space_Grotesk] overflow-hidden selection:bg-emerald-500/30">
        <NavigationRail
          isMobileOpen={mobileMenuOpen}
          onMobileClose={() => setMobileMenuOpen(false)}
        />
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden ml-0 lg:ml-16">
          <QuickVideoV2Layout onMenuClick={() => setMobileMenuOpen(true)} />
        </div>
      </div>
    </QuickVideoV2Provider>
  );
}

export default QuickVideoV2Page;
