import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence, useInView } from 'framer-motion';
import {
  Building2,
  Sparkles,
  ArrowRight,
  Crown,
  Image as ImageIcon,
  Video,
  Wand2,
  Sun,
  Eraser,
  TreePine,
  Camera,
  Star,
  Clock,
  Check,
  Play,
  ChevronLeft,
  ChevronRight,
  Zap,
  Users,
  Shield,
} from 'lucide-react';
import { NavigationRail, FlyoutType } from '../dashboard/navigation/NavigationRail';
import { FlyoutPanels } from '../dashboard/navigation/FlyoutPanels';

// ============ TYPES ============
interface Tool {
  id: string;
  name: string;
  description: string;
  icon: React.ElementType;
  gradient: string;
  route: string;
  credits: number;
  isPremium?: boolean;
  isNew?: boolean;
  beforeImage: string;
  afterImage: string;
}

// ============ DATA ============
const TOOLS: Tool[] = [
  {
    id: 'virtual-staging',
    name: 'Virtual Staging',
    description: 'Fill empty rooms with designer furniture in seconds',
    icon: Building2,
    gradient: 'from-blue-500 to-indigo-600',
    route: '/studio/apps/real-estate/virtual-staging',
    credits: 2,
    beforeImage: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&h=500&fit=crop',
    afterImage: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&h=500&fit=crop',
  },
  {
    id: 'photo-enhancement',
    name: 'Photo Enhancement',
    description: 'One-click HDR, lighting & color correction',
    icon: Camera,
    gradient: 'from-amber-500 to-orange-500',
    route: '/studio/apps/real-estate/photo-enhancement',
    credits: 1,
    beforeImage: 'https://images.unsplash.com/photo-1560185007-cde436f6a4d0?w=800&h=500&fit=crop',
    afterImage: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&h=500&fit=crop',
  },
  {
    id: 'sky-replacement',
    name: 'Sky Replacement',
    description: 'Replace gray skies with perfect blue instantly',
    icon: Sun,
    gradient: 'from-sky-400 to-blue-500',
    route: '/studio/apps/real-estate/sky-replacement',
    credits: 1,
    beforeImage: 'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=800&h=500&fit=crop',
    afterImage: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&h=500&fit=crop',
  },
  {
    id: 'twilight',
    name: 'Day to Twilight',
    description: 'Transform daytime shots into stunning dusk photos',
    icon: Sparkles,
    gradient: 'from-violet-500 to-purple-600',
    route: '/studio/apps/real-estate/twilight',
    credits: 2,
    isPremium: true,
    beforeImage: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&h=500&fit=crop',
    afterImage: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&h=500&fit=crop',
  },
  {
    id: 'item-removal',
    name: 'Item Removal',
    description: 'Remove clutter, cars & unwanted objects',
    icon: Eraser,
    gradient: 'from-rose-500 to-pink-500',
    route: '/studio/apps/real-estate/item-removal',
    credits: 2,
    beforeImage: 'https://images.unsplash.com/photo-1558036117-15d82a90b9b1?w=800&h=500&fit=crop',
    afterImage: 'https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=800&h=500&fit=crop',
  },
  {
    id: 'lawn-enhancement',
    name: 'Lawn Enhancement',
    description: 'Make grass greener & landscaping vibrant',
    icon: TreePine,
    gradient: 'from-green-500 to-emerald-500',
    route: '/studio/apps/real-estate/lawn-enhancement',
    credits: 1,
    beforeImage: 'https://images.unsplash.com/photo-1560185007-cde436f6a4d0?w=800&h=500&fit=crop',
    afterImage: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&h=500&fit=crop',
  },
  {
    id: 'room-tour',
    name: 'Room Tour Video',
    description: 'Generate cinematic video from a single photo',
    icon: Video,
    gradient: 'from-fuchsia-500 to-pink-500',
    route: '/studio/apps/real-estate/room-tour',
    credits: 5,
    isPremium: true,
    beforeImage: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&h=500&fit=crop',
    afterImage: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&h=500&fit=crop',
  },
  {
    id: 'storyboard',
    name: 'Property Storyboard',
    description: 'Build complete video tours with scenes & transitions',
    icon: ImageIcon,
    gradient: 'from-indigo-500 to-violet-500',
    route: '/studio/apps/real-estate/storyboard',
    credits: 5,
    isPremium: true,
    isNew: true,
    beforeImage: 'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=800&h=500&fit=crop',
    afterImage: 'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=800&h=500&fit=crop',
  },
  {
    id: 'text-to-video',
    name: 'Text to Video',
    description: 'Generate property videos from listing descriptions',
    icon: Wand2,
    gradient: 'from-purple-500 to-indigo-500',
    route: '/studio/apps/real-estate/text-to-video',
    credits: 10,
    isPremium: true,
    isNew: true,
    beforeImage: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&h=500&fit=crop',
    afterImage: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&h=500&fit=crop',
  },
];

