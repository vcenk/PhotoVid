"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Play, ArrowRight, Sparkles } from 'lucide-react';

// AI-generated / Abstract art style video loops
const HERO_VIDEOS = [
  'https://cdn.pixabay.com/video/2024/03/15/204314-924826328_large.mp4', // Abstract fluid AI art
  'https://cdn.pixabay.com/video/2023/10/06/183927-871755146_large.mp4', // Neon particles
  'https://cdn.pixabay.com/video/2023/07/28/173543-849489032_large.mp4', // Abstract waves
];

export const Hero = () => {
  const [isMounted, setIsMounted] = useState(false);
  const [currentVideo, setCurrentVideo] = useState(0);
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Cycle through videos
  useEffect(() => {
    const interval = setInterval(() => {
      setIsVideoLoaded(false);
      setCurrentVideo((prev) => (prev + 1) % HERO_VIDEOS.length);
    }, 15000);
    return () => clearInterval(interval);
  }, []);

  if (!isMounted) return null;

  return (
    <section className="relative h-screen w-full overflow-hidden bg-black">
      {/* Video Background - AI Generated Art */}
      <div className="absolute inset-0">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: isVideoLoaded ? 1 : 0 }}
          transition={{ duration: 1.5 }}
          className="absolute inset-0"
        >
          <video
            key={currentVideo}
            autoPlay
            muted
            loop
            playsInline
            onLoadedData={() => setIsVideoLoaded(true)}
            className="absolute inset-0 w-full h-full object-cover scale-110"
            src={HERO_VIDEOS[currentVideo]}
          />
        </motion.div>

        {/* Dark overlay for text readability */}
        <div className="absolute inset-0 bg-black/50" />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-black/40" />

        {/* Vignette effect */}
        <div className="absolute inset-0 shadow-[inset_0_0_200px_rgba(0,0,0,0.9)]" />

        {/* Subtle noise */}
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.08] mix-blend-overlay pointer-events-none" />
      </div>

      {/* Content */}
      <div className="relative z-10 h-full flex flex-col items-center justify-center px-6 text-center">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/20 bg-white/10 backdrop-blur-sm text-xs font-semibold uppercase tracking-widest text-white/90">
            <Sparkles size={14} className="text-violet-400" />
            AI-Powered Creation Studio
          </span>
        </motion.div>

        {/* Main Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.8 }}
          className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold text-white tracking-tight leading-[0.95] max-w-5xl"
        >
          Create Beyond
          <br />
          <span className="bg-gradient-to-r from-violet-400 via-fuchsia-400 to-pink-400 bg-clip-text text-transparent">
            Imagination
          </span>
        </motion.h1>

        {/* Subheadline */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-8 text-lg md:text-xl text-white/60 max-w-2xl font-medium leading-relaxed"
        >
          Transform ideas into stunning videos, images, and audio.
          <br className="hidden sm:block" />
          Powered by next-generation AI models.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="mt-12 flex flex-col sm:flex-row items-center gap-4"
        >
          <Link
            to="/studio"
            className="group relative inline-flex items-center gap-3 px-8 py-4 bg-white text-black font-bold rounded-full hover:bg-white/90 transition-all hover:scale-105 shadow-2xl shadow-white/20"
          >
            Start Creating Free
            <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
          </Link>

          <button className="group inline-flex items-center gap-3 px-6 py-4 text-white/70 hover:text-white font-medium transition-colors">
            <span className="w-11 h-11 rounded-full border border-white/20 bg-white/5 flex items-center justify-center group-hover:border-white/40 group-hover:bg-white/10 transition-all">
              <Play size={16} fill="currentColor" className="ml-0.5" />
            </span>
            Watch Demo
          </button>
        </motion.div>

        {/* Trust indicators */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="mt-20 flex flex-wrap items-center justify-center gap-6 sm:gap-10 text-white/40 text-sm"
        >
          <div className="flex items-center gap-2">
            <div className="flex -space-x-2">
              {['from-violet-500 to-purple-600', 'from-fuchsia-500 to-pink-600', 'from-indigo-500 to-blue-600', 'from-cyan-500 to-teal-600'].map((gradient, i) => (
                <div key={i} className={`w-7 h-7 rounded-full bg-gradient-to-br ${gradient} border-2 border-black`} />
              ))}
            </div>
            <span>50K+ creators</span>
          </div>
          <div className="hidden sm:block w-px h-4 bg-white/20" />
          <div>10M+ generations</div>
          <div className="hidden sm:block w-px h-4 bg-white/20" />
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((i) => (
              <svg key={i} className="w-3.5 h-3.5 text-yellow-500 fill-current" viewBox="0 0 20 20">
                <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
              </svg>
            ))}
            <span className="ml-1">4.9 rating</span>
          </div>
        </motion.div>
      </div>

      {/* Video selector dots */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex gap-2">
        {HERO_VIDEOS.map((_, idx) => (
          <button
            key={idx}
            onClick={() => {
              setIsVideoLoaded(false);
              setCurrentVideo(idx);
            }}
            className={`h-1 rounded-full transition-all duration-500 ${
              idx === currentVideo ? 'w-8 bg-white' : 'w-2 bg-white/30 hover:bg-white/50'
            }`}
          />
        ))}
      </div>

      {/* Scroll hint */}
      <motion.div
        animate={{ y: [0, 8, 0] }}
        transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
        className="absolute bottom-8 right-8 z-20 hidden lg:block"
      >
        <div className="flex flex-col items-center gap-2 text-white/30">
          <div className="w-5 h-8 rounded-full border border-white/30 flex justify-center pt-2">
            <motion.div
              animate={{ y: [0, 8, 0], opacity: [1, 0, 1] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
              className="w-1 h-1 rounded-full bg-white/50"
            />
          </div>
        </div>
      </motion.div>
    </section>
  );
};
