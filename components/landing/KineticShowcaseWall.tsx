"use client";

import React, { useRef, useState, useEffect } from 'react';
import { motion } from 'framer-motion';

// --- TOP ROW: 8 Unique High-Res Images ---
const SHOWCASE_ITEMS_TOP = [
  {
    id: 1,
    image: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1000&auto=format&fit=crop",
    title: "Liquid Metal",
    tag: "3D Render"
  },
  {
    id: 2,
    image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=1000&auto=format&fit=crop",
    title: "Vogue Edit",
    tag: "Portrait"
  },
  {
    id: 3,
    image: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=1000&auto=format&fit=crop",
    title: "Retro Tech",
    tag: "Product"
  },
  {
    id: 4,
    image: "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?q=80&w=1000&auto=format&fit=crop",
    title: "Night Drive",
    tag: "Cinematic"
  },
  {
    id: 5,
    image: "https://images.unsplash.com/photo-1555685812-4b943f1cb0eb?q=80&w=1000&auto=format&fit=crop",
    title: "Neon Rain",
    tag: "Cyberpunk"
  },
  {
    id: 6,
    image: "https://images.unsplash.com/photo-1511818966892-d7d671e672a2?q=80&w=1000&auto=format&fit=crop",
    title: "Glass Spire",
    tag: "Architecture"
  },
  {
    id: 7,
    image: "https://images.unsplash.com/photo-1549298916-b41d501d3772?q=80&w=1000&auto=format&fit=crop",
    title: "Urban Kicks",
    tag: "E-Commerce"
  },
  {
    id: 8,
    image: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?q=80&w=1000&auto=format&fit=crop",
    title: "Digital Soul",
    tag: "Abstract"
  },
];

// --- BOTTOM ROW: 8 Different Unique Images ---
const SHOWCASE_ITEMS_BOTTOM = [
  {
    id: 9,
    image: "https://images.unsplash.com/photo-1563089145-599997674d42?q=80&w=1000&auto=format&fit=crop",
    title: "Neon Signs",
    tag: "Cyberpunk"
  },
  {
    id: 10,
    image: "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?q=80&w=1000&auto=format&fit=crop",
    title: "Modern Home",
    tag: "Real Estate"
  },
  {
    id: 11,
    image: "https://images.unsplash.com/photo-1614850523459-c2f4c699c52e?q=80&w=1000&auto=format&fit=crop",
    title: "Fluid Art",
    tag: "Abstract"
  },
  {
    id: 12,
    image: "https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=1000&auto=format&fit=crop",
    title: "AI Matrix",
    tag: "Tech"
  },
  {
    id: 13,
    image: "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?q=80&w=1000&auto=format&fit=crop",
    title: "Studio Sound",
    tag: "Audio Viz"
  },
  {
    id: 14,
    image: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=1000&auto=format&fit=crop",
    title: "Culinary Art",
    tag: "Food"
  },
  {
    id: 15,
    image: "https://images.unsplash.com/photo-1598550476439-c9212f6433e2?q=80&w=1000&auto=format&fit=crop",
    title: "Battle Station",
    tag: "Gaming"
  },
  {
    id: 16,
    image: "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?q=80&w=1000&auto=format&fit=crop",
    title: "Nordic Mist",
    tag: "Nature"
  },
];

interface ShowcaseItemProps {
  item: typeof SHOWCASE_ITEMS_TOP[0];
  index: number;
}

