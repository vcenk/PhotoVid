"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  UserCircle,
  Camera,
  Building2,
  KeyRound,
  Sofa,
  ArrowRight,
  CheckCircle2,
  Zap,
  Sparkles
} from 'lucide-react';

const PERSONAS = [
  {
    id: "agents",
    title: "Real Estate Agents",
    tagline: "Close Faster",
    description: "Get listing-ready photos in minutes, not days. Virtual staging, sky replacement, and enhancement tools help you market properties the moment they hit MLS.",
    features: ["Virtual Staging", "Sky Replacement", "Twilight Conversion"],
    image: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&q=80&w=1200",
    icon: UserCircle,
    color: "bg-teal-500"
  },
  {
    id: "photographers",
    title: "RE Photographers",
    tagline: "Scale Output",
    description: "Batch-process hundreds of photos with consistent quality. HDR merge, color correction, and lens fixes — all automated so you can shoot more, edit less.",
    features: ["Batch Processing", "HDR Merge", "Auto Color Correction"],
    image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=1200",
    icon: Camera,
    color: "bg-emerald-500"
  },
  {
    id: "brokerages",
    title: "Brokerages & Teams",
    tagline: "Brand Consistency",
    description: "Ensure every agent on your team delivers polished visuals. Shared presets, branded watermarks, and team-wide tool access from one dashboard.",
    features: ["Team Presets", "Brand Watermarks", "Usage Analytics"],
    image: "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&q=80&w=1200",
    icon: Building2,
    color: "bg-emerald-500"
  },
  {
    id: "managers",
    title: "Property Managers",
    tagline: "Fill Vacancies",
    description: "Make rental listings look move-in ready without hiring a photographer. Declutter tenant photos, enhance lighting, and stage empty units virtually.",
    features: ["Item Removal", "Photo Enhancement", "Virtual Staging"],
    image: "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&q=80&w=1200",
    icon: KeyRound,
    color: "bg-amber-500"
  },
  {
    id: "stagers",
    title: "Home Stagers",
    tagline: "Stage Smarter",
    description: "Show clients virtual staging concepts before moving a single piece of furniture. Offer multiple design styles per room and win more staging contracts.",
    features: ["Multi-Style Preview", "Room Redesign", "Before/After Reports"],
    image: "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&q=80&w=1200",
    icon: Sofa,
    color: "bg-rose-500"
  }
];

export const UseCasesSection = () => {
  const [activeTab, setActiveTab] = useState(PERSONAS[0]);

  return (
    <section id="use-cases" className="relative py-24 md:py-32 bg-zinc-950 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 relative z-10">

        {/* Header */}
        <div className="text-center mb-12 md:mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-zinc-400 text-xs font-bold uppercase tracking-widest mb-6"
          >
            <Sparkles size={12} /> Built for Real Estate
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-6xl font-bold text-white tracking-tighter mb-6"
          >
            Your role.{' '}
            <span className="text-zinc-400 font-serif italic">Your workflow.</span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="max-w-2xl mx-auto text-lg text-zinc-400"
          >
            Whether you're an agent, photographer, or brokerage — Photovid adapts to how you work with tools built for your specific needs.
          </motion.p>
        </div>

        {/* Tabs */}
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
                    : "text-zinc-400 hover:text-white hover:bg-zinc-800"
                  }
                `}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeTabBg"
                    className="absolute inset-0 bg-teal-600 rounded-full"
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

        {/* Feature Stage */}
        <div className="relative w-full max-w-5xl mx-auto min-h-[500px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab.id}
              initial={{ opacity: 0, y: 20, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.98 }}
              transition={{ duration: 0.4 }}
              className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 p-8 md:p-12 rounded-[40px] bg-zinc-800/50 border border-white/10"
            >

              {/* Left: Content */}
              <div className="flex flex-col justify-center space-y-8">
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <div className={`p-3 rounded-2xl ${activeTab.color} bg-opacity-20`}>
                      <activeTab.icon size={24} className="text-white" />
                    </div>
                    <span className="text-xs font-bold uppercase tracking-widest text-zinc-400">
                      {activeTab.tagline}
                    </span>
                  </div>
                  <h3 className="text-3xl md:text-4xl font-bold text-white mb-4 tracking-tight">
                    {activeTab.title}
                  </h3>
                  <p className="text-lg text-zinc-300 leading-relaxed">
                    {activeTab.description}
                  </p>
                </div>

                <div className="space-y-4">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Key Tools</span>
                  <div className="flex flex-wrap gap-3">
                    {activeTab.features.map((feature) => (
                      <div key={feature} className="px-4 py-2 rounded-lg bg-zinc-900 border border-white/5 text-xs font-bold text-zinc-300 flex items-center gap-2">
                        <CheckCircle2 size={14} className="text-teal-500" />
                        {feature}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-4">
                  <a href="/auth" className="flex items-center gap-2 text-sm font-bold text-white border-b-2 border-zinc-700 pb-1 hover:border-teal-500 transition-colors group">
                    Get Started Free
                    <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                  </a>
                </div>
              </div>

              {/* Right: Image */}
              <div className="relative aspect-[4/3] md:aspect-square rounded-[32px] overflow-hidden bg-zinc-900 group">
                <img
                  src={activeTab.image}
                  alt={activeTab.title}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-60" />

                {/* Badge */}
                <div className="absolute bottom-8 left-8 right-8 p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-between text-white">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest opacity-80">Workflow</p>
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
