import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Sparkles, Wand2, Sun, Search,
  Image as ImageIcon, Eraser, CircleDot, Layers, Zap,
  Maximize, Focus, Droplets, Palette, Crop, Ban,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { LucideIcon } from 'lucide-react';

// ============ TOOL DATA ============

interface EditTool {
  id: string;
  name: string;
  description: string;
  icon: LucideIcon;
  category: string;
  creditCost: number;
  route: string;
  image: string;
}

const CATEGORIES = [
  'All',
  'Enhance',
  'Remove & Clean',
  'Color & Lighting',
  'Transform',
] as const;

type Category = typeof CATEGORIES[number];

const EDIT_TOOLS: EditTool[] = [
  // Enhance
  { id: 'auto-enhance', name: 'Auto Enhance', description: 'One-click fix for lighting, colors, and sharpness', icon: Zap, category: 'Enhance', creditCost: 1, route: '/studio/edit/auto-enhance', image: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400&h=240&fit=crop' },
  { id: 'upscale', name: 'AI Upscale', description: 'Increase image resolution up to 4x with AI', icon: Maximize, category: 'Enhance', creditCost: 2, route: '/studio/edit/upscale', image: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=400&h=240&fit=crop' },
  { id: 'sharpen', name: 'Smart Sharpen', description: 'Sharpen blurry or soft property images with AI', icon: Focus, category: 'Enhance', creditCost: 1, route: '/studio/edit/sharpen', image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=400&h=240&fit=crop' },
  { id: 'hdr', name: 'HDR Effect', description: 'Add dynamic range to interior and exterior shots', icon: Layers, category: 'Enhance', creditCost: 2, route: '/studio/edit/hdr', image: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=400&h=240&fit=crop' },

  // Remove & Clean
  { id: 'object-removal', name: 'Object Removal', description: 'Erase unwanted objects from property photos', icon: Eraser, category: 'Remove & Clean', creditCost: 2, route: '/studio/edit/object-removal', image: 'https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?w=400&h=240&fit=crop' },
  { id: 'watermark-removal', name: 'Watermark Removal', description: 'Remove MLS watermarks and text overlays', icon: Ban, category: 'Remove & Clean', creditCost: 2, route: '/studio/edit/watermark-removal', image: 'https://images.unsplash.com/photo-1600573472550-8090b5e0745e?w=400&h=240&fit=crop' },
  { id: 'noise-reduction', name: 'Noise Reduction', description: 'Remove grain from low-light interior shots', icon: Droplets, category: 'Remove & Clean', creditCost: 1, route: '/studio/edit/noise-reduction', image: 'https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=400&h=240&fit=crop' },

  // Color & Lighting
  { id: 'color-correct', name: 'Color Correction', description: 'Fix white balance and color casts in property photos', icon: Palette, category: 'Color & Lighting', creditCost: 1, route: '/studio/edit/color-correct', image: 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=400&h=240&fit=crop' },
  { id: 'exposure-fix', name: 'Exposure Fix', description: 'Recover details from dark or bright areas', icon: Sun, category: 'Color & Lighting', creditCost: 1, route: '/studio/edit/exposure-fix', image: 'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=400&h=240&fit=crop' },
  { id: 'shadow-highlight', name: 'Shadow & Highlight', description: 'Lift shadows and balance highlights in interiors', icon: CircleDot, category: 'Color & Lighting', creditCost: 1, route: '/studio/edit/shadow-highlight', image: 'https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=400&h=240&fit=crop' },
  { id: 'relight', name: 'AI Relight', description: 'Improve lighting direction and mood in rooms', icon: Sparkles, category: 'Color & Lighting', creditCost: 3, route: '/studio/edit/relight', image: 'https://images.unsplash.com/photo-1600121848594-d8644e57abab?w=400&h=240&fit=crop' },

  // Transform
  { id: 'smart-crop', name: 'Smart Crop', description: 'AI-powered cropping for perfect composition', icon: Crop, category: 'Transform', creditCost: 1, route: '/studio/edit/smart-crop', image: 'https://images.unsplash.com/photo-1600607687644-aac4c3eac7f4?w=400&h=240&fit=crop' },
  { id: 'uncrop', name: 'Uncrop / Extend', description: 'Expand narrow property photos with AI', icon: Maximize, category: 'Transform', creditCost: 2, route: '/studio/edit/uncrop', image: 'https://images.unsplash.com/photo-1600563438938-a9a27216b4f5?w=400&h=240&fit=crop' },
];

// ============ COMPONENT ============

export function EditHub() {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState<Category>('All');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredTools = EDIT_TOOLS.filter((tool) => {
    const matchesCategory = activeCategory === 'All' || tool.category === activeCategory;
    const matchesSearch = !searchQuery || tool.name.toLowerCase().includes(searchQuery.toLowerCase()) || tool.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-full">
      {/* Hero Banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-teal-600 via-emerald-600 to-teal-700 px-6 py-10 sm:px-10">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-40" />
        <div className="relative max-w-4xl">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center backdrop-blur-sm">
              <Wand2 size={22} className="text-white" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">AI Image Editor</h1>
          </div>
          <p className="text-white/70 text-sm sm:text-base max-w-2xl">
            Professional photo editing powered by AI — enhance, remove, restyle, and transform your images
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="px-6 sm:px-10 py-6 space-y-6">
        {/* Search + Category Pills */}
        <div className="space-y-4">
          {/* Search */}
          <div className="relative max-w-md">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
            <input
              type="text"
              placeholder="Search tools..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-white dark:bg-white/[0.04] border border-zinc-200 dark:border-white/10 text-sm text-zinc-900 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 transition-colors"
            />
          </div>

          {/* Category Pills */}
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={cn(
                  'px-3.5 py-1.5 rounded-full text-xs font-medium transition-all duration-200',
                  activeCategory === cat
                    ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/20'
                    : 'bg-white dark:bg-white/[0.04] text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-white/10 hover:bg-zinc-50 dark:hover:bg-white/[0.07] hover:text-zinc-900 dark:hover:text-white'
                )}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Tool Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredTools.map((tool, i) => {
            const Icon = tool.icon;
            return (
              <motion.button
                key={tool.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, delay: i * 0.02 }}
                onClick={() => navigate(tool.route)}
                className="group relative flex flex-col rounded-2xl bg-white dark:bg-white/[0.03] border border-zinc-200 dark:border-white/[0.06] hover:border-emerald-500/30 dark:hover:border-emerald-500/20 hover:bg-zinc-50 dark:hover:bg-white/[0.05] transition-all duration-200 text-left overflow-hidden"
              >
                {/* Image */}
                <div className="relative w-full h-36 overflow-hidden">
                  <img
                    src={tool.image}
                    alt={tool.name}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                  {/* Credit badge on image */}
                  <span className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-full bg-black/40 backdrop-blur-sm text-white text-[11px] font-medium">
                    {tool.creditCost} {tool.creditCost === 1 ? 'credit' : 'credits'}
                  </span>
                </div>

                {/* Content */}
                <div className="flex items-start gap-3 p-4">
                  <div className="w-9 h-9 rounded-lg bg-emerald-500/10 flex items-center justify-center shrink-0 group-hover:bg-emerald-500/15 transition-colors">
                    <Icon size={18} className="text-emerald-500" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-sm font-semibold text-zinc-900 dark:text-white mb-0.5 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors truncate">
                      {tool.name}
                    </h3>
                    <p className="text-xs text-zinc-500 dark:text-zinc-500 leading-relaxed line-clamp-2">
                      {tool.description}
                    </p>
                  </div>
                </div>
              </motion.button>
            );
          })}
        </div>

        {/* Empty State */}
        {filteredTools.length === 0 && (
          <div className="text-center py-16">
            <ImageIcon size={40} className="mx-auto text-zinc-300 dark:text-zinc-700 mb-3" />
            <p className="text-sm text-zinc-500 dark:text-zinc-500">No tools match your search</p>
          </div>
        )}
      </div>
    </div>
  );
}
