import React, { useState } from 'react';
import { useWizard } from '../../../lib/store/contexts/WizardContext';
import { useProjects } from '../../../lib/store/contexts/ProjectContext';
import { Download, RefreshCw, Share2, Save, Check } from 'lucide-react';

export const ResultViewer: React.FC = () => {
  const { result, resetWizard, configuration } = useWizard();
  const { saveProject } = useProjects();
  const [isSaved, setIsSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  if (!result) return null;

  const handleSave = async () => {
    setIsSaving(true);
    const projectName = `Real Estate - ${new Date().toLocaleDateString()}`;
    await saveProject(projectName, 'wizard', { result, configuration });
    setIsSaving(false);
    setIsSaved(true);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="aspect-video bg-black rounded-3xl overflow-hidden shadow-2xl mb-8 relative group">
        <video 
          src={result} 
          controls 
          autoPlay 
          loop 
          className="w-full h-full"
        />
      </div>

      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-6 py-3 bg-teal-600 text-white rounded-xl font-bold hover:bg-teal-700 transition-colors">
            <Download size={18} /> Download 4K
          </button>
          
          <button 
            onClick={handleSave}
            disabled={isSaved || isSaving}
            className={`
              flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all
              ${isSaved
                ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                : 'bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-750'}
            `}
          >
            {isSaved ? <Check size={18} /> : <Save size={18} />}
            {isSaved ? 'Saved to Projects' : isSaving ? 'Saving...' : 'Save to Projects'}
          </button>

          <button className="flex items-center gap-2 px-6 py-3 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 rounded-xl font-bold hover:bg-zinc-50 dark:hover:bg-zinc-750 transition-colors">
            <Share2 size={18} /> Share
          </button>
        </div>

        <button 
          onClick={resetWizard}
          className="flex items-center gap-2 px-6 py-3 text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 font-medium transition-colors"
        >
          <RefreshCw size={18} /> Create Another
        </button>
      </div>
    </div>
  );
};
