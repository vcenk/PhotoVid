"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Quote, Star, Play } from 'lucide-react';

interface Testimonial {
  id: number;
  name: string;
  role: string;
  company: string;
  avatar: string;
  content: string;
  rating: number;
  videoUrl?: string;
  companyLogo?: string;
}

const TESTIMONIALS: Testimonial[] = [
  {
    id: 1,
    name: "Sarah Mitchell",
    role: "Top Producer",
    company: "Keller Williams",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=150&auto=format&fit=crop",
    content: "I used to wait 3 days for a stager and photographer. Now I upload photos at 9am and have listing-ready images by 9:05. My clients can't believe how fast I move.",
    rating: 5,
  },
  {
    id: 2,
    name: "Marcus Rodriguez",
    role: "Founder & CEO",
    company: "PropertyVista",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=150&auto=format&fit=crop",
    content: "Our listings sell 40% faster with Photovid virtual staging. Empty rooms become furnished showpieces in seconds. We've cut our photo editing costs by 80%.",
    rating: 5,
  },
  {
    id: 3,
    name: "Emily Watson",
    role: "RE Photographer",
    company: "Watson Photography",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=150&auto=format&fit=crop",
    content: "I shoot 5 properties a day and Photovid handles all the post-processing. Sky replacements, HDR merge, twilight conversions — what took me hours now takes minutes.",
    rating: 5,
  },
  {
    id: 4,
    name: "David Park",
    role: "Managing Broker",
    company: "Compass",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=150&auto=format&fit=crop",
    content: "We rolled Photovid out to our entire team of 120 agents. The consistency in listing quality has been remarkable. Every property looks like it had a professional shoot.",
    rating: 5,
  },
  {
    id: 5,
    name: "Jessica Liu",
    role: "Property Manager",
    company: "Greystar",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=150&auto=format&fit=crop",
    content: "Managing 200+ rental units means constant turnover photos. Photovid's declutter and staging tools make every vacancy look move-in ready without staging a single room.",
    rating: 5,
  },
];

const COMPANY_LOGOS = [
  { name: 'Inman', logo: 'Inman' },
  { name: 'Realtor.com', logo: 'Realtor.com' },
  { name: 'HousingWire', logo: 'HousingWire' },
  { name: 'The Real Deal', logo: 'The Real Deal' },
];

