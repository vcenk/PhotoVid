"use client";

import React, { useRef, useState } from 'react';
import { motion, useInView, useSpring, useTransform } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Check, Package, Zap, Sparkles, Crown, Rocket } from 'lucide-react';

const PLANS = [
  {
    name: "Free",
    price: "0",
    description: "Perfect for exploring the neural engine.",
    features: [
      "Watermarked previews",
      "Basic templates",
      "Standard queue",
      "720p exports"
    ],
    cta: "Start Free",
    highlight: false,
    icon: Zap,
    gradient: "from-zinc-400 to-zinc-600",
  },
  {
    name: "Creator",
    price: "19",
    description: "Scale your creative output with HD results.",
    features: [
      "HD exports (No Watermark)",
      "Faster rendering queue",
      "Creator template packs",
      "Commercial use license",
      "Cloud storage (5GB)"
    ],
    cta: "Go Creator",
    highlight: true,
    icon: Crown,
    gradient: "from-indigo-500 to-violet-500",
  },
  {
    name: "Pro Studio",
    price: "49",
    description: "Cinema-grade tools for agencies and teams.",
    features: [
      "4K Cinema exports",
      "Priority queue",
      "All industry template packs",
      "Team-ready presets",
      "API Access"
    ],
    cta: "Go Pro",
    highlight: false,
    icon: Rocket,
    gradient: "from-fuchsia-500 to-pink-500",
  }
];

const CREDIT_PACKS = [
  { credits: 10, price: 12 },
  { credits: 25, price: 25 },
  { credits: 60, price: 49 },
];

interface TiltCardProps {
  children: React.ReactNode;
  className?: string;
}

const TiltCard: React.FC<TiltCardProps> = ({ children, className = '' }) => {
  const ref = useRef<HTMLDivElement>(null);
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const mouseX = e.clientX - centerX;
    const mouseY = e.clientY - centerY;

    setRotateX(-mouseY / 20);
    setRotateY(mouseX / 20);
  };

  const handleMouseLeave = () => {
    setRotateX(0);
    setRotateY(0);
  };

  const springConfig = { stiffness: 150, damping: 15 };
  const rotateXSpring = useSpring(rotateX, springConfig);
  const rotateYSpring = useSpring(rotateY, springConfig);

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        rotateX: rotateXSpring,
        rotateY: rotateYSpring,
        transformStyle: 'preserve-3d',
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

interface AnimatedCounterProps {
  value: number;
  isInView: boolean;
}

const AnimatedCounter: React.FC<AnimatedCounterProps> = ({ value, isInView }) => {
  const spring = useSpring(0, { stiffness: 50, damping: 20 });
  const display = useTransform(spring, (current) => Math.floor(current));

  React.useEffect(() => {
    if (isInView) {
      spring.set(value);
    }
  }, [isInView, spring, value]);

  return <motion.span>{display}</motion.span>;
};

