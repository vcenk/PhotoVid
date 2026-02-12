"use client";

import React, { useState, useEffect, useRef } from 'react';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import {
  Sparkles, Wand2, Sofa, Sun, Trash2, Paintbrush, TreeDeciduous, Home,
  Camera, CloudSun, Moon, Leaf, Waves, PaintBucket, Grid3X3, CloudRain, Sunrise,
  Cloud, Video, Armchair
} from 'lucide-react';

interface TransformExample {
  id: string;
  title: string;
  icon: React.ElementType;
  before: string;
  after: string;
  beforeLabel: string;
  afterLabel: string;
}

const TRANSFORM_EXAMPLES: TransformExample[] = [
  {
    id: 'virtual-staging',
    title: 'Virtual Staging',
    icon: Sofa,
    before: '/showcase/real-estate/before/virtual-staging.jpg',
    after: '/showcase/real-estate/after/virtual-staging.jpg',
    beforeLabel: 'Empty Room',
    afterLabel: 'AI Staged',
  },
  {
    id: 'custom-furniture-staging',
    title: 'Custom Staging',
    icon: Armchair,
    before: '/showcase/real-estate/before/virtual-staging.jpg',
    after: '/showcase/real-estate/after/virtual-staging.jpg',
    beforeLabel: 'Empty Room',
    afterLabel: 'Custom Staged',
  },
  {
    id: 'photo-enhancement',
    title: 'Photo Enhancement',
    icon: Camera,
    before: '/showcase/real-estate/before/photo-enhancement.jpg',
    after: '/showcase/real-estate/after/photo-enhancement.jpg',
    beforeLabel: 'Original',
    afterLabel: 'Enhanced',
  },
  {
    id: 'sky-replacement',
    title: 'Sky Replacement',
    icon: Cloud,
    before: '/showcase/real-estate/before/day-to-twilight.jpg',
    after: '/showcase/real-estate/after/sky-replacement.jpg',
    beforeLabel: 'Overcast',
    afterLabel: 'Blue Sky',
  },
  {
    id: 'day-to-twilight',
    title: 'Day to Twilight',
    icon: Sun,
    before: '/showcase/real-estate/before/day-to-twilight.jpg',
    after: '/showcase/real-estate/after/day-to-twilight.jpg',
    beforeLabel: 'Daytime',
    afterLabel: 'Twilight',
  },
  {
    id: 'item-removal',
    title: 'Item Removal',
    icon: Trash2,
    before: '/showcase/real-estate/before/item-removal.jpg',
    after: '/showcase/real-estate/after/item-removal.jpg',
    beforeLabel: 'Cluttered',
    afterLabel: 'Clean',
  },
  {
    id: 'virtual-renovation',
    title: 'Virtual Renovation',
    icon: Paintbrush,
    before: '/showcase/real-estate/before/virtual-renovation.jpg',
    after: '/showcase/real-estate/after/virtual-renovation.jpg',
    beforeLabel: 'Before',
    afterLabel: 'Renovated',
  },
  {
    id: 'auto-declutter',
    title: 'Auto Declutter',
    icon: Grid3X3,
    before: '/showcase/real-estate/before/auto-declutter.jpg',
    after: '/showcase/real-estate/after/auto-declutter.jpg',
    beforeLabel: 'Messy',
    afterLabel: 'Decluttered',
  },
  {
    id: 'wall-color',
    title: 'Wall Color Changer',
    icon: PaintBucket,
    before: '/showcase/real-estate/before/wall-color-changer.jpg',
    after: '/showcase/real-estate/after/wall-color-changer.jpg',
    beforeLabel: 'Original',
    afterLabel: 'New Color',
  },
  {
    id: 'floor-replacement',
    title: 'Floor Replacement',
    icon: Grid3X3,
    before: '/showcase/real-estate/before/floor-replacement.png',
    after: '/showcase/real-estate/after/floor-replacement.jpg',
    beforeLabel: 'Old Floors',
    afterLabel: 'New Floors',
  },
  {
    id: 'lawn-enhancement',
    title: 'Lawn Enhancement',
    icon: TreeDeciduous,
    before: '/showcase/real-estate/before/lawn-enhancement.jpg',
    after: '/showcase/real-estate/after/lawn-enhancement.jpg',
    beforeLabel: 'Original',
    afterLabel: 'Enhanced',
  },
  {
    id: 'exterior-paint',
    title: 'Exterior Paint',
    icon: Home,
    before: '/showcase/real-estate/before/exterior-paint-visualizer.jpg',
    after: '/showcase/real-estate/after/exterior-paint-visualizer.jpg',
    beforeLabel: 'Current',
    afterLabel: 'Visualized',
  },
  {
    id: 'landscape-design',
    title: 'Landscape Design',
    icon: TreeDeciduous,
    before: '/showcase/real-estate/before/landscape-design.jpg',
    after: '/showcase/real-estate/after/landscape-design.jpg',
    beforeLabel: 'Before',
    afterLabel: 'Designed',
  },
  {
    id: 'rain-to-shine',
    title: 'Rain to Shine',
    icon: CloudRain,
    before: '/showcase/real-estate/before/rain-to-shine.png',
    after: '/showcase/real-estate/after/rain-to-shine.jpg',
    beforeLabel: 'Rainy',
    afterLabel: 'Sunny',
  },
  {
    id: 'night-to-day',
    title: 'Night to Day',
    icon: Sunrise,
    before: '/showcase/real-estate/before/night-to-day.jpg',
    after: '/showcase/real-estate/after/night-to-day.jpg',
    beforeLabel: 'Night',
    afterLabel: 'Daytime',
  },
  {
    id: 'changing-seasons',
    title: 'Changing Seasons',
    icon: Leaf,
    before: '/showcase/real-estate/before/changing-seasons.jpg',
    after: '/showcase/real-estate/after/changing-seasons.jpg',
    beforeLabel: 'Winter',
    afterLabel: 'Summer',
  },
  {
    id: 'pool-enhancement',
    title: 'Pool Enhancement',
    icon: Waves,
    before: '/showcase/real-estate/before/pool-enhancement.jpg',
    after: '/showcase/real-estate/after/pool-enhancement.jpg',
    beforeLabel: 'Before',
    afterLabel: 'Enhanced',
  },
  {
    id: 'quick-video',
    title: 'Quick Video',
    icon: Video,
    before: '/showcase/real-estate/before/virtual-staging.jpg',
    after: '/showcase/real-estate/after/virtual-staging.jpg',
    beforeLabel: 'Photo',
    afterLabel: 'Video',
  },
  {
    id: 'room-tour',
    title: 'Room Tour Video',
    icon: Video,
    before: '/showcase/real-estate/before/photo-enhancement.jpg',
    after: '/showcase/real-estate/after/photo-enhancement.jpg',
    beforeLabel: 'Photo',
    afterLabel: 'Tour Video',
  },
  {
    id: 'social-media-poster',
    title: 'Social Media Poster',
    icon: Camera,
    before: '/showcase/real-estate/before/social-media-poster.jpg',
    after: '/showcase/real-estate/after/social-media-poster.jpg',
    beforeLabel: 'Photo',
    afterLabel: 'Poster',
  },
];

