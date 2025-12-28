
"use client";

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useInView } from 'framer-motion';
import { 
  Users, 
  Home, 
  ShoppingBag, 
  Utensils, 
  Briefcase, 
  Zap, 
  Layers, 
  CheckCircle2,
  ArrowRight
} from 'lucide-react';

interface Persona {
  id: string;
  title: string;
  description: string;
  icon: any;
  image: string;
  benefit: string;
}

const PERSONAS: Persona[] = [
  {
    id: "creators",
    title: "Content Creators",
    description: "Turn photos into scroll-stopping Reels, Shorts, and TikToks with zero editing overhead.",
    icon: Users,
    benefit: "Scroll-stopping motion",
    image: "https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?auto=format&fit=crop&q=80&w=1200"
  },
  {
    id: "real-estate",
    title: "Real Estate",
    description: "Produce cinematic walkthroughs from still photos. Bring property listings to life instantly.",
    icon: Home,
    benefit: "Listing-ready visuals",
    image: "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&q=80&w=1200"
  },
  {
    id: "ecommerce",
    title: "E-commerce Brands",
    description: "Dynamic product motion ads without expensive reshoots. Optimized for conversion.",
    icon: ShoppingBag,
    benefit: "Ad-ready exports",
    image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=1200"
  },
  {
    id: "food",
    title: "Restaurants & Cafés",
    description: "Mouth-watering food motion content that sells instantly on social media platforms.",
    icon: Utensils,
    benefit: "Sizzle-reel quality",
    image: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&q=80&w=1200"
  },
  {
    id: "agencies",
    title: "Creative Agencies",
    description: "Produce high-end client visuals 10× faster. Scale content production without scaling staff.",
    icon: Briefcase,
    benefit: "10x production speed",
    image: "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=1200"
  }
];

interface PersonaCardProps {
  persona: Persona;
  isActive: boolean;
  onInView: () => void;
}

/**
 * PersonaCard Component
 * Fixed typing to resolve 'key' prop assignment issues.
 */
const PersonaCard: React.FC<PersonaCardProps> = ({ persona, isActive, onInView }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { amount: 0.6 });

  useEffect(() => {
    if (isInView) onInView();
  }, [isInView, onInView]);

  return (
    <motion.div
      ref={ref}
      animate={{ 
        opacity: isActive ? 1 : 0.3,
        scale: isActive ? 1 : 0.95,
        x: isActive ? 0 : -10
      }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className={`
        relative p-8 md:p-10 rounded-[32px] border transition-all duration-500
        ${isActive 
          ? "bg-white/[0.03] border-violet-500/30 shadow-[0_20px_50px_rgba(139,92,246,0.1)]" 
          : "bg-transparent border-white/5"
        }
      `}
    >
      <div className="flex items-center gap-6 mb-6">
        <div className={`p-4 rounded-2xl ${isActive ? 'bg-violet-600 text-white' : 'bg-zinc-900 text-zinc-600'} transition-colors duration-500`}>
          <persona.icon size={28} />
        </div>
        <div>
          <h3 className={`text-xl md:text-2xl font-bold tracking-tight ${isActive ? 'text-white' : 'text-zinc-500'}`}>
            {persona.title}
          </h3>
          <span className={`text-[10px] font-black uppercase tracking-widest ${isActive ? 'text-violet-400' : 'text-zinc-700'}`}>
            {persona.benefit}
          </span>
        </div>
      </div>
      <p className={`text-base md:text-lg leading-relaxed font-sans ${isActive ? 'text-zinc-300' : 'text-zinc-600'}`}>
        {persona.description}
      </p>
      
      {/* Mobile-only Preview Image */}
      <div className="mt-8 md:hidden overflow-hidden rounded-2xl aspect-video bg-zinc-900 border border-white/5">
        <img src={persona.image} className="w-full h-full object-cover opacity-60" alt={persona.title} />
      </div>
    </motion.div>
  );
};

