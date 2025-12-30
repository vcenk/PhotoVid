"use client";

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, ChevronDown, Sun, Moon } from 'lucide-react';
import { createClient } from '../../lib/supabase/client';
import { AuthButton } from '../AuthButton';
import { useTheme } from '../theme/ThemeProvider';

const PRIMARY_NAV = [
  { name: 'Home', id: 'hero-start' },
  { name: 'Industries', id: 'use-cases' },
  { name: 'Showcase', id: 'showcase' },
];

const SECONDARY_NAV = [
  { name: 'Workflow', id: 'workflow' },
  { name: 'Presets', id: 'presets' },
  { name: 'Templates', id: 'templates' },
  { name: 'Pricing', id: 'pricing' },
  { name: 'FAQ', id: 'faq' },
];

const ALL_NAV_IDS = [...PRIMARY_NAV, ...SECONDARY_NAV].map(item => item.id);

export const Navbar: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeId, setActiveId] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMoreOpen, setIsMoreOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  
  const moreDropdownRef = useRef<HTMLDivElement>(null);
  const { theme, toggleTheme } = useTheme();
  const supabase = createClient();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    let subscription: { unsubscribe: () => void } | null = null;
    if (supabase) {
      const getUser = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        setUser(user);
      };
      getUser();

      const { data } = supabase.auth.onAuthStateChange((_event, session) => {
        setUser(session?.user ?? null);
      });
      subscription = data.subscription;
    }
    return () => {
      if (subscription) subscription.unsubscribe();
    };
  }, [supabase]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (moreDropdownRef.current && !moreDropdownRef.current.contains(event.target as Node)) {
        setIsMoreOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const observerOptions = {
      root: null,
      rootMargin: '-20% 0px -60% 0px',
      threshold: 0,
    };

    const observerCallback = (entries: IntersectionObserverEntry[]) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setActiveId(entry.target.id);
        }
      });
    };

    const observer = new IntersectionObserver(observerCallback, observerOptions);
    ALL_NAV_IDS.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setIsMobileMenuOpen(false);
      setIsMoreOpen(false);
    }
  };

  const isSecondaryActive = SECONDARY_NAV.some(item => item.id === activeId);

  const getTextColor = (isActive: boolean) => {
    if (!isScrolled) {
      return isActive ? "text-white" : "text-zinc-300 hover:text-white";
    }
    if (isActive) {
      return "text-indigo-600 dark:text-white";
    }
    return "text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white";
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-[100] flex justify-center p-4 md:p-8 transition-all duration-500 pointer-events-none">
      <motion.nav
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className={`
          pointer-events-auto flex items-center justify-between w-full transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]
          ${isScrolled 
            ? "max-w-6xl px-6 md:px-10 py-4 md:py-5 rounded-3xl bg-white/80 dark:bg-zinc-950/80 backdrop-blur-2xl border border-zinc-200 dark:border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.1)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.4)]" 
            : "max-w-none px-8 md:px-12 py-10 bg-transparent border-transparent"
          }
        `}
      >
        <div 
          className="flex items-center gap-2 cursor-pointer group" 
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        >
          <div className={`text-2xl md:text-4xl font-black tracking-tighter transition-colors duration-500 ${isScrolled ? 'text-zinc-900 dark:text-white' : 'text-white'}`}>
            PHOTOVID<span className="text-indigo-500 transition-transform group-hover:scale-125 inline-block">.</span>
          </div>
        </div>

        <div className="hidden lg:flex items-center space-x-10">
          {PRIMARY_NAV.map((item) => (
            <button
              key={item.id}
              onClick={() => scrollToSection(item.id)}
              className={`
                text-sm md:text-base font-black uppercase tracking-[0.2em] transition-all relative py-2
                ${getTextColor(activeId === item.id)}
              `}
            >
              {item.name}
              {activeId === item.id && (
                <motion.div
                  layoutId="activeUnderline"
                  className="absolute bottom-0 left-0 right-0 h-1 rounded-full bg-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.4)]"
                />
              )}
            </button>
          ))}

          <div className="relative" ref={moreDropdownRef}>
            <button
              onClick={() => setIsMoreOpen(!isMoreOpen)}
              className={`
                text-sm md:text-base font-black uppercase tracking-[0.2em] transition-all relative py-2 flex items-center gap-2
                ${getTextColor(isSecondaryActive || isMoreOpen)}
              `}
            >
              Explore <ChevronDown size={18} className={`transition-transform duration-300 ${isMoreOpen ? 'rotate-180' : ''}`} />
            </button>

            <AnimatePresence>
              {isMoreOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="absolute top-full right-0 mt-6 w-64 py-4 rounded-[2rem] bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-white/10 shadow-2xl flex flex-col overflow-hidden p-2 ring-1 ring-black/5"
                >
                  {SECONDARY_NAV.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => scrollToSection(item.id)}
                      className={`
                        px-8 py-4 text-xs font-black uppercase tracking-widest text-left rounded-2xl transition-all
                        ${activeId === item.id 
                          ? "text-indigo-600 dark:text-white bg-zinc-100 dark:bg-white/10" 
                          : "text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white hover:bg-zinc-50 dark:hover:bg-white/5"
                        }
                      `}
                    >
                      {item.name}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <button 
             onClick={toggleTheme}
             className={`p-2 rounded-full transition-colors ${
               !isScrolled 
                 ? 'text-white hover:bg-white/10' 
                 : 'text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/10'
             }`}
             aria-label="Toggle Dark Mode"
          >
            {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
          </button>
        </div>

        <div className="flex items-center gap-4 md:gap-6">
          <div className="hidden sm:block">
            <AuthButton user={user} isScrolled={isScrolled} />
          </div>

          <button 
            className={`lg:hidden p-3 rounded-full transition-colors ${
              !isScrolled 
                ? 'text-white hover:bg-white/10' 
                : 'text-zinc-900 hover:bg-zinc-100 dark:text-white dark:hover:bg-white/10'
            }`}
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
          >
            {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>
      </motion.nav>

      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.98 }}
            className="fixed top-24 left-4 right-4 mx-auto max-w-md p-8 rounded-[2.5rem] bg-white/95 dark:bg-zinc-950/95 backdrop-blur-3xl border border-zinc-200 dark:border-white/10 shadow-[0_30px_100px_rgba(0,0,0,0.3)] lg:hidden pointer-events-auto max-h-[80vh] overflow-y-auto z-[90]"
          >
            <div className="flex justify-end mb-6">
               <button 
                 onClick={toggleTheme}
                 className="flex items-center gap-2 px-4 py-2 rounded-full bg-zinc-100 dark:bg-zinc-900 text-zinc-900 dark:text-white text-xs font-bold uppercase tracking-widest border border-transparent dark:border-white/10"
               >
                 {theme === 'dark' ? <><Sun size={14}/> Light Mode</> : <><Moon size={14}/> Dark Mode</>}
               </button>
            </div>

            <div className="flex flex-col gap-6">
              {[...PRIMARY_NAV, ...SECONDARY_NAV].map((item) => (
                <button
                  key={item.id}
                  onClick={() => scrollToSection(item.id)}
                  className={`
                    text-2xl font-black uppercase tracking-tight text-left py-2
                    ${activeId === item.id 
                      ? "text-indigo-600 dark:text-white" 
                      : "text-zinc-500 hover:text-zinc-900 dark:text-zinc-500 dark:hover:text-white"
                    }
                  `}
                >
                  {item.name}
                </button>
              ))}
              <div className="h-px bg-zinc-200 dark:bg-white/5 my-4" />
              <button 
                onClick={() => user ? scrollToSection('studio') : scrollToSection('login')}
                className="w-full py-6 rounded-[2rem] bg-zinc-900 dark:bg-white text-white dark:text-black font-black text-sm uppercase tracking-[0.2em] shadow-xl active:scale-95 transition-all"
              >
                {user ? 'Launch Studio' : 'Get Started Now'}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};