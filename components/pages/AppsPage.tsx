import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Building2,
  Car,
  ArrowRight,
  Sparkles,
  Play,
  Crown,
  TrendingUp,
  Zap,
  Image as ImageIcon,
  Video,
  Wand2,
  Search,
  ChevronRight,
} from 'lucide-react';
import { NavigationRail, FlyoutType } from '../dashboard/navigation/NavigationRail';
import { FlyoutPanels } from '../dashboard/navigation/FlyoutPanels';
import { AI_APPS, getTrendingApps, getNewApps, type AIApp } from '../../lib/data/apps';
import { INDUSTRY_CONFIGS } from '../../lib/data/industries';

export const AppsPage: React.FC = () => {
  const [activeFlyout, setActiveFlyout] = useState<FlyoutType>(null);
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);
  const navigate = useNavigate();

  const trendingApps = getTrendingApps();
  const newApps = getNewApps();
  const realEstate = INDUSTRY_CONFIGS['real-estate'];
  const auto = INDUSTRY_CONFIGS['auto'];

  const handleAppClick = (app: AIApp) => {
    switch (app.id) {
      case 'lipsync':
        navigate('/studio/lipsync');
        break;
      case 'image-to-video':
        navigate('/studio');
        break;
      default:
        navigate('/studio/image');
    }
  };

  return (
    <div className="h-screen flex bg-[#0a0a0b]">
      <NavigationRail activeFlyout={activeFlyout} onFlyoutChange={setActiveFlyout} />
      <FlyoutPanels activeFlyout={activeFlyout} onClose={() => setActiveFlyout(null)} />

      <div className="flex-1 overflow-y-auto ml-56">
        {/* Hero Section */}
        <div className="relative overflow-hidden">
          {/* Background gradient */}
          <div className="absolute inset-0 bg-gradient-to-b from-violet-950/20 via-transparent to-transparent" />
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-violet-500/10 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2" />

          <div className="relative px-6 pt-8 pb-12">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-4xl font-bold text-white mb-2">
                Discover AI Tools
              </h1>
              <p className="text-zinc-400 text-lg">
                Powerful AI apps to transform your creative vision
              </p>
            </div>

            {/* Bento Grid */}
            <div className="grid grid-cols-12 gap-4 auto-rows-[140px]">
              {/* Real Estate - Large Featured */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                onClick={() => navigate('/studio/apps/real-estate')}
                onMouseEnter={() => setHoveredCard('real-estate')}
                onMouseLeave={() => setHoveredCard(null)}
                className="col-span-12 md:col-span-6 row-span-2 relative group cursor-pointer rounded-3xl overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-indigo-600 to-violet-700" />
                <img
                  src={realEstate?.heroPreviewImage}
                  alt="Real Estate"
                  className={`absolute inset-0 w-full h-full object-cover transition-all duration-700 ${
                    hoveredCard === 'real-estate' ? 'opacity-40 scale-110' : 'opacity-30 scale-100'
                  }`}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                <div className="relative h-full p-6 flex flex-col justify-between">
                  <div className="flex items-start justify-between">
                    <div className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-sm flex items-center justify-center">
                      <Building2 size={28} className="text-white" />
                    </div>
                    <span className="px-3 py-1 rounded-full bg-white/10 backdrop-blur-sm text-white text-xs font-medium">
                      {realEstate?.featuredTools.length} tools
                    </span>
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white mb-2">Real Estate</h2>
                    <p className="text-white/70 text-sm mb-4 max-w-md">
                      Virtual staging, sky replacement, twilight conversion & more
                    </p>
                    <motion.div
                      className="flex items-center gap-2 text-white font-medium"
                      animate={{ x: hoveredCard === 'real-estate' ? 8 : 0 }}
                    >
                      Explore tools <ArrowRight size={18} />
                    </motion.div>
                  </div>
                </div>
              </motion.div>

              {/* Auto Dealership */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                onClick={() => navigate('/studio/apps/auto')}
                onMouseEnter={() => setHoveredCard('auto')}
                onMouseLeave={() => setHoveredCard(null)}
                className="col-span-12 md:col-span-6 lg:col-span-3 row-span-2 relative group cursor-pointer rounded-3xl overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-zinc-800 via-zinc-900 to-black" />
                <img
                  src={auto?.heroPreviewImage}
                  alt="Auto"
                  className={`absolute inset-0 w-full h-full object-cover transition-all duration-700 ${
                    hoveredCard === 'auto' ? 'opacity-40 scale-110' : 'opacity-30 scale-100'
                  }`}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                <div className="relative h-full p-5 flex flex-col justify-between">
                  <div className="w-12 h-12 rounded-xl bg-white/10 backdrop-blur-sm flex items-center justify-center">
                    <Car size={24} className="text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white mb-1">Auto Dealership</h3>
                    <p className="text-white/60 text-sm mb-3">360° spins & showroom shots</p>
                    <motion.div
                      className="flex items-center gap-1.5 text-white/80 text-sm font-medium"
                      animate={{ x: hoveredCard === 'auto' ? 4 : 0 }}
                    >
                      Explore <ArrowRight size={14} />
                    </motion.div>
                  </div>
                </div>
              </motion.div>

              {/* Quick Access Cards */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                onClick={() => navigate('/studio/image')}
                className="col-span-6 lg:col-span-3 row-span-1 relative group cursor-pointer rounded-2xl overflow-hidden bg-gradient-to-br from-violet-600 to-fuchsia-600 hover:scale-[1.02] transition-transform"
              >
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1547891654-e66ed7ebb968?w=400')] bg-cover bg-center opacity-20" />
                <div className="relative h-full p-4 flex flex-col justify-between">
                  <ImageIcon size={24} className="text-white/80" />
                  <div>
                    <h4 className="text-white font-semibold">Image Tools</h4>
                    <p className="text-white/60 text-xs">Generate & edit</p>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                onClick={() => navigate('/studio/lipsync')}
                className="col-span-6 lg:col-span-3 row-span-1 relative group cursor-pointer rounded-2xl overflow-hidden bg-gradient-to-br from-orange-500 to-pink-600 hover:scale-[1.02] transition-transform"
              >
                <div className="relative h-full p-4 flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <Video size={24} className="text-white/80" />
                    <span className="px-2 py-0.5 rounded-full bg-white/20 text-white text-[10px] font-bold">HOT</span>
                  </div>
                  <div>
                    <h4 className="text-white font-semibold">Lipsync</h4>
                    <p className="text-white/60 text-xs">Make portraits talk</p>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>

        {/* Trending Section */}
        <div className="px-6 py-10">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-pink-500 flex items-center justify-center">
                <TrendingUp size={20} className="text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Trending Now</h2>
                <p className="text-zinc-500 text-sm">Most popular this week</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4">
            {trendingApps.map((app, index) => (
              <VisualAppCard
                key={app.id}
                app={app}
                index={index}
                onHover={setHoveredCard}
                isHovered={hoveredCard === app.id}
                onClick={() => handleAppClick(app)}
              />
            ))}
          </div>
        </div>

        {/* New Arrivals */}
        <div className="px-6 py-10">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center">
                <Zap size={20} className="text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">New Arrivals</h2>
                <p className="text-zinc-500 text-sm">Fresh tools just added</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4">
            {newApps.map((app, index) => (
              <VisualAppCard
                key={app.id}
                app={app}
                index={index}
                onHover={setHoveredCard}
                isHovered={hoveredCard === app.id}
                onClick={() => handleAppClick(app)}
                showNewBadge
              />
            ))}
          </div>
        </div>

        {/* All Apps Grid */}
        <div className="px-6 py-10 pb-20">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
                <Sparkles size={20} className="text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">All Apps</h2>
                <p className="text-zinc-500 text-sm">{AI_APPS.length} powerful AI tools</p>
              </div>
            </div>
          </div>

          {/* Masonry-style grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4">
            {AI_APPS.map((app, index) => (
              <VisualAppCard
                key={app.id}
                app={app}
                index={index}
                onHover={setHoveredCard}
                isHovered={hoveredCard === app.id}
                onClick={() => handleAppClick(app)}
                variant={index % 5 === 0 ? 'tall' : 'normal'}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// Visual App Card Component
interface VisualAppCardProps {
  app: AIApp;
  index: number;
  onHover: (id: string | null) => void;
  isHovered: boolean;
  onClick: () => void;
  variant?: 'normal' | 'tall';
  showNewBadge?: boolean;
}

const VisualAppCard: React.FC<VisualAppCardProps> = ({
  app,
  index,
  onHover,
  isHovered,
  onClick,
  variant = 'normal',
  showNewBadge = false,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      onMouseEnter={() => onHover(app.id)}
      onMouseLeave={() => onHover(null)}
      onClick={onClick}
      className={`
        relative group cursor-pointer rounded-2xl overflow-hidden
        bg-zinc-900 border border-white/5 hover:border-white/10
        transition-all duration-300 hover:shadow-2xl hover:shadow-violet-500/10
        ${variant === 'tall' ? 'row-span-2' : ''}
      `}
    >
      {/* Image */}
      <div className={`relative overflow-hidden ${variant === 'tall' ? 'aspect-[3/4]' : 'aspect-[4/3]'}`}>
        <img
          src={app.thumbnail}
          alt={app.name}
          className={`w-full h-full object-cover transition-all duration-500 ${
            isHovered ? 'scale-110 blur-[2px]' : 'scale-100'
          }`}
        />

        {/* Gradient overlay */}
        <div className={`absolute inset-0 bg-gradient-to-t from-zinc-900 via-zinc-900/50 to-transparent transition-opacity duration-300 ${
          isHovered ? 'opacity-90' : 'opacity-70'
        }`} />

        {/* Badges */}
        <div className="absolute top-3 left-3 flex gap-2">
          {(app.isNew || showNewBadge) && (
            <span className="px-2 py-1 bg-emerald-500 text-white text-[10px] font-bold uppercase rounded-full flex items-center gap-1">
              <Zap size={10} />
              New
            </span>
          )}
          {app.isTrending && (
            <span className="px-2 py-1 bg-gradient-to-r from-orange-500 to-pink-500 text-white text-[10px] font-bold uppercase rounded-full flex items-center gap-1">
              <TrendingUp size={10} />
              Hot
            </span>
          )}
        </div>

        {app.isPremium && (
          <div className="absolute top-3 right-3">
            <span className="px-2 py-1 bg-gradient-to-r from-amber-400 to-yellow-500 text-black text-[10px] font-bold uppercase rounded-full flex items-center gap-1">
              <Crown size={10} />
              Pro
            </span>
          </div>
        )}

        {/* Play button on hover */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: isHovered ? 1 : 0, scale: isHovered ? 1 : 0.8 }}
          className="absolute inset-0 flex items-center justify-center"
        >
          <div className="w-14 h-14 rounded-full bg-white/90 flex items-center justify-center shadow-2xl">
            <Play size={24} className="text-violet-600 ml-1" fill="currentColor" />
          </div>
        </motion.div>

        {/* Content overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <h3 className={`font-bold text-white mb-1 transition-colors ${
            isHovered ? 'text-violet-300' : ''
          }`}>
            {app.name}
          </h3>
          <p className={`text-zinc-400 text-sm line-clamp-2 transition-all duration-300 ${
            isHovered ? 'opacity-100' : 'opacity-80'
          }`}>
            {app.description}
          </p>
        </div>
      </div>

      {/* Tags */}
      <div className="p-3 pt-0 flex flex-wrap gap-1.5">
        {app.tags.slice(0, 3).map((tag) => (
          <span
            key={tag}
            className="px-2 py-0.5 bg-white/5 text-zinc-500 text-[10px] font-medium rounded-full"
          >
            {tag}
          </span>
        ))}
      </div>

      {/* Hover action */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: isHovered ? 1 : 0, y: isHovered ? 0 : 10 }}
        className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-zinc-900 via-zinc-900/95 to-transparent"
      >
        <button className="w-full py-2.5 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white text-sm font-semibold rounded-xl hover:from-violet-500 hover:to-fuchsia-500 transition-all flex items-center justify-center gap-2">
          <Sparkles size={16} />
          Try Now
        </button>
      </motion.div>
    </motion.div>
  );
};

export default AppsPage;
