"use client";

import React, { useState, useRef, useCallback } from 'react';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import { ArrowLeftRight, Sofa, Camera, Sparkles } from 'lucide-react';

interface ComparisonExample {
  id: string;
  category: string;
  icon: React.ElementType;
  before: string;
  after: string;
  beforeLabel: string;
  afterLabel: string;
}

const EXAMPLES: ComparisonExample[] = [
  {
    id: 'virtual-staging',
    category: 'Virtual Staging',
    icon: Sofa,
    before: '/showcase/real-estate/before/virtual-staging.jpg',
    after: '/showcase/real-estate/after/virtual-staging.jpg',
    beforeLabel: 'Empty Room',
    afterLabel: 'AI Staged',
  },
  {
    id: 'photo-enhancement',
    category: 'Photo Enhancement',
    icon: Camera,
    before: '/showcase/real-estate/before/photo-enhancement.jpg',
    after: '/showcase/real-estate/after/photo-enhancement.jpg',
    beforeLabel: 'Original',
    afterLabel: 'Enhanced',
  },
];

interface SliderProps {
  before: string;
  after: string;
  beforeLabel: string;
  afterLabel: string;
}

const ComparisonSlider: React.FC<SliderProps> = ({ before, after, beforeLabel, afterLabel }) => {
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMove = useCallback((clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setSliderPosition(percentage);
  }, []);

  const handleMouseDown = () => setIsDragging(true);
  const handleMouseUp = () => setIsDragging(false);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      handleMove(e.clientX);
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    handleMove(e.touches[0].clientX);
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full aspect-[16/10] rounded-2xl overflow-hidden cursor-ew-resize select-none border border-white/10"
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleMouseUp}
    >
      {/* After Image (Background) */}
      <div className="absolute inset-0">
        <img
          src={after}
          alt="After"
          className="w-full h-full object-cover"
          draggable={false}
        />
        {/* After Label */}
        <div className="absolute bottom-4 right-4 px-3.5 py-1.5 bg-white dark:bg-zinc-100 rounded-full text-xs font-bold text-black flex items-center gap-2 shadow-lg">
          <Sparkles size={12} />
          {afterLabel}
        </div>
      </div>

      {/* Before Image (Clipped) */}
      <div
        className="absolute inset-0 overflow-hidden"
        style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}
      >
        <img
          src={before}
          alt="Before"
          className="w-full h-full object-cover"
          draggable={false}
        />
        {/* Before Label */}
        <div className="absolute bottom-4 left-4 px-3.5 py-1.5 bg-zinc-900/90 backdrop-blur-sm rounded-full text-xs font-bold text-white">
          {beforeLabel}
        </div>
      </div>

      {/* Slider Handle */}
      <div
        className="absolute top-0 bottom-0 w-0.5 bg-white/80 z-10"
        style={{ left: `${sliderPosition}%`, transform: 'translateX(-50%)' }}
        onMouseDown={handleMouseDown}
        onTouchStart={handleMouseDown}
      >
        {/* Handle Button */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white shadow-2xl ring-2 ring-white/20 flex items-center justify-center">
          <ArrowLeftRight size={18} className="text-zinc-800" />
        </div>

        {/* Glow effect */}
        <div className="absolute inset-y-0 -inset-x-3 bg-white/10 blur-md pointer-events-none" />
      </div>
    </div>
  );
};

const FEATURES = [
  {
    icon: Sofa,
    title: 'Virtual Staging',
    description: 'Fill empty rooms with designer furniture in seconds',
  },
  {
    icon: Camera,
    title: 'Photo Enhancement',
    description: 'HDR-quality photos from any smartphone shot',
  },
  {
    icon: Sparkles,
    title: 'AI Precision',
    description: '99% style accuracy with cinema-grade output',
  },
];

export const BeforeAfterShowcase: React.FC = () => {
  const [activeExample, setActiveExample] = useState(EXAMPLES[0]);
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" });

  return (
    <section
      ref={sectionRef}
      id="showcase"
      className="relative py-24 md:py-32 overflow-hidden bg-black"
    >
      {/* Ambient glow */}
      <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-[500px] h-[500px] bg-teal-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-1/2 right-1/4 -translate-y-1/2 w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          className="text-center mb-12"
        >
          <motion.span
            initial={{ opacity: 0, scale: 0.9 }}
            animate={isInView ? { opacity: 1, scale: 1 } : {}}
            transition={{ delay: 0.1 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-zinc-400 text-xs font-bold uppercase tracking-widest mb-6"
          >
            See It To Believe It
          </motion.span>

          <h2 className="text-3xl md:text-5xl font-bold text-white tracking-tight mb-4">
            Transform Any{' '}
            <span className="bg-gradient-to-r from-teal-400 to-emerald-400 bg-clip-text text-transparent">
              Property
            </span>
          </h2>

          <p className="text-lg text-zinc-400 max-w-2xl mx-auto">
            Watch AI turn empty rooms into dream homes and enhance photos to magazine quality — all in seconds.
          </p>
        </motion.div>

        {/* Category Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.2 }}
          className="flex justify-center gap-3 mb-12"
        >
          {EXAMPLES.map((example) => {
            const Icon = example.icon;
            const isActive = activeExample.id === example.id;

            return (
              <motion.button
                key={example.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setActiveExample(example)}
                className={`flex items-center gap-2 px-6 py-3 rounded-full text-sm font-semibold transition-all duration-300 ${
                  isActive
                    ? 'bg-white dark:bg-zinc-100 text-black shadow-lg'
                    : 'bg-white/5 text-zinc-400 border border-white/10 hover:bg-white/10 hover:text-white'
                }`}
              >
                <Icon size={16} />
                {example.category}
              </motion.button>
            );
          })}
        </motion.div>

        {/* Comparison Slider */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.3 }}
          className="max-w-4xl mx-auto"
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={activeExample.id}
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.3 }}
            >
              <ComparisonSlider
                before={activeExample.before}
                after={activeExample.after}
                beforeLabel={activeExample.beforeLabel}
                afterLabel={activeExample.afterLabel}
              />
            </motion.div>
          </AnimatePresence>

          {/* Instruction */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : {}}
            transition={{ delay: 0.5 }}
            className="text-center text-sm text-zinc-500 mt-6 flex items-center justify-center gap-2"
          >
            <ArrowLeftRight size={14} />
            Drag the slider to compare
          </motion.p>
        </motion.div>

        {/* Feature Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.6 }}
          className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto"
        >
          {FEATURES.map((feature, idx) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 10 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: 0.7 + idx * 0.1 }}
                className="text-center p-6 rounded-2xl bg-white/5 border border-white/10"
              >
                <div className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-white/5 mb-4">
                  <Icon size={20} className="text-white/60" />
                </div>
                <div className="text-base font-semibold text-white mb-1">
                  {feature.title}
                </div>
                <div className="text-sm text-zinc-500">
                  {feature.description}
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
};
