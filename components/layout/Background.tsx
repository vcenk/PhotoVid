
import React from 'react';
import { motion } from 'framer-motion';

/**
 * Clean Stone Background
 * Features subtle, stone-washed washes to prevent flat visuals.
 */
export const Background: React.FC = () => {
  return (
    <div className="fixed inset-0 -z-0 overflow-hidden bg-stone-50 dark:bg-zinc-950 pointer-events-none">
      {/* Subtle Soft Washes (Muted Slate/Stone) */}

      {/* Top Left Wash */}
      <div className="absolute -left-[10%] -top-[5%] h-[70vh] w-[70vw] rounded-full bg-slate-100/40 dark:bg-emerald-900/20 blur-[140px] opacity-60" />

      {/* Center Right Wash */}
      <div className="absolute right-0 top-[25%] h-[60vh] w-[60vw] rounded-full bg-stone-200/30 dark:bg-teal-900/15 blur-[160px] opacity-50" />

      {/* Mid Left Wash */}
      <div className="absolute -left-[20%] top-[50%] h-[80vh] w-[80vw] rounded-full bg-slate-200/20 dark:bg-teal-900/10 blur-[180px] opacity-30" />

      {/* Bottom Right Wash */}
      <div className="absolute -right-[10%] bottom-[10%] h-[70vh] w-[70vw] rounded-full bg-stone-100/40 dark:bg-emerald-950/20 blur-[150px] opacity-50" />

      {/* Animated Floating Particles for Depth (Light Version) */}
      <div className="absolute inset-0 z-0">
        {[...Array(3)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0 }}
            animate={{ 
              opacity: [0.1, 0.4, 0.1],
              y: [0, -100, 0],
              x: [0, 50, 0]
            }}
            transition={{
              duration: 20 + i * 5,
              repeat: Infinity,
              ease: "linear",
              delay: i * 2
            }}
            className="absolute w-1.5 h-1.5 bg-stone-300 dark:bg-emerald-400/50 rounded-full blur-[1px]"
            style={{
              top: `${20 + i * 25}%`,
              left: `${15 + i * 30}%`
            }}
          />
        ))}
      </div>

      {/* Cinematic Noise Layer (Very subtle) */}
      <div className="absolute inset-0 opacity-[0.012] mix-blend-multiply dark:mix-blend-soft-light dark:opacity-[0.03]">
        <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
          <filter id="noiseFilter">
            <feTurbulence 
              type="fractalNoise" 
              baseFrequency="0.6" 
              numOctaves="3" 
              stitchTiles="stitch" 
            />
          </filter>
          <rect width="100%" height="100%" filter="url(#noiseFilter)" />
        </svg>
      </div>

      {/* Depth Gradients */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(71,85,105,0.02)_0%,transparent_50%)]" />
    </div>
  );
};
