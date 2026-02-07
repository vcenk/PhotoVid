import React from 'react';
import { useWizard } from '../../../lib/store/contexts/WizardContext';
import { FileUploader } from './FileUploader';
import { ConfigurationPanel } from './ConfigurationPanel';
import { GenerationProgress } from './GenerationProgress';
import { ResultViewer } from './ResultViewer';
import { ArrowLeft, ArrowRight } from 'lucide-react';

export const WizardContainer: React.FC = () => {
  const { currentStep, nextStep, prevStep, isGenerating, result, uploadedFiles, startGeneration } = useWizard();

  const steps = [
    { title: 'Upload', component: <FileUploader /> },
    { title: 'Configure', component: <ConfigurationPanel /> },
    { title: 'Generate', component: <GenerationProgress /> },
    { title: 'Result', component: <ResultViewer /> }
  ];

  const currentComponent = steps[currentStep].component;

  // Validation Logic
  const canProceed = () => {
    if (currentStep === 0) return uploadedFiles.length > 0;
    if (currentStep === 1) return true; // Always allow proceed from config for now
    return false;
  };

  if (isGenerating && currentStep !== 2) {
    // Force show progress if generating
    return <GenerationProgress />;
  }

  return (
    <div className="py-8">
      {/* Stepper Header */}
      <div className="flex justify-center mb-12">
        {steps.map((step, idx) => (
          <div key={idx} className="flex items-center">
            <div className={`
              w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-colors duration-300
              ${idx === currentStep ? 'bg-teal-600 text-white shadow-lg shadow-teal-200' : 
                idx < currentStep ? 'bg-teal-100 text-teal-600' : 'bg-zinc-100 text-zinc-400'}
            `}>
              {idx + 1}
            </div>
            {idx < steps.length - 1 && (
              <div className={`w-20 h-1 mx-2 rounded-full transition-colors duration-300 ${idx < currentStep ? 'bg-teal-100' : 'bg-zinc-100'}`} />
            )}
          </div>
        ))}
      </div>

      {/* Main Content */}
      <div className="min-h-[400px]">
        {currentComponent}
      </div>

      {/* Footer Navigation */}
      {!result && !isGenerating && (
        <div className="flex justify-between items-center mt-12 pt-8 border-t border-zinc-100 max-w-3xl mx-auto">
          <button
            onClick={prevStep}
            disabled={currentStep === 0}
            className={`flex items-center gap-2 text-zinc-500 font-medium px-4 py-2 hover:text-zinc-900 transition-colors ${currentStep === 0 ? 'opacity-0 pointer-events-none' : ''}`}
          >
            <ArrowLeft size={18} /> Back
          </button>

          <button
            onClick={currentStep === 1 ? startGeneration : nextStep}
            disabled={!canProceed()}
            className={`
              flex items-center gap-2 px-8 py-3 rounded-xl font-bold transition-all shadow-lg shadow-teal-100
              ${canProceed() 
                ? 'bg-teal-600 text-white hover:bg-teal-700 hover:shadow-teal-200 hover:-translate-y-0.5' 
                : 'bg-zinc-100 text-zinc-400 cursor-not-allowed'}
            `}
          >
            {currentStep === 1 ? 'Generate Video' : 'Continue'} <ArrowRight size={18} />
          </button>
        </div>
      )}
    </div>
  );
};
