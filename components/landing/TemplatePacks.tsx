"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowUpRight, Zap, Layers } from 'lucide-react';

const TEMPLATES = [
  {
    id: "luxury-listing",
    title: "Luxury Listing Pack",
    category: "Listing Photos",
    tools: "Staging + Enhancement + Sky",
    image: "https://images.unsplash.com/photo-1613490493576-7fde63acd811?q=80&w=1200&auto=format&fit=crop",
    description: "Complete photo set for high-end properties — virtual staging, sky swap, and HDR enhancement in one workflow."
  },
  {
    id: "vacant-to-staged",
    title: "Vacant to Staged",
    category: "Virtual Staging",
    tools: "Staging + Declutter + Enhancement",
    image: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?q=80&w=1200&auto=format&fit=crop",
    description: "Transform empty rooms into beautifully furnished spaces. Modern, traditional, or Scandinavian styles."
  },
  {
    id: "twilight-exterior",
    title: "Twilight Exterior",
    category: "Exterior",
    tools: "Twilight + Sky + Lawn",
    image: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?q=80&w=1200&auto=format&fit=crop",
    description: "Turn daytime exteriors into stunning dusk shots with warm glowing windows and dramatic skies."
  },
  {
    id: "social-media-kit",
    title: "Social Media Kit",
    category: "Social Media",
    tools: "Enhancement + Text Overlay",
    image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=1200&auto=format&fit=crop",
    description: "Instagram-ready listing posts with branded overlays, optimized for engagement and click-through."
  },
  {
    id: "rental-refresh",
    title: "Rental Refresh",
    category: "Listing Photos",
    tools: "Declutter + Enhancement + Staging",
    image: "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?q=80&w=1200&auto=format&fit=crop",
    description: "Make rental units look move-in ready — remove tenant items, enhance lighting, add fresh staging."
  },
  {
    id: "curb-appeal",
    title: "Curb Appeal Boost",
    category: "Exterior",
    tools: "Lawn + Sky + Enhancement",
    image: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=1200&auto=format&fit=crop",
    description: "Green lawns, blue skies, and vibrant landscaping — make any exterior photo pop for the listing."
  },
];

const CATEGORIES = ["All", "Listing Photos", "Virtual Staging", "Exterior", "Social Media"];

const Card = ({ item }: { item: typeof TEMPLATES[0] }) => {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true, margin: "-50px" }}
      className="group relative w-full aspect-video rounded-3xl overflow-hidden bg-zinc-900 border border-white/10 cursor-pointer shadow-2xl"
    >
      {/* Image */}
      <img
        src={item.image}
        alt={item.title}
        className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        loading="lazy"
      />

      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-80 pointer-events-none" />

      {/* Content */}
      <div className="absolute inset-0 p-6 flex flex-col justify-between">

        {/* Top Badges */}
        <div className="flex justify-between items-start">
          <span className="px-3 py-1 rounded-full bg-black/50 backdrop-blur-md border border-white/10 text-[10px] font-bold text-white uppercase tracking-widest shadow-lg">
            {item.category}
          </span>
          <span className="px-3 py-1 rounded-full bg-black/50 backdrop-blur-md border border-white/10 text-[10px] font-bold text-zinc-300 uppercase tracking-widest flex items-center gap-1.5 shadow-lg">
            <Layers size={10} /> Template
          </span>
        </div>

        {/* Bottom Text */}
        <div className="transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
          <div className="flex items-end justify-between">
            <div>
              <h3 className="text-xl md:text-2xl font-bold text-white leading-tight drop-shadow-xl">
                {item.title}
              </h3>
              {/* Reveal on Hover */}
              <div className="h-0 group-hover:h-12 overflow-hidden transition-all duration-300">
                <p className="pt-2 text-xs text-indigo-300 font-mono flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity delay-100">
                  <Zap size={12} /> {item.tools}
                </p>
              </div>
            </div>

            {/* Action Button */}
            <div className="w-10 h-10 rounded-full bg-white text-black flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 scale-50 group-hover:scale-100 shadow-lg hover:bg-indigo-400 hover:text-white">
              <ArrowUpRight size={18} />
            </div>
          </div>
        </div>

      </div>
    </motion.div>
  );
};

export const TemplatePacks = () => {
  const [filter, setFilter] = useState("All");

  const filtered = filter === "All"
    ? TEMPLATES
    : TEMPLATES.filter(t => t.category === filter);

  return (
    <section className="relative py-32 bg-black text-white overflow-hidden border-t border-white/10">
      <div className="max-w-7xl mx-auto px-6 relative z-10">

        {/* Header */}
        <div className="flex flex-col md:flex-row items-end justify-between gap-10 mb-16">
          <div className="max-w-xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="flex items-center gap-3 mb-6"
            >
              <div className="w-12 h-[1px] bg-indigo-500" />
              <span className="text-xs font-bold uppercase tracking-[0.3em] text-indigo-400">
                Template Library
              </span>
            </motion.div>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-5xl md:text-7xl font-bold tracking-tighter"
            >
              Ready-Made <span className="text-zinc-600">Workflows.</span>
            </motion.h2>
          </div>

          {/* Filter Bar */}
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => setFilter(cat)}
                className={`px-5 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider border transition-all ${
                  filter === cat
                    ? "bg-white text-black border-white"
                    : "bg-transparent text-zinc-500 border-zinc-800 hover:border-zinc-600 hover:text-white"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Grid */}
        <motion.div
          layout
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
        >
          <AnimatePresence mode="popLayout">
            {filtered.map((item) => (
              <Card key={item.id} item={item} />
            ))}
          </AnimatePresence>
        </motion.div>

        {/* Bottom CTA */}
        <div className="mt-16 flex justify-center">
          <button className="px-8 py-4 rounded-full border border-dashed border-zinc-700 text-zinc-400 text-xs font-bold uppercase tracking-widest hover:text-white hover:border-zinc-500 transition-all flex items-center gap-3">
            View All Templates <ArrowUpRight size={14} />
          </button>
        </div>

      </div>
    </section>
  );
};
