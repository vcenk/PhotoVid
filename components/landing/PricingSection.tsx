"use client";

import React, { useRef, useState } from 'react';
import { motion, useInView, useSpring, useTransform } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Check, Package, Zap, Sparkles, Crown, Rocket } from 'lucide-react';

const PLANS = [
  {
    name: "Free",
    price: "0",
    description: "Try before you buy.",
    features: [
      "5 credits per month",
      "Basic image editing tools",
      "SD video export",
      "Community support"
    ],
    cta: "Start Free",
    highlight: false,
    icon: Zap,
    gradient: "from-zinc-400 to-zinc-600",
  },
  {
    name: "Starter",
    price: "19",
    description: "Perfect for individuals.",
    features: [
      "100 credits per month",
      "All image editing tools",
      "HD video export",
      "Email support",
      "Remove watermarks"
    ],
    cta: "Go Starter",
    highlight: false,
    icon: Package,
    gradient: "from-blue-500 to-cyan-500",
  },
  {
    name: "Pro",
    price: "49",
    description: "For professionals and teams.",
    features: [
      "250 credits per month",
      "All image & video tools",
      "4K video export",
      "Priority support",
      "API access",
      "Custom branding"
    ],
    cta: "Go Pro",
    highlight: true,
    icon: Crown,
    gradient: "from-teal-500 to-emerald-500",
  },
  {
    name: "Enterprise",
    price: "149",
    description: "For large organizations.",
    features: [
      "800 credits per month",
      "Unlimited team members",
      "4K+ video export",
      "Dedicated support",
      "Custom integrations",
      "SLA guarantee"
    ],
    cta: "Go Enterprise",
    highlight: false,
    icon: Rocket,
    gradient: "from-emerald-500 to-teal-500",
  }
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

  return (
    <section ref={sectionRef} className="relative py-24 md:py-32 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-zinc-950 via-zinc-900 to-zinc-950" />

      {/* Grid pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:40px_40px]" />

      {/* Ambient glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-teal-500/10 rounded-full blur-[150px]" />

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
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-zinc-400 text-xs font-bold uppercase tracking-widest mb-6"
          >
            <Sparkles size={14} />
            Pricing
          </motion.span>

          <h2 className="text-4xl md:text-6xl font-bold text-white tracking-tighter leading-[1.1]">
            Start free. <br />
            <span className="font-serif italic text-zinc-500">Scale when you're ready.</span>
          </h2>
        </motion.div>

        {/* Subscription Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-start mb-20 perspective-1000">
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
                      ? "bg-zinc-900 z-10"
                      : "bg-zinc-900/50 border border-white/10 hover:border-white/20"
                    }
                  `}
                >
                  {/* Animated border for highlighted plan */}
                  {plan.highlight && (
                    <>
                      <div className="absolute -inset-px rounded-[2rem] bg-gradient-to-r from-teal-500 via-emerald-500 to-teal-500 opacity-100" />
                      <div className="absolute inset-0 rounded-[2rem] bg-zinc-900" />

                      <motion.div
                        className="absolute -inset-px rounded-[2rem] opacity-50"
                        style={{
                          background: 'linear-gradient(90deg, #6366f1, #8b5cf6, #6366f1)',
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

                      <div className="absolute -inset-4 bg-gradient-to-r from-teal-500/20 via-emerald-500/20 to-teal-500/20 rounded-[3rem] blur-2xl -z-10" />
                    </>
                  )}

                  {/* Card content */}
                  <div className="relative z-10">
                    {plan.highlight && (
                      <motion.div
                        initial={{ y: -20, opacity: 0 }}
                        animate={isInView ? { y: 0, opacity: 1 } : {}}
                        transition={{ delay: 0.4 }}
                        className="absolute -top-12 left-1/2 -translate-x-1/2 px-4 py-1.5 bg-gradient-to-r from-teal-500 to-emerald-500 text-white text-[10px] font-bold uppercase tracking-widest rounded-full shadow-lg shadow-teal-500/30 flex items-center gap-2"
                      >
                        <Sparkles size={10} fill="currentColor" /> Most Popular
                      </motion.div>
                    )}

                    {/* Plan icon and name */}
                    <div className="flex items-center gap-3 mb-6">
                      <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${plan.gradient} flex items-center justify-center`}>
                        <Icon size={18} className="text-white" />
                      </div>
                      <h3 className="text-xl font-bold text-white">{plan.name}</h3>
                    </div>

                    {/* Price */}
                    <div className="flex items-baseline gap-1 mb-4">
                      <span className="text-5xl font-bold text-white tracking-tight">
                        $<AnimatedCounter value={parseInt(plan.price)} isInView={isInView} />
                      </span>
                      <span className="text-sm text-zinc-500">/mo</span>
                    </div>

                    <p className="text-sm text-zinc-400 leading-relaxed mb-8">
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
                          className="flex items-start gap-3 text-sm text-zinc-300"
                        >
                          <Check size={16} className={`flex-shrink-0 mt-0.5 ${plan.highlight ? 'text-teal-500' : 'text-zinc-500'}`} />
                          <span className="leading-tight">{feature}</span>
                        </motion.li>
                      ))}
                    </ul>

                    {/* CTA Button */}
                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                      <Link
                        to="/auth"
                        className={`
                          w-full py-4 rounded-xl text-xs font-bold uppercase tracking-widest transition-all text-center block
                          ${plan.highlight
                            ? "bg-gradient-to-r from-teal-500 to-emerald-500 text-white shadow-lg shadow-teal-500/30 hover:shadow-xl hover:shadow-teal-500/40"
                            : "bg-white/5 border border-white/10 text-white hover:bg-white/10"
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

      </div>
    </section>
  );
};
