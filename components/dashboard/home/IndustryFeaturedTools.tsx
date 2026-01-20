import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Sparkles, ArrowRight, Building2, Car } from 'lucide-react';
import { INDUSTRY_CONFIGS, getAllIndustries, IndustryTool, IndustryConfig } from '../../../lib/data/industries';
import { ExpandableToolCard } from '../../industry/ExpandableToolCard';

export const IndustryFeaturedTools: React.FC = () => {
    const navigate = useNavigate();
    const industries = getAllIndustries();
    const [activeIndustryId, setActiveIndustryId] = useState<string>(industries[0]?.id || 'real-estate');
    const [expandedToolId, setExpandedToolId] = useState<string | null>(null);
    const scrollRef = useRef<HTMLDivElement>(null);

    const activeIndustry = INDUSTRY_CONFIGS[activeIndustryId];
    const featuredTools = activeIndustry?.featuredTools || [];

    const scroll = (direction: 'left' | 'right') => {
        if (scrollRef.current) {
            const scrollAmount = 320;
            scrollRef.current.scrollBy({
                left: direction === 'left' ? -scrollAmount : scrollAmount,
                behavior: 'smooth',
            });
        }
    };

    const handleExpand = (toolId: string) => {
        setExpandedToolId(toolId);
        setTimeout(() => {
            const card = document.getElementById(`home-tool-card-${toolId}`);
            if (card && scrollRef.current) {
                const container = scrollRef.current;
                const cardRect = card.getBoundingClientRect();
                const containerRect = container.getBoundingClientRect();
                const scrollLeft = card.offsetLeft - (containerRect.width / 2) + (cardRect.width / 2);
                container.scrollTo({ left: scrollLeft, behavior: 'smooth' });
            }
        }, 50);
    };

    const handleViewAllTools = () => {
        navigate(`/studio/apps/${activeIndustryId}`);
    };

    return (
        <div className="py-8">
            {/* Section Header */}
            <div className="max-w-7xl mx-auto px-6 mb-6">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-600 flex items-center justify-center">
                            <Sparkles size={20} className="text-white" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-zinc-900 dark:text-white">
                                Industry Tools
                            </h2>
                            <p className="text-sm text-zinc-500 dark:text-zinc-400">
                                Click to explore tools for your industry
                            </p>
                        </div>
                    </div>

                    {/* Navigation Arrows */}
                    <div className="flex items-center gap-3">
                        <button
                            onClick={handleViewAllTools}
                            className="hidden sm:flex items-center gap-2 px-4 py-2 text-sm font-medium text-violet-600 dark:text-violet-400 hover:bg-violet-50 dark:hover:bg-violet-950/30 rounded-lg transition-colors"
                        >
                            View All {activeIndustry?.name} Tools
                            <ArrowRight size={16} />
                        </button>
                        <div className="flex gap-2">
                            <button
                                onClick={() => scroll('left')}
                                className="p-2 rounded-full bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
                            >
                                <ChevronLeft size={20} className="text-zinc-600 dark:text-zinc-400" />
                            </button>
                            <button
                                onClick={() => scroll('right')}
                                className="p-2 rounded-full bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
                            >
                                <ChevronRight size={20} className="text-zinc-600 dark:text-zinc-400" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Industry Tabs */}
                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                    {industries.map((industry) => {
                        const isActive = activeIndustryId === industry.id;
                        const Icon = industry.icon;
                        return (
                            <button
                                key={industry.id}
                                onClick={() => {
                                    setActiveIndustryId(industry.id);
                                    setExpandedToolId(null);
                                }}
                                className={`
                                    flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap
                                    transition-all duration-200
                                    ${isActive
                                        ? 'bg-violet-600 text-white shadow-lg shadow-violet-500/20'
                                        : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700'
                                    }
                                `}
                            >
                                <Icon size={18} />
                                {industry.name}
                                <span className={`
                                    px-1.5 py-0.5 rounded-full text-[10px] font-bold
                                    ${isActive
                                        ? 'bg-white/20 text-white'
                                        : 'bg-zinc-200 dark:bg-zinc-700 text-zinc-500 dark:text-zinc-400'
                                    }
                                `}>
                                    {industry.featuredTools.length}
                                </span>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Featured Tools Carousel */}
            <AnimatePresence mode="wait">
                <motion.div
                    key={activeIndustryId}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                >
                    <div
                        ref={scrollRef}
                        className="flex gap-4 overflow-x-auto px-6 pb-4 scrollbar-hide snap-x snap-mandatory"
                        style={{ scrollPaddingLeft: '24px' }}
                    >
                        {/* Left padding spacer for max-w-7xl alignment */}
                        <div className="flex-shrink-0 w-[calc((100vw-1280px)/2-24px)] max-w-0 lg:max-w-none" />

                        {featuredTools.map((tool, index) => (
                            <motion.div
                                key={tool.id}
                                id={`home-tool-card-${tool.id}`}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className="snap-start"
                            >
                                <ExpandableToolCard
                                    tool={tool}
                                    isExpanded={expandedToolId === tool.id}
                                    onExpand={() => handleExpand(tool.id)}
                                    onCollapse={() => setExpandedToolId(null)}
                                    accentColor={activeIndustry?.accentColor || 'violet'}
                                />
                            </motion.div>
                        ))}

                        {/* View All Card */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: featuredTools.length * 0.1 }}
                            className="snap-start flex-shrink-0"
                        >
                            <button
                                onClick={handleViewAllTools}
                                className="w-[300px] h-full min-h-[240px] rounded-2xl border-2 border-dashed border-zinc-300 dark:border-zinc-700 hover:border-violet-500 dark:hover:border-violet-500 bg-zinc-50 dark:bg-zinc-900/50 hover:bg-violet-50 dark:hover:bg-violet-950/20 transition-all duration-300 flex flex-col items-center justify-center gap-4 group"
                            >
                                <div className="w-16 h-16 rounded-full bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center group-hover:scale-110 transition-transform">
                                    <ArrowRight size={24} className="text-violet-600 dark:text-violet-400" />
                                </div>
                                <div className="text-center">
                                    <p className="text-base font-semibold text-zinc-900 dark:text-white mb-1">
                                        View All Tools
                                    </p>
                                    <p className="text-sm text-zinc-500 dark:text-zinc-400">
                                        {activeIndustry?.tools.length || 0}+ more tools
                                    </p>
                                </div>
                            </button>
                        </motion.div>

                        {/* Right padding spacer */}
                        <div className="flex-shrink-0 w-6" />
                    </div>
                </motion.div>
            </AnimatePresence>

            {/* Mobile View All Button */}
            <div className="max-w-7xl mx-auto px-6 mt-4 sm:hidden">
                <button
                    onClick={handleViewAllTools}
                    className="w-full py-3 bg-violet-600 text-white font-medium rounded-xl hover:bg-violet-700 transition-colors flex items-center justify-center gap-2"
                >
                    View All {activeIndustry?.name} Tools
                    <ArrowRight size={16} />
                </button>
            </div>

            {/* Industry Stats Preview */}
            {activeIndustry && (
                <div className="max-w-7xl mx-auto px-6 mt-6">
                    <div className="grid grid-cols-3 gap-4 p-4 bg-zinc-50 dark:bg-zinc-900/50 rounded-2xl border border-zinc-200 dark:border-zinc-800">
                        {activeIndustry.stats.map((stat, index) => (
                            <div key={index} className="text-center">
                                <div className="text-xl font-bold text-zinc-900 dark:text-white">
                                    {stat.value}
                                </div>
                                <div className="text-xs text-zinc-500 dark:text-zinc-400">
                                    {stat.label}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <style>{`
                .scrollbar-hide::-webkit-scrollbar {
                    display: none;
                }
                .scrollbar-hide {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                }
            `}</style>
        </div>
    );
};
