
import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';

interface PreviewItem {
  id: number;
  label: string;
  type: string;
  ratio: string;
  image: string;
}

const PREVIEW_ITEMS: PreviewItem[] = [
  { id: 1, label: "Ethereal Valley", type: "Landscape", ratio: "16:9", image: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&q=80&w=800" },
  { id: 2, label: "City Texture", type: "Street", ratio: "9:16", image: "https://images.unsplash.com/photo-1514565131-fce0801e5785?auto=format&fit=crop&q=80&w=800" },
  { id: 3, label: "Professional Look", type: "Product", ratio: "16:9", image: "https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&q=80&w=800" },
  { id: 4, label: "Clean Detail", type: "Architecture", ratio: "16:9", image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=800" },
  { id: 5, label: "Golden Hour", type: "Portrait", ratio: "9:16", image: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=800" },
  { id: 6, label: "Urban Edge", type: "Fashion", ratio: "16:9", image: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&q=80&w=800" },
  { id: 7, label: "Deep Ocean", type: "Nature", ratio: "16:9", image: "https://images.unsplash.com/photo-1551244072-5d12893278ab?auto=format&fit=crop&q=80&w=800" },
  { id: 8, label: "Soft Lighting", type: "Tech", ratio: "9:16", image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=800" },
];

const PreviewCard: React.FC<{ item: PreviewItem; offset: number }> = ({ item, offset }) => (
  <motion.div
    style={{ y: offset }}
    whileHover={{ 
      scale: 1.03, 
      boxShadow: "0 20px 40px -10px rgba(0,0,0,0.1)",
      zIndex: 10,
    }}
    className="group relative w-[240px] md:w-[320px] aspect-[16/10] flex-shrink-0 rounded-2xl overflow-hidden bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 shadow-xl transition-all duration-500 cursor-pointer"
  >
    <img 
      src={item.image} 
      alt={item.label}
      className="absolute inset-0 w-full h-full object-cover transition-all duration-700 opacity-90 group-hover:opacity-100 group-hover:scale-105"
    />
    <div className="absolute inset-0 bg-gradient-to-t from-white/90 dark:from-black/90 via-transparent to-transparent" />
    <div className="absolute inset-0 p-4 flex flex-col justify-end">
      <div className="flex gap-2 items-center mb-2">
        <span className="px-2 py-0.5 rounded-full bg-white/80 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 text-[8px] md:text-[9px] font-bold uppercase tracking-widest text-zinc-900 dark:text-zinc-100 shadow-sm">
          {item.type}
        </span>
        <span className="px-2 py-0.5 rounded-full bg-white/80 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 text-[8px] md:text-[9px] font-medium text-zinc-500 dark:text-zinc-400 shadow-sm">
          {item.ratio}
        </span>
      </div>
      <h4 className="text-sm md:text-base font-semibold text-zinc-900 dark:text-zinc-100 tracking-tight">
        {item.label}
      </h4>
    </div>
  </motion.div>
);

export const PreviewMarquee: React.FC = () => {
  const shouldReduceMotion = useReducedMotion();
  const duplicatedItems = [...PREVIEW_ITEMS, ...PREVIEW_ITEMS];

  return (
    <section className="relative py-16 md:py-24 overflow-hidden select-none bg-zinc-50 dark:bg-zinc-900 border-t border-zinc-200 dark:border-zinc-800">
      <div className="container mx-auto px-6 mb-12">
        <h3 className="text-center text-[10px] md:text-xs font-bold uppercase tracking-[0.4em] text-zinc-400 dark:text-zinc-500">
          PROFESSIONAL SAMPLES
        </h3>
      </div>

      <div className="relative flex items-center">
        {/* Edge Fade Masks */}
        <div className="absolute left-0 top-0 bottom-0 w-32 md:w-64 z-20 bg-gradient-to-r from-zinc-50 dark:from-zinc-900 to-transparent pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-32 md:w-64 z-20 bg-gradient-to-l from-zinc-50 dark:from-zinc-900 to-transparent pointer-events-none" />

        <motion.div
          className="flex whitespace-nowrap gap-6 px-3"
          animate={shouldReduceMotion ? {} : { x: ["0%", "-50%"] }}
          transition={{
            duration: 40,
            repeat: Infinity,
            ease: "linear",
          }}
        >
          {duplicatedItems.map((item, idx) => (
            <PreviewCard 
              key={`preview-${idx}`} 
              item={item} 
              offset={idx % 2 === 0 ? -6 : 6}
            />
          ))}
        </motion.div>
      </div>
    </section>
  );
};
