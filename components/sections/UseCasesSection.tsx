"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, 
  Home, 
  ShoppingBag, 
  Utensils, 
  Briefcase, 
  ArrowRight, 
  CheckCircle2, 
  Zap,
  Sparkles
} from 'lucide-react';

// --- Data ---
const PERSONAS = [
  {
    id: "creators",
    title: "Content Creators",
    tagline: "Viral Speed",
    description: "Turn photos into scroll-stopping Reels, Shorts, and TikToks. Auto-detects subjects and applies trending motion effects instantly.",
    features: ["Auto-Portrait Animation", "Beat-Sync Motion", "Face-Lock Stabilization"],
    image: "https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?auto=format&fit=crop&q=80&w=1200",
    icon: Users,
    color: "bg-blue-500"
  },
  {
    id: "real-estate",
    title: "Real Estate",
    tagline: "Luxury Listings",
    description: "Generate cinematic fly-throughs from standard listing photos. Create drone-style exterior sweeps without a pilot.",
    features: ["Room-to-Room Transitions", "Exterior Drone Sim", "Virtual Staging"],
    image: "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&q=80&w=1200",
    icon: Home,
    color: "bg-emerald-500"
  },
  {
    id: "ecommerce",
    title: "E-commerce",
    tagline: "Conversion Ads",
    description: "Product motion ads without reshoots. Add dynamic camera orbits and studio lighting to static product shots.",
    features: ["360° Orbit Gen", "Texture Magnification", "Background Swap"],
    image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=1200",
    icon: ShoppingBag,
    color: "bg-purple-500"
  },
  {
    id: "food",
    title: "Hospitality",
    tagline: "Taste Appeal",
    description: "Capture the steam, the pour, and the texture. Make static menu photos look freshly prepared.",
    features: ["Steam/Smoke FX", "Liquid Pour Sim", "Macro Detail Zoom"],
    image: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&q=80&w=1200",
    icon: Utensils,
    color: "bg-orange-500"
  },
  {
    id: "agencies",
    title: "Agencies",
    tagline: "Scale Production",
    description: "Ship client visuals 10x faster. Maintain brand consistency across hundreds of assets with saved presets.",
    features: ["Brand Kit Locking", "Bulk Generation", "Team Presets"],
    image: "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=1200",
    icon: Briefcase,
    color: "bg-zinc-500"
  }
];

export const UseCasesSection = () => {
  const [activeTab, setActiveTab] = useState(PERSONAS[0]);

  return (
    <section id="use-cases" className="relative py-24 md:py-32 bg-stone-50 dark:bg-zinc-900 overflow-hidden transition-colors duration-500">
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        
        {/* 1. Unified Header */}
        <div className="text-center mb-12 md:mb-16">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-100 dark:border-indigo-500/30 text-indigo-600 dark:text-indigo-400 text-[10px] font-bold uppercase tracking-widest mb-6"
          >
            <Sparkles size={12} /> Industry Solutions
          </motion.div>
          
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-6xl font-bold text-zinc-900 dark:text-white tracking-tighter mb-6"
          >
            Specialized workflows <br />
            <span className="text-zinc-400 font-serif italic">for your craft.</span>
          </motion.h2>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="max-w-2xl mx-auto text-lg text-zinc-500 dark:text-zinc-400"
          >
            Photophia isn't just a general tool. It adapts to your industry with 
            trained models and specialized motion presets.
          </motion.p>
        </div>

        {/* 2. Navigation Tabs (Centered) */}
        <div className="flex flex-wrap justify-center gap-2 mb-12">
          {PERSONAS.map((persona) => {
            const isActive = activeTab.id === persona.id;
            return (
              <button
                key={persona.id}
                onClick={() => setActiveTab(persona)}
                className={`
                  relative px-6 py-3 rounded-full text-xs font-bold uppercase tracking-wider transition-all duration-300
                  ${isActive 
                    ? "text-white shadow-lg scale-105" 
                    : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800"
                  }
                `}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeTabBg"
                    className="absolute inset-0 bg-zinc-900 dark:bg-indigo-600 rounded-full"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
                <span className="relative z-10 flex items-center gap-2">
                  <persona.icon size={14} />
                  {persona.title}
                </span>
              </button>
            );
          })}
        </div>

        {/* 3. The Feature Stage (Fixed Height Container) */}
        <div className="relative w-full max-w-5xl mx-auto min-h-[500px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab.id}
              initial={{ opacity: 0, y: 20, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.98 }}
              transition={{ duration: 0.4 }}
              className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 p-8 md:p-12 rounded-[40px] bg-white dark:bg-zinc-800/50 border border-zinc-200 dark:border-white/10 shadow-2xl shadow-zinc-200/50 dark:shadow-none"
            >
              
              {/* Left: Content */}
              <div className="flex flex-col justify-center space-y-8">
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <div className={`p-3 rounded-2xl ${activeTab.color} bg-opacity-10 text-${activeTab.color.split('-')[1]}-600 dark:text-white`}>
                      <activeTab.icon size={24} />
                    </div>
                    <span className="text-xs font-bold uppercase tracking-widest text-zinc-500 dark:text-zinc-400">
                      {activeTab.tagline}
                    </span>
                  </div>
                  <h3 className="text-3xl md:text-4xl font-bold text-zinc-900 dark:text-white mb-4 tracking-tight">
                    {activeTab.title} Suite
                  </h3>
                  <p className="text-lg text-zinc-600 dark:text-zinc-300 leading-relaxed">
                    {activeTab.description}
                  </p>
                </div>

                <div className="space-y-4">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Included Features</span>
                  <div className="flex flex-wrap gap-3">
                    {activeTab.features.map((feature) => (
                      <div key={feature} className="px-4 py-2 rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-white/5 text-xs font-bold text-zinc-700 dark:text-zinc-300 flex items-center gap-2">
                        <CheckCircle2 size={14} className="text-indigo-500" />
                        {feature}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-4">
                  <button className="flex items-center gap-2 text-sm font-bold text-zinc-900 dark:text-white border-b-2 border-zinc-200 dark:border-zinc-700 pb-1 hover:border-indigo-500 transition-colors group">
                    Explore {activeTab.title} Templates
                    <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>

              {/* Right: Visual Preview */}
              <div className="relative aspect-[4/3] md:aspect-square rounded-[32px] overflow-hidden bg-zinc-100 dark:bg-zinc-900 group">
                <img 
                  src={activeTab.image} 
                  alt={activeTab.title}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-60" />
                
                {/* Floating "Active" Badge */}
                <div className="absolute bottom-8 left-8 right-8 p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-between text-white">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest opacity-80">Active Preset</p>
                    <p className="text-sm font-bold">{activeTab.tagline}</p>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-white text-black flex items-center justify-center">
                    <Zap size={16} fill="currentColor" />
                  </div>
                </div>
              </div>

            </motion.div>
          </AnimatePresence>
        </div>

      </div>
    </section>
  );
};