// Magic sparkle particles component - ENHANCED for visibility
const MagicParticles: React.FC<{ isActive: boolean }> = ({ isActive }) => {
  const particles = Array.from({ length: 60 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 16 + 8,
    delay: Math.random() * 0.8,
    duration: Math.random() * 1.2 + 0.8,
  }));

  return (
    <AnimatePresence>
      {isActive && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 pointer-events-none z-20 overflow-hidden"
        >
          {/* Bright flash effect */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 1, 0] }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="absolute inset-0 bg-white/40"
          />

          {/* Multiple glow layers */}
          <motion.div
            initial={{ opacity: 0, scale: 0.3 }}
            animate={{
              opacity: [0, 1, 1, 0],
              scale: [0.3, 1, 1.5, 2],
            }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            className="absolute inset-0 flex items-center justify-center"
          >
            <div className="w-[400px] h-[400px] rounded-full bg-gradient-to-r from-emerald-400/60 via-teal-400/60 to-cyan-400/60 blur-[100px]" />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{
              opacity: [0, 0.8, 0.6, 0],
              scale: [0.5, 1.2, 1.8, 2.5],
            }}
            transition={{ duration: 1.2, ease: "easeOut", delay: 0.1 }}
            className="absolute inset-0 flex items-center justify-center"
          >
            <div className="w-[300px] h-[300px] rounded-full bg-gradient-to-r from-yellow-400/50 via-emerald-400/50 to-teal-400/50 blur-[80px]" />
          </motion.div>

          {/* Sparkle particles */}
          {particles.map((particle) => (
            <motion.div
              key={particle.id}
              initial={{
                opacity: 0,
                scale: 0,
                x: `${particle.x}%`,
                y: `${particle.y}%`,
              }}
              animate={{
                opacity: [0, 1, 1, 0],
                scale: [0, 2, 1.5, 0],
                y: [`${particle.y}%`, `${particle.y - 30}%`],
                rotate: [0, 180],
              }}
              transition={{
                duration: particle.duration,
                delay: particle.delay,
                ease: "easeOut",
              }}
              className="absolute drop-shadow-[0_0_10px_rgba(52,211,153,0.8)]"
              style={{
                width: particle.size,
                height: particle.size,
              }}
            >
              <Sparkles
                className="text-emerald-300"
                style={{ width: '100%', height: '100%' }}
              />
            </motion.div>
          ))}

          {/* Radial burst lines */}
          {Array.from({ length: 12 }).map((_, i) => (
            <motion.div
              key={`line-${i}`}
              initial={{ opacity: 0, scale: 0 }}
              animate={{
                opacity: [0, 0.8, 0],
                scale: [0, 1],
              }}
              transition={{
                duration: 0.6,
                delay: 0.1 + i * 0.02,
                ease: "easeOut",
              }}
              className="absolute left-1/2 top-1/2 h-1 w-32 bg-gradient-to-r from-emerald-400 to-transparent origin-left"
              style={{
                transform: `rotate(${i * 30}deg)`,
              }}
            />
          ))}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// Shimmer sweep effect - ENHANCED for visibility
const ShimmerSweep: React.FC<{ isActive: boolean }> = ({ isActive }) => {
  return (
    <AnimatePresence>
      {isActive && (
        <>
          {/* Main bright sweep */}
          <motion.div
            initial={{ x: '-100%', opacity: 0 }}
            animate={{ x: '200%', opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1, ease: "easeInOut" }}
            className="absolute inset-0 z-20 pointer-events-none"
          >
            <div className="h-full w-1/2 bg-gradient-to-r from-transparent via-white/60 to-transparent skew-x-12" />
          </motion.div>
          {/* Secondary colored sweep */}
          <motion.div
            initial={{ x: '-100%', opacity: 0 }}
            animate={{ x: '200%', opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1, ease: "easeInOut", delay: 0.1 }}
            className="absolute inset-0 z-20 pointer-events-none"
          >
            <div className="h-full w-1/3 bg-gradient-to-r from-transparent via-emerald-400/40 to-transparent skew-x-12" />
          </motion.div>
          {/* Border glow effect */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 1, 1, 0] }}
            transition={{ duration: 1.2 }}
            className="absolute inset-0 z-10 pointer-events-none rounded-2xl"
            style={{
              boxShadow: 'inset 0 0 60px rgba(52, 211, 153, 0.5), 0 0 80px rgba(52, 211, 153, 0.4)',
            }}
          />
        </>
      )}
    </AnimatePresence>
  );
};

