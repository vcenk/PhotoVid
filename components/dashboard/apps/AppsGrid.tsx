import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Sparkles, ChevronRight, Filter, X } from 'lucide-react';
import { AppCard } from './AppCard';
import { AI_APPS, APP_CATEGORIES, searchApps, getAppsByCategory, getTrendingApps, type AIApp, type AppCategory } from '../../../lib/data/apps';

interface AppsGridProps {
    onAppSelect?: (app: AIApp) => void;
}

export const AppsGrid: React.FC<AppsGridProps> = ({ onAppSelect }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [activeCategory, setActiveCategory] = useState<AppCategory | 'all' | 'trending'>('all');

    // Filter apps based on search and category
    const filteredApps = useMemo(() => {
        let apps = AI_APPS;

        if (searchQuery.trim()) {
            apps = searchApps(searchQuery);
        } else if (activeCategory === 'trending') {
            apps = getTrendingApps();
        } else if (activeCategory !== 'all') {
            apps = getAppsByCategory(activeCategory);
        }

        return apps;
    }, [searchQuery, activeCategory]);

    // Group apps by category for sectioned view
    const groupedApps = useMemo(() => {
        if (searchQuery.trim() || activeCategory !== 'all') {
            return null; // Don't group when filtering
        }

        const groups: Record<string, AIApp[]> = {};
        APP_CATEGORIES.forEach(cat => {
            const apps = getAppsByCategory(cat.id);
            if (apps.length > 0) {
                groups[cat.id] = apps;
            }
        });
        return groups;
    }, [searchQuery, activeCategory]);

    const handleAppSelect = (app: AIApp) => {
        onAppSelect?.(app);
    };

    return (
        <div className="h-full flex flex-col bg-white dark:bg-[#09090b]">
            {/* Header */}
            <div className="flex-shrink-0 p-6 border-b border-zinc-100 dark:border-zinc-800">
                <div className="max-w-7xl mx-auto">
                    {/* Title */}
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h1 className="text-3xl font-bold text-zinc-900 dark:text-white flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-600 flex items-center justify-center">
                                    <Sparkles size={22} className="text-white" />
                                </div>
                                AI Apps
                            </h1>
                            <p className="text-zinc-500 dark:text-zinc-400 mt-1">
                                Powerful AI tools to transform your creative vision
                            </p>
                        </div>
                    </div>

                    {/* Search & Filters */}
                    <div className="flex flex-col sm:flex-row gap-4">
                        {/* Search Bar */}
                        <div className="relative flex-1 max-w-md">
                            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search apps..."
                                className="w-full pl-11 pr-4 py-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-zinc-900 dark:text-white placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-colors"
                            />
                            {searchQuery && (
                                <button
                                    onClick={() => setSearchQuery('')}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-full transition-colors"
                                >
                                    <X size={16} className="text-zinc-400" />
                                </button>
                            )}
                        </div>

                        {/* Category Tabs */}
                        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
                            <button
                                onClick={() => setActiveCategory('all')}
                                className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${activeCategory === 'all'
                                        ? 'bg-violet-600 text-white shadow-lg shadow-violet-200 dark:shadow-violet-900/30'
                                        : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700'
                                    }`}
                            >
                                All Apps
                            </button>
                            <button
                                onClick={() => setActiveCategory('trending')}
                                className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all flex items-center gap-1.5 ${activeCategory === 'trending'
                                        ? 'bg-gradient-to-r from-orange-500 to-pink-500 text-white shadow-lg'
                                        : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700'
                                    }`}
                            >
                                🔥 Trending
                            </button>
                            {APP_CATEGORIES.map((cat) => (
                                <button
                                    key={cat.id}
                                    onClick={() => setActiveCategory(cat.id)}
                                    className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all flex items-center gap-1.5 ${activeCategory === cat.id
                                            ? 'bg-violet-600 text-white shadow-lg shadow-violet-200 dark:shadow-violet-900/30'
                                            : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700'
                                        }`}
                                >
                                    <span>{cat.icon}</span>
                                    {cat.label}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
                <div className="max-w-7xl mx-auto">
                    <AnimatePresence mode="wait">
                        {/* Sectioned View (All Apps) */}
                        {groupedApps && !searchQuery ? (
                            <motion.div
                                key="grouped"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="space-y-10"
                            >
                                {/* Trending Section */}
                                <section>
                                    <div className="flex items-center justify-between mb-4">
                                        <h2 className="text-xl font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                                            🔥 Trending Now
                                        </h2>
                                        <button
                                            onClick={() => setActiveCategory('trending')}
                                            className="text-sm text-violet-600 dark:text-violet-400 font-medium hover:underline flex items-center gap-1"
                                        >
                                            See all <ChevronRight size={16} />
                                        </button>
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                                        {getTrendingApps().slice(0, 4).map((app) => (
                                            <AppCard key={app.id} app={app} onSelect={handleAppSelect} />
                                        ))}
                                    </div>
                                </section>

                                {/* Category Sections */}
                                {Object.entries(groupedApps).map(([categoryId, apps]) => {
                                    const category = APP_CATEGORIES.find(c => c.id === categoryId);
                                    return (
                                        <section key={categoryId}>
                                            <div className="flex items-center justify-between mb-4">
                                                <h2 className="text-xl font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                                                    <span>{category?.icon}</span>
                                                    {category?.label}
                                                </h2>
                                                <button
                                                    onClick={() => setActiveCategory(categoryId as AppCategory)}
                                                    className="text-sm text-violet-600 dark:text-violet-400 font-medium hover:underline flex items-center gap-1"
                                                >
                                                    See all <ChevronRight size={16} />
                                                </button>
                                            </div>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                                                {apps.slice(0, 4).map((app) => (
                                                    <AppCard key={app.id} app={app} onSelect={handleAppSelect} />
                                                ))}
                                            </div>
                                        </section>
                                    );
                                })}
                            </motion.div>
                        ) : (
                            /* Filtered/Search View */
                            <motion.div
                                key="filtered"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                            >
                                {filteredApps.length > 0 ? (
                                    <>
                                        <div className="mb-4">
                                            <span className="text-sm text-zinc-500 dark:text-zinc-400">
                                                Showing {filteredApps.length} {filteredApps.length === 1 ? 'app' : 'apps'}
                                                {searchQuery && ` for "${searchQuery}"`}
                                            </span>
                                        </div>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                                            {filteredApps.map((app) => (
                                                <AppCard key={app.id} app={app} onSelect={handleAppSelect} />
                                            ))}
                                        </div>
                                    </>
                                ) : (
                                    <div className="flex flex-col items-center justify-center py-20">
                                        <div className="w-16 h-16 rounded-2xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center mb-4">
                                            <Search size={32} className="text-zinc-400" />
                                        </div>
                                        <h3 className="text-lg font-semibold text-zinc-900 dark:text-white mb-2">
                                            No apps found
                                        </h3>
                                        <p className="text-zinc-500 dark:text-zinc-400 text-center max-w-md">
                                            Try adjusting your search or filter to find what you're looking for.
                                        </p>
                                        <button
                                            onClick={() => {
                                                setSearchQuery('');
                                                setActiveCategory('all');
                                            }}
                                            className="mt-4 px-4 py-2 bg-violet-600 text-white rounded-xl text-sm font-medium hover:bg-violet-700 transition-colors"
                                        >
                                            Clear filters
                                        </button>
                                    </div>
                                )}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
};
