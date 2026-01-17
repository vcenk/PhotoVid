"use client";

import React, { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import {
  Wand2,
  Film,
  Music,
  Palette,
  Zap,
  Globe,
  Layers,
  Sparkles,
  ArrowRight,
} from 'lucide-react';

interface FeatureCardProps {
  title: string;
  description: string;
  icon: React.ElementType;
  gradient: string;
  size: 'small' | 'medium' | 'large';
  preview?: string;
  delay?: number;
}

const FeatureCard: React.FC<FeatureCardProps> = ({
  title,
  description,
  icon: Icon,
  gradient,
  size,
  preview,
  delay = 0,
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  const sizeClasses = {
    small: 'col-span-1 row-span-1',
    medium: 'col-span-1 md:col-span-2 row-span-1',
    large: 'col-span-1 md:col-span-2 row-span-2',
  };

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ delay, duration: 0.5 }}
      whileHover={{ y: -5, scale: 1.01 }}
      className={`${sizeClasses[size]} group relative overflow-hidden rounded-3xl bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-white/10 p-6 md:p-8 transition-all duration-500 hover:border-zinc-300 dark:hover:border-white/20 hover:shadow-2xl hover:shadow-indigo-500/5`}
    >
      {/* Background gradient on hover */}
      <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-500`} />

      {/* Glow effect */}
      <div className={`absolute -inset-px rounded-3xl bg-gradient-to-br ${gradient} opacity-0 group-hover:opacity-10 blur-xl transition-opacity duration-500`} />

      {/* Content */}
      <div className="relative z-10 h-full flex flex-col">
        {/* Icon */}
        <motion.div
          whileHover={{ rotate: [0, -10, 10, 0] }}
          transition={{ duration: 0.5 }}
          className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center mb-4 shadow-lg`}
          style={{ boxShadow: `0 8px 32px -8px var(--tw-shadow-color)` }}
        >
          <Icon className="w-6 h-6 text-white" />
        </motion.div>

        {/* Title */}
        <h3 className="text-xl font-bold text-zinc-900 dark:text-white mb-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
          {title}
        </h3>

        {/* Description */}
        <p className="text-zinc-500 dark:text-zinc-400 text-sm leading-relaxed flex-grow">
          {description}
        </p>

        {/* Preview image for large cards */}
        {preview && size === 'large' && (
          <div className="mt-6 -mx-2 -mb-2 relative overflow-hidden rounded-2xl">
            <img
              src={preview}
              alt={title}
              className="w-full h-48 object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-zinc-900/60 to-transparent" />
          </div>
        )}

        {/* Learn more link */}
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          whileHover={{ x: 5 }}
          className="mt-4 flex items-center gap-2 text-sm font-semibold text-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity"
        >
          Learn more <ArrowRight size={14} />
        </motion.div>
      </div>

      {/* Corner accent */}
      <div className={`absolute -top-20 -right-20 w-40 h-40 bg-gradient-to-br ${gradient} rounded-full opacity-5 group-hover:opacity-10 transition-opacity blur-2xl`} />
    </motion.div>
  );
};

const FEATURES: FeatureCardProps[] = [
  {
    title: "AI Image Generation",
    description: "Create stunning visuals from text prompts. Our models understand composition, lighting, and style to deliver professional-grade imagery.",
    icon: Wand2,
    gradient: "from-violet-500 to-purple-600",
    size: "large",
    preview: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=600&auto=format&fit=crop",
  },
  {
    title: "Video Synthesis",
    description: "Transform static images into cinematic motion with AI-powered video generation.",
    icon: Film,
    gradient: "from-blue-500 to-cyan-500",
    size: "small",
  },
  {
    title: "Audio Composition",
    description: "Generate context-aware soundscapes and music that perfectly complement your visuals.",
    icon: Music,
    gradient: "from-pink-500 to-rose-500",
    size: "small",
  },
  {
    title: "Style Transfer",
    description: "Apply artistic styles to any content. Transform photos into paintings, sketches, or custom aesthetics with one click.",
    icon: Palette,
    gradient: "from-amber-500 to-orange-500",
    size: "medium",
  },
  {
    title: "Real-time Processing",
    description: "Lightning-fast generation powered by optimized GPU infrastructure.",
    icon: Zap,
    gradient: "from-yellow-500 to-amber-500",
    size: "small",
  },
  {
    title: "Multi-language Support",
    description: "Create content in 40+ languages with native-quality AI voices.",
    icon: Globe,
    gradient: "from-emerald-500 to-teal-500",
    size: "small",
  },
  {
    title: "Layered Editing",
    description: "Professional compositing tools with AI-assisted masking and object isolation.",
    icon: Layers,
    gradient: "from-indigo-500 to-violet-500",
    size: "medium",
  },
];

export const FeatureGrid: React.FC = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" });

  return (
    <section
      ref={sectionRef}
      className="relative py-24 md:py-32 overflow-hidden"
    >
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-white via-zinc-50 to-white dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-950" />

      {/* Grid pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.02)_1px,transparent_1px)] dark:bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:50px_50px]" />

      <div className="relative max-w-7xl mx-auto px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          className="text-center mb-16"
        >
          <motion.span
            initial={{ opacity: 0, scale: 0.9 }}
            animate={isInView ? { opacity: 1, scale: 1 } : {}}
            transition={{ delay: 0.1 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-indigo-500/10 to-violet-500/10 text-indigo-600 dark:text-indigo-400 text-xs font-bold uppercase tracking-widest mb-6 border border-indigo-500/20"
          >
            <Sparkles size={14} />
            Powerful Features
          </motion.span>

          <h2 className="text-3xl md:text-5xl font-bold text-zinc-900 dark:text-white tracking-tight mb-4">
            Everything you need to{' '}
            <span className="bg-gradient-to-r from-indigo-500 to-violet-500 bg-clip-text text-transparent">
              create
            </span>
          </h2>

          <p className="text-lg text-zinc-500 dark:text-zinc-400 max-w-2xl mx-auto">
            A complete suite of AI-powered tools designed for professional content creation
          </p>
        </motion.div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 md:gap-6 auto-rows-[200px]">
          {FEATURES.map((feature, idx) => (
            <FeatureCard
              key={feature.title}
              {...feature}
              delay={idx * 0.1}
            />
          ))}
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.8 }}
          className="mt-16 text-center"
        >
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="inline-flex items-center gap-3 px-8 py-4 rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 text-white font-bold shadow-lg shadow-indigo-500/30 hover:shadow-xl hover:shadow-indigo-500/40 transition-shadow"
          >
            <Sparkles size={18} />
            Explore All Features
            <ArrowRight size={18} />
          </motion.button>
        </motion.div>
      </div>
    </section>
  );
};