export const TestimonialsCarousel: React.FC = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [direction, setDirection] = useState(0);

  const nextSlide = useCallback(() => {
    setDirection(1);
    setActiveIndex((prev) => (prev + 1) % TESTIMONIALS.length);
  }, []);

  const prevSlide = useCallback(() => {
    setDirection(-1);
    setActiveIndex((prev) => (prev - 1 + TESTIMONIALS.length) % TESTIMONIALS.length);
  }, []);

  // Auto-rotate
  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(nextSlide, 5000);
    return () => clearInterval(interval);
  }, [isPaused, nextSlide]);

  const getCardStyle = (index: number) => {
    const diff = index - activeIndex;
    const normalizedDiff = ((diff + TESTIMONIALS.length) % TESTIMONIALS.length);
    const adjustedDiff = normalizedDiff > TESTIMONIALS.length / 2 ? normalizedDiff - TESTIMONIALS.length : normalizedDiff;

    return {
      x: adjustedDiff * 60,
      scale: 1 - Math.abs(adjustedDiff) * 0.1,
      zIndex: TESTIMONIALS.length - Math.abs(adjustedDiff),
      opacity: Math.abs(adjustedDiff) <= 2 ? 1 - Math.abs(adjustedDiff) * 0.3 : 0,
      rotateY: adjustedDiff * -5,
    };
  };

  const currentTestimonial = TESTIMONIALS[activeIndex];

  return (
    <section className="relative py-24 md:py-32 overflow-hidden bg-zinc-950">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-zinc-900 via-zinc-950 to-black" />

      {/* Ambient glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-teal-600/10 rounded-full blur-[150px]" />

      <div className="relative max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-16">
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-zinc-400 text-xs font-bold uppercase tracking-widest mb-6"
          >
            <Quote size={14} className="text-teal-400" />
            What professionals say
          </motion.span>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl md:text-5xl font-bold text-white tracking-tight"
          >
            Trusted by{' '}
            <span className="bg-gradient-to-r from-teal-400 to-emerald-400 bg-clip-text text-transparent">
              10,000+
            </span>{' '}
            real estate pros
          </motion.h2>
        </div>

        {/* Carousel Container */}
        <div
          className="relative"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          {/* Main Card */}
          <div className="relative h-[400px] flex items-center justify-center perspective-1000">
            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key={currentTestimonial.id}
                custom={direction}
                initial={{ opacity: 0, x: direction * 100, rotateY: direction * 10 }}
                animate={{ opacity: 1, x: 0, rotateY: 0 }}
                exit={{ opacity: 0, x: direction * -100, rotateY: direction * -10 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="absolute w-full max-w-2xl"
              >
                <div className="relative bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 md:p-12">
                  {/* Quote icon */}
                  <div className="absolute -top-4 -left-4 w-12 h-12 rounded-2xl bg-gradient-to-br from-teal-500 to-emerald-500 flex items-center justify-center shadow-lg shadow-teal-500/30">
                    <Quote size={20} className="text-white" />
                  </div>

                  {/* Rating */}
                  <div className="flex gap-1 mb-6">
                    {Array.from({ length: currentTestimonial.rating }).map((_, i) => (
                      <Star key={i} size={16} className="fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>

                  {/* Content */}
                  <p className="text-lg md:text-xl text-white/90 leading-relaxed mb-8 font-medium">
                    "{currentTestimonial.content}"
                  </p>

                  {/* Author */}
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <img
                        src={currentTestimonial.avatar}
                        alt={currentTestimonial.name}
                        className="w-14 h-14 rounded-full object-cover border-2 border-white/20"
                      />
                      <div className="absolute inset-0 rounded-full bg-gradient-to-br from-teal-500/20 to-transparent" />
                    </div>
                    <div>
                      <div className="font-bold text-white">{currentTestimonial.name}</div>
                      <div className="text-sm text-zinc-400">
                        {currentTestimonial.role} at {currentTestimonial.company}
                      </div>
                    </div>
                  </div>

                  {/* Decorative gradient */}
                  <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-teal-500/5 to-emerald-500/5 pointer-events-none" />
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Navigation Buttons */}
          <div className="absolute top-1/2 -translate-y-1/2 left-0 right-0 flex justify-between px-4 pointer-events-none">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={prevSlide}
              className="pointer-events-auto w-12 h-12 rounded-full bg-white/10 backdrop-blur-sm border border-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors"
            >
              <ChevronLeft size={20} />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={nextSlide}
              className="pointer-events-auto w-12 h-12 rounded-full bg-white/10 backdrop-blur-sm border border-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors"
            >
              <ChevronRight size={20} />
            </motion.button>
          </div>

          {/* Dots Navigation */}
          <div className="flex justify-center gap-2 mt-8">
            {TESTIMONIALS.map((_, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setDirection(idx > activeIndex ? 1 : -1);
                  setActiveIndex(idx);
                }}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  idx === activeIndex
                    ? 'w-8 bg-gradient-to-r from-teal-500 to-emerald-500'
                    : 'bg-white/20 hover:bg-white/40'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Featured In */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="mt-20 text-center"
        >
          <p className="text-xs font-bold uppercase tracking-widest text-zinc-600 mb-6">
            Featured in
          </p>
          <div className="flex flex-wrap justify-center items-center gap-8 md:gap-12">
            {COMPANY_LOGOS.map((company) => (
              <motion.div
                key={company.name}
                whileHover={{ scale: 1.05 }}
                className="text-xl md:text-2xl font-bold text-zinc-600 hover:text-zinc-400 transition-colors cursor-default"
                style={{ fontFamily: 'serif' }}
              >
                {company.logo}
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};
