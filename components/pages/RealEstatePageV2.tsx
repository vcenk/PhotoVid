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
  Paintbrush,
  CloudSun,
  Moon,
  Snowflake,
  Waves,
  Layers,
  Wand2,
  Share2,
  Armchair,
} from 'lucide-react';
import { NavigationRail } from '../dashboard/navigation/NavigationRail';
import { DashboardTopbar } from '../dashboard/navigation/DashboardTopbar';

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
  showcaseType?: 'slider' | 'single'; // 'single' shows just the after image (for posters, etc.)
}

// ============ DATA ============
const TOOLS: Tool[] = [
  {
    id: 'virtual-staging',
    name: 'Virtual Staging',
    description: 'Fill empty rooms with designer furniture in seconds',
    icon: Building2,
    gradient: 'from-blue-500 to-teal-600',
    route: '/studio/real-estate/virtual-staging',
    credits: 2,
    beforeImage: '/showcase/real-estate/before/virtual-staging.jpg',
    afterImage: '/showcase/real-estate/after/virtual-staging.jpg',
  },
  {
    id: 'custom-furniture-staging',
    name: 'Custom Furniture Staging',
    description: 'Stage rooms with your own furniture reference images',
    icon: Armchair,
    gradient: 'from-violet-500 to-purple-600',
    route: '/studio/real-estate/custom-furniture-staging',
    credits: 3,
    isPremium: true,
    isNew: true,
    beforeImage: '/showcase/real-estate/before/virtual-staging.jpg',
    afterImage: '/showcase/real-estate/after/virtual-staging.jpg',
  },
  {
    id: 'photo-enhancement',
    name: 'Photo Enhancement',
    description: 'One-click HDR, lighting & color correction',
    icon: Camera,
    gradient: 'from-amber-500 to-orange-500',
    route: '/studio/real-estate/photo-enhancement',
    credits: 1,
    beforeImage: '/showcase/real-estate/before/photo-enhancement.jpg',
    afterImage: '/showcase/real-estate/after/photo-enhancement.jpg',
  },
  {
    id: 'sky-replacement',
    name: 'Sky Replacement',
    description: 'Replace gray skies with perfect blue instantly',
    icon: Sun,
    gradient: 'from-sky-400 to-blue-500',
    route: '/studio/real-estate/sky-replacement',
    credits: 1,
    beforeImage: '/showcase/real-estate/before/sky-replacement.jpg',
    afterImage: '/showcase/real-estate/after/sky-replacement.jpg',
  },
  {
    id: 'twilight',
    name: 'Day to Twilight',
    description: 'Transform daytime shots into stunning dusk photos',
    icon: Sparkles,
    gradient: 'from-emerald-500 to-teal-600',
    route: '/studio/real-estate/twilight',
    credits: 4,
    isPremium: true,
    beforeImage: '/showcase/real-estate/before/day-to-twilight.jpg',
    afterImage: '/showcase/real-estate/after/day-to-twilight.jpg',
  },
  {
    id: 'item-removal',
    name: 'Item Removal',
    description: 'Remove clutter, cars & unwanted objects',
    icon: Eraser,
    gradient: 'from-rose-500 to-pink-500',
    route: '/studio/real-estate/item-removal',
    credits: 2,
    beforeImage: '/showcase/real-estate/before/item-removal.jpg',
    afterImage: '/showcase/real-estate/after/item-removal.jpg',
  },
  {
    id: 'lawn-enhancement',
    name: 'Lawn Enhancement',
    description: 'Make grass greener & landscaping vibrant',
    icon: TreePine,
    gradient: 'from-green-500 to-emerald-500',
    route: '/studio/real-estate/lawn-enhancement',
    credits: 4,
    beforeImage: '/showcase/real-estate/before/lawn-enhancement.jpg',
    afterImage: '/showcase/real-estate/after/lawn-enhancement.jpg',
  },
  {
    id: 'room-tour',
    name: 'Room Tour Video',
    description: 'Generate cinematic video from a single photo',
    icon: Video,
    gradient: 'from-fuchsia-500 to-pink-500',
    route: '/studio/real-estate/room-tour',
    credits: 5,
    isPremium: true,
    beforeImage: '/showcase/real-estate/before/room-tour-video.jpg',
    afterImage: '/showcase/real-estate/after/room-tour-video.mp4',
  },
  {
    id: 'virtual-renovation',
    name: 'Virtual Renovation',
    description: 'Visualize kitchen & bathroom remodels instantly',
    icon: Paintbrush,
    gradient: 'from-teal-500 to-cyan-500',
    route: '/studio/real-estate/virtual-renovation',
    credits: 3,
    isPremium: true,
    isNew: true,
    beforeImage: '/showcase/real-estate/before/virtual-renovation.jpg',
    afterImage: '/showcase/real-estate/after/virtual-renovation.jpg',
  },
  {
    id: 'wall-color',
    name: 'Wall Color Changer',
    description: 'Preview different paint colors on walls',
    icon: Paintbrush,
    gradient: 'from-pink-500 to-rose-500',
    route: '/studio/real-estate/wall-color',
    credits: 2,
    isNew: true,
    beforeImage: '/showcase/real-estate/before/wall-color-changer.jpg',
    afterImage: '/showcase/real-estate/after/wall-color-changer.jpg',
  },
  {
    id: 'exterior-paint',
    name: 'Exterior Paint Visualizer',
    description: 'Preview exterior paint colors on your home',
    icon: Paintbrush,
    gradient: 'from-emerald-500 to-teal-500',
    route: '/studio/real-estate/exterior-paint',
    credits: 2,
    isNew: true,
    beforeImage: '/showcase/real-estate/before/exterior-paint-visualizer.jpg',
    afterImage: '/showcase/real-estate/after/exterior-paint-visualizer.jpg',
  },
  {
    id: 'floor-replacement',
    name: 'Floor Replacement',
    description: 'Swap hardwood, tile, or carpet styles',
    icon: Layers,
    gradient: 'from-amber-600 to-yellow-500',
    route: '/studio/real-estate/floor-replacement',
    credits: 2,
    isNew: true,
    beforeImage: '/showcase/real-estate/before/floor-replacement.png',
    afterImage: '/showcase/real-estate/after/floor-replacement.jpg',
  },
  {
    id: 'rain-to-shine',
    name: 'Rain to Shine',
    description: 'Convert cloudy or rainy photos to sunny weather',
    icon: CloudSun,
    gradient: 'from-yellow-400 to-orange-400',
    route: '/studio/real-estate/rain-to-shine',
    credits: 1,
    isNew: true,
    beforeImage: '/showcase/real-estate/before/rain-to-shine.png',
    afterImage: '/showcase/real-estate/after/rain-to-shine.jpg',
  },
  {
    id: 'night-to-day',
    name: 'Night to Day',
    description: 'Convert nighttime exteriors to bright daylight',
    icon: Sun,
    gradient: 'from-orange-400 to-yellow-300',
    route: '/studio/real-estate/night-to-day',
    credits: 2,
    isNew: true,
    beforeImage: '/showcase/real-estate/before/night-to-day.jpg',
    afterImage: '/showcase/real-estate/after/night-to-day.jpg',
  },
  {
    id: 'changing-seasons',
    name: 'Changing Seasons',
    description: 'Add spring blooms, fall leaves, or winter snow',
    icon: Snowflake,
    gradient: 'from-sky-400 to-cyan-400',
    route: '/studio/real-estate/changing-seasons',
    credits: 2,
    isNew: true,
    beforeImage: '/showcase/real-estate/before/changing-seasons.jpg',
    afterImage: '/showcase/real-estate/after/changing-seasons.jpg',
  },
  {
    id: 'pool-enhancement',
    name: 'Pool Enhancement',
    description: 'Add water to empty pools or clarify murky water',
    icon: Waves,
    gradient: 'from-cyan-400 to-blue-500',
    route: '/studio/real-estate/pool-enhancement',
    credits: 2,
    isNew: true,
    beforeImage: '/showcase/real-estate/before/pool-enhancement.jpg',
    afterImage: '/showcase/real-estate/after/pool-enhancement.jpg',
  },
  {
    id: 'landscape-design',
    name: 'Landscape Design',
    description: 'Enhance or redesign exterior landscaping',
    icon: TreePine,
    gradient: 'from-green-500 to-lime-500',
    route: '/studio/real-estate/landscape-design',
    credits: 4,
    isNew: true,
    beforeImage: '/showcase/real-estate/before/landscape-design.jpg',
    afterImage: '/showcase/real-estate/after/landscape-design.jpg',
  },
  {
    id: 'auto-declutter',
    name: 'Auto Declutter',
    description: 'One-click clutter removal — no brushing needed',
    icon: Wand2,
    gradient: 'from-amber-500 to-orange-500',
    route: '/studio/real-estate/auto-declutter',
    credits: 2,
    isNew: true,
    beforeImage: '/showcase/real-estate/before/auto-declutter.jpg',
    afterImage: '/showcase/real-estate/after/auto-declutter.jpg',
  },
  {
    id: 'social-media-poster',
    name: 'Social Media Poster',
    description: 'Instant marketing posters with professional templates',
    icon: Share2,
    gradient: 'from-pink-500 to-rose-600',
    route: '/studio/real-estate/social-media-poster',
    credits: 0,
    isNew: true,
    beforeImage: '/showcase/real-estate/before/social-media-poster.jpg',
    afterImage: '/showcase/real-estate/after/social-media-poster.jpg',
  },
  {
    id: 'property-reveal',
    name: 'Property Reveal',
    description: 'Stunning transformation videos - staging reveals, renovation before/after',
    icon: Play,
    gradient: 'from-amber-500 to-orange-600',
    route: '/studio/real-estate/property-reveal',
    credits: 40,
    isPremium: true,
    isNew: true,
    beforeImage: '/showcase/real-estate/before/property-reveal.jpg',
    afterImage: '/showcase/real-estate/after/property-reveal.mp4',
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
const isVideo = (src: string) => /\.(mp4|webm|ogg)$/i.test(src);

const MediaElement: React.FC<{ src: string; alt: string; className?: string }> = ({ src, alt, className }) => {
  if (isVideo(src)) {
    return (
      <video
        src={src}
        className={className}
        autoPlay
        muted
        loop
        playsInline
      />
    );
  }
  return <img src={src} alt={alt} className={className} />;
};

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
      {/* After (Background) */}
      <MediaElement src={after} alt="After" className="w-full h-full object-cover" />

      {/* Before (Clipped) */}
      <div
        className="absolute inset-0 overflow-hidden"
        style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}
      >
        <MediaElement src={before} alt="Before" className="w-full h-full object-cover" />
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
      className="group relative bg-[#121212] rounded-2xl overflow-hidden border border-white/5 hover:border-emerald-500/50 hover:shadow-2xl hover:shadow-emerald-500/10 transition-all duration-300 flex flex-col h-full"
    >
      {/* Preview - Slider for before/after or Single image for posters */}
      <div className="relative aspect-[16/10] overflow-hidden bg-zinc-900" onClick={(e) => e.stopPropagation()}>
        {tool.showcaseType === 'single' ? (
          /* Single Image Showcase (for posters, etc.) */
          <div
            className="w-full h-full flex items-center justify-center bg-gradient-to-br from-zinc-800 to-zinc-900 cursor-pointer"
            onClick={() => navigate(tool.route)}
          >
            <img
              src={tool.afterImage}
              alt={tool.name}
              className="max-w-full max-h-full object-contain rounded-lg shadow-lg"
            />
          </div>
        ) : (
          /* Before/After Slider */
          <>
            <BeforeAfterSlider
              before={tool.beforeImage}
              after={tool.afterImage}
              className="w-full h-full"
            />

            {/* Hover Overlay for clicking the whole card (except slider handle which captures events) */}
            <div
              className="absolute inset-0 cursor-pointer"
              onClick={() => navigate(tool.route)}
              style={{ pointerEvents: 'none' }} // Let clicks pass through to slider, but we handle navigation via the bottom part
            />
          </>
        )}
      </div>

      {/* Content */}
      <div 
        className="p-5 flex flex-col flex-grow cursor-pointer"
        onClick={() => navigate(tool.route)}
      >
        <div className="flex items-start justify-between mb-3">
          <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${tool.gradient} flex items-center justify-center shadow-lg`}>
            <Icon size={20} className="text-white" />
          </div>
          <div className="flex items-center gap-2">
            {tool.isNew && (
              <span className="px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-bold uppercase rounded-full tracking-wider">
                New
              </span>
            )}
            {tool.isPremium && (
              <span className="px-2 py-0.5 bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[10px] font-bold uppercase rounded-full flex items-center gap-1 tracking-wider">
                <Crown size={10} />
                Pro
              </span>
            )}
          </div>
        </div>

        <h3 className="text-lg font-bold text-white mb-2 tracking-tight group-hover:text-emerald-400 transition-colors">
          {tool.name}
        </h3>
        <p className="text-sm text-zinc-400 mb-5 leading-relaxed flex-grow">
          {tool.description}
        </p>

        <div className="flex items-center justify-between mt-auto pt-4 border-t border-white/5">
          <div className="flex items-center gap-1.5 text-xs font-medium text-zinc-500 bg-zinc-900/50 px-2 py-1 rounded-md">
            <Zap size={12} className="text-emerald-400 fill-emerald-400/20" />
            <span>{tool.credits} credits</span>
          </div>
          <button className="text-xs font-semibold text-white bg-zinc-800 hover:bg-emerald-600 px-3 py-1.5 rounded-full flex items-center gap-1.5 transition-all group-hover:bg-emerald-600">
            Try Tool
            <ArrowRight size={12} />
          </button>
        </div>
      </div>
    </motion.div>
  );
};

// Featured Showcase Carousel Component
const FeaturedShowcase: React.FC<{ tools: Tool[] }> = ({ tools }) => {
  const navigate = useNavigate();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const currentTool = tools[currentIndex];
  const Icon = currentTool.icon;

  // Auto-play functionality
  useEffect(() => {
    if (isAutoPlaying) {
      intervalRef.current = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % tools.length);
      }, 5000);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isAutoPlaying, tools.length]);

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
    setIsAutoPlaying(false);
    // Resume auto-play after 10 seconds of inactivity
    setTimeout(() => setIsAutoPlaying(true), 10000);
  };

  const goToPrev = () => {
    setCurrentIndex((prev) => (prev - 1 + tools.length) % tools.length);
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 10000);
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % tools.length);
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 10000);
  };

  return (
    <section className="px-6 pb-16">
      <div className="max-w-[1600px] mx-auto">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="flex items-center justify-between mb-6"
        >
          <div>
            <h2 className="text-2xl font-bold text-white mb-1">See the Magic</h2>
            <p className="text-zinc-500">Drag the slider to compare before & after</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={goToPrev}
              className="p-2 rounded-full bg-zinc-800 hover:bg-zinc-700 transition-colors"
            >
              <ChevronLeft size={20} className="text-zinc-400" />
            </button>
            <button
              onClick={goToNext}
              className="p-2 rounded-full bg-zinc-800 hover:bg-zinc-700 transition-colors"
            >
              <ChevronRight size={20} className="text-zinc-400" />
            </button>
          </div>
        </motion.div>

        {/* Carousel Container */}
        <div className="relative rounded-2xl overflow-hidden bg-zinc-900">
          {/* Before/After Slider with Animation */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.4, ease: 'easeInOut' }}
            >
              <BeforeAfterSlider
                before={currentTool.beforeImage}
                after={currentTool.afterImage}
                className="aspect-[2/1] md:aspect-[2.5/1]"
              />
            </motion.div>
          </AnimatePresence>

          {/* Overlay Content */}
          <div className="absolute bottom-0 left-0 right-0 p-4 md:p-6 bg-gradient-to-t from-black/80 via-black/40 to-transparent">
            <div className="flex items-end justify-between">
              {/* Tool Info */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentIndex}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  className="flex items-center gap-4"
                >
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${currentTool.gradient} flex items-center justify-center`}>
                    <Icon size={24} className="text-white" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-xl font-bold text-white">{currentTool.name}</h3>
                      {currentTool.isPremium && (
                        <span className="px-2 py-0.5 bg-amber-500/20 text-amber-400 text-[10px] font-bold uppercase rounded-full flex items-center gap-1">
                          <Crown size={10} />
                          Pro
                        </span>
                      )}
                      {currentTool.isNew && (
                        <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 text-[10px] font-bold uppercase rounded-full">
                          New
                        </span>
                      )}
                    </div>
                    <p className="text-zinc-400 text-sm">{currentTool.description}</p>
                  </div>
                </motion.div>
              </AnimatePresence>

              {/* CTA Button */}
              <button
                onClick={() => navigate(currentTool.route)}
                className="hidden md:flex px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-medium rounded-xl items-center gap-2 transition-colors"
              >
                Try Now
                <ArrowRight size={16} />
              </button>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-black/20">
            <motion.div
              className="h-full bg-emerald-500"
              initial={{ width: '0%' }}
              animate={{ width: '100%' }}
              transition={{ duration: 5, ease: 'linear' }}
              key={currentIndex}
            />
          </div>
        </div>

        {/* Dot Navigation */}
        <div className="flex items-center justify-center gap-1.5 mt-4">
          {tools.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`rounded-full transition-all ${
                index === currentIndex
                  ? 'w-6 h-2 bg-emerald-500'
                  : 'w-2 h-2 bg-zinc-300 dark:bg-zinc-700 hover:bg-zinc-400 dark:hover:bg-zinc-500'
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

// ============ MAIN PAGE ============
export const RealEstatePageV2: React.FC = () => {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen flex bg-white dark:bg-[#0a0a0a] text-zinc-900 dark:text-white font-[Space_Grotesk]">
      <NavigationRail isMobileOpen={mobileMenuOpen} onMobileClose={() => setMobileMenuOpen(false)} />
      <div className="flex-1 flex flex-col ml-0 lg:ml-16">
        <DashboardTopbar onMenuClick={() => setMobileMenuOpen(true)} />
        <div className="flex-1 overflow-y-auto">
        {/* ===== HERO SECTION ===== */}
        <section className="relative pt-12 pb-16 px-6 overflow-hidden">
          {/* Subtle gradient bg */}
          <div className="absolute inset-0 bg-gradient-to-b from-emerald-950/20 via-[#0a0a0a] to-[#0a0a0a] pointer-events-none" />
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-emerald-600/10 blur-[120px] rounded-full pointer-events-none" />

          <div className="relative max-w-[1600px] mx-auto">
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-3 mb-8"
            >
              <div className="flex items-center gap-2 px-4 py-2 bg-[#1A1A1A] border border-white/10 rounded-full backdrop-blur-sm shadow-xl">
                <div className="flex -space-x-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={14} className="text-amber-400 fill-amber-400" />
                  ))}
                </div>
                <span className="text-sm text-zinc-300 font-medium ml-1">4.9/5 from 2,000+ agents</span>
              </div>
            </motion.div>

            {/* Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-[1.1] tracking-tight max-w-4xl"
            >
              Transform listings with
              <br className="hidden md:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-400 to-blue-400 animate-gradient-x"> AI-powered </span>
              photo editing
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-lg md:text-xl text-zinc-400 mb-10 max-w-2xl leading-relaxed text-balance"
            >
              Virtual staging, sky replacement, twilight conversion, and video tours.
              Everything you need to make properties sell faster, in seconds.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex flex-wrap items-center gap-4 mb-16"
            >
              <button
                onClick={() => navigate('/studio/real-estate/virtual-staging')}
                className="px-8 py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl flex items-center gap-2 transition-all shadow-lg shadow-emerald-600/20 hover:shadow-emerald-600/40 hover:-translate-y-0.5"
              >
                Start for Free
                <ArrowRight size={20} />
              </button>
              <button className="px-8 py-4 bg-[#1A1A1A] hover:bg-[#252525] border border-white/10 text-white font-medium rounded-xl flex items-center gap-2 transition-all hover:-translate-y-0.5">
                <Play size={20} className="fill-current" />
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

        {/* ===== FEATURED BEFORE/AFTER CAROUSEL ===== */}
        <FeaturedShowcase tools={TOOLS} />

        {/* ===== HOW IT WORKS ===== */}
        <section className="px-6 pb-24">
          <div className="max-w-[1600px] mx-auto">
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl font-bold text-white mb-3 tracking-tight">How it works</h2>
              <p className="text-zinc-500">Professional results in 4 simple steps</p>
            </motion.div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {STEPS.map((step, index) => (
                <motion.div
                  key={step.num}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="relative p-6 bg-[#121212] rounded-2xl border border-white/5 hover:border-emerald-500/30 transition-colors group"
                >
                  <div className="w-10 h-10 rounded-xl bg-emerald-600/10 border border-emerald-600/20 text-emerald-400 font-bold flex items-center justify-center mb-4 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                    {step.num}
                  </div>
                  <h3 className="text-white font-bold mb-2">{step.title}</h3>
                  <p className="text-sm text-zinc-400 leading-relaxed">{step.desc}</p>

                  {/* Connector line */}
                  {index < STEPS.length - 1 && (
                    <div className="hidden md:block absolute top-11 -right-3 w-6 border-t border-dashed border-white/10" />
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ===== TOOLS GRID ===== */}
        <section className="px-6 pb-24">
          <div className="max-w-[1600px] mx-auto">
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="flex items-center justify-between mb-10"
            >
              <div>
                <h2 className="text-3xl font-bold text-white mb-2 tracking-tight">All Tools</h2>
                <p className="text-zinc-500">Drag the slider on each card to see before/after</p>
              </div>
              <div className="hidden md:flex items-center gap-2 text-sm text-zinc-500 bg-[#121212] px-3 py-1.5 rounded-full border border-white/5">
                <span>23 tools available</span>
              </div>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {TOOLS.map((tool, index) => (
                <ToolCard key={tool.id} tool={tool} index={index} />
              ))}
            </div>
          </div>
        </section>

        {/* ===== STATS SECTION ===== */}
        <section className="px-6 pb-24">
          <div className="max-w-[1600px] mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="grid grid-cols-2 md:grid-cols-4 gap-6"
            >
              {[
                { icon: ImageIcon, value: '50K+', label: 'Photos Enhanced' },
                { icon: Clock, value: '<30s', label: 'Average Processing' },
                { icon: Users, value: '2,000+', label: 'Happy Agents' },
                { icon: Shield, value: '99.9%', label: 'Uptime' },
              ].map((stat, index) => (
                <div
                  key={index}
                  className="p-6 bg-[#121212] rounded-2xl border border-white/5 text-center hover:border-emerald-500/30 transition-colors group"
                >
                  <stat.icon size={28} className="text-emerald-400 mx-auto mb-4 group-hover:scale-110 transition-transform" />
                  <p className="text-3xl font-bold text-white mb-1 tracking-tight">{stat.value}</p>
                  <p className="text-sm text-zinc-500">{stat.label}</p>
                </div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* ===== CTA SECTION ===== */}
        <section className="px-6 pb-24">
          <div className="max-w-[1600px] mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="relative p-10 md:p-16 rounded-3xl bg-gradient-to-br from-emerald-600 to-teal-700 overflow-hidden shadow-2xl shadow-emerald-900/20"
            >
              {/* Decorative circles */}
              <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-black/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

              <div className="relative text-center max-w-2xl mx-auto">
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 tracking-tight">
                  Ready to transform your listings?
                </h2>
                <p className="text-white/80 mb-8 text-lg text-balance">
                  Join 2,000+ real estate agents using Photovid to sell properties faster.
                  Get started with 100 free credits today.
                </p>
                <button
                  onClick={() => navigate('/studio/real-estate/virtual-staging')}
                  className="px-8 py-4 bg-white text-emerald-700 font-bold rounded-xl hover:bg-zinc-50 transition-all shadow-xl hover:shadow-2xl hover:-translate-y-1 inline-flex items-center gap-2"
                >
                  Get Started Free
                  <ArrowRight size={20} />
                </button>
              </div>
            </motion.div>
          </div>
        </section>
        </div>
      </div>
    </div>
  );
};
