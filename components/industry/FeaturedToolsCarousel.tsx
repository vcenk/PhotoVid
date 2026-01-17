import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import { ExpandableToolCard } from './ExpandableToolCard';
import type { IndustryTool } from '../../lib/data/industries';

interface FeaturedToolsCarouselProps {
    tools: IndustryTool[];
    accentColor: string;
    title?: string;
    subtitle?: string;
}

export const FeaturedToolsCarousel: React.FC<FeaturedToolsCarouselProps> = ({
    tools,
    accentColor,
    title = 'Featured Tools',
    subtitle = 'Click to expand and learn more',
}) => {
    const [expandedId, setExpandedId] = useState<string | null>(null);
    const scrollRef = useRef<HTMLDivElement>(null);

    const scroll = (direction: 'left' | 'right') => {
        if (scrollRef.current) {
            const scrollAmount = 300;
            scrollRef.current.scrollBy({
                left: direction === 'left' ? -scrollAmount : scrollAmount,
                behavior: 'smooth',
            });
        }
    };

    const handleExpand = (toolId: string) => {
        setExpandedId(toolId);

        // Scroll the expanded card into view
        setTimeout(() => {
            const card = document.getElementById(`tool-card-${toolId}`);
            if (card && scrollRef.current) {
                const container = scrollRef.current;
                const cardRect = card.getBoundingClientRect();
                const containerRect = container.getBoundingClientRect();

                // Center the card in the container
                const scrollLeft = card.offsetLeft - (containerRect.width / 2) + (cardRect.width / 2);
                container.scrollTo({
                    left: scrollLeft,
                    behavior: 'smooth',
                });
            }
        }, 50);
    };

    return (
        <div className="py-8">
            {/* Section Header */}
            <div className="max-w-7xl mx-auto px-6 mb-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-600 flex items-center justify-center">
                            <Sparkles size={20} className="text-white" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-zinc-900 dark:text-white">
                                {title}
                            </h2>
                            <p className="text-sm text-zinc-500 dark:text-zinc-400">
                                {subtitle}
                            </p>
                        </div>
                    </div>

                    {/* Navigation Arrows */}
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

            {/* Carousel */}
            <div
                ref={scrollRef}
                className="flex gap-4 overflow-x-auto px-6 pb-4 scrollbar-hide snap-x snap-mandatory"
                style={{ scrollPaddingLeft: '24px' }}
            >
                {/* Left padding spacer for max-w-7xl alignment */}
                <div className="flex-shrink-0 w-[calc((100vw-1280px)/2-24px)] max-w-0 lg:max-w-none" />

                {tools.map((tool, index) => (
                    <motion.div
                        key={tool.id}
                        id={`tool-card-${tool.id}`}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="snap-start"
                    >
                        <ExpandableToolCard
                            tool={tool}
                            isExpanded={expandedId === tool.id}
                            onExpand={() => handleExpand(tool.id)}
                            onCollapse={() => setExpandedId(null)}
                            accentColor={accentColor}
                        />
                    </motion.div>
                ))}

                {/* Right padding spacer */}
                <div className="flex-shrink-0 w-6" />
            </div>

            {/* Scroll hint for mobile */}
            <div className="flex justify-center mt-2 lg:hidden">
                <span className="text-xs text-zinc-400">Swipe to see more →</span>
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
        </div>
    );
};