interface TransformCardProps {
  example: TransformExample;
  isActive: boolean;
  onClick: () => void;
}

const TransformCard: React.FC<TransformCardProps> = ({ example, isActive, onClick }) => {
  const [showAfter, setShowAfter] = useState(false);
  const [isTransforming, setIsTransforming] = useState(false);

  // Auto-animate when card becomes active - ENHANCED timing for visibility
  useEffect(() => {
    if (isActive) {
      setShowAfter(false);
      const timer = setTimeout(() => {
        setIsTransforming(true);
        setTimeout(() => {
          setShowAfter(true);
          setIsTransforming(false);
        }, 1500); // Longer transformation for better visibility
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [isActive, example.id]);

  const Icon = example.icon;

  return (
    <motion.div
      onClick={onClick}
      className="relative rounded-2xl overflow-hidden aspect-[16/10] border border-white/10"
    >
      {/* Before Image */}
      <motion.div
        className="absolute inset-0"
        animate={{
          opacity: showAfter ? 0 : 1,
          scale: isTransforming ? 1.02 : 1,
        }}
        transition={{ duration: 0.8 }}
      >
        <img
          src={example.before}
          alt={`${example.title} Before`}
          className="w-full h-full object-cover"
        />
      </motion.div>

      {/* After Image */}
      <motion.div
        className="absolute inset-0"
        initial={{ opacity: 0, scale: 1.05 }}
        animate={{
          opacity: showAfter ? 1 : 0,
          scale: showAfter ? 1 : 1.05,
        }}
        transition={{ duration: 0.8 }}
      >
        <img
          src={example.after}
          alt={`${example.title} After`}
          className="w-full h-full object-cover"
        />
      </motion.div>

      {/* Magic Animation Effects */}
      <MagicParticles isActive={isTransforming} />
      <ShimmerSweep isActive={isTransforming} />

      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

      {/* Labels */}
      <div className="absolute bottom-0 left-0 right-0 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl backdrop-blur-sm bg-emerald-500/20">
              <Icon size={24} className="text-emerald-400" />
            </div>
            <div>
              <p className="font-bold text-white text-xl">
                {example.title}
              </p>
              <motion.p
                key={showAfter ? 'after' : 'before'}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-sm text-zinc-300"
              >
                {showAfter ? example.afterLabel : example.beforeLabel}
              </motion.p>
            </div>
          </div>

          {/* Transform indicator - ENHANCED for visibility */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{
              opacity: 1,
              scale: isTransforming ? [1, 1.1, 1] : 1,
            }}
            transition={isTransforming ? { duration: 0.5, repeat: Infinity } : {}}
            className={`
              px-5 py-2.5 rounded-full text-sm font-bold flex items-center gap-2 transition-all duration-300
              ${isTransforming
                ? 'bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 text-white shadow-lg shadow-emerald-500/50 animate-pulse'
                : showAfter
                  ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30'
                  : 'bg-white/10 text-white backdrop-blur-sm'
              }
            `}
          >
            {isTransforming ? (
              <>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                >
                  <Wand2 size={18} />
                </motion.div>
                <span className="text-base">AI Transforming...</span>
              </>
            ) : showAfter ? (
              <>
                <Sparkles size={18} />
                <span className="text-base">AI Enhanced</span>
              </>
            ) : (
              <span className="text-base">Original</span>
            )}
          </motion.div>
        </div>
      </div>

      {/* Play Again Button - ENHANCED for visibility */}
      {showAfter && (
        <motion.button
          initial={{ opacity: 0, y: 10, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
          onClick={(e) => {
            e.stopPropagation();
            setShowAfter(false);
            setTimeout(() => {
              setIsTransforming(true);
              setTimeout(() => {
                setShowAfter(true);
                setIsTransforming(false);
              }, 1500); // Longer for better recording visibility
            }, 500);
          }}
          className="absolute top-4 right-4 px-5 py-2.5 rounded-full bg-emerald-500/90 backdrop-blur-sm text-white text-sm font-bold hover:bg-emerald-400 transition-all flex items-center gap-2 border border-emerald-400/50 shadow-lg shadow-emerald-500/30"
        >
          <Wand2 size={16} className="animate-pulse" />
          Replay Magic
        </motion.button>
      )}
    </motion.div>
  );
};

export const TransformShowcase: React.FC = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" });

  // Auto-cycle through examples - EXTENDED for recording
  useEffect(() => {
    if (!isInView) return;

    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % TRANSFORM_EXAMPLES.length);
    }, 8000); // Longer interval for better recording

    return () => clearInterval(interval);
  }, [isInView]);

  return (
    <section
      ref={sectionRef}
      id="showcase"
      className="relative py-24 md:py-32 overflow-hidden bg-zinc-950"
    >
      {/* Background Effects */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-emerald-500/5 rounded-full blur-[150px]" />
        <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-teal-500/5 rounded-full blur-[150px]" />
      </div>

      {/* Grid Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:60px_60px]" />

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
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold uppercase tracking-widest mb-6"
          >
            <Wand2 size={14} />
            AI Magic
          </motion.span>

          <h2 className="text-4xl md:text-6xl font-bold text-white tracking-tighter mb-4" style={{ fontFamily: "'Roboto', sans-serif" }}>
            Transform any{' '}
            <span className="text-zinc-400">property.</span>
          </h2>

          <p className="text-lg text-zinc-400 max-w-2xl mx-auto">
            Watch AI work its magic — empty rooms become dream homes, dull photos turn stunning, all in seconds.
          </p>
        </motion.div>

        {/* Main Active Card */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.2 }}
          className="max-w-4xl mx-auto mb-8"
        >
          <TransformCard
            example={TRANSFORM_EXAMPLES[activeIndex]}
            isActive={true}
            onClick={() => {}}
          />
        </motion.div>

        {/* Thumbnail Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.3 }}
          className="grid grid-cols-5 md:grid-cols-10 gap-2 max-w-6xl mx-auto"
        >
          {TRANSFORM_EXAMPLES.map((example, index) => {
            const Icon = example.icon;
            const isActive = index === activeIndex;

            return (
              <motion.button
                key={example.id}
                onClick={() => setActiveIndex(index)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`
                  relative aspect-square rounded-xl overflow-hidden transition-all duration-300
                  ${isActive
                    ? 'ring-2 ring-emerald-500 ring-offset-2 ring-offset-zinc-950'
                    : 'opacity-60 hover:opacity-100'
                  }
                `}
              >
                <img
                  src={example.after}
                  alt={example.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                <div className="absolute bottom-1 left-1 right-1">
                  <div className={`
                    flex items-center justify-center gap-1 p-1 rounded-md text-[10px] font-medium
                    ${isActive ? 'bg-emerald-500 text-white' : 'bg-black/50 text-white/80'}
                  `}>
                    <Icon size={10} />
                    <span className="truncate hidden sm:inline">{example.title.split(' ')[0]}</span>
                  </div>
                </div>
              </motion.button>
            );
          })}
        </motion.div>


        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.5 }}
          className="text-center mt-12"
        >
          <a
            href="/auth"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-semibold hover:shadow-lg hover:shadow-emerald-500/25 transition-all"
          >
            <Sparkles size={18} />
            Start Free
          </a>
        </motion.div>
      </div>
    </section>
  );
};
