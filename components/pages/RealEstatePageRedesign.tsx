import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Building2,
  Sparkles,
  Play,
  ArrowRight,
  Crown,
  Zap,
  Image as ImageIcon,
  Video,
  Wand2,
  Sun,
  Eraser,
  TreePine,
  Camera,
  ChevronRight,
  Star,
  TrendingUp,
  Clock,
  Check,
} from 'lucide-react';
import { NavigationRail, FlyoutType } from '../dashboard/navigation/NavigationRail';
import { FlyoutPanels } from '../dashboard/navigation/FlyoutPanels';

// Tool categories for tabs
type ToolCategory = 'all' | 'photo' | 'video' | 'ai';

interface Tool {
  id: string;
  name: string;
  description: string;
  icon: React.ElementType;
  gradient: string;
  route: string;
  category: ToolCategory[];
  isPremium?: boolean;
  isNew?: boolean;
  isFeatured?: boolean;
  stats?: string;
}

const TOOLS: Tool[] = [
  {
    id: 'virtual-staging',
    name: 'Virtual Staging',
    description: 'Transform empty rooms with AI-generated furniture and decor',
    icon: Building2,
    gradient: 'from-blue-500 to-indigo-600',
    route: '/studio/apps/real-estate/virtual-staging',
    category: ['all', 'photo', 'ai'],
    isFeatured: true,
    stats: '73% faster sales',
  },
  {
    id: 'photo-enhancement',
    name: 'Photo Enhancement',
    description: 'One-click HDR, lighting fixes, and professional color grading',
    icon: Camera,
    gradient: 'from-amber-500 to-orange-600',
    route: '/studio/apps/real-estate/photo-enhancement',
    category: ['all', 'photo'],
    stats: '30% more clicks',
  },
  {
    id: 'sky-replacement',
    name: 'Sky Replacement',
    description: 'Replace overcast skies with perfect blue skies instantly',
    icon: Sun,
    gradient: 'from-cyan-400 to-blue-500',
    route: '/studio/apps/real-estate/sky-replacement',
    category: ['all', 'photo'],
  },
  {
    id: 'twilight',
    name: 'Day-to-Twilight',
    description: 'Convert daytime exteriors into stunning dusk photography',
    icon: Sparkles,
    gradient: 'from-indigo-500 to-purple-600',
    route: '/studio/apps/real-estate/twilight',
    category: ['all', 'photo', 'ai'],
    isPremium: true,
    stats: '35% more views',
  },
  {
    id: 'item-removal',
    name: 'Item Removal',
    description: 'Remove clutter, cars, and unwanted objects seamlessly',
    icon: Eraser,
    gradient: 'from-rose-500 to-pink-600',
    route: '/studio/apps/real-estate/item-removal',
    category: ['all', 'photo', 'ai'],
  },
  {
    id: 'lawn-enhancement',
    name: 'Lawn Enhancement',
    description: 'Make grass greener and landscaping more vibrant',
    icon: TreePine,
    gradient: 'from-green-500 to-emerald-600',
    route: '/studio/apps/real-estate/lawn-enhancement',
    category: ['all', 'photo'],
  },
  {
    id: 'room-tour',
    name: 'Room Tour Video',
    description: 'Generate cinematic video clips from still photos',
    icon: Video,
    gradient: 'from-violet-500 to-purple-600',
    route: '/studio/apps/real-estate/room-tour',
    category: ['all', 'video', 'ai'],
    isPremium: true,
  },
  {
    id: 'storyboard',
    name: 'Property Storyboard',
    description: 'Build complete video tours with multiple scenes and transitions',
    icon: ImageIcon,
    gradient: 'from-fuchsia-500 to-pink-600',
    route: '/studio/apps/real-estate/storyboard',
    category: ['all', 'video', 'ai'],
    isPremium: true,
    isNew: true,
  },
  {
    id: 'text-to-video',
    name: 'Text-to-Video',
    description: 'Generate entire property videos from listing descriptions',
    icon: Wand2,
    gradient: 'from-violet-600 to-indigo-600',
    route: '/studio/apps/real-estate/text-to-video',
    category: ['all', 'video', 'ai'],
    isPremium: true,
    isNew: true,
  },
];

const QUICK_ACTIONS = [
  { id: 'virtual-staging', label: 'Stage a Room', icon: Building2 },
  { id: 'photo-enhancement', label: 'Enhance Photo', icon: Camera },
  { id: 'storyboard', label: 'Create Video Tour', icon: Video },
];

// Stagger animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring', stiffness: 100, damping: 15 },
  },
};

