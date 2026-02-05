/**
 * TemplatePickerStep - Step 1: Choose video template style
 */

import React from 'react';
import { motion } from 'framer-motion';
import { Check, Sparkles, Smartphone, Monitor, Square as SquareIcon, Info } from 'lucide-react';
import { useQuickVideo } from '../QuickVideoContext';
import { getAllTemplates, getTemplateConfig } from '@/lib/data/video-templates';
import type { VideoTemplate, ExportFormat } from '@/lib/types/video-project';

// Format options with Lucide icons
const FORMAT_OPTIONS: { id: ExportFormat; label: string; ratio: string; description: string; icon: React.ReactNode }[] = [
  { id: 'vertical', label: 'Vertical', ratio: '9:16', description: 'TikTok, Reels, Shorts', icon: <Smartphone size={20} /> },
  { id: 'square', label: 'Square', ratio: '1:1', description: 'Instagram Feed', icon: <SquareIcon size={20} /> },
  { id: 'landscape', label: 'Landscape', ratio: '16:9', description: 'YouTube, Website', icon: <Monitor size={20} /> },
];

export function TemplatePickerStep() {
  const { templateId, setTemplate, format, setFormat } = useQuickVideo();
  const templates = getAllTemplates();

  return (
    <div className="space-y-10">
      {/* Template Selection */}
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-white/70 mb-2">Choose Your Style</h2>
          <p className="text-zinc-400">
            Select a template that matches your property's personality
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
          {templates.map((template) => {
            const isSelected = templateId === template.id;
            const config = getTemplateConfig(template.id as VideoTemplate);

            return (
              <motion.button
                key={template.id}
                onClick={() => setTemplate(template.id as VideoTemplate)}
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                className={`
                  relative group rounded-2xl overflow-hidden border transition-all duration-300
                  ${isSelected
                    ? 'border-violet-500 ring-4 ring-violet-500/10 shadow-xl shadow-violet-500/20'
                    : 'border-white/5 hover:border-white/20 hover:shadow-lg hover:shadow-black/20'
                  }
                `}
              >
                {/* Template Preview */}
                <div
                  className="aspect-[9/16] flex items-center justify-center relative overflow-hidden"
                  style={{ backgroundColor: config.colors.background }}
                >
                   {/* Abstract Pattern overlay */}
                   <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_50%_120%,rgba(255,255,255,0.4),transparent)]" />
                   
                  <div className="text-center p-4 relative z-10">
                    <div
                      className="w-16 h-16 mx-auto mb-4 rounded-2xl shadow-lg transform group-hover:scale-110 transition-transform duration-500"
                      style={{ backgroundColor: config.colors.accent }}
                    />
                    <h3
                      className="text-lg font-bold mb-1 tracking-tight"
                      style={{
                        color: config.colors.text,
                        fontFamily: config.fonts.heading,
                      }}
                    >
                      {template.name}
                    </h3>
                  </div>
                </div>

                {/* Selection Indicator */}
                {isSelected && (
                  <div className="absolute top-3 right-3 w-7 h-7 bg-violet-600 rounded-full flex items-center justify-center shadow-lg animate-in fade-in zoom-in duration-200">
                    <Check size={14} className="text-white" />
                  </div>
                )}

                {/* Template Description Hover Overlay */}
                <div className={`
                    absolute inset-x-0 bottom-0 p-4 bg-black/60 backdrop-blur-md transition-transform duration-300
                    ${isSelected ? 'translate-y-0' : 'translate-y-full group-hover:translate-y-0'}
                `}>
                    <p className="text-xs text-white/90 font-medium leading-relaxed">
                      {template.description}
                    </p>
                </div>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Format Selection */}
      <div className="space-y-6">
        <div>
           <h3 className="text-lg font-semibold text-white mb-2">Output Format</h3>
           <p className="text-zinc-400 text-sm">
             Choose the aspect ratio for your video
           </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {FORMAT_OPTIONS.map((option) => {
            const isSelected = format === option.id;

            return (
              <motion.button
                key={option.id}
                onClick={() => setFormat(option.id)}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                className={`
                  relative flex flex-col p-5 rounded-2xl border transition-all duration-300 text-left
                  ${isSelected
                    ? 'bg-violet-600/10 border-violet-500/50 shadow-lg shadow-violet-900/10'
                    : 'bg-white/5 border-white/5 hover:bg-white/10 hover:border-white/10'
                  }
                `}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className={`
                    p-3 rounded-xl transition-colors
                    ${isSelected ? 'bg-violet-600 text-white' : 'bg-zinc-800 text-zinc-400 group-hover:text-white'}
                  `}>
                    {option.icon}
                  </div>
                  {isSelected && (
                    <div className="w-6 h-6 bg-violet-600 rounded-full flex items-center justify-center">
                       <Check size={14} className="text-white" />
                    </div>
                  )}
                </div>
                
                <div>
                    <h4 className={`font-semibold text-lg mb-1 ${isSelected ? 'text-violet-100' : 'text-zinc-200'}`}>
                        {option.label}
                    </h4>
                    <div className="flex items-center gap-2 mb-2">
                        <span className={`text-xs font-mono px-2 py-0.5 rounded ${isSelected ? 'bg-violet-600/20 text-violet-200' : 'bg-black/30 text-zinc-500'}`}>
                            {option.ratio}
                        </span>
                    </div>
                    <p className="text-xs text-zinc-400 leading-relaxed">{option.description}</p>
                </div>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Tip */}
      <div className="flex items-start gap-4 p-5 bg-gradient-to-r from-violet-900/20 to-indigo-900/20 border border-violet-500/10 rounded-2xl backdrop-blur-sm">
        <div className="p-2 bg-violet-600/20 rounded-lg text-violet-400">
            <Sparkles size={20} />
        </div>
        <div>
          <p className="text-sm text-violet-200 font-semibold mb-1">Pro Tip</p>
          <p className="text-sm text-zinc-400 leading-relaxed">
            For social media, we recommend the <strong>Vertical (9:16)</strong> format.
            You can still export multiple formats later from the preview step.
          </p>
        </div>
      </div>
    </div>
  );
}

export default TemplatePickerStep;
