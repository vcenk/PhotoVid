import React from 'react';
import { motion } from 'framer-motion';
import { INDUSTRIES } from '../../lib/data/workflows';
import { useStudio } from '../contexts/StudioContext';
import { IndustryId } from '../../lib/types/studio';

export const IndustrySelector: React.FC = () => {
  const { selectedIndustry, selectIndustry } = useStudio();

  return (
    <div className="flex flex-wrap gap-3 mb-8">
      {INDUSTRIES.map((industry) => (
        <button
          key={industry.id}
          onClick={() => selectIndustry(industry.id)}
          className={`
            relative px-4 py-2 rounded-full text-sm font-medium transition-all duration-200
            flex items-center gap-2
            ${selectedIndustry?.id === industry.id 
              ? 'bg-zinc-900 text-white shadow-md' 
              : 'bg-white text-zinc-600 hover:bg-zinc-100 border border-zinc-200'}
          `}
        >
          <industry.icon size={16} />
          {industry.name}
        </button>
      ))}
    </div>
  );
};
