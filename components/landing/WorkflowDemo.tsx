"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ImageIcon, 
  Film, 
  Music, 
  Wand2, 
  CheckCircle2, 
  Loader2, 
  Play
} from 'lucide-react';

const DEMO_SCENARIO = {
  // Reliable assets that match visually
  staticImage: "https://images.unsplash.com/photo-1535295972055-1c762f4483e5?q=80&w=1600&auto=format&fit=crop", // Neon City Stills
  videoUrl: "https://cdn.coverr.co/videos/coverr-hyper-lapse-of-tokyo-traffic-1566/1080p.mp4", // Matching City Motion
  prompt: "Cyberpunk cityscape at night, neon lights reflecting on wet pavement, cinematic lighting, 8k resolution..."
};

const STEPS = [
  {
    id: 'image',
    label: '1. Generate Image',
    icon: ImageIcon,
    description: "High-fidelity text-to-image synthesis.",
    status: "Rendering Base Layer..."
  },
  {
    id: 'video',
    label: '2. Animate Scene',
    icon: Film,
    description: "Image-to-Video motion interpolation.",
    status: "Synthesizing Motion Vectors..."
  },
  {
    id: 'audio',
    label: '3. Compose Audio',
    icon: Music,
    description: "Context-aware soundscape generation.",
    status: "Mastering Audio Track..."
  }
];