const ShowcaseCard: React.FC<ShowcaseItemProps> = ({ item, index }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="relative w-[350px] aspect-[4/3] rounded-2xl overflow-hidden group flex-shrink-0 cursor-pointer"
    >
      {/* Glow effect on hover */}
      <motion.div
        animate={{
          opacity: isHovered ? 1 : 0,
          scale: isHovered ? 1.1 : 1,
        }}
        transition={{ duration: 0.4 }}
        className="absolute -inset-4 bg-gradient-to-r from-indigo-500/30 via-violet-500/30 to-fuchsia-500/30 blur-2xl z-0"
      />

      {/* Card container */}
      <div className="relative w-full h-full border border-white/10 rounded-2xl overflow-hidden z-10">
        {/* Image */}
        <motion.img
          src={item.image}
          alt={item.title}
          className="w-full h-full object-cover"
          animate={{
            scale: isHovered ? 1.1 : 1,
            filter: isHovered ? 'grayscale(0%) brightness(1.1)' : 'grayscale(100%) brightness(0.8)',
          }}
          transition={{ duration: 0.7 }}
        />

        {/* Overlay gradient */}
        <motion.div
          className="absolute inset-0"
          animate={{
            background: isHovered
              ? 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, transparent 50%)'
              : 'linear-gradient(to top, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0.3) 100%)',
          }}
          transition={{ duration: 0.4 }}
        />

        {/* Content */}
        <div className="absolute bottom-0 left-0 right-0 p-6">
          <motion.div
            initial={false}
            animate={{
              y: isHovered ? 0 : 10,
              opacity: isHovered ? 1 : 0,
            }}
            transition={{ duration: 0.3 }}
          >
            <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-400 block mb-1">
              {item.tag}
            </span>
            <span className="text-xl font-bold text-white">
              {item.title}
            </span>
          </motion.div>
        </div>

        {/* Shine effect */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12"
          animate={{
            x: isHovered ? ['100%', '-100%'] : '-100%',
          }}
          transition={{
            duration: 0.6,
            ease: 'easeInOut',
          }}
        />

        {/* Border glow on hover */}
        <motion.div
          className="absolute inset-0 rounded-2xl border-2 border-indigo-500/0"
          animate={{
            borderColor: isHovered ? 'rgba(99, 102, 241, 0.5)' : 'rgba(99, 102, 241, 0)',
          }}
          transition={{ duration: 0.3 }}
        />
      </div>
    </motion.div>
  );
};

export const KineticShowcaseWall = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  // Track mouse for spotlight effect
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setMousePosition({
          x: e.clientX - rect.left,
          y: e.clientY - rect.top,
        });
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // We duplicate the arrays to ensure a seamless infinite loop
  const topRow = [...SHOWCASE_ITEMS_TOP, ...SHOWCASE_ITEMS_TOP];
  const bottomRow = [...SHOWCASE_ITEMS_BOTTOM, ...SHOWCASE_ITEMS_BOTTOM];

  return (
    <section
      ref={containerRef}
      className="relative py-32 bg-zinc-950 overflow-hidden border-y border-white/5"
    >
      {/* Background Glow */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-transparent to-black/80 z-10 pointer-events-none" />

      {/* Center ambient glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-indigo-600/10 blur-[200px] rounded-full pointer-events-none" />

      {/* Mouse-following spotlight */}
      <div
        className="absolute w-[400px] h-[400px] bg-violet-500/10 blur-[100px] rounded-full pointer-events-none transition-all duration-300 ease-out z-5"
        style={{
          left: mousePosition.x - 200,
          top: mousePosition.y - 200,
        }}
      />

      {/* The Tilted Wall Container */}
      <div className="relative z-0 space-y-8 rotate-[-2deg] scale-110">

        {/* Row 1: Moving Left */}
        <div className="flex gap-6 animate-marquee-left w-max">
          {topRow.map((item, idx) => (
            <ShowcaseCard
              key={`top-${item.id}-${idx}`}
              item={item}
              index={idx}
            />
          ))}
        </div>

        {/* Row 2: Moving Right */}
        <div className="flex gap-6 animate-marquee-right w-max ml-[-100%]">
          {bottomRow.map((item, idx) => (
            <ShowcaseCard
              key={`bottom-${item.id}-${idx}`}
              item={item}
              index={idx}
            />
          ))}
        </div>

      </div>

      {/* Overlay Text */}
      <div className="absolute inset-0 z-20 flex flex-col items-center justify-center pointer-events-none">
        <motion.h2
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 0.3, scale: 1 }}
          transition={{ duration: 0.8 }}
          className="text-6xl md:text-9xl font-black text-transparent stroke-text tracking-tighter select-none"
        >
          SHOWCASE
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-4 text-sm md:text-lg text-white/80 font-bold uppercase tracking-[0.5em] bg-black/50 backdrop-blur-md px-6 py-2 rounded-full border border-white/10"
        >
          Made with Photovid
        </motion.p>
      </div>

      <style>{`
        .stroke-text {
          -webkit-text-stroke: 2px rgba(255,255,255,0.5);
        }
        @keyframes marquee-left {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        @keyframes marquee-right {
          0% { transform: translateX(-50%); }
          100% { transform: translateX(0); }
        }
        .animate-marquee-left {
          animation: marquee-left 80s linear infinite;
        }
        .animate-marquee-right {
          animation: marquee-right 80s linear infinite;
        }
        .animate-marquee-left:hover, .animate-marquee-right:hover {
          animation-play-state: paused;
        }
      `}</style>
    </section>
  );
};
