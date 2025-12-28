"use client";

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowUpRight, Zap, Clock, Play } from 'lucide-react';

// --- HAND-PICKED ASSETS (Guaranteed to Load) ---
const ASSETS = [
  {
    id: "neon-city",
    title: "Neo Tokyo",
    category: "Cinematic",
    duration: "5s Loop",
    // Vibrant Night Street (Red/Blue/Black)
    image: "https://images.unsplash.com/photo-1555685812-4b943f1cb0eb?q=80&w=1200&auto=format&fit=crop",
    video: "https://cdn.coverr.co/videos/coverr-tokyo-street-at-night-4678/1080p.mp4",
    prompt: "Cyberpunk rain, neon reflections, 8k render..."
  },
  {
    id: "luxury-home",
    title: "Modern Villa",
    category: "Real Estate",
    duration: "8s Loop",
    // Modern Architecture (Dusk)
    image: "https://images.unsplash.com/photo-1613490493576-7fde63acd811?q=80&w=1200&auto=format&fit=crop",
    video: "https://cdn.coverr.co/videos/coverr-drone-shot-of-a-luxury-hotel-5203/1080p.mp4",
    prompt: "Drone sweep, golden hour, wide angle..."
  },
  {
    id: "dark-tech",
    title: "Tech Macro",
    category: "Product",
    duration: "6s Loop",
    // Dark Camera Lens (Black/Glass)
    image: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?q=80&w=1200&auto=format&fit=crop",
    video: "https://cdn.coverr.co/videos/coverr-applying-face-cream-5347/1080p.mp4",
    prompt: "Macro lens, studio rim light, 360 orbit..."
  },
  {
    id: "fashion-edit",
    title: "Vogue Edit",
    category: "Social",
    duration: "4s Loop",
    // High Fashion Portrait (Moody)
    image: "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?q=80&w=1200&auto=format&fit=crop",
    video: "https://cdn.coverr.co/videos/coverr-fashion-photoshoot-4592/1080p.mp4",
    prompt: "Softbox lighting, slow motion hair, editorial..."
  },
  {
    id: "automotive",
    title: "Night Drive",
    category: "Cinematic",
    duration: "10s Loop",
    // Car Tail Lights (Motion Blur)
    image: "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?q=80&w=1200&auto=format&fit=crop",
    video: "https://cdn.coverr.co/videos/coverr-driving-at-night-4611/1080p.mp4",
    prompt: "Bokeh city lights, reflection on hood, cinematic..."
  },
  {
    id: "nature-storm",
    title: "Nordic Coast",
    category: "Nature",
    duration: "7s Loop",
    // Dark Moody Ocean
    image: "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?q=80&w=1200&auto=format&fit=crop",
    video: "https://cdn.coverr.co/videos/coverr-friends-running-into-the-ocean-at-sunset-4638/1080p.mp4",
    prompt: "High contrast, slow motion waves, atmospheric fog..."
  }
];

const CATEGORIES = ["All", "Cinematic", "Real Estate", "Product", "Social"];

const Card = ({ item }: { item: typeof ASSETS[0] }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  // Attempt autoplay immediately
  useEffect(() => {
    const vid = videoRef.current;
    if (vid) {
      vid.play()
        .then(() => setIsPlaying(true))
        .catch(() => console.log("Autoplay blocked - showing image"));
    }
  }, []);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true, margin: "-50px" }}
      className="group relative w-full aspect-video rounded-3xl overflow-hidden bg-zinc-900 border border-white/10 cursor-pointer shadow-2xl"
    >
      {/* 1. Video Layer (Background) */}
      <video
        ref={videoRef}
        src={item.video}
        muted
        loop
        playsInline
        preload="auto"
        className="absolute inset-0 w-full h-full object-cover"
        onPlaying={() => setIsPlaying(true)}
      />

      {/* 2. Poster Image Layer (Foreground) 
          - This sits ON TOP of the video.
          - It fades out ONLY when video is actually playing.
          - This guarantees no black screens.
      */}
      <div 
        className={`absolute inset-0 z-10 transition-opacity duration-700 ${isPlaying ? 'opacity-0' : 'opacity-100'}`}
      >
        <img 
          src={item.image} 
          alt={item.title}
          className="w-full h-full object-cover"
        />
        {/* Dark Tint for Readability */}
        <div className="absolute inset-0 bg-black/30" />
      </div>

      {/* 3. Gradient Overlay (Always on top for UI) */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-80 z-20 pointer-events-none" />

      {/* 4. UI Content */}
      <div className="absolute inset-0 z-30 p-6 flex flex-col justify-between">
        
        {/* Top Badges */}
        <div className="flex justify-between items-start">
          <span className="px-3 py-1 rounded-full bg-black/50 backdrop-blur-md border border-white/10 text-[10px] font-bold text-white uppercase tracking-widest shadow-lg">
            {item.category}
          </span>
          <span className="px-3 py-1 rounded-full bg-black/50 backdrop-blur-md border border-white/10 text-[10px] font-bold text-zinc-300 uppercase tracking-widest flex items-center gap-1.5 shadow-lg">
            <Clock size={10} /> {item.duration}
          </span>
        </div>

        {/* Bottom Text */}
        <div className="transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
          <div className="flex items-end justify-between">
            <div>
              <h3 className="text-xl md:text-2xl font-bold text-white leading-tight drop-shadow-xl">
                {item.title}
              </h3>
              {/* Reveal Prompt on Hover */}
              <div className="h-0 group-hover:h-6 overflow-hidden transition-all duration-300">
                <p className="pt-2 text-xs text-violet-300 font-mono flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity delay-100">
                  <Zap size={12} /> {item.prompt}
                </p>
              </div>
            </div>
            
            {/* Action Button */}
            <div className="w-10 h-10 rounded-full bg-white text-black flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 scale-50 group-hover:scale-100 shadow-lg hover:bg-violet-400 hover:text-white">
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
    ? ASSETS 
    : ASSETS.filter(a => a.category === filter);

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
              <div className="w-12 h-[1px] bg-violet-500" />
              <span className="text-xs font-bold uppercase tracking-[0.3em] text-violet-500">
                Motion Library
              </span>
            </motion.div>
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-5xl md:text-7xl font-bold tracking-tighter"
            >
              Curated <span className="text-zinc-600">Motion.</span>
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

        {/* The Grid */}
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
            View All 200+ Templates <ArrowUpRight size={14} />
          </button>
        </div>

      </div>
    </section>
  );
};