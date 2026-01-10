
"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  ChevronDown, 
  ShieldCheck, 
  CreditCard, 
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
    question: "Do I need video editing skills?",
    answer: "Not at all. Photovid replaces complex timelines and keyframes with simplified neural workflows. You describe the vision, and our engine handles the technical rendering."
  },
  {
    question: "What are templates and industry packs?",
    answer: "These are professional prompt presets and motion models optimized for specific industries like Real Estate or E-commerce."
  },
  {
    question: "How do credits work?",
    answer: "Credits are only utilized for high-fidelity final renders. Standard previews are lower cost, ensuring efficient project iteration."
  },
  {
    question: "Can I use it for Real Estate listings?",
    answer: "Yes, our Real Estate pack is optimized for interior pans and exterior sweeps, ideal for high-end property marketing."
  }
];

interface AccordionItemProps {
  item: FaqItem;
  isOpen: boolean;
  onClick: () => void;
}

const AccordionItem: React.FC<AccordionItemProps> = ({ item, isOpen, onClick }) => {
  return (
    <div className={`border-b border-zinc-100 last:border-0 overflow-hidden transition-colors ${isOpen ? 'bg-zinc-50' : ''}`}>
      <button 
        onClick={onClick}
        className="w-full py-6 flex items-center justify-between text-left group px-4"
      >
        <span className={`text-base md:text-lg font-bold transition-colors ${isOpen ? 'text-zinc-900' : 'text-zinc-400 group-hover:text-zinc-600'}`}>
          {item.question}
        </span>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          className={`p-2 rounded-full transition-colors ${isOpen ? 'bg-indigo-600 text-white' : 'text-zinc-300'}`}
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
            <div className="pb-6 px-4 text-zinc-600 font-sans leading-relaxed pr-12">
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

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <section id="faq" className="relative py-24 md:py-40 bg-zinc-50 overflow-hidden border-t border-zinc-200">
      <div className="max-w-6xl mx-auto px-6 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-24 items-start mb-32">
          
          <div className="lg:col-span-7">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mb-12"
            >
              <span className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-400 mb-4 block">COMMON QUESTIONS</span>
              <h2 className="text-4xl md:text-5xl font-bold text-zinc-900 tracking-tighter font-serif">
                Everything you need <br />
                <span className="text-zinc-400 italic">to know.</span>
              </h2>
            </motion.div>

            <div className="border-t border-zinc-200 bg-white rounded-[32px] shadow-lg shadow-zinc-100 overflow-hidden">
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

          <div className="lg:col-span-5 lg:sticky lg:top-32">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="p-10 rounded-[40px] border border-zinc-200 bg-white shadow-xl relative overflow-hidden"
            >
              <h3 className="text-xl font-bold text-zinc-900 mb-8 tracking-tight">Professional Standards</h3>
              
              <div className="space-y-8">
                {[
                  { icon: ShieldCheck, title: "Commercial-ready", desc: "All outputs carry professional usage rights." },
                  { icon: Lock, title: "Secure systems", desc: "Stripe-powered transactions with encryption." },
                  { icon: Zap, title: "Optimized speed", desc: "Distributed rendering for rapid asset delivery." }
                ].map((item, idx) => (
                  <div key={idx} className="flex gap-5 group">
                    <div className="p-3 rounded-2xl bg-zinc-50 border border-zinc-100 text-indigo-600 group-hover:scale-110 transition-transform">
                      <item.icon size={22} />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-zinc-900 mb-1">{item.title}</h4>
                      <p className="text-xs text-zinc-500 font-sans leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-12 pt-10 border-t border-zinc-100 flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-zinc-50 flex items-center justify-center text-zinc-400">
                  <MessageCircle size={18} />
                </div>
                <div>
                  <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Support Access</p>
                  <a href="mailto:support@photovid.ai" className="text-sm font-bold text-zinc-900 hover:text-indigo-600 transition-colors">Contact Support</a>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        <motion.div 
          id="get-started"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative group rounded-[60px] overflow-hidden p-12 md:p-24 text-center border border-zinc-200 bg-white shadow-2xl shadow-zinc-200"
        >
          <div className="relative z-10 max-w-3xl mx-auto">
            <motion.div
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-50 border border-indigo-100 text-xs font-bold text-indigo-600 mb-10"
            >
              <Sparkles size={14} /> Neural Engine v2.0
            </motion.div>
            
            <h2 className="text-5xl md:text-8xl font-bold text-zinc-900 tracking-tighter leading-[0.9] mb-10 font-serif">
              Launch <span className="italic text-zinc-500">Photovid</span> <br />
              Studio in seconds.
            </h2>
            
            <p className="text-lg md:text-xl text-zinc-600 font-sans mb-12 max-w-xl mx-auto">
              Professional motion assets, simplified for your creative workflow. No commitment required to start.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link 
                to="/login"
                className="w-full sm:w-auto px-12 py-5 rounded-full bg-zinc-900 text-white text-sm font-black uppercase tracking-widest shadow-xl hover:bg-black transition-all text-center"
              >
                Get Started Now
              </Link>
              <motion.button 
                onClick={() => scrollToSection('templates')}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="w-full sm:w-auto px-12 py-5 rounded-full border border-zinc-200 text-zinc-900 text-sm font-black uppercase tracking-widest bg-white hover:bg-zinc-50 transition-all flex items-center justify-center gap-2"
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
