import React, { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Star, ArrowRight, Crown, TrendingUp, Zap } from 'lucide-react';
import { INDUSTRY_CONFIGS } from '../../../lib/data/industries';

interface FeaturedItem {
  id: string;
  name: string;
  description: string;
  image: string;
  route?: string;
  badge?: 'featured' | 'popular' | 'new' | 'pro';
  tag?: string;
}

function buildRealEstateFeatured(): FeaturedItem[] {
  const config = INDUSTRY_CONFIGS['real-estate'];
  if (!config) return [];

  return config.featuredTools.map((tool) => ({
    id: tool.id,
    name: tool.name,
    description: tool.longDescription || tool.description,
    image: tool.image,
    route: tool.route,
    badge: tool.isPremium ? 'pro' : tool.tags?.includes('Most Used') ? 'popular' : 'featured',
    tag: tool.tags?.[0] || 'Real Estate',
  }));
}

export const IndustryFeaturedTools: React.FC = () => {
  const navigate = useNavigate();
  const scrollRef = useRef<HTMLDivElement>(null);
  const items = buildRealEstateFeatured();

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -370 : 370,
        behavior: 'smooth',
      });
    }
  };

  const handleCardClick = (item: FeaturedItem) => {
    if (item.route) {
      navigate(item.route);
    } else {
      navigate('/studio/real-estate');
    }
  };

  const badgeConfig = {
    featured: { label: 'Featured', icon: Star, className: 'bg-amber-500/90 text-white' },
    popular: { label: 'Most Used', icon: TrendingUp, className: 'bg-gradient-to-r from-orange-500 to-pink-500 text-white' },
    new: { label: 'New', icon: Zap, className: 'bg-emerald-500 text-white' },
    pro: { label: 'Pro', icon: Crown, className: 'bg-gradient-to-r from-amber-400 to-yellow-500 text-amber-900' },
  };

  return (
    <div>
      {/* Section Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
            <Star size={20} className="text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-zinc-900 dark:text-white">
              Featured Tools
            </h2>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              Most popular real estate AI tools
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/studio/real-estate')}
            className="hidden sm:flex items-center gap-2 px-4 py-2 text-sm font-medium text-teal-600 dark:text-teal-400 hover:bg-teal-50 dark:hover:bg-teal-950/30 rounded-lg transition-colors"
          >
            View All Tools
            <ArrowRight size={16} />
          </button>
          <div className="flex gap-2">
            <button
              onClick={() => scroll('left')}
              className="p-2 rounded-full bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
            >
              <ChevronLeft size={20} className="text-zinc-600 dark:text-zinc-400" />
            </button>
            <button
              onClick={() => scroll('right')}
              className="p-2 rounded-full bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
            >
              <ChevronRight size={20} className="text-zinc-600 dark:text-zinc-400" />
            </button>
          </div>
        </div>
      </div>

      {/* Carousel */}
      <div
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide snap-x snap-mandatory -mx-6 px-6"
      >
        {items.map((item, index) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="snap-start flex-shrink-0 w-[340px]"
          >
            <div
              onClick={() => handleCardClick(item)}
              className="rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 overflow-hidden cursor-pointer group hover:border-teal-500 dark:hover:border-teal-500 transition-all hover:shadow-lg hover:shadow-teal-500/5"
            >
              {/* Image */}
              <div className="relative aspect-video overflow-hidden">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                {item.badge && (
                  <div className="absolute top-3 right-3">
                    {(() => {
                      const cfg = badgeConfig[item.badge];
                      const BadgeIcon = cfg.icon;
                      return (
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase flex items-center gap-1 ${cfg.className}`}>
                          <BadgeIcon size={10} />
                          {cfg.label}
                        </span>
                      );
                    })()}
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="p-5">
                <h3 className="text-base font-bold text-zinc-900 dark:text-white mb-1.5 group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">
                  {item.name}
                </h3>
                <p className="text-sm text-zinc-500 dark:text-zinc-400 line-clamp-2 mb-4">
                  {item.description}
                </p>
                <div className="flex items-center justify-between">
                  <span className="px-3 py-1 rounded-full bg-teal-50 dark:bg-teal-500/10 text-teal-600 dark:text-teal-400 text-xs font-medium">
                    {item.tag}
                  </span>
                  <span className="text-sm font-medium text-zinc-600 dark:text-zinc-300 group-hover:text-teal-600 dark:group-hover:text-teal-400 flex items-center gap-1 transition-colors">
                    Use Tool <ArrowRight size={14} />
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <style>{`
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
};
