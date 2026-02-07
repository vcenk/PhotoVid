import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Play, Sparkles, Crown, TrendingUp, Zap } from 'lucide-react';
import type { AIApp } from '../../../lib/data/apps';

interface AppCardProps {
    app: AIApp;
    onSelect?: (app: AIApp) => void;
}

export const AppCard: React.FC<AppCardProps> = ({ app, onSelect }) => {
    const [isHovered, setIsHovered] = useState(false);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -4 }}
            className="group relative cursor-pointer"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            onClick={() => onSelect?.(app)}
        >
            {/* Card Container */}
            <div className="relative bg-white dark:bg-zinc-900 rounded-2xl overflow-hidden border border-zinc-100 dark:border-zinc-800 shadow-sm hover:shadow-xl hover:border-emerald-200 dark:hover:border-emerald-900/50 transition-all duration-300">
                {/* Thumbnail */}
                <div className="relative aspect-[4/3] overflow-hidden bg-zinc-100 dark:bg-zinc-800">
                    <img
                        src={app.thumbnail}
                        alt={app.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />

                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                    {/* Badges - Top Left */}
                    <div className="absolute top-3 left-3 flex gap-2">
                        {app.isNew && (
                            <span className="px-2 py-1 bg-emerald-500 text-white text-[10px] font-bold uppercase rounded-full flex items-center gap-1 shadow-lg">
                                <Zap size={10} />
                                New
                            </span>
                        )}
                        {app.isTrending && (
                            <span className="px-2 py-1 bg-gradient-to-r from-orange-500 to-pink-500 text-white text-[10px] font-bold uppercase rounded-full flex items-center gap-1 shadow-lg">
                                <TrendingUp size={10} />
                                Trending
                            </span>
                        )}
                    </div>

                    {/* Premium Badge - Top Right */}
                    {app.isPremium && (
                        <div className="absolute top-3 right-3">
                            <span className="px-2 py-1 bg-gradient-to-r from-amber-400 to-yellow-500 text-amber-900 text-[10px] font-bold uppercase rounded-full flex items-center gap-1 shadow-lg">
                                <Crown size={10} />
                                Pro
                            </span>
                        </div>
                    )}

                    {/* Hover Play Button */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{
                            opacity: isHovered ? 1 : 0,
                            scale: isHovered ? 1 : 0.8
                        }}
                        className="absolute inset-0 flex items-center justify-center"
                    >
                        <div className="w-14 h-14 rounded-full bg-white/90 dark:bg-zinc-900/90 backdrop-blur-sm flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform">
                            <Play size={24} className="text-emerald-600 dark:text-emerald-400 ml-1" fill="currentColor" />
                        </div>
                    </motion.div>
                </div>

                {/* Content */}
                <div className="p-4">
                    <h3 className="font-semibold text-zinc-900 dark:text-white text-base mb-1 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                        {app.name}
                    </h3>
                    <p className="text-zinc-500 dark:text-zinc-400 text-sm line-clamp-2 leading-relaxed">
                        {app.description}
                    </p>

                    {/* Tags */}
                    <div className="mt-3 flex flex-wrap gap-1.5">
                        {app.tags.slice(0, 3).map((tag) => (
                            <span
                                key={tag}
                                className="px-2 py-0.5 bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 text-[11px] font-medium rounded-full"
                            >
                                {tag}
                            </span>
                        ))}
                    </div>
                </div>

                {/* Bottom Action Bar - Appears on Hover */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{
                        opacity: isHovered ? 1 : 0,
                        y: isHovered ? 0 : 10
                    }}
                    className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-white dark:from-zinc-900 via-white/95 dark:via-zinc-900/95 to-transparent"
                >
                    <button className="w-full py-2.5 bg-gradient-to-r from-emerald-600 to-fuchsia-600 text-white text-sm font-semibold rounded-xl hover:from-emerald-700 hover:to-fuchsia-700 transition-colors flex items-center justify-center gap-2 shadow-lg shadow-emerald-200 dark:shadow-emerald-900/30">
                        <Sparkles size={16} />
                        Try Now
                    </button>
                </motion.div>
            </div>
        </motion.div>
    );
};
