"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Upload,
  Wand2,
  Download,
  CheckCircle2,
  Loader2,
  Sparkles
} from 'lucide-react';

const DEMO_SCENARIO = {
  beforeImage: "/showcase/real-estate/before/virtual-staging.jpg",
  afterImage: "/showcase/real-estate/after/virtual-staging.jpg",
  prompt: "Luxury modern living room, professionally staged with designer furniture, warm natural lighting, 4K resolution..."
};

const STEPS = [
  {
    id: 'upload',
    label: '1. Upload Photo',
    icon: Upload,
    heading: "Upload.",
    description: "Drop in your property photo — any angle, any lighting.",
    status: "Uploading Property Photo..."
  },
  {
    id: 'transform',
    label: '2. Choose AI Tool',
    icon: Wand2,
    heading: "Transform.",
    description: "Select from 25+ AI tools — staging, sky replacement, enhancement, and more.",
    status: "Applying Virtual Staging..."
  },
  {
    id: 'deliver',
    label: '3. Download Result',
    icon: Download,
    heading: "Deliver.",
    description: "Get your listing-ready image in seconds, not hours.",
    status: "Finalizing Output..."
  }
];

export const WorkflowDemo = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    setProgress(0);

    const progressInterval = setInterval(() => {
      setProgress(prev => Math.min(prev + 2, 100));
    }, 40);

    const stepTimeout = setTimeout(() => {
      setActiveStep(prev => (prev + 1) % STEPS.length);
    }, 4000);

    return () => {
      clearInterval(progressInterval);
      clearTimeout(stepTimeout);
    };
  }, [activeStep]);

  const currentStep = STEPS[activeStep];

  return (
    <div className="w-full max-w-6xl mx-auto px-6">

      {/* Progress Tracker */}
      <div className="flex justify-between items-center mb-16 relative">
        {/* Background line */}
        <div className="absolute top-1/2 left-0 right-0 h-1 bg-zinc-800 -z-10 rounded-full" />
        {/* Active line */}
        <div
          className="absolute top-1/2 left-0 h-1 bg-teal-500 -z-10 rounded-full transition-all duration-1000 ease-linear"
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
                animate={{ scale: isActive ? 1.1 : 1 }}
                className={`
                  w-16 h-16 rounded-2xl flex items-center justify-center border-2 shadow-sm transition-colors duration-500
                  ${isActive
                    ? 'bg-zinc-800 border-teal-500 text-teal-400 shadow-xl shadow-teal-900/30'
                    : isCompleted
                      ? 'bg-teal-950 border-teal-800 text-teal-400'
                      : 'bg-zinc-900 border-zinc-700 text-zinc-600'
                  }
                `}
              >
                {isCompleted ? <CheckCircle2 size={24} /> : <Icon size={24} />}
              </motion.div>

              <div className="absolute top-20 text-center w-40">
                <span className={`text-xs font-black uppercase tracking-widest transition-colors duration-300 ${isActive ? 'text-white' : 'text-zinc-500'}`}>
                  {step.label}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 lg:gap-16 items-center">

        {/* Left: AI Console */}
        <div className="space-y-8 order-2 lg:order-1 lg:col-span-2">
          <motion.div
            key={currentStep.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <h3 className="text-4xl font-bold text-white flex items-center gap-3">
              {currentStep.heading}
            </h3>
            <p className="text-lg text-zinc-400 font-sans">
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

            {/* Prompt */}
            <div className="space-y-6">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-zinc-500">
                  <Wand2 size={12} className="text-teal-400" /> AI Tool Input
                </div>
                <p className="font-mono text-zinc-300 text-sm leading-relaxed">
                  {DEMO_SCENARIO.prompt}
                  <motion.span
                    animate={{ opacity: [1, 0] }}
                    transition={{ repeat: Infinity, duration: 0.8 }}
                    className="inline-block w-2 h-4 ml-1 bg-teal-500 align-middle"
                  />
                </p>
              </div>

              {/* Progress Line */}
              <div className="pt-6 border-t border-white/10">
                <div className="flex justify-between items-end mb-2">
                  <span className="text-xs text-teal-400 font-mono flex items-center gap-2">
                    {progress < 100 ? <Loader2 size={12} className="animate-spin" /> : <CheckCircle2 size={12} />}
                    {currentStep.status}
                  </span>
                  <span className="text-xs text-zinc-500 font-mono">{progress}%</span>
                </div>
                <div className="h-1 w-full bg-zinc-800 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-teal-500"
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ ease: "linear" }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Preview Canvas */}
        <div className="order-1 lg:order-2 lg:col-span-3">
          <div className="relative aspect-video rounded-2xl overflow-hidden bg-zinc-900 shadow-2xl border border-white/10">

            {/* Before image (always present as base) */}
            <img
              src={DEMO_SCENARIO.beforeImage}
              alt="Property before"
              className="absolute inset-0 w-full h-full object-cover"
            />

            {/* Step 2: Processing overlay */}
            <AnimatePresence>
              {activeStep === 1 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.5 }}
                  className="absolute inset-0 flex items-center justify-center"
                >
                  {/* Scan line effect */}
                  <motion.div
                    className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-teal-400 to-transparent opacity-60"
                    animate={{ top: ['0%', '100%', '0%'] }}
                    transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }}
                  />
                  {/* Shimmer overlay */}
                  <div className="absolute inset-0 bg-gradient-to-br from-teal-500/10 via-transparent to-emerald-500/10" />
                  {/* Label */}
                  <div className="relative flex items-center gap-2 px-4 py-2 rounded-full bg-black/60 backdrop-blur-md border border-white/20">
                    <Sparkles size={14} className="text-teal-400" />
                    <span className="text-[11px] font-bold uppercase tracking-widest text-white">
                      AI Processing
                    </span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Step 3: After image crossfade */}
            <motion.div
              className="absolute inset-0"
              initial={{ opacity: 0 }}
              animate={{ opacity: activeStep >= 2 ? 1 : 0 }}
              transition={{ duration: 0.8 }}
            >
              <img
                src={DEMO_SCENARIO.afterImage}
                alt="Property after AI staging"
                className="w-full h-full object-cover"
              />
              {/* Success badge */}
              <AnimatePresence>
                {activeStep === 2 && (
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 1.1, opacity: 0 }}
                    transition={{ delay: 0.3 }}
                    className="absolute inset-0 flex items-center justify-center pointer-events-none"
                  >
                    <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/80 backdrop-blur-md border border-emerald-400/30">
                      <CheckCircle2 size={14} className="text-white" />
                      <span className="text-[11px] font-bold uppercase tracking-widest text-white">
                        Complete
                      </span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>

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
