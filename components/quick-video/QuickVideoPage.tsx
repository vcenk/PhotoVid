/**
 * QuickVideoPage - Main page for the Quick Video wizard
 * Provides a step-by-step flow for creating property videos
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Check } from 'lucide-react';
import { NavigationRail } from '../dashboard/navigation/NavigationRail';
import { DashboardTopbar } from '../dashboard/navigation/DashboardTopbar';
import { QuickVideoProvider, useQuickVideo, STEP_LABELS, WizardStep } from './QuickVideoContext';
import { TemplatePickerStep } from './steps/TemplatePickerStep';
import { PropertyDetailsStep } from './steps/PropertyDetailsStep';
import { ImageUploadStep } from './steps/ImageUploadStep';
import { BrandingStep } from './steps/BrandingStep';
import { PreviewStep } from './steps/PreviewStep';

// Step indicator component
function StepIndicator() {
  const { currentStep, goToStep, canProceed } = useQuickVideo();
  const steps: WizardStep[] = [1, 2, 3, 4, 5];

  return (
    <div className="flex items-center justify-center p-1.5 bg-zinc-100 dark:bg-white/5 backdrop-blur-md border border-zinc-200 dark:border-white/5 rounded-full shadow-lg shadow-zinc-200/50 dark:shadow-black/20">
      {steps.map((step) => {
        const isActive = step === currentStep;
        const isCompleted = step < currentStep;
        const isClickable = step <= currentStep || canProceed();

        return (
          <button
            key={step}
            onClick={() => isClickable && goToStep(step)}
            disabled={!isClickable}
            className={`
              relative flex items-center justify-center px-5 py-2 rounded-full transition-all duration-300
              ${isActive
                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/25'
                : isCompleted
                  ? 'text-emerald-600 dark:text-emerald-300 hover:text-emerald-700 dark:hover:text-emerald-200 hover:bg-emerald-50 dark:hover:bg-white/5'
                  : 'text-zinc-400 dark:text-zinc-500'
              }
              ${isClickable ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'}
            `}
          >
            <span className="flex items-center gap-2 relative z-10">
              {isCompleted ? (
                <div className="w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-500/20 flex items-center justify-center">
                  <Check size={12} className="text-emerald-600 dark:text-emerald-300" />
                </div>
              ) : (
                <span className={`text-sm font-semibold ${isActive ? 'text-white' : 'text-zinc-400 dark:text-zinc-500'}`}>
                  {step}
                </span>
              )}
              <span className={`text-sm font-medium whitespace-nowrap ${isActive ? 'text-white' : ''}`}>
                {STEP_LABELS[step]}
              </span>
            </span>
          </button>
        );
      })}
    </div>
  );
}

// Navigation buttons component
function NavigationButtons() {
  const { currentStep, nextStep, prevStep, canProceed, isLoading } = useQuickVideo();

  return (
    <div className="flex items-center justify-between">
      <button
        onClick={prevStep}
        disabled={currentStep === 1 || isLoading}
        className={`
          flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all duration-300
          ${currentStep === 1
            ? 'opacity-0 cursor-default'
            : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-white/5'
          }
          disabled:opacity-50 disabled:cursor-not-allowed
        `}
      >
        <ArrowLeft size={18} />
        Back
      </button>

      {currentStep < 5 ? (
        <button
          onClick={nextStep}
          disabled={!canProceed() || isLoading}
          className={`
            group flex items-center gap-2 px-8 py-3 rounded-xl font-semibold text-white transition-all duration-300 shadow-lg shadow-emerald-200 dark:shadow-emerald-900/20
            ${!canProceed() || isLoading
               ? 'bg-zinc-300 dark:bg-zinc-800 text-zinc-500 cursor-not-allowed'
               : 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 hover:shadow-emerald-600/30 hover:-translate-y-0.5'
            }
          `}
        >
          Continue
          <ArrowLeft size={18} className="rotate-180 group-hover:translate-x-1 transition-transform" />
        </button>
      ) : (
        <button
          disabled={isLoading}
          className={`
            group flex items-center gap-2 px-8 py-3 rounded-xl font-semibold text-white transition-all duration-300 shadow-lg shadow-emerald-200 dark:shadow-emerald-900/20
            ${isLoading
               ? 'bg-zinc-300 dark:bg-zinc-800 text-zinc-500 cursor-not-allowed'
               : 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 hover:shadow-emerald-600/30 hover:-translate-y-0.5'
            }
          `}
        >
          {isLoading ? 'Exporting...' : 'Export Video'}
          {!isLoading && <ArrowLeft size={18} className="rotate-180 group-hover:translate-x-1 transition-transform" />}
        </button>
      )}
    </div>
  );
}

// Step content renderer
function StepContent() {
  const { currentStep } = useQuickVideo();

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={currentStep}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        transition={{ duration: 0.2 }}
        className="flex-1 min-h-0 overflow-y-auto"
      >
        {currentStep === 1 && <TemplatePickerStep />}
        {currentStep === 2 && <PropertyDetailsStep />}
        {currentStep === 3 && <ImageUploadStep />}
        {currentStep === 4 && <BrandingStep />}
        {currentStep === 5 && <PreviewStep />}
      </motion.div>
    </AnimatePresence>
  );
}

// Main wizard content
function QuickVideoWizard({ mobileMenuOpen, setMobileMenuOpen }: { mobileMenuOpen: boolean; setMobileMenuOpen: (open: boolean) => void }) {
  const navigate = useNavigate();
  const { error, setError } = useQuickVideo();

  return (
    <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
      {/* Background Gradients */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-emerald-300/30 dark:bg-emerald-600/20 rounded-full blur-[120px] opacity-50" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-teal-300/30 dark:bg-teal-600/20 rounded-full blur-[120px] opacity-50" />
        <div className="absolute top-[20%] right-[20%] w-[20%] h-[20%] bg-fuchsia-300/20 dark:bg-fuchsia-600/10 rounded-full blur-[100px] opacity-30" />
      </div>

      {/* Dashboard Topbar */}
      <DashboardTopbar onMenuClick={() => setMobileMenuOpen(true)} />

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative z-10">
        {/* Header */}
        <div className="flex-shrink-0 h-16 flex items-center justify-between px-8">
          <button
            onClick={() => navigate('/studio/real-estate')}
            className="group flex items-center gap-2 px-4 py-2 rounded-full bg-zinc-100 dark:bg-white/5 hover:bg-zinc-200 dark:hover:bg-white/10 border border-zinc-200 dark:border-white/5 hover:border-zinc-300 dark:hover:border-white/10 backdrop-blur-md transition-all duration-300"
          >
            <ArrowLeft size={18} className="text-zinc-500 dark:text-zinc-400 group-hover:text-zinc-900 dark:group-hover:text-white transition-colors" />
            <span className="text-sm font-medium text-zinc-500 dark:text-zinc-400 group-hover:text-zinc-900 dark:group-hover:text-white transition-colors">Back to Real Estate</span>
          </button>

          <div className="flex flex-col items-center">
             <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-zinc-900 to-zinc-600 dark:from-white dark:to-white/60">Quick Property Video</h1>
             <p className="text-xs text-zinc-400 dark:text-white/40 font-medium tracking-wide uppercase mt-0.5">AI Studio</p>
          </div>

          <div className="w-32" />
        </div>

        {/* Step Indicator */}
        <div className="flex justify-center pb-6">
           <StepIndicator />
        </div>

        {/* Error Banner */}
        {error && (
          <div className="mx-auto max-w-lg w-full mb-6 px-4">
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 bg-red-50 dark:bg-red-500/10 backdrop-blur-md border border-red-200 dark:border-red-500/20 rounded-2xl flex items-start justify-between gap-4"
            >
              <div className="flex gap-3">
                 <div className="w-1.5 h-1.5 rounded-full bg-red-500 mt-2" />
                 <p className="text-red-700 dark:text-red-200 text-sm leading-relaxed">{error}</p>
              </div>
              <button
                onClick={() => setError(null)}
                className="text-red-500 dark:text-red-400 hover:text-red-700 dark:hover:text-white transition-colors text-xs font-medium px-2 py-1 hover:bg-red-100 dark:hover:bg-red-500/20 rounded-lg"
              >
                Dismiss
              </button>
            </motion.div>
          </div>
        )}

        {/* Main Content Area - Glass Card */}
        <div className="flex-1 min-h-0 px-4 pb-8 flex justify-center">
          <div className="w-full max-w-5xl flex flex-col bg-white dark:bg-zinc-900/40 backdrop-blur-xl border border-zinc-200 dark:border-white/5 rounded-3xl overflow-hidden shadow-2xl shadow-zinc-200/50 dark:shadow-black/50 ring-1 ring-zinc-100 dark:ring-white/5">
             <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar p-6 md:p-10">
                <StepContent />
             </div>
             <div className="flex-shrink-0 p-6 md:px-10 md:py-8 bg-zinc-50 dark:bg-zinc-900/40 border-t border-zinc-200 dark:border-white/5 backdrop-blur-xl">
                <NavigationButtons />
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Page component with provider
export function QuickVideoPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <QuickVideoProvider>
      <div className="flex h-screen bg-zinc-50 dark:bg-[#050505] text-zinc-900 dark:text-white font-sans overflow-hidden selection:bg-emerald-500/30">
        <NavigationRail
          isMobileOpen={mobileMenuOpen}
          onMobileClose={() => setMobileMenuOpen(false)}
        />
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden ml-0 lg:ml-16">
          <QuickVideoWizard mobileMenuOpen={mobileMenuOpen} setMobileMenuOpen={setMobileMenuOpen} />
        </div>
      </div>
    </QuickVideoProvider>
  );
}

export default QuickVideoPage;
