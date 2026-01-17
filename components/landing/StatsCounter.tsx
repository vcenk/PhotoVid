"use client";

import React, { useState, useEffect, useRef } from 'react';
import { motion, useInView, useSpring, useTransform } from 'framer-motion';
import { TrendingUp, Users, Star, Zap } from 'lucide-react';

interface StatItemProps {
  value: number;
  suffix?: string;
  prefix?: string;
  label: string;
  icon: React.ElementType;
  delay?: number;
  decimals?: number;
}

const AnimatedCounter: React.FC<{
  value: number;
  suffix?: string;
  prefix?: string;
  decimals?: number;
  isInView: boolean;
}> = ({ value, suffix = '', prefix = '', decimals = 0, isInView }) => {
  const spring = useSpring(0, {
    stiffness: 50,
    damping: 20,
    duration: 2000
  });

  const display = useTransform(spring, (current) => {
    if (decimals > 0) {
      return `${prefix}${current.toFixed(decimals)}${suffix}`;
    }
    return `${prefix}${Math.floor(current).toLocaleString()}${suffix}`;
  });

  useEffect(() => {
    if (isInView) {
      spring.set(value);
    }
  }, [isInView, spring, value]);

  return <motion.span>{display}</motion.span>;
};

const StatItem: React.FC<StatItemProps> = ({
  value,
  suffix = '',
  prefix = '',
  label,
  icon: Icon,
  delay = 0,
  decimals = 0
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ delay, duration: 0.6, ease: "easeOut" }}
      className="relative group"
    >
      {/* Glow effect on hover */}
      <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/0 via-indigo-500/10 to-violet-500/0 rounded-3xl opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-500" />

      <div className="relative bg-white dark:bg-zinc-900/50 backdrop-blur-sm border border-zinc-200 dark:border-white/10 rounded-3xl p-8 text-center transition-all duration-300 hover:border-indigo-500/30 hover:shadow-xl hover:shadow-indigo-500/5">
        {/* Icon */}
        <motion.div
          initial={{ scale: 0 }}
          animate={isInView ? { scale: 1 } : {}}
          transition={{ delay: delay + 0.2, type: "spring", stiffness: 200 }}
          className="mx-auto mb-4 w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500/10 to-violet-500/10 flex items-center justify-center"
        >
          <Icon className="w-6 h-6 text-indigo-500" />
        </motion.div>

        {/* Animated Number */}
        <div className="text-4xl md:text-5xl font-black text-zinc-900 dark:text-white tracking-tight mb-2">
          <AnimatedCounter
            value={value}
            suffix={suffix}
            prefix={prefix}
            decimals={decimals}
            isInView={isInView}
          />
        </div>

        {/* Label */}
        <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-widest">
          {label}
        </p>

        {/* Pulse ring on hover */}
        <motion.div
          className="absolute inset-0 rounded-3xl border-2 border-indigo-500/50 opacity-0 group-hover:opacity-100"
          animate={{ scale: [1, 1.02, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
      </div>
    </motion.div>
  );
};

const STATS = [
  {
    value: 10,
    suffix: 'M+',
    label: 'Videos Generated',
    icon: TrendingUp,
  },
  {
    value: 50,
    suffix: 'K+',
    label: 'Active Creators',
    icon: Users,
  },
  {
    value: 4.9,
    suffix: '',
    label: 'Average Rating',
    icon: Star,
    decimals: 1,
  },
  {
    value: 99.9,
    suffix: '%',
    label: 'Uptime',
    icon: Zap,
    decimals: 1,
  },
];

export const StatsCounter: React.FC = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" });

  return (
    <section
      ref={sectionRef}
      className="relative py-24 md:py-32 overflow-hidden"
    >
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-white via-zinc-50 to-white dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-950" />

      {/* Ambient glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-indigo-500/5 dark:bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          className="text-center mb-16"
        >
          <motion.span
            initial={{ opacity: 0, scale: 0.9 }}
            animate={isInView ? { opacity: 1, scale: 1 } : {}}
            transition={{ delay: 0.1 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-xs font-bold uppercase tracking-widest mb-6"
          >
            <TrendingUp size={14} />
            Trusted by creators worldwide
          </motion.span>

          <h2 className="text-3xl md:text-5xl font-bold text-zinc-900 dark:text-white tracking-tight">
            Numbers that speak{' '}
            <span className="bg-gradient-to-r from-indigo-500 to-violet-500 bg-clip-text text-transparent">
              volumes
            </span>
          </h2>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {STATS.map((stat, idx) => (
            <StatItem
              key={stat.label}
              {...stat}
              delay={idx * 0.1}
            />
          ))}
        </div>

        {/* Bottom accent */}
        <motion.div
          initial={{ scaleX: 0 }}
          animate={isInView ? { scaleX: 1 } : {}}
          transition={{ delay: 0.6, duration: 0.8 }}
          className="mt-16 mx-auto w-24 h-1 bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full"
        />
      </div>
    </section>
  );
};
