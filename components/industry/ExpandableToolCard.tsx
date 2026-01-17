import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Crown, Sparkles, X, ArrowLeftRight } from 'lucide-react';
import type { IndustryTool } from '../../lib/data/industries';

interface ExpandableToolCardProps {
    tool: IndustryTool;
    isExpanded: boolean;
    onExpand: () => void;
    onCollapse: () => void;
    accentColor: string;
}

// Before/After Comparison Slider Component
const BeforeAfterSlider: React.FC<{ beforeImage: string; afterImage: string; }> = ({ beforeImage, afterImage }) => {
    const [sliderPosition, setSliderPosition] = useState(50);
    const containerRef = useRef<HTMLDivElement>(null);
    const [isDragging, setIsDragging] = useState(false);

    const handleMove = (clientX: number) => {
        if (containerRef.current) {
            const rect = containerRef.current.getBoundingClientRect();
            const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
            setSliderPosition((x / rect.width) * 100);
        }
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (isDragging) handleMove(e.clientX);
    };

    const handleTouchMove = (e: React.TouchEvent) => {
        handleMove(e.touches[0].clientX);
    };

    return (
        <div
            ref={containerRef}
            className="relative w-full aspect-[4/3] rounded-xl overflow-hidden cursor-ew-resize select-none"
            onMouseDown={() => setIsDragging(true)}
            onMouseUp={() => setIsDragging(false)}
            onMouseLeave={() => setIsDragging(false)}
            onMouseMove={handleMouseMove}
            onTouchMove={handleTouchMove}
        >
            {/* After Image (Background) */}
            <img src={afterImage} alt="After" className="absolute inset-0 w-full h-full object-cover" />

            {/* Before Image (Clipped) */}
            <div
                className="absolute inset-0 overflow-hidden"
                style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}
            >
                <img src={beforeImage} alt="Before" className="w-full h-full object-cover" />
            </div>

            {/* Slider Line */}
            <div
                className="absolute top-0 bottom-0 w-0.5 bg-white shadow-lg z-10"
                style={{ left: `${sliderPosition}%` }}
            >
                {/* Slider Handle */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center">
                    <ArrowLeftRight size={18} className="text-zinc-700" />
                </div>
            </div>

            {/* Labels */}
            <div className="absolute top-3 left-3 px-2 py-1 bg-black/60 backdrop-blur-sm rounded text-xs text-white font-medium">
                Before
            </div>
            <div className="absolute top-3 right-3 px-2 py-1 bg-black/60 backdrop-blur-sm rounded text-xs text-white font-medium">
                After
            </div>
        </div>
    );
};

