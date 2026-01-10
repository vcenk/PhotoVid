import React from 'react';
import { useWizard } from '../../../lib/store/contexts/WizardContext';
import { Camera, Zap, Wind, Eye } from 'lucide-react';

const MOTION_STYLES = [
  { id: 'smooth-pan', name: 'Smooth Pan', icon: Camera, desc: 'Cinematic horizontal movement' },
  { id: 'zoom-in', name: 'Slow Zoom', icon: Eye, desc: 'Focuses attention on details' },
  { id: 'orbit', name: 'Orbit', icon: Wind, desc: 'Rotates around the subject' },
  { id: 'dynamic', name: 'Dynamic', icon: Zap, desc: 'Fast paced transitions' },
];

export const ConfigurationPanel: React.FC = () => {
  const { configuration, updateConfiguration } = useWizard();

  return (
    <div className="max-w-3xl mx-auto">
      <h3 className="text-xl font-bold text-zinc-900 mb-6">Select Motion Style</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        {MOTION_STYLES.map((style) => (
          <button
            key={style.id}
            onClick={() => updateConfiguration('motionStyle', style.id)}
            className={`
              p-6 rounded-2xl text-left border-2 transition-all flex items-start gap-4
              ${configuration.motionStyle === style.id 
                ? 'border-indigo-600 bg-indigo-50 ring-2 ring-indigo-200 ring-offset-2' 
                : 'border-zinc-200 bg-white hover:border-zinc-300 hover:bg-zinc-50'
              }
            `}
          >
            <div className={`
              p-3 rounded-xl 
              ${configuration.motionStyle === style.id ? 'bg-indigo-600 text-white' : 'bg-zinc-100 text-zinc-500'}
            `}>
              <style.icon size={24} />
            </div>
            <div>
              <div className="font-bold text-zinc-900 mb-1">{style.name}</div>
              <div className="text-sm text-zinc-500">{style.desc}</div>
            </div>
          </button>
        ))}
      </div>

      <div className="bg-zinc-50 p-6 rounded-2xl border border-zinc-200">
        <h4 className="font-semibold text-zinc-900 mb-4">Advanced Settings</h4>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-zinc-700 block mb-2">Motion Strength</label>
            <input 
              type="range" 
              className="w-full h-2 bg-zinc-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
              min="1" max="10" 
              onChange={(e) => updateConfiguration('strength', e.target.value)}
            />
            <div className="flex justify-between text-xs text-zinc-400 mt-1">
              <span>Subtle</span>
              <span>Intense</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
