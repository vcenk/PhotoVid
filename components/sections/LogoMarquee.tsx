"use client";

import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Sparkles } from 'lucide-react';

const NICHES = [
  "Real Estate Agents", 
  "Fashion Brands", 
  "Food Photographers", 
  "Travel Vloggers", 
  "Ad Agencies", 
  "Product Designers",
  "Amazon Sellers",
  "Etsy Sellers",
  "TikTok Creators",
  "Social Media Influencers",
  "UGC Creators",
  "Shopify Store Owners"
];

export const LogoMarquee: React.FC = () => {
  const shouldReduceMotion = useReducedMotion();
  // Duplicate list to create seamless loop
  const duplicatedNiches = [...NICHES, ...NICHES, ...NICHES, ...NICHES];

  return (
    <section className="relative py-12 md:py-16 overflow-hidden bg-zinc-50 border-t border-zinc-200">
      <div className="container mx-auto px-6 mb-10">
        <h3 className="text-center text-[10px] md:text-xs font-bold uppercase tracking-[0.3em] text-zinc-400">
          BUILT FOR MODERN CREATORS
        </h3>
      </div>

      <div className="relative flex items-center">
        {/* Edge Fade Masks */}
        <div className="absolute left-0 top-0 bottom-0 w-32 md:w-64 z-20 bg-gradient-to-r from-zinc-50 to-transparent pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-32 md:w-64 z-20 bg-gradient-to-l from-zinc-50 to-transparent pointer-events-none" />

        <motion.div
          className="flex whitespace-nowrap gap-16 md:gap-24 items-center"
          animate={shouldReduceMotion ? {} : { x: ["-50%", "0%"] }}
          transition={{
            duration: 50,
            repeat: Infinity,
            ease: "linear",
          }}
        >
          {duplicatedNiches.map((niche, idx) => (
            <div
              key={`${niche}-${idx}`}
              className="flex items-center gap-3 opacity-40 hover:opacity-100 transition-opacity duration-300 group cursor-default"
            >
              <div className="p-1.5 rounded-full bg-zinc-200/50 text-zinc-400 group-hover:text-indigo-500 group-hover:bg-indigo-50 transition-colors">
                 {/* Generic icon for all items */}
                 <Sparkles size={14} />
              </div>
              <span className="text-lg md:text-xl font-bold text-zinc-800 tracking-tight leading-none group-hover:text-black transition-colors">
                {niche}
              </span>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};