// Tool Card Component
const ToolCard: React.FC<{ tool: Tool; index: number }> = ({ tool, index }) => {
  const navigate = useNavigate();
  const Icon = tool.icon;

  return (
    <motion.div
      variants={itemVariants}
      whileHover={{ y: -8, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => navigate(tool.route)}
      className="group relative bg-zinc-900/50 backdrop-blur-sm rounded-2xl border border-white/10 overflow-hidden cursor-pointer hover:border-white/20 transition-colors"
    >
      {/* Gradient glow on hover */}
      <div className={`absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity bg-gradient-to-br ${tool.gradient}`} />

      {/* Content */}
      <div className="relative p-5">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${tool.gradient} flex items-center justify-center shadow-lg`}>
            <Icon size={24} className="text-white" />
          </div>

          <div className="flex gap-1.5">
            {tool.isNew && (
              <span className="px-2 py-0.5 bg-green-500/20 text-green-400 text-[10px] font-bold uppercase rounded-full">
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

        {/* Title & Description */}
        <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-white transition-colors">
          {tool.name}
        </h3>
        <p className="text-sm text-zinc-400 leading-relaxed mb-4">
          {tool.description}
        </p>

        {/* Stats or CTA */}
        <div className="flex items-center justify-between">
          {tool.stats ? (
            <div className="flex items-center gap-1.5 text-xs text-emerald-400">
              <TrendingUp size={14} />
              {tool.stats}
            </div>
          ) : (
            <div />
          )}

          <div className="flex items-center gap-1 text-sm text-zinc-500 group-hover:text-white transition-colors">
            Try now
            <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// Featured Tool Hero Card
const FeaturedToolCard: React.FC<{ tool: Tool }> = ({ tool }) => {
  const navigate = useNavigate();
  const Icon = tool.icon;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.02 }}
      onClick={() => navigate(tool.route)}
      className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-700 p-8 cursor-pointer group"
    >
      {/* Decorative elements */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-black/20 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2" />

      {/* Grid pattern */}
      <div className="absolute inset-0 opacity-10" style={{
        backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)',
        backgroundSize: '24px 24px',
      }} />

      <div className="relative flex flex-col lg:flex-row items-start lg:items-center gap-6">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center">
              <Icon size={28} className="text-white" />
            </div>
            <div>
              <span className="text-white/60 text-sm">Most Popular</span>
              <h3 className="text-2xl font-bold text-white">{tool.name}</h3>
            </div>
          </div>

          <p className="text-white/80 text-lg mb-6 max-w-md">
            {tool.description}
          </p>

          <div className="flex flex-wrap items-center gap-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-6 py-3 bg-white text-violet-700 font-semibold rounded-xl flex items-center gap-2 shadow-xl shadow-black/20"
            >
              Get Started
              <ArrowRight size={18} />
            </motion.button>

            <div className="flex items-center gap-6 text-white/80 text-sm">
              <div className="flex items-center gap-2">
                <Check size={16} className="text-green-400" />
                73% faster sales
              </div>
              <div className="flex items-center gap-2">
                <Check size={16} className="text-green-400" />
                40% more views
              </div>
            </div>
          </div>
        </div>

        {/* Preview image placeholder */}
        <div className="w-full lg:w-72 aspect-video rounded-2xl bg-white/10 backdrop-blur border border-white/20 overflow-hidden">
          <div className="w-full h-full flex items-center justify-center">
            <Play size={48} className="text-white/60" />
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// Main Page Component
export const RealEstatePageRedesign: React.FC = () => {
  const navigate = useNavigate();
  const [activeFlyout, setActiveFlyout] = useState<FlyoutType>(null);
  const [activeCategory, setActiveCategory] = useState<ToolCategory>('all');

  const filteredTools = TOOLS.filter(
    tool => activeCategory === 'all' || tool.category.includes(activeCategory)
  );

  const featuredTool = TOOLS.find(t => t.isFeatured);

  const categories: { id: ToolCategory; label: string; icon: React.ElementType }[] = [
    { id: 'all', label: 'All Tools', icon: Sparkles },
    { id: 'photo', label: 'Photo Editing', icon: Camera },
    { id: 'video', label: 'Video Creation', icon: Video },
    { id: 'ai', label: 'AI-Powered', icon: Wand2 },
  ];

  return (
    <div className="min-h-screen flex bg-[#08080a]">
      <NavigationRail activeFlyout={activeFlyout} onFlyoutChange={setActiveFlyout} />
      <FlyoutPanels activeFlyout={activeFlyout} onClose={() => setActiveFlyout(null)} />

      <div className="flex-1 ml-[72px] overflow-y-auto">
        {/* Hero Section */}
        <div className="relative overflow-hidden">
          {/* Background gradient */}
          <div className="absolute inset-0 bg-gradient-to-b from-violet-950/50 via-transparent to-transparent" />
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-violet-600/20 rounded-full blur-[120px]" />

          <div className="relative max-w-7xl mx-auto px-6 pt-12 pb-8">
            {/* Breadcrumb */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-2 text-sm text-zinc-500 mb-8"
            >
              <button onClick={() => navigate('/studio/apps')} className="hover:text-white transition-colors">
                Apps
              </button>
              <ChevronRight size={14} />
              <span className="text-white">Real Estate</span>
            </motion.div>

            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-3xl mb-10"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center">
                  <Building2 size={24} className="text-white" />
                </div>
                <div className="px-3 py-1 bg-violet-500/20 text-violet-300 text-xs font-medium rounded-full">
                  9 Professional Tools
                </div>
              </div>

              <h1 className="text-4xl lg:text-5xl font-bold text-white mb-4 leading-tight">
                Real Estate
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-indigo-400"> AI Studio</span>
              </h1>

              <p className="text-xl text-zinc-400 leading-relaxed">
                Transform property photos into stunning visuals that sell. Virtual staging, photo enhancement,
                and AI-powered video tours—all in one place.
              </p>
            </motion.div>

            {/* Quick Actions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="flex flex-wrap gap-3 mb-12"
            >
              {QUICK_ACTIONS.map((action) => {
                const Icon = action.icon;
                const tool = TOOLS.find(t => t.id === action.id);
                return (
                  <motion.button
                    key={action.id}
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => tool && navigate(tool.route)}
                    className="px-5 py-3 bg-white/10 hover:bg-white/15 backdrop-blur-sm border border-white/10 rounded-xl text-white font-medium flex items-center gap-2 transition-colors"
                  >
                    <Icon size={18} className="text-violet-400" />
                    {action.label}
                    <ArrowRight size={16} className="text-zinc-500" />
                  </motion.button>
                );
              })}
            </motion.div>

            {/* Featured Tool */}
            {featuredTool && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="mb-12"
              >
                <FeaturedToolCard tool={featuredTool} />
              </motion.div>
            )}
          </div>
        </div>

        {/* Tools Section */}
        <div className="max-w-7xl mx-auto px-6 pb-20">
          {/* Category Tabs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex items-center gap-2 mb-8 overflow-x-auto pb-2"
          >
            {categories.map((cat) => {
              const Icon = cat.icon;
              const isActive = activeCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`px-4 py-2.5 rounded-xl font-medium text-sm flex items-center gap-2 transition-all whitespace-nowrap ${
                    isActive
                      ? 'bg-violet-600 text-white shadow-lg shadow-violet-600/25'
                      : 'bg-white/5 text-zinc-400 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <Icon size={16} />
                  {cat.label}
                </button>
              );
            })}
          </motion.div>

          {/* Tools Grid */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeCategory}
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5"
            >
              {filteredTools.map((tool, index) => (
                <ToolCard key={tool.id} tool={tool} index={index} />
              ))}
            </motion.div>
          </AnimatePresence>

          {/* Stats Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mt-16 grid grid-cols-2 lg:grid-cols-4 gap-4"
          >
            {[
              { value: '50K+', label: 'Listings Enhanced', icon: ImageIcon },
              { value: '3x', label: 'Faster Time-to-Sell', icon: Clock },
              { value: '47%', label: 'More Inquiries', icon: TrendingUp },
              { value: '4.9', label: 'User Rating', icon: Star },
            ].map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div
                  key={index}
                  className="p-5 rounded-2xl bg-white/5 border border-white/10"
                >
                  <Icon size={20} className="text-violet-400 mb-3" />
                  <p className="text-2xl font-bold text-white mb-1">{stat.value}</p>
                  <p className="text-sm text-zinc-500">{stat.label}</p>
                </div>
              );
            })}
          </motion.div>

          {/* CTA Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mt-16 text-center"
          >
            <div className="inline-flex flex-col items-center p-8 rounded-3xl bg-gradient-to-br from-violet-600/20 to-indigo-600/20 border border-violet-500/20">
              <Zap size={32} className="text-violet-400 mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">Ready to transform your listings?</h3>
              <p className="text-zinc-400 mb-6 max-w-md">
                Start with 100 free credits. No credit card required.
              </p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/studio/apps/real-estate/virtual-staging')}
                className="px-8 py-4 bg-violet-600 hover:bg-violet-500 text-white font-semibold rounded-xl flex items-center gap-2 transition-colors"
              >
                Start Creating
                <ArrowRight size={18} />
              </motion.button>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};
