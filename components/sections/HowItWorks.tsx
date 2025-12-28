
"use client";

import React, { useState, useEffect, useRef } from 'react';
import { motion, useInView, Variants, AnimatePresence, useReducedMotion } from 'framer-motion';
import { Sparkles, Palette, Play, Image as ImageIcon, Upload, ChevronDown, MonitorPlay, Activity } from 'lucide-react';

/**
 * Typewriter Hook for the Studio Prompt Demo
 */
function useTypewriter(texts: string[], speed: number = 50, delay: number = 2000, skip?: boolean) {
  const [displayText, setDisplayText] = useState("");
  const [textIndex, setTextIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (skip) {
      setDisplayText(texts[0]);
      return;
    }

    const currentText = texts[textIndex];
    let timeout: ReturnType<typeof setTimeout>;

    if (isDeleting) {
      timeout = setTimeout(() => {
        setDisplayText(currentText.slice(0, displayText.length - 1));
      }, speed / 2);
    } else {
      timeout = setTimeout(() => {
        setDisplayText(currentText.slice(0, displayText.length + 1));
      }, speed);
    }

    if (!isDeleting && displayText === currentText) {
      timeout = setTimeout(() => setIsDeleting(true), delay);
    } else if (isDeleting && displayText === "") {
      setIsDeleting(false);
      setTextIndex((prev) => (prev + 1) % texts.length);
    }

    return () => clearTimeout(timeout);
  }, [displayText, isDeleting, textIndex, texts, speed, delay, skip]);

  return displayText;
}

const STEPS = [
  {
    id: 1,
    title: "Describe it or Upload",
    description: "Start with a prompt or drop in a photo. Photophia preps it for motion.",
    icon: Sparkles,
    tag: "Guided",
  },
  {
    id: 2,
    title: "Pick a Style",
    description: "Choose a cinematic look or use a template pack built for your industry.",
    icon: Palette,
    tag: "Fast",
  },
  {
    id: 3,
    title: "Get Motion",
    description: "Generate a video, then tweak the prompt and create variations instantly.",
    icon: Play,
    tag: "Instant",
  },
];

