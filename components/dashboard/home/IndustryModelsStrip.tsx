import React from 'react';
import { useNavigate } from 'react-router-dom';
import { cn } from '../../../lib/utils';
import { models } from '../../../lib/data/dashboard';
import { useDashboardStore } from '../../../lib/store/dashboard';

export function IndustryModelsStrip() {
  const navigate = useNavigate();
  const { selectedMode, activeIndustry } = useDashboardStore();

  const handleModelClick = (modelId: string, modelType: string) => {
    const params = new URLSearchParams({
      mode: modelType,
      industry: activeIndustry,
      model: modelId,
    });
    navigate(`/dashboard/studio?${params.toString()}`);
  };

  return (
    <section className="max-w-7xl mx-auto px-6 py-12">
      <h2 className="text-2xl font-bold mb-6">Industry Models</h2>

      <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
        {models.map((model) => {
          const Icon = model.icon;
          const typeBadgeColor =
            model.type === 'image'
              ? 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400'
              : model.type === 'video'
              ? 'bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-400'
              : 'bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400';

          return (
            <button
              key={model.id}
              onClick={() => handleModelClick(model.id, model.type)}
              className={cn(
                'flex-shrink-0 w-64 p-5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800',
                'rounded-2xl hover:border-violet-300 dark:hover:border-violet-700 hover:shadow-lg transition-all group text-left'
              )}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="p-3 bg-zinc-100 dark:bg-zinc-800 rounded-xl group-hover:bg-violet-100 dark:group-hover:bg-violet-950 transition-colors">
                  <Icon size={24} className="text-zinc-700 dark:text-zinc-300" />
                </div>
                <span className={cn('px-2.5 py-1 rounded-full text-xs font-medium uppercase', typeBadgeColor)}>
                  {model.type}
                </span>
              </div>
              <h3 className="font-bold text-base mb-1">{model.name}</h3>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">{model.description}</p>
            </button>
          );
        })}
      </div>

      <style>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </section>
  );
}
