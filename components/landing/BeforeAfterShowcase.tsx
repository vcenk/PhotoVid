"use client";

import React, { useState, useRef, useCallback } from 'react';
import { motion, useInView } from 'framer-motion';
import { ArrowLeftRight, Home, ShoppingBag, Camera, Sparkles } from 'lucide-react';

interface ComparisonExample {
  id: string;
  category: string;
  icon: React.ElementType;
  before: string;
  after: string;
  beforeLabel: string;
  afterLabel: string;
}

// Base URL for showcase images - use R2 for production, local for dev
const SHOWCASE_BASE_URL = import.meta.env.PROD
  ? 'https://pub-de07eb6b4fff417798674246b03f5ee4.r2.dev/showcase'
  : '/showcase';

const EXAMPLES: ComparisonExample[] = [
  {
    id: 'virtual-staging',
    category: 'Virtual Staging',
    icon: Home,
    before: `${SHOWCASE_BASE_URL}/real-estate/before/empty-living-room.jpg`,
    after: `${SHOWCASE_BASE_URL}/real-estate/after/staged-living-room.jpg`,
    beforeLabel: 'Empty Room',
    afterLabel: 'AI Staged',
  },
  {
    id: 'twilight',
    category: 'Twilight',
    icon: Home,
    before: `${SHOWCASE_BASE_URL}/real-estate/before/house-day.jpg`,
    after: `${SHOWCASE_BASE_URL}/real-estate/after/house-twilight.jpg`,
    beforeLabel: 'Daytime',
    afterLabel: 'Twilight',
  },
  {
    id: 'sky-replacement',
    category: 'Sky Replace',
    icon: Camera,
    before: `${SHOWCASE_BASE_URL}/real-estate/before/house-cloudy.jpg`,
    after: `${SHOWCASE_BASE_URL}/real-estate/after/house-blue-sky.jpg`,
    beforeLabel: 'Cloudy Sky',
    afterLabel: 'Blue Sky',
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
      className="relative w-full aspect-[16/10] rounded-3xl overflow-hidden cursor-ew-resize select-none"
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
        <div className="absolute bottom-4 right-4 px-3 py-1.5 bg-emerald-500/90 backdrop-blur-sm rounded-full text-xs font-bold text-white flex items-center gap-2">
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
        <div className="absolute bottom-4 left-4 px-3 py-1.5 bg-zinc-800/90 backdrop-blur-sm rounded-full text-xs font-bold text-white">
          {beforeLabel}
        </div>
      </div>

      {/* Slider Handle */}
      <div
        className="absolute top-0 bottom-0 w-1 bg-white shadow-lg cursor-ew-resize z-10"
        style={{ left: `${sliderPosition}%`, transform: 'translateX(-50%)' }}
        onMouseDown={handleMouseDown}
        onTouchStart={handleMouseDown}
      >
        {/* Handle Button */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white shadow-xl flex items-center justify-center">
          <ArrowLeftRight size={20} className="text-zinc-800" />
        </div>

        {/* Glow effect */}
        <div className="absolute inset-y-0 -inset-x-4 bg-white/20 blur-md pointer-events-none" />
      </div>

      {/* Border overlay */}
      <div className="absolute inset-0 rounded-3xl border border-white/10 pointer-events-none" />
    </div>
  );
};

export const BeforeAfterShowcase: React.FC = () => {
  const [activeExample, setActiveExample] = useState(EXAMPLES[0]);
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" });

  return (
    <section
      ref={sectionRef}
      className="relative py-24 md:py-32 overflow-hidden"
    >
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-zinc-50 via-white to-zinc-50 dark:from-black dark:via-zinc-950 dark:to-black" />

      {/* Ambient glow */}
      <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-[500px] h-[500px] bg-indigo-500/5 dark:bg-indigo-500/10 rounded-full blur-[100px]" />
      <div className="absolute top-1/2 right-1/4 -translate-y-1/2 w-[500px] h-[500px] bg-violet-500/5 dark:bg-violet-500/10 rounded-full blur-[100px]" />

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
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-indigo-500/10 to-violet-500/10 text-indigo-600 dark:text-indigo-400 text-xs font-bold uppercase tracking-widest mb-6 border border-indigo-500/20"
          >
            <Sparkles size={14} />
            AI Transformation
          </motion.span>

          <h2 className="text-3xl md:text-5xl font-bold text-zinc-900 dark:text-white tracking-tight mb-4">
            See the{' '}
            <span className="bg-gradient-to-r from-indigo-500 to-violet-500 bg-clip-text text-transparent">
              magic
            </span>{' '}
            in action
          </h2>

          <p className="text-lg text-zinc-500 dark:text-zinc-400 max-w-2xl mx-auto">
            Drag the slider to reveal how Photovid transforms ordinary content into stunning visuals
          </p>
        </motion.div>

        {/* Category Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.2 }}
          className="flex justify-center gap-2 mb-12"
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
                className={`flex items-center gap-2 px-6 py-3 rounded-full text-sm font-bold transition-all ${
                  isActive
                    ? 'bg-gradient-to-r from-indigo-500 to-violet-500 text-white shadow-lg shadow-indigo-500/30'
                    : 'bg-zinc-100 dark:bg-white/5 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-white/10'
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
          <motion.div
            key={activeExample.id}
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
          >
            <ComparisonSlider
              before={activeExample.before}
              after={activeExample.after}
              beforeLabel={activeExample.beforeLabel}
              afterLabel={activeExample.afterLabel}
            />
          </motion.div>

          {/* Instruction */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : {}}
            transition={{ delay: 0.5 }}
            className="text-center text-sm text-zinc-400 mt-6 flex items-center justify-center gap-2"
          >
            <ArrowLeftRight size={14} />
            Drag the slider to compare
          </motion.p>
        </motion.div>

        {/* Feature highlights */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.6 }}
          className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto"
        >
          {[
            { label: 'Processing Time', value: '< 30 seconds', sublabel: 'Average generation' },
            { label: 'Quality', value: '4K Ready', sublabel: 'Cinema-grade output' },
            { label: 'Accuracy', value: '99.2%', sublabel: 'Style preservation' },
          ].map((stat, idx) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 10 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.7 + idx * 0.1 }}
              className="text-center p-6 rounded-2xl bg-zinc-100/50 dark:bg-white/5 border border-zinc-200 dark:border-white/5"
            >
              <div className="text-2xl font-bold text-zinc-900 dark:text-white mb-1">
                {stat.value}
              </div>
              <div className="text-xs uppercase tracking-widest text-zinc-500">
                {stat.label}
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};
