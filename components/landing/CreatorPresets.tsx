
"use client";

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, ArrowRight, CheckCircle2, Lock } from 'lucide-react';

interface Preset {
  id: string;
  name: string;
  benefit: string;
  prompt: string;
  tags: string[];
  includes: string[];
  image: string;
  isPro?: boolean;
}

const PRESETS: Preset[] = [
  {
    id: "cinematic",
    name: "Cinematic",
    benefit: "The Hollywood Look",
    prompt: "Anamorphic lens, low angle street scene, soft morning light, hyper-realistic textures, clean professional color grading...",
    tags: ["16:9", "Slow Pan", "Professional"],
    includes: ["Refined Grain", "Color Logic", "Global Lighting"],
    image: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?q=80&w=1200&auto=format&fit=crop",
  },
  {
    id: "social",
    name: "Social/Reels",
    benefit: "Growth Optimized",
    prompt: "First-person perspective, vibrant urban cafe, quick whip pan transition, high clarity, shallow depth of field...",
    tags: ["9:16", "Fast Cut", "Clean"],
    includes: ["Vertical Optim", "Motion Focus", "Auto-Framing"],
    image: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&q=80&w=1200",
  },
  {
    id: "product",
    name: "Product",
    benefit: "Conversion Ready",
    prompt: "Macro shot of product texture, smooth 360-degree orbit, studio lighting, pristine white background...",
    tags: ["1:1", "Orbit", "Soft"],
    includes: ["Reflectance", "Studio Rig", "Macro Clarity"],
    image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=1200",
  },
  {
    id: "realestate",
    name: "Real Estate",
    benefit: "Premium Listings",
    isPro: true,
    prompt: "Drone sweep of a modern hillside mansion, smooth gimbal motion, interior-to-exterior professional flow...",
    tags: ["16:9", "Drone", "Elegant"],
    includes: ["Property Fly", "Interior Scan", "Exterior Sweep"],
    image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=1200",
  }
];

const Typewriter = ({ text }: { text: string }) => {
  const [displayed, setDisplayed] = useState("");
  
  useEffect(() => {
    let active = true;
    setDisplayed("");
    let i = 0;
    const interval = setInterval(() => {
      if (!active) return;
      setDisplayed(text.substring(0, i));
      i++;
      if (i > text.length) clearInterval(interval);
    }, 20);
    return () => { active = false; clearInterval(interval); };
  }, [text]);

  return (
    <span className="font-mono text-zinc-500 italic">
      {displayed}
      <motion.span
        animate={{ opacity: [1, 0] }}
        transition={{ duration: 0.8, repeat: Infinity }}
        className="inline-block w-1.5 h-4 ml-1 bg-indigo-600 align-middle"
      />
    </span>
  );
};

export const CreatorPresets = () => {
  const [activeTab, setActiveTab] = useState(PRESETS[0]);

  const scrollToPricing = () => {
    const element = document.getElementById('pricing');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <section id="presets" className="relative py-24 md:py-40 bg-white overflow-hidden scroll-mt-20">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex flex-col gap-4"
          >
            <span className="text-xs font-bold uppercase tracking-[0.4em] text-indigo-600">Industry Packs</span>
            <h2 className="text-4xl md:text-6xl font-bold text-zinc-900 tracking-tighter">
              Presets for Every <br className="hidden md:block" />
              <span className="text-zinc-400 italic">Narrative.</span>
            </h2>
          </motion.div>
        </div>

        {/* Tab Selector */}
        <div className="relative mb-12 flex overflow-x-auto no-scrollbar pb-4 md:pb-0 gap-2">
          {PRESETS.map((preset) => (
            <button
              key={preset.id}
              onClick={() => setActiveTab(preset)}
              className={`relative px-6 py-3 rounded-full text-sm font-bold transition-all whitespace-nowrap ${
                activeTab.id === preset.id ? "text-zinc-900" : "text-zinc-400 hover:text-zinc-600"
              }`}
            >
              <span className="relative z-10 flex items-center gap-2">
                {preset.name}
                {preset.isPro && <Lock size={12} className="text-indigo-600/50" />}
              </span>
              {activeTab.id === preset.id && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute inset-0 bg-zinc-50 border border-zinc-200 rounded-full shadow-sm"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* Left Preview */}
          <div className="lg:col-span-7">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                className="relative aspect-video rounded-3xl overflow-hidden border border-zinc-200 bg-zinc-50 group shadow-xl"
              >
                <img
                  src={activeTab.image}
                  alt={activeTab.name}
                  className="w-full h-full object-cover transition-transform duration-[3s] group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-white/80 via-transparent to-transparent opacity-60" />
                
                <div className="absolute top-6 left-6 px-4 py-2 rounded-xl bg-white/80 backdrop-blur-md border border-zinc-200 flex items-center gap-3 shadow-sm">
                   <div className="w-2 h-2 rounded-full bg-indigo-600" />
                   <span className="text-[10px] font-bold text-zinc-900 uppercase tracking-widest">Previewing Preset</span>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Right Info */}
          <div className="lg:col-span-5">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.4 }}
                className="flex flex-col gap-8"
              >
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <h3 className="text-3xl font-bold text-zinc-900 tracking-tight">{activeTab.name}</h3>
                    {activeTab.isPro && (
                      <span className="px-2 py-0.5 rounded bg-indigo-50 border border-indigo-100 text-[10px] font-black text-indigo-600 uppercase">
                        PRO Pack
                      </span>
                    )}
                  </div>
                  <p className="text-xl text-zinc-600 leading-relaxed font-sans">{activeTab.benefit}</p>
                </div>

                {/* Prompt Box */}
                <div className="p-6 rounded-2xl bg-zinc-50 border border-zinc-200 space-y-3 shadow-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Sample Prompt</span>
                    <Sparkles size={14} className="text-zinc-300" />
                  </div>
                  <div className="min-h-[80px] text-sm leading-relaxed">
                    <Typewriter text={activeTab.prompt} />
                  </div>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-2">
                  {activeTab.tags.map(tag => (
                    <span key={tag} className="px-3 py-1 rounded-full bg-white border border-zinc-200 text-[10px] font-bold text-zinc-500 uppercase tracking-wider shadow-sm">
                      {tag}
                    </span>
                  ))}
                </div>

                {/* Includes */}
                <div className="space-y-3">
                  <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400">Included features</span>
                  <div className="grid grid-cols-2 gap-y-2">
                    {activeTab.includes.map(inc => (
                      <div key={inc} className="flex items-center gap-2 text-xs text-zinc-600">
                        <CheckCircle2 size={14} className="text-indigo-600/50" />
                        {inc}
                      </div>
                    ))}
                  </div>
                </div>

                {/* CTA */}
                <motion.button
                  onClick={scrollToPricing}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="mt-4 group flex items-center justify-center gap-2 w-full py-5 rounded-2xl bg-zinc-900 text-white text-sm font-bold transition-all hover:bg-black shadow-lg shadow-zinc-200"
                >
                  Use this preset
                  <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
                </motion.button>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
};