const STEPS = [
  { num: 1, title: 'Upload', desc: 'Drop your property photo' },
  { num: 2, title: 'Choose', desc: 'Select tool & style' },
  { num: 3, title: 'Generate', desc: 'AI processes in seconds' },
  { num: 4, title: 'Download', desc: 'Get your enhanced image' },
];

// ============ COMPONENTS ============

// Before/After Slider Component
const BeforeAfterSlider: React.FC<{ before: string; after: string; className?: string }> = ({
  before,
  after,
  className = '',
}) => {
  const [sliderPosition, setSliderPosition] = useState(50);
  const containerRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);

  const handleMove = (clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
    const percentage = (x / rect.width) * 100;
    setSliderPosition(percentage);
  };

  const handleMouseDown = () => { isDragging.current = true; };
  const handleMouseUp = () => { isDragging.current = false; };
  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging.current) handleMove(e.clientX);
  };
  const handleTouchMove = (e: React.TouchEvent) => {
    handleMove(e.touches[0].clientX);
  };

  return (
    <div
      ref={containerRef}
      className={`relative overflow-hidden cursor-ew-resize select-none ${className}`}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onMouseMove={handleMouseMove}
      onTouchMove={handleTouchMove}
    >
      {/* After Image (Background) */}
      <img src={after} alt="After" className="w-full h-full object-cover" />

      {/* Before Image (Clipped) */}
      <div
        className="absolute inset-0 overflow-hidden"
        style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}
      >
        <img src={before} alt="Before" className="w-full h-full object-cover" />
      </div>

      {/* Slider Line */}
      <div
        className="absolute top-0 bottom-0 w-1 bg-white shadow-lg"
        style={{ left: `${sliderPosition}%`, transform: 'translateX(-50%)' }}
      >
        {/* Handle */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 bg-white rounded-full shadow-xl flex items-center justify-center">
          <ChevronLeft size={14} className="text-zinc-600 -mr-1" />
          <ChevronRight size={14} className="text-zinc-600 -ml-1" />
        </div>
      </div>

      {/* Labels */}
      <div className="absolute top-3 left-3 px-2 py-1 bg-black/60 backdrop-blur-sm rounded text-xs text-white font-medium">
        Before
      </div>
      <div className="absolute top-3 right-3 px-2 py-1 bg-black/60 backdrop-blur-sm rounded text-xs text-white font-medium">
        After
      </div>
    </div>
  );
};