export const WorkflowDemo = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [progress, setProgress] = useState(0);

  // Cycle through the 3 steps automatically
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    // Reset progress when step changes
    setProgress(0);

    // Animate Progress Bar
    const progressInterval = setInterval(() => {
      setProgress(prev => Math.min(prev + 2, 100));
    }, 40); // 2 seconds to fill

    // Move to next step after delay
    const stepDuration = 4000; // 4 seconds per step
    interval = setTimeout(() => {
      setActiveStep(prev => (prev + 1) % STEPS.length);
    }, stepDuration);

    return () => {
      clearInterval(progressInterval);
      clearTimeout(interval);
    };
  }, [activeStep]);

  const currentStep = STEPS[activeStep];

  return (
    <div className="w-full max-w-6xl mx-auto px-6">
      
      {/* 1. Progress Tracker (Top) */}
      <div className="flex justify-between items-center mb-16 relative">
        {/* Connecting Line */}
        <div className="absolute top-1/2 left-0 right-0 h-1 bg-stone-100 dark:bg-zinc-800 -z-10 rounded-full" />
        <div 
          className="absolute top-1/2 left-0 h-1 bg-indigo-600 -z-10 rounded-full transition-all duration-1000 ease-linear" 
          style={{ width: `${(activeStep / (STEPS.length - 1)) * 100}%` }}
        />

        {STEPS.map((step, index) => {
          const isActive = index === activeStep;
          const isCompleted = index < activeStep;
          const Icon = step.icon;

          return (
            <div 
              key={step.id} 
              className="flex flex-col items-center gap-4 cursor-default relative group"
            >
              <motion.div
                animate={{
                  scale: isActive ? 1.1 : 1
                }}
                className={`
                  w-16 h-16 rounded-2xl flex items-center justify-center border-2 shadow-sm transition-colors duration-500
                  ${isActive
                    ? 'bg-white dark:bg-zinc-800 border-indigo-600 text-indigo-600 dark:text-indigo-400 shadow-xl shadow-indigo-200 dark:shadow-indigo-900/30'
                    : isCompleted
                      ? 'bg-indigo-50 dark:bg-indigo-950 border-indigo-200 dark:border-indigo-800 text-indigo-400'
                      : 'bg-white dark:bg-zinc-900 border-stone-200 dark:border-zinc-700 text-stone-300 dark:text-zinc-600'
                  }
                `}
              >
                {isCompleted ? <CheckCircle2 size={24} /> : <Icon size={24} />}
              </motion.div>
              
              <div className="absolute top-20 text-center w-40">
                <span className={`text-xs font-black uppercase tracking-widest transition-colors duration-300 ${isActive ? 'text-zinc-900 dark:text-white' : 'text-zinc-400 dark:text-zinc-500'}`}>
                  {step.label}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* 2. Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24 items-center">
        
        {/* Left: The AI Console */}
        <div className="space-y-8 order-2 lg:order-1">
          <motion.div
            key={currentStep.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <h3 className="text-4xl font-bold text-zinc-900 dark:text-white flex items-center gap-3">
              {currentStep.id === 'image' && "Visualize."}
              {currentStep.id === 'video' && "Animate."}
              {currentStep.id === 'audio' && "Resonate."}
            </h3>
            <p className="text-lg text-zinc-500 dark:text-zinc-400 font-sans">
              {currentStep.description}
            </p>
          </motion.div>

          {/* Terminal / Status Box */}
          <div className="bg-zinc-900 rounded-3xl p-8 shadow-2xl overflow-hidden relative border border-zinc-800">
            {/* Terminal Header */}
            <div className="flex items-center gap-2 mb-6 opacity-50">
              <div className="w-3 h-3 rounded-full bg-red-500" />
              <div className="w-3 h-3 rounded-full bg-yellow-500" />
              <div className="w-3 h-3 rounded-full bg-green-500" />
            </div>

            {/* Prompt Typing Simulation */}
            <div className="space-y-6">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-zinc-500">
                  <Wand2 size={12} className="text-indigo-400" /> Prompt Input
                </div>
                <p className="font-mono text-zinc-300 text-sm leading-relaxed">
                  {DEMO_SCENARIO.prompt}
                  <motion.span 
                    animate={{ opacity: [1, 0] }} 
                    transition={{ repeat: Infinity, duration: 0.8 }}
                    className="inline-block w-2 h-4 ml-1 bg-indigo-500 align-middle"
                  />
                </p>
              </div>

              {/* Dynamic Status Line */}
              <div className="pt-6 border-t border-white/10">
                <div className="flex justify-between items-end mb-2">
                  <span className="text-xs text-indigo-400 font-mono flex items-center gap-2">
                    {progress < 100 ? <Loader2 size={12} className="animate-spin" /> : <CheckCircle2 size={12} />}
                    {currentStep.status}
                  </span>
                  <span className="text-xs text-zinc-500 font-mono">{progress}%</span>
                </div>
                <div className="h-1 w-full bg-zinc-800 rounded-full overflow-hidden">
                  <motion.div 
                    className="h-full bg-indigo-500"
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ ease: "linear" }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right: The Visualizer Canvas */}
        <div className="order-1 lg:order-2">
          <div className="relative aspect-video rounded-3xl overflow-hidden bg-zinc-100 shadow-2xl border border-zinc-200">
             
             {/* The Content Layer */}
             <div className="absolute inset-0">
               {/* Show Image initially */}
               <img 
                 src={DEMO_SCENARIO.staticImage}
                 alt="Static Preview"
                 className="absolute inset-0 w-full h-full object-cover"
               />

               {/* Fade in Video when step is Video or Audio */}
               <motion.div
                 initial={{ opacity: 0 }}
                 animate={{ opacity: activeStep >= 1 ? 1 : 0 }}
                 transition={{ duration: 1 }}
                 className="absolute inset-0"
               >
                 <video 
                   src={DEMO_SCENARIO.videoUrl}
                   autoPlay 
                   muted 
                   loop 
                   playsInline
                   className="w-full h-full object-cover"
                 />
               </motion.div>

               {/* Overlay: Audio Visualizer (Only visible in step 3) */}
               <AnimatePresence>
                 {activeStep === 2 && (
                   <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-black/40 backdrop-blur-[2px] flex items-center justify-center"
                   >
                     <div className="flex gap-1.5 items-end h-24">
                       {[...Array(12)].map((_, i) => (
                         <motion.div
                           key={i}
                           animate={{ 
                             height: [20, Math.random() * 80 + 20, 20],
                           }}
                           transition={{ 
                             repeat: Infinity, 
                             duration: 0.5, 
                             delay: i * 0.05,
                             ease: "easeInOut"
                           }}
                           className="w-3 bg-white rounded-full shadow-[0_0_15px_rgba(255,255,255,0.5)]"
                         />
                       ))}
                     </div>
                     <div className="absolute bottom-6 left-0 right-0 text-center">
                       <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-black/50 text-[10px] font-bold uppercase tracking-widest text-white border border-white/20">
                         <Music size={12} /> Audio Generated
                       </span>
                     </div>
                   </motion.div>
                 )}
               </AnimatePresence>

               {/* Overlay: Play Icon on Video Step */}
               <AnimatePresence>
                 {activeStep === 1 && (
                   <motion.div
                     initial={{ scale: 0.8, opacity: 0 }}
                     animate={{ scale: 1, opacity: 1 }}
                     exit={{ scale: 1.2, opacity: 0 }}
                     className="absolute inset-0 flex items-center justify-center pointer-events-none"
                   >
                     <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30">
                       <Play size={32} fill="white" className="text-white ml-1" />
                     </div>
                   </motion.div>
                 )}
               </AnimatePresence>
             </div>

             {/* Canvas Footer Label */}
             <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end">
               <div className="px-3 py-1.5 rounded-lg bg-black/60 backdrop-blur-md border border-white/10 text-white text-[10px] font-bold uppercase tracking-widest">
                 Preview Output
               </div>
             </div>
          </div>
        </div>

      </div>
    </div>
  );
};