export const ExpandableToolCard: React.FC<ExpandableToolCardProps> = ({
    tool,
    isExpanded,
    onExpand,
    onCollapse,
    accentColor,
}) => {
    const navigate = useNavigate();

    const handleTryTool = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (tool.route) {
            navigate(tool.route);
        } else {
            navigate('/studio/image');
        }
    };

    // Accent color classes
    const accentClasses = {
        indigo: {
            hover: 'hover:border-indigo-200 dark:hover:border-indigo-900/50',
            text: 'text-indigo-600 dark:text-indigo-400',
            bg: 'bg-indigo-600',
            ring: 'ring-indigo-500',
        },
        red: {
            hover: 'hover:border-red-200 dark:hover:border-red-900/50',
            text: 'text-red-600 dark:text-red-400',
            bg: 'bg-red-600',
            ring: 'ring-red-500',
        },
    }[accentColor] || {
        hover: 'hover:border-violet-200 dark:hover:border-violet-900/50',
        text: 'text-violet-600 dark:text-violet-400',
        bg: 'bg-violet-600',
        ring: 'ring-violet-500',
    };

    const hasBeforeAfter = tool.beforeImage && tool.afterImage;

    return (
        <motion.div
            layout
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{
                opacity: 1,
                scale: 1,
                width: isExpanded ? 420 : 300,
            }}
            transition={{
                layout: { duration: 0.3, ease: 'easeOut' },
                width: { duration: 0.3, ease: 'easeOut' }
            }}
            className={`
                relative flex-shrink-0 bg-white dark:bg-zinc-900 rounded-2xl 
                border border-zinc-200 dark:border-zinc-800 
                cursor-pointer overflow-hidden
                transition-shadow duration-300
                ${isExpanded ? `ring-2 ${accentClasses.ring} shadow-2xl` : `${accentClasses.hover} hover:shadow-xl`}
            `}
            onClick={() => !isExpanded && onExpand()}
        >
            <AnimatePresence mode="wait">
                {isExpanded ? (
                    /* ========== EXPANDED STATE ========== */
                    <motion.div
                        key="expanded"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="flex flex-col"
                    >
                        {/* Close Button */}
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onCollapse();
                            }}
                            className="absolute top-3 right-3 p-2 rounded-full bg-black/40 hover:bg-black/60 transition-colors z-20"
                        >
                            <X size={16} className="text-white" />
                        </button>

                        {/* Before/After or Regular Image */}
                        <div className="p-4 pb-0">
                            {hasBeforeAfter ? (
                                <BeforeAfterSlider
                                    beforeImage={tool.beforeImage!}
                                    afterImage={tool.afterImage!}
                                />
                            ) : (
                                <div className="relative aspect-[4/3] rounded-xl overflow-hidden">
                                    <img
                                        src={tool.image}
                                        alt={tool.name}
                                        className="w-full h-full object-cover"
                                    />
                                    {/* Tags on image */}
                                    <div className="absolute bottom-3 left-3 flex gap-2">
                                        {tool.isPremium && (
                                            <span className="px-2 py-1 bg-gradient-to-r from-amber-400 to-yellow-500 text-black text-[10px] font-bold uppercase rounded-full flex items-center gap-1">
                                                <Crown size={10} />
                                                Pro
                                            </span>
                                        )}
                                        {tool.tags?.map((tag) => (
                                            <span
                                                key={tag}
                                                className="px-2 py-1 bg-white/90 text-zinc-800 text-[10px] font-semibold uppercase rounded-full"
                                            >
                                                {tag}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Content */}
                        <div className="p-4">
                            <h3 className="text-lg font-bold text-zinc-900 dark:text-white mb-2">
                                {tool.name}
                            </h3>
                            <p className="text-sm text-zinc-600 dark:text-zinc-300 mb-4 leading-relaxed">
                                {tool.longDescription || tool.description}
                            </p>

                            {/* CTA Button */}
                            <button
                                onClick={handleTryTool}
                                className={`w-full py-3 ${accentClasses.bg} text-white text-sm font-semibold rounded-xl hover:opacity-90 transition-opacity flex items-center justify-center gap-2`}
                            >
                                <Sparkles size={16} />
                                Try {tool.name}
                            </button>
                        </div>
                    </motion.div>
                ) : (
                    /* ========== COLLAPSED STATE ========== */
                    <motion.div
                        key="collapsed"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.15 }}
                        className="group"
                    >
                        {/* Image */}
                        <div className="relative h-40 overflow-hidden">
                            <img
                                src={tool.image}
                                alt={tool.name}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

                            {/* Tags */}
                            <div className="absolute top-3 right-3 flex gap-2">
                                {tool.isPremium && (
                                    <span className="px-2 py-1 bg-gradient-to-r from-amber-400 to-yellow-500 text-black text-[10px] font-bold uppercase rounded-full flex items-center gap-1">
                                        <Crown size={10} />
                                        Pro
                                    </span>
                                )}
                                {hasBeforeAfter && (
                                    <span className="px-2 py-1 bg-white/90 text-zinc-800 text-[10px] font-bold uppercase rounded-full flex items-center gap-1">
                                        <ArrowLeftRight size={10} />
                                        Compare
                                    </span>
                                )}
                            </div>

                            {/* Title overlay on image */}
                            <div className="absolute bottom-0 left-0 right-0 p-4">
                                <div className="flex gap-2 mb-2">
                                    {tool.tags?.slice(0, 1).map((tag) => (
                                        <span
                                            key={tag}
                                            className="px-2 py-0.5 bg-white/20 backdrop-blur-sm text-white text-[10px] font-semibold uppercase rounded-full"
                                        >
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                                <h3 className="text-base font-bold text-white">
                                    {tool.name}
                                </h3>
                            </div>
                        </div>

                        {/* Description */}
                        <div className="p-4 flex items-end justify-between">
                            <p className="text-sm text-zinc-500 dark:text-zinc-400 line-clamp-2 flex-1 pr-2">
                                {tool.description}
                            </p>
                            <motion.div
                                animate={{ x: [0, 3, 0] }}
                                transition={{ repeat: Infinity, duration: 1.5 }}
                                className="flex-shrink-0"
                            >
                                <ArrowRight size={18} className={accentClasses.text} />
                            </motion.div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};
