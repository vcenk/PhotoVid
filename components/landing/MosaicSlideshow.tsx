"use client";

import React from 'react';
import { motion } from 'framer-motion';

interface ShowcaseItem {
  image: string;
  label: string;
}

// Two rows of real estate results — each labeled with the AI tool
const ROW_1: ShowcaseItem[] = [
  { image: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?q=80&w=800&auto=format&fit=crop", label: "Virtual Staging" },
  { image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=800&auto=format&fit=crop", label: "Photo Enhancement" },
  { image: "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?q=80&w=800&auto=format&fit=crop", label: "Virtual Staging" },
  { image: "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?q=80&w=800&auto=format&fit=crop", label: "Sky Replacement" },
  { image: "https://images.unsplash.com/photo-1613490493576-7fde63acd811?q=80&w=800&auto=format&fit=crop", label: "Twilight Conversion" },
  { image: "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?q=80&w=800&auto=format&fit=crop", label: "Photo Enhancement" },
  { image: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?q=80&w=800&auto=format&fit=crop", label: "Item Removal" },
  { image: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?q=80&w=800&auto=format&fit=crop", label: "Lawn Enhancement" },
];

const ROW_2: ShowcaseItem[] = [
  { image: "https://images.unsplash.com/photo-1600585154526-990dced4db0d?q=80&w=800&auto=format&fit=crop", label: "Wall Color Change" },
  { image: "https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?q=80&w=800&auto=format&fit=crop", label: "Virtual Renovation" },
  { image: "https://images.unsplash.com/photo-1560185893-a55cbc8c57e8?q=80&w=800&auto=format&fit=crop", label: "Virtual Staging" },
  { image: "https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?q=80&w=800&auto=format&fit=crop", label: "Sky Replacement" },
  { image: "https://images.unsplash.com/photo-1600573472550-8090b5e0745e?q=80&w=800&auto=format&fit=crop", label: "Photo Enhancement" },
  { image: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=800&auto=format&fit=crop", label: "Twilight Conversion" },
  { image: "https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?q=80&w=800&auto=format&fit=crop", label: "Declutter" },
  { image: "https://images.unsplash.com/photo-1600563438938-a9a27215b4b4?q=80&w=800&auto=format&fit=crop", label: "Lawn Enhancement" },
];

const ScrollRow = ({ items, direction, duration }: { items: ShowcaseItem[]; direction: 'left' | 'right'; duration: number }) => {
  // Duplicate items for seamless loop
  const doubled = [...items, ...items];

  return (
    <div className="relative overflow-hidden">
      {/* Fade edges */}
      <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-black to-transparent z-10 pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-black to-transparent z-10 pointer-events-none" />

      <motion.div
        className="flex gap-4"
        animate={{
          x: direction === 'left' ? ['0%', '-50%'] : ['-50%', '0%'],
        }}
        transition={{
          x: {
            repeat: Infinity,
            repeatType: 'loop',
            duration,
            ease: 'linear',
          },
        }}
      >
        {doubled.map((item, i) => (
          <div
            key={`${item.label}-${i}`}
            className="relative flex-shrink-0 w-[280px] md:w-[360px] aspect-[4/3] rounded-2xl overflow-hidden group"
          >
            <img
              src={item.image}
              alt={item.label}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              loading="lazy"
            />
            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            {/* Tool label */}
            <div className="absolute bottom-3 left-3 px-3 py-1.5 rounded-lg bg-black/60 backdrop-blur-md border border-white/10 text-white text-[10px] font-bold uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              {item.label}
            </div>
          </div>
        ))}
      </motion.div>
    </div>
  );
};

export const MosaicSlideshow = () => {
  return (
    <section className="relative w-full overflow-hidden bg-black py-16">
      {/* Header */}
      <div className="text-center mb-12 px-6">
        <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-zinc-400 text-xs font-bold uppercase tracking-widest mb-6">
          AI-Enhanced Results
        </span>
        <h2 className="text-3xl md:text-5xl font-bold text-white tracking-tight mb-4">
          See what's{' '}
          <span className="bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">
            possible
          </span>
        </h2>
        <p className="text-zinc-400 max-w-2xl mx-auto">
          Every image below was transformed using our AI tools. Hover to see which tool was used.
        </p>
      </div>

      {/* Scrolling rows */}
      <div className="space-y-4">
        <ScrollRow items={ROW_1} direction="left" duration={40} />
        <ScrollRow items={ROW_2} direction="right" duration={45} />
      </div>
    </section>
  );
};
