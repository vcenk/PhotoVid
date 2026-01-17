import React, { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sparkles, Play, ArrowRight, Upload, Volume2, VolumeX } from 'lucide-react';
import type { IndustryConfig } from '../../lib/data/industries';

interface IndustryHeroProps {
    config: IndustryConfig;
}

export const IndustryHero: React.FC<IndustryHeroProps> = ({ config }) => {
    const navigate = useNavigate();
    const videoRef = useRef<HTMLVideoElement>(null);
    const [isMuted, setIsMuted] = useState(true);
    const Icon = config.icon;

    const isDarkHero = config.gradient.includes('zinc-900') || config.gradient.includes('zinc-800');

    const toggleMute = () => {
        if (videoRef.current) {
            videoRef.current.muted = !videoRef.current.muted;
            setIsMuted(!isMuted);
        }
    };

    return (
        <div className="relative overflow-hidden min-h-[480px]">
            {/* Video Background */}
            {config.heroVideo ? (
                <div className="absolute inset-0">
                    <video
                        ref={videoRef}
                        autoPlay
                        loop
                        muted
                        playsInline
                        className="w-full h-full object-cover scale-105"
                    >
                        <source src={config.heroVideo} type="video/mp4" />
                    </video>

                    {/* Glossy Overlay - Creates premium glass effect */}
                    <div className="absolute inset-0 bg-gradient-to-br from-black/70 via-black/50 to-black/30" />
                    <div className="absolute inset-0 backdrop-blur-[2px]" />

                    {/* Accent color glow */}
                    <div className={`absolute inset-0 mix-blend-overlay opacity-40 ${isDarkHero
                            ? 'bg-gradient-to-tr from-red-600/30 via-transparent to-orange-500/20'
                            : 'bg-gradient-to-tr from-blue-600/30 via-transparent to-violet-500/20'
                        }`} />

                    {/* Mute button */}
                    <button
                        onClick={toggleMute}
                        className="absolute bottom-6 right-6 p-3 rounded-full bg-white/10 backdrop-blur-md border border-white/20 hover:bg-white/20 transition-colors z-20"
                    >
                        {isMuted ? (
                            <VolumeX size={18} className="text-white/70" />
                        ) : (
                            <Volume2 size={18} className="text-white" />
                        )}
                    </button>
                </div>
            ) : (
                /* Fallback animated gradient */
                <div className={`absolute inset-0 bg-gradient-to-br ${config.gradient}`}>
                    <div className="absolute inset-0 opacity-30">
                        <div className="absolute -top-40 -left-40 w-80 h-80 bg-white/20 rounded-full blur-3xl animate-pulse" />
                        <div className="absolute -bottom-40 -right-40 w-80 h-80 bg-white/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
                    </div>
                </div>
            )}

            {/* Content */}
            <div className="relative z-10 max-w-7xl mx-auto px-6 py-16 flex items-center min-h-[480px]">
                <div className="grid lg:grid-cols-5 gap-12 items-center w-full">

                    {/* Left: Content (3 cols) */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        className="lg:col-span-3"
                    >
                        {/* Glossy Badge */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.2 }}
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-xl border border-white/20 shadow-lg mb-6"
                        >
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isDarkHero
                                    ? 'bg-gradient-to-br from-red-500 to-orange-500'
                                    : 'bg-gradient-to-br from-blue-500 to-violet-500'
                                }`}>
                                <Icon size={16} className="text-white" />
                            </div>
                            <span className="text-white font-medium">{config.name} Studio</span>
                        </motion.div>

                        {/* Headline */}
                        <h1 className="text-4xl lg:text-5xl xl:text-6xl font-bold text-white mb-5 leading-tight">
                            {config.tagline}
                        </h1>

                        {/* Description */}
                        <p className="text-lg lg:text-xl text-white/70 mb-8 max-w-xl leading-relaxed">
                            {config.description}
                        </p>

                        {/* Glossy CTA Buttons */}
                        <div className="flex flex-wrap gap-4 mb-10">
                            <motion.button
                                whileHover={{ scale: 1.03, y: -2 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => navigate('/studio/image')}
                                className={`group px-8 py-4 font-semibold rounded-2xl transition-all flex items-center gap-3 shadow-2xl ${isDarkHero
                                        ? 'bg-gradient-to-r from-red-500 to-orange-500 text-white shadow-red-500/25 hover:shadow-red-500/40'
                                        : 'bg-white text-zinc-900 shadow-white/25 hover:shadow-white/40'
                                    }`}
                            >
                                <Upload size={20} />
                                <span>Upload Your First Photo</span>
                                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                            </motion.button>

                            <motion.button
                                whileHover={{ scale: 1.03, y: -2 }}
                                className="px-6 py-4 font-semibold rounded-2xl transition-all flex items-center gap-2 bg-white/10 backdrop-blur-xl border border-white/20 text-white hover:bg-white/20 shadow-lg"
                            >
                                <Play size={18} />
                                See It In Action
                            </motion.button>
                        </div>

                        {/* Stats with glass cards */}
                        <div className="flex gap-6">
                            {config.stats.map((stat, index) => (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.3 + index * 0.1 }}
                                    className="px-5 py-3 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10"
                                >
                                    <p className="text-2xl lg:text-3xl font-bold text-white">{stat.value}</p>
                                    <p className="text-sm text-white/50">{stat.label}</p>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>

                    {/* Right: Floating Glass Card (2 cols) */}
                    <motion.div
                        initial={{ opacity: 0, x: 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6, delay: 0.3 }}
                        className="lg:col-span-2 hidden lg:block"
                    >
                        <div className="relative">
                            {/* Glow effect behind card */}
                            <div className={`absolute -inset-4 rounded-3xl blur-2xl opacity-40 ${isDarkHero
                                    ? 'bg-gradient-to-br from-red-500 to-orange-600'
                                    : 'bg-gradient-to-br from-blue-500 to-violet-600'
                                }`} />

                            {/* Glassmorphism Card */}
                            <div className="relative bg-white/10 backdrop-blur-2xl rounded-3xl border border-white/20 p-5 shadow-2xl overflow-hidden">
                                {/* Shine effect */}
                                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent" />

                                {/* Preview Image */}
                                <div className="aspect-video rounded-2xl overflow-hidden mb-4 bg-black/20">
                                    {config.heroPreviewImage && (
                                        <img
                                            src={config.heroPreviewImage}
                                            alt="Preview"
                                            className="w-full h-full object-cover"
                                        />
                                    )}
                                </div>

                                {/* Card content */}
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-white font-semibold">Ready in seconds</p>
                                        <p className="text-white/50 text-sm">No design skills needed</p>
                                    </div>
                                    <motion.div
                                        whileHover={{ scale: 1.05 }}
                                        className={`px-4 py-2 rounded-xl font-semibold text-sm cursor-pointer ${isDarkHero
                                                ? 'bg-gradient-to-r from-red-500 to-orange-500 text-white'
                                                : 'bg-white text-zinc-900'
                                            }`}
                                    >
                                        Try Free
                                    </motion.div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
};
