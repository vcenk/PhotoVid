import React from 'react';
import { useWizard } from '../../contexts/WizardContext';
import { Loader2, AlertCircle, ArrowLeft } from 'lucide-react';

export const GenerationProgress: React.FC = () => {
  const { progress, error, resetWizard } = useWizard();

  if (error) {
    return (
      <div className="max-w-xl mx-auto text-center py-20">
        <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
          <AlertCircle size={32} />
        </div>
        <h3 className="text-xl font-bold text-zinc-900 mb-2">Generation Failed</h3>
        <p className="text-zinc-500 mb-8">{error}</p>
        <button 
          onClick={resetWizard}
          className="inline-flex items-center gap-2 text-indigo-600 font-bold hover:text-indigo-700"
        >
          <ArrowLeft size={18} /> Try again
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto text-center py-20">
      <div className="relative w-32 h-32 mx-auto mb-8 flex items-center justify-center">
         <div className="absolute inset-0 border-4 border-zinc-100 rounded-full"></div>
         <div 
           className="absolute inset-0 border-4 border-indigo-600 rounded-full border-t-transparent animate-spin"
           style={{ borderTopColor: 'transparent' }}
         ></div>
         <span className="text-2xl font-bold text-zinc-900">{progress}%</span>
      </div>
      
      <h3 className="text-xl font-bold text-zinc-900 mb-2">Generating your video...</h3>
      <p className="text-zinc-500">
        Our AI is analyzing your scene and applying cinematic motion. 
        This usually takes 1-2 minutes.
      </p>
    </div>
  );
};
