import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, ArrowRight, Crown, Zap, Sparkles, ChevronDown } from 'lucide-react';
import { INDUSTRY_CONFIGS, type IndustryTool } from '../../../lib/data/industries';
import { RE_CATEGORIES } from './CategoryBrowser';

interface AppGridProps {
  category: string | null;
}

interface GridItem {
  id: string;
  name: string;
  description: string;
  image: string;
  route?: string;
  isNew?: boolean;
  isPremium?: boolean;
  tags?: string[];
}

function buildRealEstateTools(): GridItem[] {
  const config = INDUSTRY_CONFIGS['real-estate'];
  if (!config) return [];

  const items: GridItem[] = [];
  const seen = new Set<string>();

  const addTool = (tool: IndustryTool) => {
    if (seen.has(tool.id)) return;
    seen.add(tool.id);
    items.push({
      id: tool.id,
      name: tool.name,
      description: tool.description,
      image: tool.image,
      route: tool.route,
      isPremium: tool.isPremium,
      isNew: tool.tags?.includes('New'),
      tags: tool.tags,
    });
  };

  // Add featured tools first, then all tools
  config.featuredTools.forEach(addTool);
  config.tools.forEach(addTool);

  return items;
}

const INITIAL_COUNT = 12;

export const AppGrid: React.FC<AppGridProps> = ({ category }) => {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [showAll, setShowAll] = useState(false);

  const allItems = useMemo(() => buildRealEstateTools(), []);

  const filtered = useMemo(() => {
    let result = allItems;

    // Filter by real estate category
    if (category) {
      const cat = RE_CATEGORIES.find((c) => c.id === category);
      if (cat) {
        const toolIdSet = new Set(cat.toolIds);
        result = result.filter((item) => toolIdSet.has(item.id));
      }
    }

    // Search filter
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (item) =>
          item.name.toLowerCase().includes(q) ||
          item.description.toLowerCase().includes(q) ||
          item.tags?.some((t) => t.toLowerCase().includes(q))
      );
    }

    return result;
  }, [allItems, category, search]);

  const displayed = showAll ? filtered : filtered.slice(0, INITIAL_COUNT);
  const hasMore = filtered.length > INITIAL_COUNT && !showAll;

  const handleClick = (item: GridItem) => {
    if (item.route) {
      navigate(item.route);
    } else {
      navigate('/studio/real-estate');
    }
  };

  const categoryLabel = category
    ? RE_CATEGORIES.find((c) => c.id === category)?.label
    : null;

  return (
    <div>
      {/* Header + Search */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center">
            <Sparkles size={20} className="text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-zinc-900 dark:text-white">
              {categoryLabel || 'All Real Estate Tools'}
            </h2>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              {filtered.length} tools available
            </p>
          </div>
        </div>

        <div className="relative w-64 hidden sm:block">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search tools..."
            className="w-full pl-9 pr-3 py-2 text-sm bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg text-zinc-900 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:outline-none focus:border-indigo-500"
          />
        </div>
      </div>

      {/* Grid */}
      {displayed.length === 0 ? (
        <div className="text-center py-12 text-zinc-500 dark:text-zinc-400">
          No tools found{search ? ` for "${search}"` : ''}.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {displayed.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.03 }}
            >
              <div
                onClick={() => handleClick(item)}
                className="rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 overflow-hidden cursor-pointer group hover:border-indigo-500 dark:hover:border-indigo-500 transition-all hover:shadow-md"
              >
                {/* Image */}
                <div className="relative aspect-video overflow-hidden">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />

                  {/* Badges */}
                  <div className="absolute top-2 left-2 flex gap-1.5">
                    {item.isNew && (
                      <span className="px-2 py-0.5 bg-emerald-500 text-white text-[10px] font-bold rounded-full flex items-center gap-0.5">
                        <Zap size={8} /> New
                      </span>
                    )}
                  </div>
                  {item.isPremium && (
                    <div className="absolute top-2 right-2">
                      <span className="px-2 py-0.5 bg-gradient-to-r from-amber-400 to-yellow-500 text-black text-[10px] font-bold rounded-full flex items-center gap-0.5">
                        <Crown size={8} /> Pro
                      </span>
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-4">
                  <h3 className="text-sm font-bold text-zinc-900 dark:text-white mb-1 truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                    {item.name}
                  </h3>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-1 mb-3">
                    {item.description}
                  </p>
                  <div className="flex items-center justify-between">
                    {item.tags?.[0] && (
                      <span className="px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 text-[10px] font-medium">
                        {item.tags[0]}
                      </span>
                    )}
                    <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400 group-hover:text-indigo-500 flex items-center gap-1 transition-colors ml-auto">
                      Use Tool <ArrowRight size={12} />
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Show More */}
      {hasMore && (
        <div className="flex justify-center mt-6">
          <button
            onClick={() => setShowAll(true)}
            className="flex items-center gap-2 px-6 py-2.5 text-sm font-medium text-zinc-600 dark:text-zinc-300 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl hover:border-indigo-500 dark:hover:border-indigo-500 transition-all"
          >
            Show More
            <ChevronDown size={16} />
          </button>
        </div>
      )}
    </div>
  );
};
