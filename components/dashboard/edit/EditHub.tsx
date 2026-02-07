import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Sparkles, Wand2, Ban, Paintbrush, Sun, Moon, Search,
  Image as ImageIcon, Eraser, CircleDot, Layers, Zap,
  Scissors, Maximize, Contrast, Blend, Focus,
  Droplets, Palette, User, Crop,
  Replace, Eye, Stamp,
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
  'Color & Tone',
  'Lighting',
  'Transform',
  'Retouch',
] as const;

type Category = typeof CATEGORIES[number];

const EDIT_TOOLS: EditTool[] = [
  // Enhance
  { id: 'auto-enhance', name: 'Auto Enhance', description: 'One-click fix for lighting, colors, and sharpness', icon: Zap, category: 'Enhance', creditCost: 1, route: '/studio/edit/auto-enhance', image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=400&h=240&fit=crop' },
  { id: 'upscale', name: 'AI Upscale', description: 'Increase image resolution up to 4x with AI', icon: Maximize, category: 'Enhance', creditCost: 2, route: '/studio/edit/upscale', image: 'https://images.unsplash.com/photo-1518791841217-8f162f1e1131?w=400&h=240&fit=crop' },
  { id: 'sharpen', name: 'Smart Sharpen', description: 'Sharpen blurry or soft images with AI detail recovery', icon: Focus, category: 'Enhance', creditCost: 1, route: '/studio/edit/sharpen', image: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=400&h=240&fit=crop' },
  { id: 'hdr', name: 'HDR Effect', description: 'Add dynamic range and depth to flat photos', icon: Layers, category: 'Enhance', creditCost: 2, route: '/studio/edit/hdr', image: 'https://images.unsplash.com/photo-1472214103451-9374bd1c798e?w=400&h=240&fit=crop' },

  // Remove & Clean
  { id: 'background-remove', name: 'Background Remover', description: 'Remove or replace image backgrounds instantly', icon: Scissors, category: 'Remove & Clean', creditCost: 1, route: '/studio/edit/background-remove', image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=240&fit=crop' },
  { id: 'object-removal', name: 'Object Removal', description: 'Erase unwanted objects and people from photos', icon: Eraser, category: 'Remove & Clean', creditCost: 2, route: '/studio/edit/object-removal', image: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=400&h=240&fit=crop' },
  { id: 'watermark-removal', name: 'Watermark Removal', description: 'Remove watermarks and text overlays cleanly', icon: Ban, category: 'Remove & Clean', creditCost: 2, route: '/studio/edit/watermark-removal', image: 'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=400&h=240&fit=crop' },
  { id: 'noise-reduction', name: 'Noise Reduction', description: 'Remove grain and noise from low-light photos', icon: Droplets, category: 'Remove & Clean', creditCost: 1, route: '/studio/edit/noise-reduction', image: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=400&h=240&fit=crop' },

  // Color & Tone
  { id: 'color-correct', name: 'Color Correction', description: 'Fix white balance, saturation, and color casts', icon: Palette, category: 'Color & Tone', creditCost: 1, route: '/studio/edit/color-correct', image: 'https://images.unsplash.com/photo-1502691876148-a84978e59af8?w=400&h=240&fit=crop' },
  { id: 'color-grading', name: 'Color Grading', description: 'Apply cinematic color grades and film looks', icon: Blend, category: 'Color & Tone', creditCost: 2, route: '/studio/edit/color-grading', image: 'https://images.unsplash.com/photo-1518156677180-95a2893f3e9f?w=400&h=240&fit=crop' },
  { id: 'black-white', name: 'Black & White', description: 'Convert to stunning monochrome with fine control', icon: Contrast, category: 'Color & Tone', creditCost: 1, route: '/studio/edit/black-white', image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=240&fit=crop&sat=-100' },
  { id: 'recolor', name: 'Recolor', description: 'Change the color of specific objects in your image', icon: Paintbrush, category: 'Color & Tone', creditCost: 2, route: '/studio/edit/recolor', image: 'https://images.unsplash.com/photo-1525909002-1b05e0c869d8?w=400&h=240&fit=crop' },

  // Lighting
  { id: 'exposure-fix', name: 'Exposure Fix', description: 'Recover details from over or underexposed photos', icon: Sun, category: 'Lighting', creditCost: 1, route: '/studio/edit/exposure-fix', image: 'https://images.unsplash.com/photo-1495616811223-4d98c6e9c869?w=400&h=240&fit=crop' },
  { id: 'shadow-highlight', name: 'Shadow & Highlight', description: 'Lift shadows and tame highlights independently', icon: CircleDot, category: 'Lighting', creditCost: 1, route: '/studio/edit/shadow-highlight', image: 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=400&h=240&fit=crop' },
  { id: 'relight', name: 'AI Relight', description: 'Change the lighting direction and mood of any photo', icon: Sparkles, category: 'Lighting', creditCost: 3, route: '/studio/edit/relight', image: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=400&h=240&fit=crop' },
  { id: 'day-night', name: 'Day / Night', description: 'Convert between daytime and nighttime scenes', icon: Moon, category: 'Lighting', creditCost: 2, route: '/studio/edit/day-night', image: 'https://images.unsplash.com/photo-1507400492013-162706c8c05e?w=400&h=240&fit=crop' },

  // Transform
  { id: 'smart-crop', name: 'Smart Crop', description: 'AI-powered cropping for perfect composition', icon: Crop, category: 'Transform', creditCost: 1, route: '/studio/edit/smart-crop', image: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=400&h=240&fit=crop' },
  { id: 'uncrop', name: 'Uncrop / Extend', description: 'Expand image borders with AI-generated content', icon: Maximize, category: 'Transform', creditCost: 2, route: '/studio/edit/uncrop', image: 'https://images.unsplash.com/photo-1433086966358-54859d0ed716?w=400&h=240&fit=crop' },
  { id: 'style-transfer', name: 'Style Transfer', description: 'Apply artistic styles — painting, sketch, anime, and more', icon: Wand2, category: 'Transform', creditCost: 2, route: '/studio/edit/style-transfer', image: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=400&h=240&fit=crop' },
  { id: 'replace-object', name: 'Replace Object', description: 'Select any object and replace it with AI generation', icon: Replace, category: 'Transform', creditCost: 3, route: '/studio/edit/replace-object', image: 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=400&h=240&fit=crop' },

  // Retouch
  { id: 'face-retouch', name: 'Face Retouch', description: 'Smooth skin, brighten eyes, and enhance portraits', icon: User, category: 'Retouch', creditCost: 2, route: '/studio/edit/face-retouch', image: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=400&h=240&fit=crop&crop=face' },
  { id: 'headshot-retouching', name: 'Headshot Retouching', description: 'Professional headshot enhancement with background options', icon: User, category: 'Retouch', creditCost: 2, route: '/studio/edit/headshot-retouching', image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&h=400&fit=crop&crop=face' },
  { id: 'blemish-removal', name: 'Blemish Removal', description: 'Remove spots, acne, and skin imperfections', icon: CircleDot, category: 'Retouch', creditCost: 1, route: '/studio/edit/blemish-removal', image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=240&fit=crop&crop=face' },
  { id: 'red-eye', name: 'Red Eye Fix', description: 'Automatically detect and fix red-eye in portraits', icon: Eye, category: 'Retouch', creditCost: 1, route: '/studio/edit/red-eye', image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=240&fit=crop&crop=face' },
  { id: 'clone-stamp', name: 'Clone & Heal', description: 'Clone areas and heal imperfections with precision', icon: Stamp, category: 'Retouch', creditCost: 1, route: '/studio/edit/clone-stamp', image: 'https://images.unsplash.com/photo-1503023345310-bd7c1de61c7d?w=400&h=240&fit=crop' },
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
