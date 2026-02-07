"use client";

import React, { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import {
  Sofa,
  CloudSun,
  SunMedium,
  ImagePlus,
  Eraser,
  PaintBucket,
  Sparkles,
  ArrowRight,
  Layers,
  TreePine,
} from 'lucide-react';

interface FeatureCardProps {
  title: string;
  description: string;
  icon: React.ElementType;
  gradient: string;
  size: 'small' | 'medium' | 'large';
  image?: string;
  delay?: number;
}

const FeatureCard: React.FC<FeatureCardProps> = ({
  title,
  description,
  icon: Icon,
  gradient,
  size,
  image,
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
      className={`${sizeClasses[size]} group relative overflow-hidden rounded-3xl bg-zinc-900/50 border border-white/10 p-6 md:p-8 transition-all duration-500 hover:border-white/20 hover:shadow-2xl hover:shadow-teal-500/5`}
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
        >
          <Icon className="w-6 h-6 text-white" />
        </motion.div>

        {/* Title */}
        <h3 className="text-xl font-bold text-white mb-2 group-hover:text-teal-400 transition-colors">
          {title}
        </h3>

        {/* Description */}
        <p className="text-zinc-400 text-sm leading-relaxed flex-grow">
          {description}
        </p>

        {/* Preview image for large cards */}
        {image && size === 'large' && (
          <div className="mt-6 -mx-2 -mb-2 relative overflow-hidden rounded-2xl">
            <img
              src={image}
              alt={title}
              className="w-full h-48 object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-zinc-900/80 to-transparent" />
          </div>
        )}

        {/* Learn more link */}
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          whileHover={{ x: 5 }}
          className="mt-4 flex items-center gap-2 text-sm font-semibold text-teal-400 opacity-0 group-hover:opacity-100 transition-opacity"
        >
          Try it free <ArrowRight size={14} />
        </motion.div>
      </div>

      {/* Corner accent */}
      <div className={`absolute -top-20 -right-20 w-40 h-40 bg-gradient-to-br ${gradient} rounded-full opacity-5 group-hover:opacity-10 transition-opacity blur-2xl`} />
    </motion.div>
  );
};

const FEATURES: FeatureCardProps[] = [
  {
    title: "Virtual Staging",
    description: "Stage any empty room with designer furniture in seconds. Choose from modern, traditional, Scandinavian, and more — no photographer required.",
    icon: Sofa,
    gradient: "from-emerald-500 to-teal-600",
    size: "large",
    image: "/showcase/real-estate/after/virtual-staging.jpg",
  },
  {
    title: "Sky Replacement",
    description: "Swap overcast skies for perfect blue, golden hour, or dramatic sunset in one click.",
    icon: CloudSun,
    gradient: "from-blue-500 to-cyan-500",
    size: "small",
  },
  {
    title: "Photo Enhancement",
    description: "HDR merge, color correction, and lens fix — make every listing photo look professionally shot.",
    icon: ImagePlus,
    gradient: "from-emerald-500 to-teal-500",
    size: "small",
  },
  {
    title: "Item Removal & Declutter",
    description: "Remove personal items, clutter, power lines, or unwanted objects. AI fills in the background seamlessly so the space looks clean and inviting.",
    icon: Eraser,
    gradient: "from-pink-500 to-rose-500",
    size: "medium",
  },
  {
    title: "Twilight Conversion",
    description: "Transform daytime exteriors into stunning dusk shots with warm interior glow.",
    icon: SunMedium,
    gradient: "from-amber-500 to-orange-500",
    size: "small",
  },
  {
    title: "Lawn & Landscape",
    description: "Green up patchy lawns, add seasonal landscaping, and enhance curb appeal instantly.",
    icon: TreePine,
    gradient: "from-green-500 to-emerald-500",
    size: "small",
  },
  {
    title: "AI Renovation & Wall Colors",
    description: "Preview kitchen remodels, bathroom upgrades, or fresh wall paint colors — help buyers see the potential before any construction begins.",
    icon: PaintBucket,
    gradient: "from-teal-500 to-emerald-500",
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
      <div className="absolute inset-0 bg-gradient-to-b from-zinc-950 via-zinc-900 to-zinc-950" />

      {/* Grid pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:50px_50px]" />

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
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-zinc-400 text-xs font-bold uppercase tracking-widest mb-6"
          >
            <Layers size={14} />
            25+ AI Tools
          </motion.span>

          <h2 className="text-3xl md:text-5xl font-bold text-white tracking-tight mb-4">
            Every tool a listing{' '}
            <span className="bg-gradient-to-r from-teal-400 to-emerald-400 bg-clip-text text-transparent">
              needs
            </span>
          </h2>

          <p className="text-lg text-zinc-400 max-w-2xl mx-auto">
            Professional-grade real estate photo editing powered by AI. No design skills required.
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
            className="inline-flex items-center gap-3 px-8 py-4 rounded-full bg-gradient-to-r from-teal-500 to-emerald-500 text-white font-bold shadow-lg shadow-teal-500/30 hover:shadow-xl hover:shadow-teal-500/40 transition-shadow"
          >
            <Sparkles size={18} />
            Explore All Tools
            <ArrowRight size={18} />
          </motion.button>
        </motion.div>
      </div>
    </section>
  );
};
