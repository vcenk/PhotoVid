import React, { useState, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Building2,
  ArrowRight,
  Crown,
  Zap,
  Search,
  ChevronLeft,
  ChevronRight,
  Star,
  TrendingUp,
  Camera,
  Video,
  Paintbrush,
  Sun,
  Wand2,
  Sparkles,
  ChevronDown,
  LayoutGrid,
} from 'lucide-react';
import { NavigationRail } from '../dashboard/navigation/NavigationRail';
import { DashboardTopbar } from '../dashboard/navigation/DashboardTopbar';
import { INDUSTRY_CONFIGS, type IndustryTool } from '../../lib/data/industries';

// ── Real Estate Tool Categories ──

const RE_CATEGORIES = [
  { id: 'all', label: 'All Tools', icon: LayoutGrid },
  { id: 'photo', label: 'Photo Enhancement', icon: Camera, toolIds: ['photo-enhancement', 'hdr-merge', 'headshot-retouching'] },
  { id: 'staging', label: 'Staging & Design', icon: Paintbrush, toolIds: ['virtual-staging', 'virtual-renovation', 'wall-color', 'floor-replacement', 'declutter', '360-staging'] },
  { id: 'video', label: 'Video', icon: Video, toolIds: ['storyboard', 'video-builder', 'text-to-video', 'room-tour'] },
  { id: 'weather', label: 'Weather & Lighting', icon: Sun, toolIds: ['sky-replacement', 'twilight', 'rain-to-shine', 'night-to-day', 'changing-seasons'] },
  { id: 'utility', label: 'Utility', icon: Wand2, toolIds: ['item-removal', 'lawn-enhancement', 'pool-enhancement', 'watermark-removal'] },
  { id: 'premium', label: 'Premium', icon: Crown, toolIds: ['floor-plan', '360-staging', 'virtual-renovation'] },
];

// ── Build deduplicated tool list ──

interface ToolItem {
  id: string;
  name: string;
  description: string;
  image: string;
  route?: string;
  isPremium?: boolean;
  isFeatured?: boolean;
  isNew?: boolean;
  tags?: string[];
}

function buildAllTools(): ToolItem[] {
  const config = INDUSTRY_CONFIGS['real-estate'];
  if (!config) return [];
  const items: ToolItem[] = [];
  const seen = new Set<string>();

  const add = (t: IndustryTool) => {
    if (seen.has(t.id)) return;
    seen.add(t.id);
    items.push({
      id: t.id,
      name: t.name,
      description: t.description,
      image: t.image,
      route: t.route,
      isPremium: t.isPremium,
      isFeatured: t.isFeatured,
      isNew: t.tags?.includes('New'),
      tags: t.tags,
    });
  };

  config.featuredTools.forEach(add);
  config.tools.forEach(add);
  return items;
}

// ── Badge config ──

const badgeConfig: Record<string, { label: string; icon: React.ElementType; className: string }> = {
  featured: { label: 'Featured', icon: Star, className: 'bg-amber-500/90 text-white' },
  popular: { label: 'Most Used', icon: TrendingUp, className: 'bg-gradient-to-r from-orange-500 to-pink-500 text-white' },
  new: { label: 'New', icon: Zap, className: 'bg-emerald-500 text-white' },
  pro: { label: 'Pro', icon: Crown, className: 'bg-gradient-to-r from-amber-400 to-yellow-500 text-black' },
};

function toolBadge(item: ToolItem): string | null {
  if (item.isPremium) return 'pro';
  if (item.isNew) return 'new';
  if (item.tags?.includes('Most Used')) return 'popular';
  if (item.isFeatured) return 'featured';
  return null;
}

// ── Page ──

export const AppsPage: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <div className="h-screen flex bg-white dark:bg-[#09090b] text-zinc-900 dark:text-white font-[Space_Grotesk] overflow-hidden">
      <NavigationRail isMobileOpen={mobileMenuOpen} onMobileClose={() => setMobileMenuOpen(false)} />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden ml-0 lg:ml-16">
        <DashboardTopbar onMenuClick={() => setMobileMenuOpen(true)} />
        <main className="flex-1 overflow-y-auto">
          <HeroBanner />
          <div className="max-w-7xl mx-auto px-6 space-y-10 pb-20">
            <FeaturedCarousel />
            <ToolsBrowser />
          </div>
        </main>
      </div>
    </div>
  );
};

// ── Hero Banner ──

