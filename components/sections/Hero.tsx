"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, ArrowRight, Zap, Image as ImageIcon, Music } from 'lucide-react';

const MODES = [
  { 
    id: 'creator', 
    label: 'For Creators', 
    video: 'https://cdn.coverr.co/videos/coverr-skateboarding-at-sunset-4600/1080p.mp4',
    headline: "Create Everything.",
    sub: "Generate thumbnails, viral shorts, and trending audio in one studio."
  },
  { 
    id: 'realestate', 
    label: 'For Real Estate', 
    video: 'https://cdn.coverr.co/videos/coverr-living-room-interior-2616/1080p.mp4', 
    headline: "Virtual Staging Suite.",
    sub: "Turn empty room photos into furnished cinematic tours with AI voiceovers."
  },
  { 
    id: 'ecommerce', 
    label: 'For Brands', 
    video: 'https://cdn.coverr.co/videos/coverr-pouring-coffee-in-slow-motion-4616/1080p.mp4',
    headline: "Commercial Production.",
    sub: "From product photography to 30-second video ads with licensed music."
  }
];

export const Hero = () => {
  const [activeMode, setActiveMode] = useState(MODES[0]);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) return null;

  return (
    <section id="hero-start" className="relative h-screen w-full overflow-hidden bg-black text-white">
      {/* 1. Background Video Layer */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeMode.id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.5 }}
          className="absolute inset-0 z-0"
        >
          <video 
            autoPlay 
            muted 
            loop 
            playsInline
            className="h-full w-full object-cover opacity-50 scale-105"
            src={activeMode.video} 
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-black/40" />
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20" />
        </motion.div>
      </AnimatePresence>

      {/* 2. Content Layer */}
      <div className="relative z-10 flex h-full flex-col items-center justify-center px-6 text-center pt-20">
        
        {/* Capability Pills */}
        <motion.div 
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="mb-8 flex items-center gap-3"
        >
          <span className="px-3 py-1 rounded-full border border-white/10 bg-black/50 backdrop-blur-md text-[10px] font-bold uppercase tracking-widest text-zinc-300 flex items-center gap-2">
            <ImageIcon size={10} className="text-indigo-400" /> Image
          </span>
          <div className="w-1 h-1 rounded-full bg-zinc-600" />
          <span className="px-3 py-1 rounded-full border border-white/10 bg-black/50 backdrop-blur-md text-[10px] font-bold uppercase tracking-widest text-zinc-300 flex items-center gap-2">
            <Play size={10} className="text-indigo-400" /> Video
          </span>
          <div className="w-1 h-1 rounded-full bg-zinc-600" />
          <span className="px-3 py-1 rounded-full border border-white/10 bg-black/50 backdrop-blur-md text-[10px] font-bold uppercase tracking-widest text-zinc-300 flex items-center gap-2">
            <Music size={10} className="text-indigo-400" /> Audio
          </span>
        </motion.div>

        {/* Industry Switcher */}
        <div className="mb-6 flex flex-wrap items-center justify-center gap-1 rounded-full border border-white/10 bg-white/5 p-1 backdrop-blur-md">
          {MODES.map((mode) => (
            <button
              key={mode.id}
              onClick={() => setActiveMode(mode)}
              className={`relative rounded-full px-5 py-2 text-xs font-bold uppercase tracking-widest transition-all ${
                activeMode.id === mode.id ? 'text-black' : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              {activeMode.id === mode.id && (
                <motion.div
                  layoutId="activePill"
                  className="absolute inset-0 rounded-full bg-white shadow-lg"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
              <span className="relative z-10">{mode.label}</span>
            </button>
          ))}
        </div>

        {/* Dynamic Headlines */}
        <div className="max-w-5xl space-y-6">
          <motion.div
            key={activeMode.headline}
            initial={{ opacity: 0, y: 20, filter: "blur(10px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-5xl md:text-8xl font-black tracking-tighter text-white drop-shadow-2xl">
              {activeMode.headline}
            </h1>
          </motion.div>
          
          <motion.p 
            key={activeMode.sub}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="mx-auto max-w-2xl text-lg md:text-xl font-medium text-zinc-300"
          >
            {activeMode.sub}
          </motion.p>
        </div>

        {/* CTA Area */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-12 flex flex-col items-center gap-6 sm:flex-row"
        >
          <a href="/studio" className="group relative flex items-center gap-3 overflow-hidden rounded-full bg-white px-8 py-4 text-sm font-black uppercase tracking-widest text-black transition-all hover:scale-105 hover:shadow-[0_0_40px_rgba(255,255,255,0.3)]">
            <span className="relative z-10 flex items-center gap-2">
              Start Creating <Zap size={16} className="fill-current" />
            </span>
          </a>
          
          <button className="group flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-zinc-400 hover:text-white transition-colors">
            <Play size={12} className="group-hover:text-indigo-400 transition-colors" /> See Workflow
          </button>
        </motion.div>

      </div>
      
      {/* Scroll Indicator */}
      <motion.div 
        animate={{ y: [0, 10, 0] }}
        transition={{ repeat: Infinity, duration: 2 }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2 text-white/20"
      >
        <ArrowRight size={24} className="rotate-90" />
      </motion.div>
    </section>
  );
};