"use client";

import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import {
  Home,
  Camera,
  Paintbrush,
  Sun,
  Sofa,
  TreePine,
  Eraser,
  Layers,
  Video,
  Image,
  Wand2,
  Palette,
} from 'lucide-react';

const TOOLS = [
  { name: "Virtual Staging", icon: Sofa },
  { name: "Sky Replacement", icon: Sun },
  { name: "Photo Enhancement", icon: Camera },
  { name: "Item Removal", icon: Eraser },
  { name: "Twilight Conversion", icon: Palette },
  { name: "Lawn Enhancement", icon: TreePine },
  { name: "Wall Color Change", icon: Paintbrush },
  { name: "HDR Merge", icon: Layers },
  { name: "Video Tours", icon: Video },
  { name: "Floor Plans", icon: Home },
  { name: "AI Image Gen", icon: Image },
  { name: "Renovation Preview", icon: Wand2 },
];

export const LogoMarquee: React.FC = () => {
  const shouldReduceMotion = useReducedMotion();
  const duplicated = [...TOOLS, ...TOOLS, ...TOOLS, ...TOOLS];

  return (
    <section className="relative py-10 md:py-14 overflow-hidden bg-zinc-950 border-t border-white/5">
      {/* Heading */}
      <div className="container mx-auto px-6 mb-8">
        <p className="text-center text-[11px] md:text-xs font-medium uppercase tracking-[0.25em] text-white/30">
          25+ AI tools built for real estate professionals
        </p>
      </div>

      {/* Scrolling Strip */}
      <div className="relative flex items-center">
        {/* Edge Fades */}
        <div className="absolute left-0 top-0 bottom-0 w-32 md:w-48 z-20 bg-gradient-to-r from-zinc-950 to-transparent pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-32 md:w-48 z-20 bg-gradient-to-l from-zinc-950 to-transparent pointer-events-none" />

        <motion.div
          className="flex whitespace-nowrap gap-10 md:gap-14 items-center"
          animate={shouldReduceMotion ? {} : { x: ["-50%", "0%"] }}
          transition={{
            duration: 60,
            repeat: Infinity,
            ease: "linear",
          }}
        >
          {duplicated.map((tool, idx) => {
            const Icon = tool.icon;
            return (
              <div
                key={`${tool.name}-${idx}`}
                className="flex items-center gap-2.5 opacity-40 hover:opacity-100 transition-opacity duration-300 group cursor-default"
              >
                <div className="p-1.5 rounded-lg bg-white/5 text-white/40 group-hover:text-white group-hover:bg-white/10 transition-all duration-300">
                  <Icon size={16} strokeWidth={1.5} />
                </div>
                <span className="text-sm md:text-base font-medium text-white/50 group-hover:text-white transition-colors duration-300">
                  {tool.name}
                </span>
              </div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
};
