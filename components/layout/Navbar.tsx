"use client";

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Menu, X, ChevronDown } from 'lucide-react';
import { createClient } from '../../lib/database/client';
import { AuthButton } from '../common/AuthButton';

const PRIMARY_NAV = [
  { name: 'Tools', id: 'workflow' },
  { name: 'Showcase', id: 'showcase' },
  { name: 'Pricing', id: 'pricing' },
  { name: 'Templates', id: 'templates' },
];

const SECONDARY_NAV = [
  { name: 'FAQ', id: 'faq' },
];

const ALL_NAV_IDS = [...PRIMARY_NAV, ...SECONDARY_NAV].map(item => item.id);

export const Navbar: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeId, setActiveId] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [user, setUser] = useState<any>(null);

  const navigate = useNavigate();
  const supabase = createClient();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
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
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-[100] transition-all duration-500">
      <motion.nav
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className={`
          flex items-center justify-between w-full px-8 md:px-14 transition-all duration-500
          ${isScrolled
            ? "py-4 bg-white/80 dark:bg-black/70 backdrop-blur-xl border-b border-zinc-200 dark:border-white/5"
            : "py-6 md:py-8 bg-transparent"
          }
        `}
      >
        {/* ── Logo (left) ── */}
        <div
          className="flex items-center gap-2 cursor-pointer flex-shrink-0"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        >
          <img
            src="/logo.png"
            alt="Photovid"
            className="h-14 md:h-16 w-auto"
          />
        </div>

        {/* ── Centered Nav Links ── */}
        <div className="hidden lg:flex items-center gap-10 absolute left-1/2 -translate-x-1/2">
          {PRIMARY_NAV.map((item) => (
            <button
              key={item.id}
              onClick={() => scrollToSection(item.id)}
              className={`
                text-base font-medium transition-all duration-300 relative py-1
                ${activeId === item.id
                  ? 'text-zinc-900 dark:text-white'
                  : 'text-zinc-600 hover:text-zinc-900 dark:text-white/60 dark:hover:text-white'
                }
              `}
            >
              {item.name}
              {activeId === item.id && (
                <motion.div
                  layoutId="navUnderline"
                  className="absolute -bottom-1 left-0 right-0 h-px bg-zinc-400 dark:bg-white/60"
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                />
              )}
            </button>
          ))}

          {SECONDARY_NAV.length > 0 && (
            <button
              onClick={() => scrollToSection(SECONDARY_NAV[0].id)}
              className={`
                text-base font-medium transition-all duration-300 py-1
                ${activeId === SECONDARY_NAV[0].id
                  ? 'text-zinc-900 dark:text-white'
                  : 'text-zinc-600 hover:text-zinc-900 dark:text-white/60 dark:hover:text-white'
                }
              `}
            >
              {SECONDARY_NAV[0].name}
            </button>
          )}
        </div>

        {/* ── Right Side: Auth + Mobile Menu ── */}
        <div className="flex items-center gap-4 flex-shrink-0">
          {/* Sign In */}
          <button
            onClick={() => navigate(user ? '/studio' : '/login')}
            className="hidden sm:inline-flex text-base font-medium text-zinc-600 hover:text-zinc-900 dark:text-white/70 dark:hover:text-white transition-colors px-5 py-2.5"
          >
            {user ? 'Dashboard' : 'Sign In'}
          </button>

          {/* Primary CTA */}
          <button
            onClick={() => navigate(user ? '/studio/real-estate' : '/studio')}
            className="hidden sm:inline-flex items-center gap-2 px-7 py-2.5 bg-zinc-900 text-white dark:bg-white dark:text-black text-base font-semibold rounded-full hover:bg-zinc-800 dark:hover:bg-white/90 transition-all duration-300"
          >
            Start For Free
          </button>

          {/* Mobile Menu Toggle */}
          <button
            className="lg:hidden p-2 rounded-full text-zinc-700 dark:text-white hover:bg-zinc-100 dark:hover:bg-white/10 transition-colors"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </motion.nav>

      {/* ── Mobile Menu ── */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="fixed top-16 left-0 right-0 bg-white/95 dark:bg-black/95 backdrop-blur-xl border-b border-zinc-200 dark:border-white/10 lg:hidden z-[90]"
          >
            <div className="flex flex-col px-6 py-6 gap-1">
              {[...PRIMARY_NAV, ...SECONDARY_NAV].map((item) => (
                <button
                  key={item.id}
                  onClick={() => scrollToSection(item.id)}
                  className={`
                    text-left px-4 py-3 rounded-xl text-base font-medium transition-all
                    ${activeId === item.id
                      ? 'text-zinc-900 bg-zinc-100 dark:text-white dark:bg-white/10'
                      : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-50 dark:text-white/60 dark:hover:text-white dark:hover:bg-white/5'
                    }
                  `}
                >
                  {item.name}
                </button>
              ))}
              <div className="h-px bg-zinc-200 dark:bg-white/10 my-3" />
              <button
                onClick={() => {
                  navigate(user ? '/studio' : '/login');
                  setIsMobileMenuOpen(false);
                }}
                className="w-full py-3 rounded-full bg-zinc-900 text-white dark:bg-white dark:text-black font-semibold text-sm transition-all active:scale-95"
              >
                {user ? 'Launch Studio' : 'Start For Free'}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};
