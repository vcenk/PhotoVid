import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Play, Star, Zap, Crown, TrendingUp, Clock } from 'lucide-react';
import { Template } from '../../../lib/types/studio';

interface TemplateCardProps {
    template: Template;
    onSelect: (template: Template) => void;
}

export const TemplateCard: React.FC<TemplateCardProps> = ({ template, onSelect }) => {
    const [isHovering, setIsHovering] = useState(false);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -4 }}
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => setIsHovering(false)}
            onClick={() => onSelect(template)}
            className="group cursor-pointer bg-white dark:bg-zinc-950 rounded-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden hover:shadow-2xl hover:border-indigo-200 dark:hover:border-indigo-600 transition-all duration-300"
        >
            {/* Image/Video Preview */}
            <div className="relative aspect-[4/3] overflow-hidden bg-zinc-100 dark:bg-zinc-900">
                {/* Before Image (default) */}
                <img
                    src={template.beforeImageUrl}
                    alt={template.name}
                    className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${isHovering ? 'opacity-0' : 'opacity-100'}`}
                />

                {/* After Video Preview (on hover) */}
                {isHovering && (
                    <video
                        autoPlay
                        muted
                        loop
                        playsInline
                        className="absolute inset-0 w-full h-full object-cover"
                        src={template.afterVideoUrl}
                    />
                )}

                {/* Hover Overlay */}
                <div className={`absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent transition-opacity duration-300 ${isHovering ? 'opacity-100' : 'opacity-0'}`}>
                    <div className="absolute bottom-4 left-4 right-4">
                        <div className="flex items-center gap-2 text-white text-sm font-medium">
                            <Play size={14} className="fill-current" />
                            <span>Preview</span>
                        </div>
                    </div>
                </div>

                {/* Before/After Label */}
                <div className="absolute top-3 left-3 flex items-center gap-1">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide ${isHovering ? 'bg-indigo-500 text-white' : 'bg-white/90 dark:bg-zinc-800/90 text-zinc-600 dark:text-zinc-300'}`}>
                        {isHovering ? 'After' : 'Before'}
                    </span>
                </div>

                {/* Badges */}
                <div className="absolute top-3 right-3 flex flex-col gap-1.5">
                    {template.isPremium && (
                        <span className="px-2 py-0.5 rounded-full bg-amber-400 text-amber-900 text-[10px] font-bold flex items-center gap-1">
                            <Crown size={10} /> PRO
                        </span>
                    )}
                    {template.isNew && (
                        <span className="px-2 py-0.5 rounded-full bg-emerald-500 text-white text-[10px] font-bold">
                            NEW
                        </span>
                    )}
                    {template.isTrending && !template.isNew && (
                        <span className="px-2 py-0.5 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center gap-1">
                            <TrendingUp size={10} /> HOT
                        </span>
                    )}
                </div>

                {/* Credits Badge */}
                <div className="absolute bottom-3 right-3">
                    <span className="px-2 py-1 rounded-lg bg-black/60 backdrop-blur-sm text-white text-xs font-medium flex items-center gap-1">
                        <Zap size={12} className="text-amber-400" />
                        {template.credits}
                    </span>
                </div>
            </div>

            {/* Content */}
            <div className="p-4">
                <div className="flex items-start justify-between mb-2">
                    <h3 className="text-sm font-bold text-zinc-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors line-clamp-1">
                        {template.name}
                    </h3>
                    <div className="flex items-center gap-1 text-amber-500">
                        <Star size={12} className="fill-current" />
                        <span className="text-xs font-medium text-zinc-600 dark:text-zinc-400">{template.rating}</span>
                    </div>
                </div>

                <p className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-2 mb-3">
                    {template.description}
                </p>

                {/* Tags */}
                <div className="flex flex-wrap gap-1 mb-3">
                    <span className="px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 text-[10px] font-medium">
                        {template.category}
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 text-[10px] font-medium">
                        {template.stylePreset}
                    </span>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between pt-3 border-t border-zinc-100 dark:border-zinc-800">
                    <span className="text-[10px] text-zinc-400 dark:text-zinc-500 flex items-center gap-1">
                        <Clock size={10} />
                        {template.duration}s
                    </span>
                    <span className="text-[10px] text-zinc-400 dark:text-zinc-500">
                        {template.usageCount.toLocaleString()} uses
                    </span>
                </div>
            </div>
        </motion.div>
    );
};
