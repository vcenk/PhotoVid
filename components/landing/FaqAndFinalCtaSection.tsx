"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  ChevronDown,
  ShieldCheck,
  Zap,
  ArrowRight,
  Sparkles,
  Lock,
  MessageCircle
} from 'lucide-react';

interface FaqItem {
  question: string;
  answer: string;
}

const FAQS: FaqItem[] = [
  {
    question: "Do I need design or editing skills?",
    answer: "Not at all. Upload a photo, pick an AI tool, and download the result. No Photoshop, no manual editing — everything is automated."
  },
  {
    question: "How realistic is the virtual staging?",
    answer: "Our AI generates photorealistic furniture and decor that matches the room's lighting, perspective, and style. Most viewers can't tell the difference from real staging."
  },
  {
    question: "How do credits work?",
    answer: "Each AI edit uses one credit. Free accounts get 5 per month. Paid plans include a monthly credit allowance, and you can always top up with credit packs if you need more."
  },
  {
    question: "Can I use the images commercially on MLS?",
    answer: "Yes. All paid plan exports are full-resolution, watermark-free, and licensed for commercial use including MLS, Zillow, Realtor.com, and marketing materials."
  },
  {
    question: "What photo formats and sizes are supported?",
    answer: "We accept JPG, PNG, and WebP up to 50MB. Output images match your input resolution, so upload the highest quality photo you have for best results."
  },
  {
    question: "Is there a team or brokerage plan?",
    answer: "Yes. The Brokerage plan supports up to 10 team seats with shared brand presets, watermarks, and usage analytics. Contact us for custom enterprise pricing."
  }
];

interface AccordionItemProps {
  item: FaqItem;
  isOpen: boolean;
  onClick: () => void;
}

const AccordionItem: React.FC<AccordionItemProps> = ({ item, isOpen, onClick }) => {
  return (
    <div className={`border-b border-white/5 last:border-0 overflow-hidden transition-colors ${isOpen ? 'bg-white/5' : ''}`}>
      <button
        onClick={onClick}
        className="w-full py-6 flex items-center justify-between text-left group px-6"
      >
        <span className={`text-base md:text-lg font-bold transition-colors ${isOpen ? 'text-white' : 'text-zinc-400 group-hover:text-zinc-200'}`}>
          {item.question}
        </span>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          className={`p-2 rounded-full transition-colors flex-shrink-0 ml-4 ${isOpen ? 'bg-teal-600 text-white' : 'text-zinc-500'}`}
        >
          <ChevronDown size={18} />
        </motion.div>
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
          >
            <div className="pb-6 px-6 text-zinc-400 font-sans leading-relaxed pr-16">
              {item.answer}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export const FaqAndFinalCtaSection: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section id="faq" className="relative py-24 md:py-40 bg-zinc-950 overflow-hidden">
      <div className="max-w-6xl mx-auto px-6 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-24 items-start mb-32">

          {/* Left: FAQ */}
          <div className="lg:col-span-7">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mb-12"
            >
              <span className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-500 mb-4 block">Common Questions</span>
              <h2 className="text-4xl md:text-5xl font-bold text-white tracking-tighter" style={{ fontFamily: "'Roboto', sans-serif" }}>
                Everything you need <br />
                <span className="text-zinc-400">to know.</span>
              </h2>
            </motion.div>

            <div className="border-t border-white/10 bg-zinc-900/50 rounded-[32px] border border-white/10 overflow-hidden">
              {FAQS.map((faq, i) => (
                <AccordionItem
                  key={i}
                  item={faq}
                  isOpen={openIndex === i}
                  onClick={() => setOpenIndex(openIndex === i ? null : i)}
                />
              ))}
            </div>
          </div>

          {/* Right: Trust sidebar */}
          <div className="lg:col-span-5 lg:sticky lg:top-32">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="p-10 rounded-[40px] border border-white/10 bg-zinc-900/50 relative overflow-hidden"
            >
              <h3 className="text-xl font-bold text-white mb-8 tracking-tight">Professional Standards</h3>

              <div className="space-y-8">
                {[
                  { icon: ShieldCheck, title: "MLS-ready quality", desc: "Full-resolution outputs that meet every listing platform's standards." },
                  { icon: Lock, title: "Secure & private", desc: "Your photos are encrypted and never used for AI training." },
                  { icon: Zap, title: "Instant processing", desc: "Most edits complete in under 10 seconds with priority queue." }
                ].map((item, idx) => (
                  <div key={idx} className="flex gap-5 group">
                    <div className="p-3 rounded-2xl bg-white/5 border border-white/10 text-teal-400 group-hover:scale-110 transition-transform">
                      <item.icon size={22} />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white mb-1">{item.title}</h4>
                      <p className="text-xs text-zinc-500 font-sans leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-12 pt-10 border-t border-white/10 flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-zinc-400">
                  <MessageCircle size={18} />
                </div>
                <div>
                  <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Need help?</p>
                  <a href="mailto:support@photovid.ai" className="text-sm font-bold text-white hover:text-teal-400 transition-colors">Contact Support</a>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Final CTA */}
        <motion.div
          id="get-started"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative group rounded-[60px] overflow-hidden p-12 md:p-24 text-center border border-white/10 bg-gradient-to-br from-zinc-900 to-zinc-900/50"
        >
          {/* Ambient glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-teal-600/10 rounded-full blur-[150px] pointer-events-none" />

          <div className="relative z-10 max-w-3xl mx-auto">
            <motion.div
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-bold text-zinc-400 mb-10"
            >
              <Sparkles size={14} className="text-teal-400" /> Free to start — no credit card required
            </motion.div>

            <h2 className="text-5xl md:text-8xl font-bold text-white tracking-tighter leading-[0.9] mb-10" style={{ fontFamily: "'Roboto', sans-serif" }}>
              Transform your <br />
              <span className="text-zinc-400">listings today.</span>
            </h2>

            <p className="text-lg md:text-xl text-zinc-400 font-sans mb-12 max-w-xl mx-auto">
              Join thousands of real estate professionals using AI to create listing-ready photos in seconds.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                to="/auth"
                className="w-full sm:w-auto px-12 py-5 rounded-full bg-gradient-to-r from-teal-500 to-emerald-500 text-white text-sm font-black uppercase tracking-widest shadow-xl shadow-teal-500/30 hover:shadow-2xl hover:shadow-teal-500/40 transition-all text-center"
              >
                Get Started Free
              </Link>
              <motion.button
                onClick={() => {
                  const el = document.getElementById('templates');
                  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="w-full sm:w-auto px-12 py-5 rounded-full border border-white/10 text-white text-sm font-black uppercase tracking-widest bg-white/5 hover:bg-white/10 transition-all flex items-center justify-center gap-2"
              >
                View Templates <ArrowRight size={16} />
              </motion.button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