export const PricingSection = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" });
  const [hoveredPack, setHoveredPack] = useState<number | null>(null);

  return (
    <section ref={sectionRef} className="relative py-24 md:py-32 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-zinc-100 via-zinc-50 to-zinc-100 dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-950" />

      {/* Grid pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.02)_1px,transparent_1px)] dark:bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:40px_40px]" />

      {/* Ambient glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-indigo-500/5 dark:bg-indigo-500/10 rounded-full blur-[150px]" />

      <div className="relative max-w-7xl mx-auto px-6">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          className="text-center mb-16 md:mb-24"
        >
          <motion.span
            initial={{ opacity: 0, scale: 0.9 }}
            animate={isInView ? { opacity: 1, scale: 1 } : {}}
            transition={{ delay: 0.1 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-indigo-500/10 to-violet-500/10 text-indigo-600 dark:text-indigo-400 text-xs font-bold uppercase tracking-widest mb-6 border border-indigo-500/20"
          >
            <Sparkles size={14} />
            Pricing
          </motion.span>

          <h2 className="text-4xl md:text-6xl font-bold text-zinc-900 dark:text-white tracking-tighter leading-[1.1]">
            Start free. <br />
            <span className="font-serif italic text-zinc-400 dark:text-zinc-500">Scale when you're ready.</span>
          </h2>
        </motion.div>

        {/* Subscription Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start mb-20 perspective-1000">
          {PLANS.map((plan, idx) => {
            const Icon = plan.icon;

            return (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 30 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: idx * 0.1 + 0.2 }}
                className={plan.highlight ? 'md:-mt-4 md:mb-4' : ''}
              >
                <TiltCard
                  className={`
                    relative p-8 rounded-[2rem] transition-all duration-300 flex flex-col h-full
                    ${plan.highlight
                      ? "bg-white dark:bg-zinc-900 z-10"
                      : "bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-white/10 hover:border-zinc-300 dark:hover:border-white/20"
                    }
                  `}
                >
                  {/* Animated border for highlighted plan */}
                  {plan.highlight && (
                    <>
                      <div className="absolute -inset-px rounded-[2rem] bg-gradient-to-r from-indigo-500 via-violet-500 to-fuchsia-500 opacity-100" />
                      <div className="absolute inset-0 rounded-[2rem] bg-white dark:bg-zinc-900" />

                      {/* Animated gradient border */}
                      <motion.div
                        className="absolute -inset-px rounded-[2rem] opacity-50"
                        style={{
                          background: 'linear-gradient(90deg, #6366f1, #8b5cf6, #d946ef, #6366f1)',
                          backgroundSize: '300% 100%',
                        }}
                        animate={{
                          backgroundPosition: ['0% 0%', '100% 0%', '0% 0%'],
                        }}
                        transition={{
                          duration: 5,
                          repeat: Infinity,
                          ease: 'linear',
                        }}
                      />

                      {/* Glow effect */}
                      <div className="absolute -inset-4 bg-gradient-to-r from-indigo-500/20 via-violet-500/20 to-fuchsia-500/20 rounded-[3rem] blur-2xl -z-10" />
                    </>
                  )}

                  {/* Card content */}
                  <div className="relative z-10">
                    {/* "Most Popular" Badge */}
                    {plan.highlight && (
                      <motion.div
                        initial={{ y: -20, opacity: 0 }}
                        animate={isInView ? { y: 0, opacity: 1 } : {}}
                        transition={{ delay: 0.4 }}
                        className="absolute -top-12 left-1/2 -translate-x-1/2 px-4 py-1.5 bg-gradient-to-r from-indigo-500 to-violet-500 text-white text-[10px] font-bold uppercase tracking-widest rounded-full shadow-lg shadow-indigo-500/30 flex items-center gap-2"
                      >
                        <Sparkles size={10} fill="currentColor" /> Most Popular
                      </motion.div>
                    )}

                    {/* Plan icon and name */}
                    <div className="flex items-center gap-3 mb-6">
                      <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${plan.gradient} flex items-center justify-center`}>
                        <Icon size={18} className="text-white" />
                      </div>
                      <h3 className="text-xl font-bold text-zinc-900 dark:text-white">{plan.name}</h3>
                    </div>

                    {/* Price */}
                    <div className="flex items-baseline gap-1 mb-4">
                      <span className="text-5xl font-bold text-zinc-900 dark:text-white tracking-tight">
                        $<AnimatedCounter value={parseInt(plan.price)} isInView={isInView} />
                      </span>
                      <span className="text-sm text-zinc-500">/mo</span>
                    </div>

                    <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed mb-8">
                      {plan.description}
                    </p>

                    {/* Features */}
                    <ul className="space-y-4 mb-8 flex-grow">
                      {plan.features.map((feature, featureIdx) => (
                        <motion.li
                          key={feature}
                          initial={{ opacity: 0, x: -10 }}
                          animate={isInView ? { opacity: 1, x: 0 } : {}}
                          transition={{ delay: idx * 0.1 + featureIdx * 0.05 + 0.4 }}
                          className="flex items-start gap-3 text-sm text-zinc-600 dark:text-zinc-300"
                        >
                          <Check size={16} className={`flex-shrink-0 mt-0.5 ${plan.highlight ? 'text-indigo-500' : 'text-zinc-400'}`} />
                          <span className="leading-tight">{feature}</span>
                        </motion.li>
                      ))}
                    </ul>

                    {/* CTA Button */}
                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                      <Link
                        to="/login"
                        className={`
                          w-full py-4 rounded-xl text-xs font-bold uppercase tracking-widest transition-all text-center block
                          ${plan.highlight
                            ? "bg-gradient-to-r from-indigo-500 to-violet-500 text-white shadow-lg shadow-indigo-500/30 hover:shadow-xl hover:shadow-indigo-500/40"
                            : "bg-zinc-100 dark:bg-white/5 border border-zinc-200 dark:border-white/10 text-zinc-900 dark:text-white hover:bg-zinc-200 dark:hover:bg-white/10"
                          }
                        `}
                      >
                        {plan.cta}
                      </Link>
                    </motion.div>
                  </div>
                </TiltCard>
              </motion.div>
            );
          })}
        </div>

        {/* Credit System Add-on */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.6 }}
          className="max-w-4xl mx-auto"
        >
          <div className="relative p-2 bg-white dark:bg-zinc-900/50 rounded-[2.5rem] border border-zinc-200 dark:border-white/10 shadow-xl overflow-hidden">
            {/* Subtle animated gradient */}
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/5 via-violet-500/5 to-fuchsia-500/5" />

            <div className="relative flex flex-col md:flex-row items-center p-6 md:p-10 gap-8">

              {/* Left: Info */}
              <div className="flex items-center gap-6 flex-1">
                <motion.div
                  whileHover={{ rotate: 10 }}
                  className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500/10 to-violet-500/10 flex items-center justify-center text-indigo-500 border border-indigo-500/20"
                >
                  <Package size={32} strokeWidth={1.5} />
                </motion.div>
                <div>
                  <h4 className="text-lg font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                    Need extra bandwidth?
                  </h4>
                  <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
                    Top up with credits for high-fidelity rendering without a subscription.
                  </p>
                </div>
              </div>

              {/* Right: Credit Packs */}
              <div className="flex gap-4">
                {CREDIT_PACKS.map((pack) => (
                  <motion.button
                    key={pack.credits}
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    onMouseEnter={() => setHoveredPack(pack.credits)}
                    onMouseLeave={() => setHoveredPack(null)}
                    className={`
                      relative flex flex-col items-center justify-center w-28 h-28 rounded-2xl border transition-all duration-300 cursor-pointer overflow-hidden
                      ${hoveredPack === pack.credits
                        ? 'border-indigo-500 bg-gradient-to-br from-indigo-500/10 to-violet-500/10 shadow-lg shadow-indigo-500/20'
                        : 'border-zinc-200 dark:border-white/10 bg-white dark:bg-black hover:border-zinc-300 dark:hover:border-white/20'
                      }
                    `}
                  >
                    {hoveredPack === pack.credits && (
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 to-violet-500/10"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                      />
                    )}
                    <span className={`relative text-[10px] font-bold uppercase tracking-widest mb-1 transition-colors ${hoveredPack === pack.credits ? 'text-indigo-500' : 'text-zinc-400'}`}>
                      {pack.credits} Credits
                    </span>
                    <span className="relative text-2xl font-bold text-zinc-900 dark:text-white">
                      ${pack.price}
                    </span>
                  </motion.button>
                ))}
              </div>

            </div>
          </div>
        </motion.div>

      </div>
    </section>
  );
};