export default function HowItWorks() {
  const sectionRef = useRef(null);
  const shouldReduceMotion = useReducedMotion();
  
  const promptTexts = [
    "Luxury living room, slow cinematic pan, warm golden hour light...",
    "Mountain peak at dawn, hyper-realistic drone shot, thick clouds...",
    "Cyberpunk city street, neon reflections, rainy atmosphere, 4k...",
  ];
  
  const promptText = useTypewriter(promptTexts, 50, 2000, shouldReduceMotion);

  const [isGenerating, setIsGenerating] = useState(false);
  const [isReady, setIsReady] = useState(false);

  // Cycle the "Generate" state loop to simulate the "Live" vibe
  useEffect(() => {
    if (shouldReduceMotion) {
      setIsReady(true);
      return;
    }

    const interval = setInterval(() => {
      setIsGenerating(true);
      setIsReady(false);
      // Simulate a 1.5s-3s generation process
      setTimeout(() => {
        setIsGenerating(false);
        setIsReady(true);
      }, 2500);
    }, 8500);
    return () => clearInterval(interval);
  }, [shouldReduceMotion]);

  return (
    <section 
      id="workflow" 
      ref={sectionRef}
      className="relative px-6 py-24 md:py-40 overflow-hidden bg-zinc-950 scroll-mt-32"
    >
      {/* Cinematic Background Elements */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        {/* Subtle Radial Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-[1200px] h-[800px] bg-violet-600/10 blur-[160px] rounded-full opacity-60" />
        
        {/* Drifting Blobs (Hidden on mobile for performance and clarity) */}
        {!shouldReduceMotion && (
          <>
            <motion.div 
              animate={{
                x: [0, 60, 0],
                y: [0, -40, 0],
              }}
              transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
              className="absolute -top-40 -right-40 w-[500px] h-[500px] bg-violet-500/5 blur-[120px] rounded-full hidden md:block"
            />
            <motion.div 
              animate={{
                x: [0, -50, 0],
                y: [0, 30, 0],
              }}
              transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
              className="absolute bottom-1/4 -left-40 w-[400px] h-[400px] bg-indigo-500/5 blur-[120px] rounded-full hidden md:block"
            />
          </>
        )}

        {/* Subtle Grain Overlay */}
        <div className="absolute inset-0 opacity-[0.02] mix-blend-overlay bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
      </div>

      <div className="max-w-6xl mx-auto relative z-10">
        {/* Header Section */}
        <div className="text-center mb-16 md:mb-32">
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-block text-xs uppercase tracking-[0.45em] text-zinc-500 mb-6"
          >
            The Magic Loop
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-7xl font-bold tracking-tight text-white mb-8"
          >
            Prompt. Generate. Publish.
          </motion.h2>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="space-y-4"
          >
            <p className="text-xl md:text-2xl text-zinc-400 max-w-3xl mx-auto font-sans leading-relaxed">
              Turn a photo or prompt into a motion asset — then iterate in seconds.
            </p>
            <p className="text-[10px] md:text-xs font-bold text-zinc-600 uppercase tracking-[0.4em]">
              No timelines. No keyframes. Just results.
            </p>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-24 items-start">
          
          {/* LEFT COLUMN: Studio Demo Panel (55% on desktop) */}
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
            className="lg:col-span-7 relative"
          >
            {/* Soft perimeter glow */}
            <div className="absolute -inset-4 bg-violet-600/10 rounded-[40px] blur-3xl opacity-50 group-hover:opacity-100 transition-opacity" />
            
            <div className="relative rounded-[32px] border border-white/10 bg-zinc-900/40 backdrop-blur-2xl shadow-[0_32px_64px_-16px_rgba(0,0,0,0.6)] overflow-hidden">
              {/* Tool Header Bar */}
              <div className="flex items-center justify-between px-8 py-5 border-b border-white/5 bg-white/[0.02]">
                <div className="flex items-center gap-3">
                  <div className="flex gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-zinc-800" />
                    <div className="w-2.5 h-2.5 rounded-full bg-zinc-800" />
                  </div>
                  <div className="w-px h-4 bg-white/10 mx-2" />
                  <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400">Photophia Studio</span>
                </div>
                <div className="flex items-center gap-4">
                  <div className="px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 text-[10px] font-bold text-violet-400 flex items-center gap-2">
                    <Activity size={12} className="animate-pulse" /> LIVE
                  </div>
                </div>
              </div>

              {/* Tool Internal Canvas */}
              <div className="p-8 md:p-10 space-y-8">
                {/* Prompt Section */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Input Prompt</label>
                    <span className="text-[10px] text-zinc-600 font-mono">82 / 240 chars</span>
                  </div>
                  <div className="min-h-[110px] w-full p-5 rounded-2xl bg-zinc-950/40 border border-white/10 text-base md:text-lg text-zinc-300 font-mono leading-relaxed transition-all focus-within:border-violet-500/40">
                    {promptText}
                    {!shouldReduceMotion && (
                      <motion.span 
                        animate={{ opacity: [1, 0] }}
                        transition={{ duration: 0.8, repeat: Infinity }}
                        className="inline-block w-[2.5px] h-[1.1em] ml-1 bg-violet-500 align-middle"
                      />
                    )}
                  </div>
                </div>

                {/* Configuration Chips */}
                <div className="flex flex-wrap gap-4">
                  {[
                    { label: "Model", value: "FAL • Fast Motion" },
                    { label: "Aspect", value: "9:16" },
                    { label: "Style", value: "Real Estate • Luxury" },
                  ].map((chip) => (
                    <div key={chip.label} className="flex flex-col gap-1.5 flex-1 min-w-[140px]">
                      <span className="text-[9px] font-bold uppercase tracking-tighter text-zinc-600 ml-1">{chip.label}</span>
                      <div className="px-4 py-2.5 rounded-xl bg-zinc-800/40 border border-white/5 text-xs text-zinc-300 flex items-center justify-between cursor-pointer hover:bg-zinc-800/80 transition-all active:scale-[0.98]">
                        {chip.value} <ChevronDown size={14} className="text-zinc-600" />
                      </div>
                    </div>
                  ))}
                </div>

                {/* Assets Area */}
                <div className="grid grid-cols-2 gap-5">
                  <div className="group/tile h-28 rounded-2xl border border-dashed border-white/10 flex flex-col items-center justify-center gap-3 hover:bg-white/[0.03] hover:border-violet-500/30 transition-all cursor-pointer">
                    <div className="p-2.5 rounded-full bg-zinc-900 border border-white/5 text-zinc-500 group-hover/tile:text-violet-400 group-hover/tile:border-violet-500/20 transition-colors">
                      <Upload size={20} />
                    </div>
                    <span className="text-[11px] text-zinc-500 font-bold uppercase tracking-widest">Base Image</span>
                  </div>
                  <div className="group/tile h-28 rounded-2xl border border-dashed border-white/10 flex flex-col items-center justify-center gap-3 hover:bg-white/[0.03] hover:border-violet-500/30 transition-all cursor-pointer">
                    <div className="p-2.5 rounded-full bg-zinc-900 border border-white/5 text-zinc-500 group-hover/tile:text-violet-400 group-hover/tile:border-violet-500/20 transition-colors">
                      <ImageIcon size={20} />
                    </div>
                    <span className="text-[11px] text-zinc-500 font-bold uppercase tracking-widest">Style Ref</span>
                  </div>
                </div>

                {/* Main Action Button */}
                <motion.button 
                  whileHover={{ scale: 1.01, boxShadow: "0 20px 40px -12px rgba(139,92,246,0.3)" }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full py-5 rounded-2xl bg-gradient-to-r from-violet-600 via-indigo-600 to-violet-600 bg-[length:200%_auto] animate-gradient-x text-sm font-bold text-white shadow-2xl shadow-violet-900/20 transition-all"
                >
                  Generate 4s Loop
                </motion.button>

                {/* Result/Loading Preview Section */}
                <div className="relative h-48 rounded-[24px] bg-zinc-950/60 border border-white/5 overflow-hidden flex flex-col items-center justify-center">
                  <AnimatePresence mode="wait">
                    {isGenerating ? (
                      <motion.div 
                        key="generating"
                        initial={{ opacity: 0 }} 
                        animate={{ opacity: 1 }} 
                        exit={{ opacity: 0 }}
                        className="flex flex-col items-center gap-4 w-full px-12"
                      >
                        <div className="flex gap-2">
                          {[0, 1, 2, 3].map((i) => (
                            <motion.div 
                              key={i}
                              animate={{ 
                                height: [12, 28, 12],
                                opacity: [0.3, 1, 0.3] 
                              }}
                              transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.1 }}
                              className="w-2 bg-violet-500 rounded-full"
                            />
                          ))}
                        </div>
                        <div className="w-full h-1.5 bg-zinc-900/50 rounded-full overflow-hidden">
                          <motion.div 
                            initial={{ x: "-100%" }}
                            animate={{ x: "100%" }}
                            transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                            className="w-1/2 h-full bg-gradient-to-r from-transparent via-violet-500 to-transparent"
                          />
                        </div>
                        <span className="text-[11px] font-bold text-zinc-600 uppercase tracking-[0.3em] animate-pulse">Encoding Fluid Motion</span>
                      </motion.div>
                    ) : (
                      <motion.div 
                        key="ready"
                        initial={{ opacity: 0, scale: 0.95 }} 
                        animate={{ opacity: 1, scale: 1 }}
                        className="flex flex-col items-center gap-5 text-center px-10"
                      >
                        <motion.div 
                          whileHover={{ scale: 1.1 }}
                          className="w-14 h-14 rounded-full bg-violet-500/10 border border-violet-500/30 flex items-center justify-center text-violet-400 cursor-pointer shadow-lg shadow-violet-500/10"
                        >
                          <Play size={24} className="fill-current ml-1" />
                        </motion.div>
                        <div>
                          <p className="text-sm font-bold text-white mb-1 uppercase tracking-widest">Generation Ready</p>
                          <p className="text-[11px] text-zinc-500 uppercase tracking-tighter">HD • 30FPS • Seed: 824901</p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>
          </motion.div>

          {/* RIGHT COLUMN: Vertical Timeline Steps (45% on desktop) */}
          <div className="lg:col-span-5 relative lg:pt-12">
            
            {/* Background Timeline Path (Desktop Only) */}
            <div className="absolute left-8 top-12 bottom-12 w-px hidden md:block">
              <div className="h-full w-full bg-zinc-900" />
              <motion.div 
                initial={{ height: 0 }}
                whileInView={{ height: "100%" }}
                viewport={{ once: true }}
                transition={{ duration: 2, ease: [0.65, 0, 0.35, 1], delay: 0.6 }}
                className="absolute top-0 left-0 w-full bg-gradient-to-b from-violet-600 via-indigo-600 to-transparent"
              />
            </div>

            <div className="space-y-16">
              {STEPS.map((step, idx) => (
                <motion.div
                  key={step.id}
                  initial={{ opacity: 0, x: 30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.2 * idx, duration: 0.8, ease: "easeOut" }}
                  className="relative flex gap-8 group/step"
                >
                  {/* Timeline Marker Icon */}
                  <div className="relative z-10 flex-shrink-0 w-16 h-16 rounded-3xl bg-zinc-900 border border-white/5 flex items-center justify-center transition-all duration-500 group-hover/step:border-violet-500/40 group-hover/step:bg-zinc-800 group-hover/step:shadow-[0_0_20px_rgba(139,92,246,0.15)]">
                    <step.icon size={26} className="text-zinc-600 group-hover/step:text-violet-400 transition-colors duration-500" />
                    
                    {/* Animated Pulsing Ring on Hover */}
                    <div className="absolute inset-0 rounded-3xl opacity-0 group-hover/step:opacity-100 transition-opacity">
                      <div className="absolute inset-0 animate-ping rounded-3xl bg-violet-400/10" />
                    </div>
                  </div>

                  {/* Step Descriptive Content */}
                  <div className="flex-1 pt-2">
                    <div className="flex items-center gap-4 mb-2">
                      <h3 className="text-xl font-bold text-white tracking-tight">{step.title}</h3>
                      <span className="px-2.5 py-0.5 rounded-md bg-zinc-900 border border-white/10 text-[9px] font-black text-zinc-500 uppercase tracking-[0.2em]">
                        {step.tag}
                      </span>
                    </div>
                    <p className="text-base text-zinc-400 leading-relaxed font-sans max-w-sm">
                      {step.description}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Bottom Proof Pill */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 1.2 }}
              className="mt-20 ml-0 md:ml-24"
            >
              <div className="inline-flex items-center gap-5 p-5 rounded-[24px] border border-white/5 bg-white/[0.02] backdrop-blur-sm group hover:border-white/10 transition-colors">
                <div className="w-12 h-12 rounded-full bg-zinc-800 flex items-center justify-center text-[10px] font-black text-violet-500 border border-violet-500/20 group-hover:scale-110 transition-transform">
                  NEURAL
                </div>
                <div className="pr-4">
                  <p className="text-xs text-zinc-300 font-bold leading-tight mb-1">Advanced Motion Engine</p>
                  <p className="text-[10px] text-zinc-500 leading-relaxed max-w-[200px]">
                    Trained on billions of high-fidelity cinematic frames to ensure physical accuracy.
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
          
        </div>
      </div>

      <style>{`
        @keyframes gradient-x {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        .animate-gradient-x {
          animation: gradient-x 6s ease infinite;
        }
      `}</style>
    </section>
  );
}
