"use client";

import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

// Luxury real estate drone footage (verified Pexels direct links)
const HERO_VIDEOS = [
  'https://videos.pexels.com/video-files/5031099/5031099-hd_1920_1080_30fps.mp4', // Neighborhood aerial drone
  'https://videos.pexels.com/video-files/7578554/7578554-hd_1920_1080_30fps.mp4', // Luxury property with pool
  'https://videos.pexels.com/video-files/3194277/3194277-hd_1920_1080_30fps.mp4', // Modern house exterior
];

export const Hero = () => {
  const [isMounted, setIsMounted] = useState(false);
  const [currentVideo, setCurrentVideo] = useState(0);
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Cycle through videos
  useEffect(() => {
    const interval = setInterval(() => {
      setIsVideoLoaded(false);
      setCurrentVideo((prev) => (prev + 1) % HERO_VIDEOS.length);
    }, 18000);
    return () => clearInterval(interval);
  }, []);

  if (!isMounted) return null;

  return (
    <section id="hero-start" className="relative h-screen w-full overflow-hidden bg-black">
      {/* ── Video Background ── */}
      <div className="absolute inset-0">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: isVideoLoaded ? 1 : 0 }}
          transition={{ duration: 2 }}
          className="absolute inset-0"
        >
          <video
            ref={videoRef}
            key={currentVideo}
            autoPlay
            muted
            loop
            playsInline
            onLoadedData={() => setIsVideoLoaded(true)}
            className="absolute inset-0 w-full h-full object-cover scale-105"
            src={HERO_VIDEOS[currentVideo]}
          />
        </motion.div>

        {/* Subtle dark gradient for text legibility — lighter than before */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-black/60" />

        {/* Bottom fade into next section */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-zinc-950 to-transparent" />
      </div>

      {/* ── Content ── */}
      <div className="relative z-10 h-full flex flex-col items-center justify-center px-6 text-center">

        {/* Main Headline — large, bold, clean white */}
        <motion.h1
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 1, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="text-5xl sm:text-6xl md:text-7xl lg:text-[5.5rem] font-bold text-white tracking-tight leading-[1.05] max-w-4xl"
          style={{ fontFamily: "'Inter', sans-serif" }}
        >
          AI-Powered
          <br />
          Real Estate
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.8 }}
          className="mt-8 text-lg md:text-xl text-white/70 max-w-xl font-normal leading-relaxed"
        >
          Transform your property photos into stunning visuals
          <br className="hidden sm:block" />
          with cutting-edge AI tools
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9, duration: 0.8 }}
          className="mt-12 flex flex-col sm:flex-row items-center gap-4"
        >
          {/* Primary CTA — filled black with arrow */}
          <Link
            to="/studio/real-estate"
            className="group inline-flex items-center gap-3 px-10 py-4 bg-black/80 backdrop-blur-sm text-white font-semibold rounded-full border border-white/10 hover:bg-black hover:border-white/20 transition-all duration-300 text-base"
          >
            Explore AI Tools
            <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform duration-300" />
          </Link>

          {/* Secondary CTA — outlined */}
          <Link
            to="/auth"
            className="inline-flex items-center gap-3 px-10 py-4 text-white font-semibold rounded-full border border-white/30 hover:border-white/60 hover:bg-white/5 backdrop-blur-sm transition-all duration-300 text-base"
          >
            Start Free
          </Link>
        </motion.div>
      </div>

      {/* ── Scroll Indicator ── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20"
      >
        <motion.div
          animate={{ y: [0, 6, 0] }}
          transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
        >
          <div className="w-6 h-10 rounded-full border-2 border-white/30 flex justify-center pt-2">
            <motion.div
              animate={{ y: [0, 10, 0], opacity: [1, 0.3, 1] }}
              transition={{ repeat: Infinity, duration: 1.8, ease: "easeInOut" }}
              className="w-1 h-1.5 rounded-full bg-white/60"
            />
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
};
