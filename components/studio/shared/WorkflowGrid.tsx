import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStudio } from '../../../lib/store/contexts/StudioContext';
import { ArrowRight, Clock, Layers } from 'lucide-react';

export const WorkflowGrid: React.FC = () => {
  const { selectedIndustry, selectWorkflow } = useStudio();

  // If no industry selected, show all (or handle empty state)
  // For now, let's just show workflows if industry is selected
  const workflows = selectedIndustry ? selectedIndustry.workflows : [];

  if (!selectedIndustry) {
    return (
      <div className="text-center py-20 bg-white dark:bg-zinc-950 rounded-3xl border border-dashed border-zinc-200 dark:border-zinc-800">
        <h3 className="text-xl font-medium text-zinc-900 dark:text-white mb-2">Select an Industry</h3>
        <p className="text-zinc-500 dark:text-zinc-400">Choose an industry above to see specialized workflows.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <AnimatePresence mode="popLayout">
        {workflows.map((workflow) => (
          <motion.div
            key={workflow.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            onClick={() => selectWorkflow(workflow)}
            className="group cursor-pointer bg-white dark:bg-zinc-950 rounded-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden hover:shadow-xl hover:border-indigo-500/30 dark:hover:border-indigo-500/50 transition-all duration-300"
          >
            {/* Preview Image Area */}
            <div className="h-40 bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center relative overflow-hidden">
               {workflow.previewImage ? (
                 <img src={workflow.previewImage} alt={workflow.name} className="w-full h-full object-cover" />
               ) : (
                 <div className="p-4 bg-indigo-50 dark:bg-indigo-950/50 rounded-full text-indigo-500 dark:text-indigo-400 group-hover:scale-110 transition-transform duration-500">
                    <workflow.icon size={32} />
                 </div>
               )}
               <div className="absolute top-3 right-3 bg-white/90 dark:bg-zinc-900/90 backdrop-blur px-2 py-1 rounded-full text-xs font-medium text-zinc-600 dark:text-zinc-300 flex items-center gap-1 shadow-sm">
                  <Clock size={12} /> {workflow.estimatedCredits}c
               </div>
            </div>

            <div className="p-6">
              <h3 className="text-lg font-bold text-zinc-900 dark:text-white mb-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                {workflow.name}
              </h3>
              <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-4 line-clamp-2">
                {workflow.description}
              </p>

              <div className="flex items-center justify-between mt-auto pt-4 border-t border-zinc-100 dark:border-zinc-800">
                <span className="text-xs text-zinc-400 dark:text-zinc-500 flex items-center gap-1">
                  <Layers size={14} /> {workflow.steps.length} Steps
                </span>
                <span className="text-sm font-medium text-indigo-600 dark:text-indigo-400 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                  Start <ArrowRight size={14} />
                </span>
              </div>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};
