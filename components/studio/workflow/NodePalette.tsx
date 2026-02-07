import React, { useState } from 'react';
import { Search, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../../../lib/utils';
import { getNodesByCategory } from '../../../lib/workflow/node-definitions';

interface NodePaletteProps {
  onAddNode: (nodeType: string) => void;
}

export const NodePalette: React.FC<NodePaletteProps> = ({ onAddNode }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedCategory, setExpandedCategory] = useState<string | null>('input');

  const categories = [
    { id: 'input', label: 'Input Nodes', color: 'emerald' },
    { id: 'processing', label: 'Processing Nodes', color: 'indigo' },
    { id: 'output', label: 'Output Nodes', color: 'zinc' }
  ];

  const filterNodes = (nodes: any[]) => {
    if (!searchQuery) return nodes;
    return nodes.filter(node =>
      node.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
      node.description.toLowerCase().includes(searchQuery.toLowerCase())
    );
  };

  return (
    <div className="h-full flex flex-col bg-white dark:bg-zinc-950">
      {/* Header */}
      <div className="p-4 border-b border-zinc-200 dark:border-zinc-800">
        <h2 className="text-lg font-bold text-zinc-900 dark:text-white mb-3">
          Node Palette
        </h2>

        {/* Search */}
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input
            type="text"
            placeholder="Search nodes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 text-zinc-900 dark:text-white placeholder:text-zinc-400"
          />
        </div>
      </div>

      {/* Categories */}
      <div className="flex-1 overflow-y-auto p-2">
        {categories.map((category) => {
          const nodes = filterNodes(getNodesByCategory(category.id as any));
          const isExpanded = expandedCategory === category.id;

          return (
            <div key={category.id} className="mb-2">
              {/* Category Header */}
              <button
                onClick={() => setExpandedCategory(isExpanded ? null : category.id)}
                className={cn(
                  'w-full flex items-center justify-between p-3 rounded-lg text-left transition-colors',
                  'hover:bg-zinc-50 dark:hover:bg-zinc-900',
                  isExpanded && 'bg-zinc-50 dark:bg-zinc-900'
                )}
              >
                <span className="text-sm font-bold text-zinc-900 dark:text-white">
                  {category.label}
                  <span className="ml-2 text-xs text-zinc-400">({nodes.length})</span>
                </span>
                <ChevronRight
                  size={16}
                  className={cn(
                    'text-zinc-400 transition-transform',
                    isExpanded && 'rotate-90'
                  )}
                />
              </button>

              {/* Nodes List */}
              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="pl-2 pr-1 py-2 space-y-1">
                      {nodes.map((node) => {
                        const Icon = node.icon;
                        return (
                          <button
                            key={node.type}
                            onClick={() => onAddNode(node.type)}
                            className={cn(
                              'w-full p-3 rounded-lg text-left transition-all group',
                              'bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800',
                              'hover:border-teal-300 dark:hover:border-teal-700 hover:shadow-md'
                            )}
                          >
                            <div className="flex items-start gap-3">
                              <div className={cn(
                                'w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-110',
                                `bg-${node.color}-50 dark:bg-${node.color}-950/30 text-${node.color}-600 dark:text-${node.color}-400`
                              )}>
                                <Icon size={20} />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="text-sm font-bold text-zinc-900 dark:text-white mb-1">
                                  {node.label}
                                </div>
                                <div className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-2">
                                  {node.description}
                                </div>
                              </div>
                            </div>
                          </button>
                        );
                      })}

                      {nodes.length === 0 && (
                        <div className="text-center py-8 text-sm text-zinc-400">
                          No nodes found
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </div>
  );
};
