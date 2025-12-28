
"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { Check, Sparkles, Zap, Shield, Rocket } from 'lucide-react';

interface PricingFeature {
  text: string;
  included: boolean;
}

interface PricingPlan {
  name: string;
  price: string;
  description: string;
  features: PricingFeature[];
  cta: string;
  isPopular?: boolean;
}

const PLANS: PricingPlan[] = [
  {
    name: "Free",
    price: "0",
    description: "Perfect for exploring the neural engine.",
    cta: "Start for Free",
    features: [
      { text: "Up to 3 generations per day", included: true },
      { text: "Standard motion models", included: true },
      { text: "720p HD exports", included: true },
      { text: "Community support", included: true },
      { text: "Photophia Watermark", included: false },
      { text: "Pro Template Access", included: false },
    ]
  },
  {
    name: "Pro Studio",
    price: "29",
    description: "For professionals scaling their creative output.",
    cta: "Go Pro Now",
    isPopular: true,
    features: [
      { text: "Unlimited generations", included: true },
      { text: "Exclusive Pro-only models", included: true },
      { text: "4K Cinema exports", included: true },
      { text: "Priority rendering queue", included: true },
      { text: "No Watermarks", included: true },
      { text: "All 200+ Template Packs", included: true },
    ]
  }
];

// Fixed TypeScript error by making children optional in the props type.
const ShimmerButton = ({ children, className = "" }: { children?: React.ReactNode, className?: string }) => {
  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={`relative group overflow-hidden px-12 py-5 rounded-2xl bg-white text-black text-sm font-black uppercase tracking-widest transition-all ${className}`}
    >
      <span className="relative z-10 flex items-center gap-3">
        {children}
      </span>
      {/* Shimmer Effect */}
      <motion.div
        initial={{ x: "-100%" }}
        animate={{ x: "100%" }}
        transition={{
          repeat: Infinity,
          duration: 2.5,
          ease: "linear",
          repeatDelay: 1
        }}
        className="absolute inset-y-0 w-24 bg-gradient-to-r from-transparent via-white/40 to-transparent skew-x-12"
      />
    </motion.button>
  );
};

export const PricingCTA: React.FC = () => {
  return (
    <section id="pricing" className="relative py-32 md:py-48 bg-[#09090b] overflow-hidden scroll-mt-20">
      {/* Ambient background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[600px] bg-violet-600/5 blur-[160px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="text-center mb-24">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex items-center justify-center gap-3 mb-6"
          >
            <div className="w-8 h-px bg-zinc-800" />
            <span className="text-[10px] font-bold uppercase tracking-[0.5em] text-zinc-500">Transparent Pricing</span>
            <div className="w-8 h-px bg-zinc-800" />
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-7xl font-bold text-white tracking-tighter"
          >
            Choose your <span className="text-zinc-500 italic">velocity.</span>
          </motion.h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto mb-24">
          {PLANS.map((plan, idx) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.2 }}
              className={`
                relative flex flex-col p-10 rounded-[40px] border transition-all duration-500
                ${plan.isPopular 
                  ? "bg-white/[0.03] border-violet-500/30 shadow-[0_32px_64px_-16px_rgba(139,92,246,0.1)] scale-105" 
                  : "bg-zinc-900/40 border-white/5 hover:border-white/10"
                }
              `}
            >
              {plan.isPopular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-full bg-violet-600 text-[10px] font-black text-white uppercase tracking-widest">
                  Most Popular
                </div>
              )}

              <div className="mb-8">
                <h3 className="text-xl font-bold text-white mb-2 tracking-tight">{plan.name}</h3>
                <p className="text-zinc-500 text-sm font-sans">{plan.description}</p>
              </div>

              <div className="mb-10 flex items-baseline gap-1">
                <span className="text-5xl md:text-6xl font-bold text-white tracking-tighter">${plan.price}</span>
                <span className="text-zinc-500 font-medium">/mo</span>
              </div>

              <div className="space-y-4 mb-12 flex-grow">
                {plan.features.map((feature) => (
                  <div key={feature.text} className={`flex items-start gap-3 text-sm ${feature.included ? 'text-zinc-300' : 'text-zinc-600'}`}>
                    <div className={`mt-0.5 rounded-full p-0.5 ${feature.included ? 'bg-violet-500/20 text-violet-400' : 'bg-zinc-800 text-zinc-700'}`}>
                      <Check size={14} />
                    </div>
                    {feature.text}
                  </div>
                ))}
              </div>

              <button className={`
                w-full py-4 rounded-2xl text-xs font-black uppercase tracking-widest transition-all
                ${plan.isPopular 
                  ? "bg-violet-600 text-white hover:bg-violet-500 hover:shadow-xl hover:shadow-violet-600/20" 
                  : "bg-zinc-800 text-zinc-300 hover:bg-zinc-700 hover:text-white"
                }
              `}>
                {plan.cta}
              </button>
            </motion.div>
          ))}
        </div>

        {/* Master CTA */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="relative rounded-[48px] overflow-hidden p-12 md:p-20 border border-white/5 bg-gradient-to-br from-white/[0.02] to-transparent backdrop-blur-3xl text-center"
        >
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-violet-500/50 to-transparent" />
          
          <div className="max-w-3xl mx-auto">
            <h3 className="text-3xl md:text-5xl font-bold text-white tracking-tighter mb-8">
              The future of motion is <br className="hidden md:block" />
              <span className="text-violet-500 italic">one prompt away.</span>
            </h3>
            
            <p className="text-zinc-400 text-lg mb-12 font-sans leading-relaxed">
              Join 12,000+ creators pushing the boundaries of cinematic generative AI. 
              No commitment, cancel anytime.
            </p>

            <div className="flex flex-col items-center gap-6">
              <ShimmerButton className="shadow-2xl shadow-white/10">
                Launch Photophia Studio <Rocket size={18} />
              </ShimmerButton>
              
              <div className="flex flex-wrap justify-center gap-8 opacity-40 grayscale">
                <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-white">
                  <Shield size={14} /> Encrypted
                </div>
                <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-white">
                  <Zap size={14} /> Instant Access
                </div>
                <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-white">
                  <Sparkles size={14} /> Pro Models
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      <style>{`
        #pricing {
          background-image: 
            radial-gradient(circle at 50% 100%, #1e1b4b 0%, transparent 40%);
        }
      `}</style>
    </section>
  );
};
