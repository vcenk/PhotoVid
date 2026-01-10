import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Filter, Sparkles, TrendingUp, Crown, Clock } from 'lucide-react';
import { Template, IndustryId, StylePreset } from '../../../lib/types/studio';
import { TEMPLATES, getTrendingTemplates, getNewTemplates, getPremiumTemplates } from '../../../lib/data/templates';
import { TemplateCard } from './TemplateCard';
import { useStudio } from '../../../lib/store/contexts/StudioContext';

interface TemplateGalleryProps {
    onSelectTemplate: (template: Template) => void;
}

const STYLE_FILTERS: { value: StylePreset | 'all'; label: string }[] = [
    { value: 'all', label: 'All Styles' },
    { value: 'cinematic', label: 'Cinematic' },
    { value: 'modern', label: 'Modern' },
    { value: 'luxury', label: 'Luxury' },
    { value: 'minimal', label: 'Minimal' },
    { value: 'vibrant', label: 'Vibrant' },
    { value: 'warm', label: 'Warm' },
    { value: 'dramatic', label: 'Dramatic' },
];

const QUICK_FILTERS = [
    { id: 'trending', label: 'Trending', icon: TrendingUp, color: 'text-rose-500' },
    { id: 'new', label: 'New', icon: Sparkles, color: 'text-emerald-500' },
    { id: 'premium', label: 'Premium', icon: Crown, color: 'text-amber-500' },
];

export const TemplateGallery: React.FC<TemplateGalleryProps> = ({ onSelectTemplate }) => {
    const { selectedIndustry } = useStudio();
    const [searchQuery, setSearchQuery] = useState('');
    const [styleFilter, setStyleFilter] = useState<StylePreset | 'all'>('all');
    const [quickFilter, setQuickFilter] = useState<string | null>(null);

    const filteredTemplates = useMemo(() => {
        let templates = TEMPLATES;

        // Filter by industry if selected
        if (selectedIndustry) {
            templates = templates.filter(t => t.industryId === selectedIndustry.id);
        }

        // Quick filters
        if (quickFilter === 'trending') {
            templates = templates.filter(t => t.isTrending);
        } else if (quickFilter === 'new') {
            templates = templates.filter(t => t.isNew);
        } else if (quickFilter === 'premium') {
            templates = templates.filter(t => t.isPremium);
        }

        // Style filter
        if (styleFilter !== 'all') {
            templates = templates.filter(t => t.stylePreset === styleFilter);
        }

        // Search
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            templates = templates.filter(t =>
                t.name.toLowerCase().includes(query) ||
                t.description.toLowerCase().includes(query) ||
                t.tags.some(tag => tag.toLowerCase().includes(query))
            );
        }

        // Sort by usage (popularity)
        return templates.sort((a, b) => b.usageCount - a.usageCount);
    }, [selectedIndustry, searchQuery, styleFilter, quickFilter]);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-xl font-bold text-zinc-900 dark:text-white">Template Gallery</h2>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400">
                        {filteredTemplates.length} templates available
                        {selectedIndustry && ` for ${selectedIndustry.name}`}
                    </p>
                </div>

                {/* Search */}
                <div className="relative">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 dark:text-zinc-500" />
                    <input
                        type="text"
                        placeholder="Search templates..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-9 pr-4 py-2 w-full sm:w-64 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-sm text-zinc-900 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                    />
                </div>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap items-center gap-3">
                {/* Quick Filters */}
                <div className="flex items-center gap-2">
                    {QUICK_FILTERS.map(filter => (
                        <button
                            key={filter.id}
                            onClick={() => setQuickFilter(quickFilter === filter.id ? null : filter.id)}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${quickFilter === filter.id
                                    ? 'bg-zinc-900 dark:bg-white text-white dark:text-zinc-900'
                                    : 'bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800'
                                }`}
                        >
                            <filter.icon size={12} className={quickFilter === filter.id ? 'text-white dark:text-zinc-900' : filter.color} />
                            {filter.label}
                        </button>
                    ))}
                </div>

                <div className="h-4 w-px bg-zinc-200 dark:bg-zinc-800" />

                {/* Style Filter */}
                <div className="flex items-center gap-2">
                    <Filter size={14} className="text-zinc-400 dark:text-zinc-500" />
                    <select
                        value={styleFilter}
                        onChange={(e) => setStyleFilter(e.target.value as StylePreset | 'all')}
                        className="px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-xs font-medium text-zinc-600 dark:text-zinc-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                    >
                        {STYLE_FILTERS.map(style => (
                            <option key={style.value} value={style.value}>{style.label}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Template Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                <AnimatePresence mode="popLayout">
                    {filteredTemplates.map((template, index) => (
                        <motion.div
                            key={template.id}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            transition={{ delay: index * 0.05 }}
                        >
                            <TemplateCard template={template} onSelect={onSelectTemplate} />
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>

            {/* Empty State */}
            {filteredTemplates.length === 0 && (
                <div className="text-center py-16 bg-zinc-50 dark:bg-zinc-900 rounded-2xl border border-dashed border-zinc-200 dark:border-zinc-800">
                    <div className="w-12 h-12 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center mx-auto mb-4">
                        <Search size={20} className="text-zinc-400 dark:text-zinc-500" />
                    </div>
                    <h3 className="text-lg font-medium text-zinc-900 dark:text-white mb-2">No templates found</h3>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400">Try adjusting your filters or search query</p>
                </div>
            )}
        </div>
    );
};
