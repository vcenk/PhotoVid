import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Play, Sparkles } from 'lucide-react';
import { INDUSTRIES } from '../../../lib/data/workflows';
import { useStudio } from '../../../lib/store/contexts/StudioContext';
import { getTemplatesByIndustry } from '../../../lib/data/templates';

// Industry-specific video backgrounds
const INDUSTRY_VIDEOS: Record<string, string> = {
    'real-estate': 'https://cdn.coverr.co/videos/coverr-living-room-interior-2616/1080p.mp4',
    'ecommerce': 'https://cdn.coverr.co/videos/coverr-pouring-coffee-in-slow-motion-4616/1080p.mp4',
    'restaurant': 'https://cdn.coverr.co/videos/coverr-chef-cooking-food-5108/1080p.mp4',
    'agency': 'https://cdn.coverr.co/videos/coverr-people-walking-in-a-modern-office-4769/1080p.mp4',
    'architecture': 'https://cdn.coverr.co/videos/coverr-modern-architecture-3657/1080p.mp4',
    'creator': 'https://cdn.coverr.co/videos/coverr-skateboarding-at-sunset-4600/1080p.mp4',
};

// Industry gradients
const INDUSTRY_GRADIENTS: Record<string, string> = {
    'real-estate': 'from-emerald-600 to-teal-600',
    'ecommerce': 'from-amber-500 to-orange-600',
    'restaurant': 'from-rose-500 to-red-600',
    'agency': 'from-slate-600 to-zinc-800',
    'architecture': 'from-teal-500 to-cyan-600',
    'creator': 'from-emerald-500 to-teal-600',
};

export const IndustryPortalCards: React.FC = () => {
    const { selectedIndustry, selectIndustry } = useStudio();
    const [hoveredId, setHoveredId] = useState<string | null>(null);

    return (
        <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-zinc-900 dark:text-white">Choose Your Industry</h2>
                <span className="text-xs text-zinc-400 dark:text-zinc-500">Select to see industry-specific templates</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
                {INDUSTRIES.map((industry, index) => {
                    const templates = getTemplatesByIndustry(industry.id);
                    const isSelected = selectedIndustry?.id === industry.id;
                    const isHovered = hoveredId === industry.id;
                    const gradient = INDUSTRY_GRADIENTS[industry.id] || 'from-zinc-600 to-zinc-800';
                    const videoUrl = INDUSTRY_VIDEOS[industry.id];

                    return (
                        <motion.div
                            key={industry.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                            onMouseEnter={() => setHoveredId(industry.id)}
                            onMouseLeave={() => setHoveredId(null)}
                            onClick={() => selectIndustry(industry.id)}
                            className={`
                relative group cursor-pointer rounded-2xl overflow-hidden
                transition-all duration-300
                ${isSelected
                                    ? 'ring-2 ring-teal-500 ring-offset-2 shadow-xl scale-[1.02]'
                                    : 'hover:shadow-xl hover:scale-[1.01]'
                                }
              `}
                        >
                            {/* Background */}
                            <div className={`absolute inset-0 bg-gradient-to-br ${gradient}`} />

                            {/* Video Background (on hover) */}
                            {videoUrl && isHovered && (
                                <video
                                    autoPlay
                                    muted
                                    loop
                                    playsInline
                                    className="absolute inset-0 w-full h-full object-cover opacity-40"
                                    src={videoUrl}
                                />
                            )}

                            {/* Overlay */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />

                            {/* Content */}
                            <div className="relative p-5 h-40 flex flex-col justify-between">
                                {/* Icon & Title */}
                                <div>
                                    <div className={`inline-flex p-2 rounded-xl bg-white/20 backdrop-blur-sm mb-3 transition-transform ${isHovered ? 'scale-110' : ''}`}>
                                        <industry.icon size={20} className="text-white" />
                                    </div>
                                    <h3 className="text-base font-bold text-white mb-1">{industry.name}</h3>
                                    <p className="text-xs text-white/70 line-clamp-2">{industry.description}</p>
                                </div>

                                {/* Stats */}
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <span className="text-[10px] text-white/60 flex items-center gap-1">
                                            <Sparkles size={10} />
                                            {templates.length} templates
                                        </span>
                                        <span className="text-[10px] text-white/60">
                                            {industry.workflows.length} workflows
                                        </span>
                                    </div>

                                    <motion.div
                                        animate={{ x: isHovered ? 4 : 0 }}
                                        className="p-1 rounded-full bg-white/20"
                                    >
                                        <ArrowRight size={12} className="text-white" />
                                    </motion.div>
                                </div>
                            </div>

                            {/* Selected Indicator */}
                            {isSelected && (
                                <div className="absolute top-3 right-3">
                                    <span className="px-2 py-0.5 rounded-full bg-white text-teal-600 text-[10px] font-bold">
                                        Selected
                                    </span>
                                </div>
                            )}
                        </motion.div>
                    );
                })}
            </div>
        </div>
    );
};