// Tool Card Component
const ToolCard: React.FC<{ tool: Tool; index: number }> = ({ tool, index }) => {
  const navigate = useNavigate();
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-50px' });
  const Icon = tool.icon;

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      whileHover={{ y: -6 }}
      onClick={() => navigate(tool.route)}
      className="group bg-zinc-900 rounded-2xl overflow-hidden cursor-pointer border border-zinc-800 hover:border-zinc-700 transition-all"
    >
      {/* Before/After Preview */}
      <BeforeAfterSlider
        before={tool.beforeImage}
        after={tool.afterImage}
        className="aspect-[16/10]"
      />

      {/* Content */}
      <div className="p-5">
        <div className="flex items-start justify-between mb-3">
          <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${tool.gradient} flex items-center justify-center`}>
            <Icon size={20} className="text-white" />
          </div>
          <div className="flex items-center gap-2">
            {tool.isNew && (
              <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 text-[10px] font-bold uppercase rounded-full">
                New
              </span>
            )}
            {tool.isPremium && (
              <span className="px-2 py-0.5 bg-amber-500/20 text-amber-400 text-[10px] font-bold uppercase rounded-full flex items-center gap-1">
                <Crown size={10} />
                Pro
              </span>
            )}
          </div>
        </div>

        <h3 className="text-base font-semibold text-white mb-1">{tool.name}</h3>
        <p className="text-sm text-zinc-500 mb-4">{tool.description}</p>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-sm">
            <Zap size={14} className="text-violet-400" />
            <span className="text-zinc-400">{tool.credits} credit{tool.credits > 1 ? 's' : ''}</span>
          </div>
          <span className="text-sm text-zinc-500 group-hover:text-white flex items-center gap-1 transition-colors">
            Try it
            <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
          </span>
        </div>
      </div>
    </motion.div>
  );
};

// ============ MAIN PAGE ============
export const RealEstatePageV2: React.FC = () => {
  const navigate = useNavigate();
  const [activeFlyout, setActiveFlyout] = useState<FlyoutType>(null);

  return (
    <div className="min-h-screen flex bg-[#0a0a0a]">
      <NavigationRail activeFlyout={activeFlyout} onFlyoutChange={setActiveFlyout} />
      <FlyoutPanels activeFlyout={activeFlyout} onClose={() => setActiveFlyout(null)} />

      <div className="flex-1 ml-56 overflow-y-auto">
        {/* ===== HERO SECTION ===== */}
        <section className="relative pt-8 pb-16 px-6">
          {/* Subtle gradient bg */}
          <div className="absolute inset-0 bg-gradient-to-b from-violet-950/30 via-transparent to-transparent pointer-events-none" />

          <div className="relative max-w-6xl mx-auto">
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-3 mb-6"
            >
              <div className="flex items-center gap-2 px-3 py-1.5 bg-zinc-800/80 rounded-full">
                <div className="flex -space-x-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={12} className="text-amber-400 fill-amber-400" />
                  ))}
                </div>
                <span className="text-sm text-zinc-300 font-medium">4.9/5 from 2,000+ agents</span>
              </div>
            </motion.div>

            {/* Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-5 leading-[1.1] max-w-3xl"
            >
              Transform listings with
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-indigo-400"> AI-powered </span>
              photo editing
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-lg text-zinc-400 mb-8 max-w-2xl"
            >
              Virtual staging, sky replacement, twilight conversion, and video tours.
              Everything you need to make properties sell faster.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex flex-wrap items-center gap-4 mb-12"
            >
              <button
                onClick={() => navigate('/studio/apps/real-estate/virtual-staging')}
                className="px-6 py-3.5 bg-violet-600 hover:bg-violet-500 text-white font-semibold rounded-xl flex items-center gap-2 transition-colors"
              >
                Start for Free
                <ArrowRight size={18} />
              </button>
              <button className="px-6 py-3.5 bg-zinc-800 hover:bg-zinc-700 text-white font-medium rounded-xl flex items-center gap-2 transition-colors">
                <Play size={18} />
                Watch Demo
              </button>
            </motion.div>

            {/* Trust Badges */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="flex flex-wrap items-center gap-6 text-sm text-zinc-500"
            >
              <div className="flex items-center gap-2">
                <Check size={16} className="text-emerald-500" />
                <span>100 free credits</span>
              </div>
              <div className="flex items-center gap-2">
                <Check size={16} className="text-emerald-500" />
                <span>No credit card required</span>
              </div>
              <div className="flex items-center gap-2">
                <Check size={16} className="text-emerald-500" />
                <span>Results in under 30 seconds</span>
              </div>
            </motion.div>
          </div>
        </section>

        {/* ===== FEATURED BEFORE/AFTER ===== */}
        <section className="px-6 pb-16">
          <div className="max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="relative rounded-2xl overflow-hidden"
            >
              <BeforeAfterSlider
                before="https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=1200&h=600&fit=crop"
                after="https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=1200&h=600&fit=crop"
                className="aspect-[2/1] md:aspect-[2.5/1]"
              />
              <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
                <div className="px-4 py-2 bg-black/70 backdrop-blur-sm rounded-lg">
                  <p className="text-white font-medium">Virtual Staging</p>
                  <p className="text-zinc-400 text-sm">Empty to furnished in 15 seconds</p>
                </div>
                <button
                  onClick={() => navigate('/studio/apps/real-estate/virtual-staging')}
                  className="px-4 py-2 bg-violet-600 hover:bg-violet-500 text-white font-medium rounded-lg flex items-center gap-2 transition-colors"
                >
                  Try Now
                  <ArrowRight size={16} />
                </button>
              </div>
            </motion.div>
          </div>
        </section>

        {/* ===== HOW IT WORKS ===== */}
        <section className="px-6 pb-16">
          <div className="max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="text-center mb-10"
            >
              <h2 className="text-2xl font-bold text-white mb-2">How it works</h2>
              <p className="text-zinc-500">Professional results in 4 simple steps</p>
            </motion.div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {STEPS.map((step, index) => (
                <motion.div
                  key={step.num}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="relative p-5 bg-zinc-900 rounded-xl border border-zinc-800"
                >
                  <div className="w-8 h-8 rounded-full bg-violet-600 text-white font-bold flex items-center justify-center mb-3">
                    {step.num}
                  </div>
                  <h3 className="text-white font-semibold mb-1">{step.title}</h3>
                  <p className="text-sm text-zinc-500">{step.desc}</p>

                  {/* Connector line */}
                  {index < STEPS.length - 1 && (
                    <div className="hidden md:block absolute top-10 -right-2 w-4 border-t-2 border-dashed border-zinc-700" />
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ===== TOOLS GRID ===== */}
        <section className="px-6 pb-16">
          <div className="max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="flex items-center justify-between mb-8"
            >
              <div>
                <h2 className="text-2xl font-bold text-white mb-1">All Tools</h2>
                <p className="text-zinc-500">Drag the slider on each card to see before/after</p>
              </div>
              <div className="hidden md:flex items-center gap-2 text-sm text-zinc-500">
                <span>9 tools available</span>
              </div>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {TOOLS.map((tool, index) => (
                <ToolCard key={tool.id} tool={tool} index={index} />
              ))}
            </div>
          </div>
        </section>

        {/* ===== STATS SECTION ===== */}
        <section className="px-6 pb-16">
          <div className="max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="grid grid-cols-2 md:grid-cols-4 gap-4"
            >
              {[
                { icon: ImageIcon, value: '50K+', label: 'Photos Enhanced' },
                { icon: Clock, value: '<30s', label: 'Average Processing' },
                { icon: Users, value: '2,000+', label: 'Happy Agents' },
                { icon: Shield, value: '99.9%', label: 'Uptime' },
              ].map((stat, index) => (
                <div
                  key={index}
                  className="p-5 bg-zinc-900 rounded-xl border border-zinc-800 text-center"
                >
                  <stat.icon size={24} className="text-violet-400 mx-auto mb-3" />
                  <p className="text-2xl font-bold text-white">{stat.value}</p>
                  <p className="text-sm text-zinc-500">{stat.label}</p>
                </div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* ===== CTA SECTION ===== */}
        <section className="px-6 pb-20">
          <div className="max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="relative p-8 md:p-12 rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-700 overflow-hidden"
            >
              {/* Decorative circles */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />

              <div className="relative text-center">
                <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">
                  Ready to transform your listings?
                </h2>
                <p className="text-white/80 mb-6 max-w-lg mx-auto">
                  Join 2,000+ real estate agents using Photovid to sell properties faster.
                </p>
                <button
                  onClick={() => navigate('/studio/apps/real-estate/virtual-staging')}
                  className="px-8 py-4 bg-white text-violet-700 font-semibold rounded-xl hover:bg-zinc-100 transition-colors inline-flex items-center gap-2"
                >
                  Get Started Free
                  <ArrowRight size={18} />
                </button>
              </div>
            </motion.div>
          </div>
        </section>
      </div>
    </div>
  );
};