export const UseCases: React.FC = () => {
  const [activePersona, setActivePersona] = useState(PERSONAS[0]);
  const containerRef = useRef(null);

  return (
    <section id="use-cases" ref={containerRef} className="relative py-24 md:py-48 bg-[#09090b] overflow-hidden scroll-mt-20">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-violet-600/5 blur-[120px] rounded-full -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
      
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-24">
          
          {/* LEFT COLUMN: Sticky Info & Preview */}
          <div className="lg:col-span-5 lg:sticky lg:top-32 lg:h-fit">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="space-y-8"
            >
              <div className="space-y-4">
                <span className="text-[10px] font-bold uppercase tracking-[0.5em] text-zinc-500">WHO IT’S FOR</span>
                <h2 className="text-4xl md:text-6xl font-bold text-white tracking-tighter leading-[1.1]">
                  Creators first. <br />
                  <span className="text-zinc-500 italic">Results everywhere.</span>
                </h2>
                <p className="text-lg md:text-xl text-zinc-400 font-sans leading-relaxed max-w-md">
                  Photophia is built for creators who want cinematic motion without timelines, plugins, or learning curves.
                </p>
              </div>

              {/* Bullet Points */}
              <div className="space-y-6 pt-4">
                {[
                  { icon: Zap, text: "No editing timelines" },
                  { icon: Layers, text: "Industry-ready presets" },
                  { icon: CheckCircle2, text: "Publish-ready in seconds" }
                ].map((item, i) => (
                  <motion.div 
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 + (i * 0.1) }}
                    className="flex items-center gap-4 group"
                  >
                    <div className="p-2 rounded-lg bg-white/5 border border-white/10 text-violet-500 group-hover:scale-110 transition-transform">
                      <item.icon size={18} />
                    </div>
                    <span className="text-sm font-bold text-zinc-300 uppercase tracking-widest">{item.text}</span>
                  </motion.div>
                ))}
              </div>

              {/* Dynamic Preview Frame (Desktop) */}
              <div className="hidden lg:block pt-12">
                <div className="relative aspect-[16/10] w-full rounded-[32px] overflow-hidden border border-white/10 bg-zinc-900 group">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={activePersona.id}
                      initial={{ opacity: 0, scale: 1.1 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                      className="absolute inset-0"
                    >
                      <img 
                        src={activePersona.image} 
                        className="w-full h-full object-cover opacity-60"
                        alt={activePersona.title} 
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/80 via-transparent to-transparent" />
                      
                      {/* Active Indicator Overlay */}
                      <div className="absolute bottom-8 left-8 flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center text-white">
                          <activePersona.icon size={20} />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-white uppercase tracking-widest">{activePersona.title} Output</p>
                          <p className="text-[10px] text-zinc-400">Cinematic Motion • 4K Export</p>
                        </div>
                      </div>
                    </motion.div>
                  </AnimatePresence>
                </div>
              </div>
            </motion.div>
          </div>

          {/* RIGHT COLUMN: Scrollable Persona Cards */}
          <div className="lg:col-span-7 space-y-8 md:space-y-12">
            {PERSONAS.map((persona) => (
              <PersonaCard 
                key={persona.id} 
                persona={persona} 
                isActive={activePersona.id === persona.id}
                onInView={() => setActivePersona(persona)}
              />
            ))}

            {/* Final CTA Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              className="p-12 rounded-[40px] bg-gradient-to-br from-violet-600 to-indigo-600 flex flex-col md:flex-row items-center justify-between gap-8 shadow-2xl shadow-violet-600/20"
            >
              <div className="space-y-2">
                <h4 className="text-2xl font-bold text-white tracking-tight">Ready to see your niche?</h4>
                <p className="text-white/70 text-sm font-sans">Join 12,000+ creators scaling their vision with neural motion.</p>
              </div>
              <button className="whitespace-nowrap rounded-full bg-white text-black px-10 py-4 text-sm font-bold flex items-center gap-3 hover:scale-105 transition-all active:scale-95 shadow-xl shadow-white/10">
                Launch Studio <ArrowRight size={18} />
              </button>
            </motion.div>
          </div>

        </div>
      </div>
    </section>
  );
};
