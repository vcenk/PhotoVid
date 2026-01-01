import React, { useState } from 'react';
import { useWizard } from '../../contexts/WizardContext';
import { useProjects } from '../../contexts/ProjectContext';
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
          <button className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-colors">
            <Download size={18} /> Download 4K
          </button>
          
          <button 
            onClick={handleSave}
            disabled={isSaved || isSaving}
            className={`
              flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all
              ${isSaved 
                ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' 
                : 'bg-white border border-zinc-200 text-zinc-700 hover:bg-zinc-50'}
            `}
          >
            {isSaved ? <Check size={18} /> : <Save size={18} />}
            {isSaved ? 'Saved to Projects' : isSaving ? 'Saving...' : 'Save to Projects'}
          </button>

          <button className="flex items-center gap-2 px-6 py-3 bg-white border border-zinc-200 text-zinc-700 rounded-xl font-bold hover:bg-zinc-50 transition-colors">
            <Share2 size={18} /> Share
          </button>
        </div>

        <button 
          onClick={resetWizard}
          className="flex items-center gap-2 px-6 py-3 text-zinc-500 hover:text-zinc-900 font-medium transition-colors"
        >
          <RefreshCw size={18} /> Create Another
        </button>
      </div>
    </div>
  );
};
