import React from 'react';
import {
  Camera,
  Video,
  Paintbrush,
  Sun,
  Wand2,
  Crown,
  LayoutGrid,
} from 'lucide-react';
import { INDUSTRY_CONFIGS } from '../../../lib/data/industries';

interface CategoryBrowserProps {
  activeCategory: string | null;
  onCategoryChange: (category: string | null) => void;
}

// Real estate tool categories derived from the tools list
const RE_CATEGORIES = [
  {
    id: 'photo',
    label: 'Photo Enhancement',
    icon: Camera,
    toolIds: ['photo-enhancement', 'hdr-merge', 'headshot-retouching'],
  },
  {
    id: 'staging',
    label: 'Staging & Design',
    icon: Paintbrush,
    toolIds: ['virtual-staging', 'virtual-renovation', 'wall-color', 'floor-replacement', 'declutter', '360-staging'],
  },
  {
    id: 'video',
    label: 'Video',
    icon: Video,
    toolIds: ['storyboard', 'video-builder', 'text-to-video', 'room-tour'],
  },
  {
    id: 'weather',
    label: 'Weather & Lighting',
    icon: Sun,
    toolIds: ['sky-replacement', 'twilight', 'rain-to-shine', 'night-to-day', 'changing-seasons'],
  },
  {
    id: 'utility',
    label: 'Utility',
    icon: Wand2,
    toolIds: ['item-removal', 'lawn-enhancement', 'pool-enhancement', 'watermark-removal'],
  },
  {
    id: 'premium',
    label: 'Premium',
    icon: Crown,
    toolIds: ['floor-plan', '360-staging', 'virtual-renovation'],
  },
];

function countToolsInCategory(categoryId: string): number {
  const cat = RE_CATEGORIES.find((c) => c.id === categoryId);
  if (!cat) return 0;
  const config = INDUSTRY_CONFIGS['real-estate'];
  if (!config) return 0;
  const allToolIds = new Set([
    ...config.featuredTools.map((t) => t.id),
    ...config.tools.map((t) => t.id),
  ]);
  return cat.toolIds.filter((id) => allToolIds.has(id)).length;
}

export const CategoryBrowser: React.FC<CategoryBrowserProps> = ({
  activeCategory,
  onCategoryChange,
}) => {
  return (
    <div>
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
          <LayoutGrid size={20} className="text-white" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-zinc-900 dark:text-white">
            Browse by Category
          </h2>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Find the right real estate tool for your needs
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {RE_CATEGORIES.map((cat) => {
          const Icon = cat.icon;
          const isActive = activeCategory === cat.id;
          const count = countToolsInCategory(cat.id);

          return (
            <button
              key={cat.id}
              onClick={() => onCategoryChange(isActive ? null : cat.id)}
              className={`
                flex flex-col items-center gap-2 p-4 rounded-xl border transition-all
                ${isActive
                  ? 'bg-indigo-50 dark:bg-indigo-500/10 border-indigo-500 text-indigo-600 dark:text-indigo-400'
                  : 'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:border-zinc-300 dark:hover:border-zinc-700'
                }
              `}
            >
              <Icon size={22} className={isActive ? 'text-indigo-500' : 'text-zinc-400 dark:text-zinc-500'} />
              <span className={`text-xs font-medium text-center ${isActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-zinc-700 dark:text-zinc-300'}`}>
                {cat.label}
              </span>
              <span className={`text-xs px-2 py-0.5 rounded-full ${
                isActive
                  ? 'bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400'
                  : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400'
              }`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

// Export category definitions for use in AppGrid filtering
export { RE_CATEGORIES };