const HeroBanner: React.FC = () => {
  const config = INDUSTRY_CONFIGS['real-estate'];

  return (
    <section className="px-6 pt-6 pb-2">
      <div className="max-w-7xl mx-auto">
        <div className="relative rounded-2xl overflow-hidden bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 py-12 px-8">
          {/* Background image */}
          {config?.heroPreviewImage && (
            <img
              src={config.heroPreviewImage}
              alt=""
              className="absolute inset-0 w-full h-full object-cover opacity-20 mix-blend-overlay"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 right-0 w-96 h-96 bg-white rounded-full blur-[100px] -translate-y-1/2 translate-x-1/3" />
          </div>

          <div className="relative z-10 max-w-2xl space-y-4">
            <div className="flex items-center gap-2">
              <Building2 size={22} className="text-white/80" />
              <h1 className="text-3xl md:text-4xl font-bold text-white">
                Real Estate AI Tools
              </h1>
            </div>
            <p className="text-base text-white/70 leading-relaxed">
              {config?.description || 'Transform listings with virtual staging, photo enhancement, sky replacement, and cinematic video tours.'}
            </p>

            {/* Stats */}
            <div className="flex flex-wrap gap-6 pt-2">
              {config?.stats.map((stat) => (
                <div key={stat.label}>
                  <span className="text-2xl font-bold text-white">{stat.value}</span>
                  <span className="text-sm text-white/50 ml-2">{stat.label}</span>
                </div>
              ))}
            </div>

            {/* Coming soon pill */}
            <div className="pt-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-sm text-white/60 text-xs font-medium border border-white/10">
                <Sparkles size={12} />
                More industries coming soon — Auto Dealership, Hospitality & more
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

// ── Featured Carousel ──

const FeaturedCarousel: React.FC = () => {
  const navigate = useNavigate();
  const scrollRef = useRef<HTMLDivElement>(null);
  const config = INDUSTRY_CONFIGS['real-estate'];
  if (!config) return null;

  const items = config.featuredTools.map((tool) => ({
    id: tool.id,
    name: tool.name,
    description: tool.longDescription || tool.description,
    image: tool.image,
    route: tool.route,
    badge: toolBadge({
      id: tool.id,
      name: tool.name,
      description: tool.description,
      image: tool.image,
      route: tool.route,
      isPremium: tool.isPremium,
      isFeatured: tool.isFeatured,
      isNew: tool.tags?.includes('New'),
      tags: tool.tags,
    }),
    tag: tool.tags?.[0] || 'Real Estate',
  }));

  const scroll = (dir: 'left' | 'right') => {
    scrollRef.current?.scrollBy({ left: dir === 'left' ? -370 : 370, behavior: 'smooth' });
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
            <Star size={20} className="text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-zinc-900 dark:text-white">Featured Tools</h2>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">Most popular real estate AI tools</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={() => scroll('left')} className="p-2 rounded-full bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors">
            <ChevronLeft size={20} className="text-zinc-600 dark:text-zinc-400" />
          </button>
          <button onClick={() => scroll('right')} className="p-2 rounded-full bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors">
            <ChevronRight size={20} className="text-zinc-600 dark:text-zinc-400" />
          </button>
        </div>
      </div>

      <div ref={scrollRef} className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide snap-x snap-mandatory -mx-6 px-6">
        {items.map((item, i) => (
          <motion.div key={item.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="snap-start flex-shrink-0 w-[340px]">
            <div
              onClick={() => navigate(item.route || '/studio/real-estate')}
              className="rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 overflow-hidden cursor-pointer group hover:border-teal-500 dark:hover:border-teal-500 transition-all hover:shadow-lg hover:shadow-teal-500/5"
            >
              <div className="relative aspect-video overflow-hidden">
                <img src={item.image} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                {item.badge && (() => {
                  const cfg = badgeConfig[item.badge];
                  if (!cfg) return null;
                  const BadgeIcon = cfg.icon;
                  return (
                    <div className="absolute top-3 right-3">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase flex items-center gap-1 ${cfg.className}`}>
                        <BadgeIcon size={10} /> {cfg.label}
                      </span>
                    </div>
                  );
                })()}
              </div>
              <div className="p-5">
                <h3 className="text-base font-bold text-zinc-900 dark:text-white mb-1.5 group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">{item.name}</h3>
                <p className="text-sm text-zinc-500 dark:text-zinc-400 line-clamp-2 mb-4">{item.description}</p>
                <div className="flex items-center justify-between">
                  <span className="px-3 py-1 rounded-full bg-teal-50 dark:bg-teal-500/10 text-teal-600 dark:text-teal-400 text-xs font-medium">{item.tag}</span>
                  <span className="text-sm font-medium text-zinc-600 dark:text-zinc-300 group-hover:text-teal-600 dark:group-hover:text-teal-400 flex items-center gap-1 transition-colors">
                    Use Tool <ArrowRight size={14} />
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <style>{`.scrollbar-hide::-webkit-scrollbar{display:none}.scrollbar-hide{-ms-overflow-style:none;scrollbar-width:none}`}</style>
    </div>
  );
};

// ── Tools Browser (categories + search + grid) ──

const INITIAL_COUNT = 12;

const ToolsBrowser: React.FC = () => {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState('all');
  const [search, setSearch] = useState('');
  const [showAll, setShowAll] = useState(false);

  const allTools = useMemo(() => buildAllTools(), []);

  const filtered = useMemo(() => {
    let result = allTools;

    if (activeCategory !== 'all') {
      const cat = RE_CATEGORIES.find((c) => c.id === activeCategory);
      if (cat && 'toolIds' in cat) {
        const ids = new Set((cat as any).toolIds as string[]);
        result = result.filter((t) => ids.has(t.id));
      }
    }

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (t) =>
          t.name.toLowerCase().includes(q) ||
          t.description.toLowerCase().includes(q) ||
          t.tags?.some((tag) => tag.toLowerCase().includes(q))
      );
    }

    return result;
  }, [allTools, activeCategory, search]);

  const displayed = showAll ? filtered : filtered.slice(0, INITIAL_COUNT);
  const hasMore = filtered.length > INITIAL_COUNT && !showAll;

  const categoryLabel = activeCategory !== 'all'
    ? RE_CATEGORIES.find((c) => c.id === activeCategory)?.label
    : 'All Real Estate Tools';

  return (
    <div className="space-y-6">
      {/* Section header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center">
            <Sparkles size={20} className="text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-zinc-900 dark:text-white">{categoryLabel}</h2>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">{filtered.length} tools available</p>
          </div>
        </div>
        <div className="relative w-full sm:w-64">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setShowAll(false); }}
            placeholder="Search tools..."
            className="w-full pl-9 pr-3 py-2 text-sm bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg text-zinc-900 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:outline-none focus:border-teal-500"
          />
        </div>
      </div>

      {/* Category pills */}
      <div className="flex flex-wrap gap-2">
        {RE_CATEGORIES.map((cat) => {
          const Icon = cat.icon;
          const isActive = activeCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => { setActiveCategory(cat.id); setShowAll(false); }}
              className={`
                flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all border
                ${isActive
                  ? 'bg-teal-600 text-white border-teal-600'
                  : 'bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700'
                }
              `}
            >
              <Icon size={14} />
              {cat.label}
            </button>
          );
        })}
      </div>

      {/* Grid */}
      {displayed.length === 0 ? (
        <div className="text-center py-16 text-zinc-500 dark:text-zinc-400">
          No tools found{search ? ` for "${search}"` : ''}.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {displayed.map((item, index) => {
            const badge = toolBadge(item);
            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.03 }}
              >
                <div
                  onClick={() => navigate(item.route || '/studio/real-estate')}
                  className="rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 overflow-hidden cursor-pointer group hover:border-teal-500 dark:hover:border-teal-500 transition-all hover:shadow-md"
                >
                  <div className="relative aspect-video overflow-hidden">
                    <img src={item.image} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                    <div className="absolute top-2 left-2 flex gap-1.5">
                      {item.isNew && (
                        <span className="px-2 py-0.5 bg-emerald-500 text-white text-[10px] font-bold rounded-full flex items-center gap-0.5">
                          <Zap size={8} /> New
                        </span>
                      )}
                    </div>
                    {item.isPremium && (
                      <div className="absolute top-2 right-2">
                        <span className="px-2 py-0.5 bg-gradient-to-r from-amber-400 to-yellow-500 text-black text-[10px] font-bold rounded-full flex items-center gap-0.5">
                          <Crown size={8} /> Pro
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="text-sm font-bold text-zinc-900 dark:text-white mb-1 truncate group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">
                      {item.name}
                    </h3>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-1 mb-3">
                      {item.description}
                    </p>
                    <div className="flex items-center justify-between">
                      {item.tags?.[0] && (
                        <span className="px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 text-[10px] font-medium">
                          {item.tags[0]}
                        </span>
                      )}
                      <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400 group-hover:text-teal-500 flex items-center gap-1 transition-colors ml-auto">
                        Use Tool <ArrowRight size={12} />
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {hasMore && (
        <div className="flex justify-center pt-2">
          <button
            onClick={() => setShowAll(true)}
            className="flex items-center gap-2 px-6 py-2.5 text-sm font-medium text-zinc-600 dark:text-zinc-300 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl hover:border-teal-500 dark:hover:border-teal-500 transition-all"
          >
            Show All ({filtered.length})
            <ChevronDown size={16} />
          </button>
        </div>
      )}
    </div>
  );
};

export default AppsPage;
