"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { Check, Package, Zap, Sparkles } from 'lucide-react';

const PLANS = [
  {
    name: "Free",
    price: "0",
    description: "Perfect for exploring the neural engine.",
    features: [
      "Watermarked previews",
      "Basic templates",
      "Standard queue",
      "720p exports"
    ],
    cta: "Start Free",
    highlight: false
  },
  {
    name: "Creator",
    price: "19",
    description: "Scale your creative output with HD results.",
    features: [
      "HD exports (No Watermark)",
      "Faster rendering queue",
      "Creator template packs",
      "Commercial use license",
      "Cloud storage (5GB)"
    ],
    cta: "Go Creator",
    highlight: true // Triggers the "Most Popular" style
  },
  {
    name: "Pro Studio",
    price: "49",
    description: "Cinema-grade tools for agencies and teams.",
    features: [
      "4K Cinema exports",
      "Priority queue",
      "All industry template packs",
      "Team-ready presets",
      "API Access"
    ],
    cta: "Go Pro",
    highlight: false
  }
];

// Credit Packs from your reference design
const CREDIT_PACKS = [
  { credits: 10, price: 12 },
  { credits: 25, price: 25 },
  { credits: 60, price: 49 },
];

export const PricingSection = () => {
  return (
    <div className="max-w-7xl mx-auto px-6 py-24">
      
      {/* 1. Header */}
      <div className="text-center mb-16 md:mb-24">
        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400 mb-4 block">
          PRICING
        </span>
        <h2 className="text-4xl md:text-6xl font-bold text-zinc-900 dark:text-white tracking-tighter leading-[1.1]">
          Start free. <br />
          <span className="font-serif italic text-zinc-400">Scale when you're ready.</span>
        </h2>
      </div>

      {/* 2. Subscription Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start mb-20">
        {PLANS.map((plan, idx) => (
          <motion.div
            key={plan.name}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            viewport={{ once: true }}
            className={`
              relative p-8 rounded-[2rem] transition-all duration-300 flex flex-col h-full
              ${plan.highlight 
                ? "bg-white dark:bg-zinc-900 border-2 border-indigo-600 shadow-2xl shadow-indigo-500/10 z-10 scale-105" 
                : "bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 hover:border-zinc-300"
              }
            `}
          >
            {/* "Most Popular" Badge */}
            {plan.highlight && (
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1.5 bg-indigo-600 text-white text-[10px] font-bold uppercase tracking-widest rounded-full border border-indigo-500 shadow-lg flex items-center gap-2">
                <Sparkles size={10} fill="currentColor" /> Most Popular
              </div>
            )}

            <div className="mb-8">
              <h3 className="text-xl font-bold text-zinc-900 dark:text-white mb-2">{plan.name}</h3>
              <div className="flex items-baseline gap-1">
                <span className="text-5xl font-bold text-zinc-900 dark:text-white tracking-tight">${plan.price}</span>
                <span className="text-sm text-zinc-500">/mo</span>
              </div>
              <p className="mt-4 text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">
                {plan.description}
              </p>
            </div>

            <ul className="space-y-4 mb-8 flex-grow">
              {plan.features.map((feature) => (
                <li key={feature} className="flex items-start gap-3 text-sm text-zinc-600 dark:text-zinc-300">
                  <Check size={16} className={`flex-shrink-0 mt-0.5 ${plan.highlight ? 'text-indigo-500' : 'text-zinc-400'}`} />
                  <span className="leading-tight">{feature}</span>
                </li>
              ))}
            </ul>

            <button 
              className={`
                w-full py-4 rounded-xl text-xs font-bold uppercase tracking-widest transition-all
                ${plan.highlight 
                  ? "bg-zinc-900 dark:bg-white text-white dark:text-black hover:bg-zinc-800 dark:hover:bg-zinc-200 shadow-lg" 
                  : "bg-white dark:bg-transparent border border-zinc-200 dark:border-white/20 text-zinc-900 dark:text-white hover:bg-zinc-50 dark:hover:bg-white/5"
                }
              `}
            >
              {plan.cta}
            </button>
          </motion.div>
        ))}
      </div>

      {/* 3. Credit System Add-on (Pay-As-You-Go) */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="max-w-4xl mx-auto p-2 bg-white dark:bg-zinc-900 rounded-[2.5rem] border border-zinc-200 dark:border-white/10 shadow-xl"
      >
        <div className="flex flex-col md:flex-row items-center p-6 md:p-10 gap-8">
          
          {/* Left: Info */}
          <div className="flex items-center gap-6 flex-1">
            <div className="w-16 h-16 rounded-2xl bg-zinc-100 dark:bg-white/5 flex items-center justify-center text-zinc-400 border border-zinc-200 dark:border-white/5">
              <Package size={32} strokeWidth={1.5} />
            </div>
            <div>
              <h4 className="text-lg font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                Need extra bandwidth?
              </h4>
              <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
                Top up with credits for high-fidelity rendering without a subscription.
              </p>
            </div>
          </div>

          {/* Right: Credit Packs */}
          <div className="flex gap-4">
            {CREDIT_PACKS.map((pack) => (
              <button 
                key={pack.credits}
                className="flex flex-col items-center justify-center w-28 h-28 rounded-2xl border border-zinc-200 dark:border-white/10 bg-white dark:bg-black hover:border-indigo-500 dark:hover:border-indigo-500 transition-all group hover:scale-105 hover:shadow-lg cursor-pointer"
              >
                <span className="text-[10px] font-bold uppercase text-zinc-400 group-hover:text-indigo-500 mb-1 transition-colors">
                  {pack.credits} Credits
                </span>
                <span className="text-2xl font-bold text-zinc-900 dark:text-white">
                  ${pack.price}
                </span>
              </button>
            ))}
          </div>

        </div>
      </motion.div>

    </div>
  );
};