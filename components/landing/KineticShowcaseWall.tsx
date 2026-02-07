"use client";

import React, { useRef, useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const SHOWCASE_ITEMS_TOP = [
  {
    id: 1,
    image: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?q=80&w=1000&auto=format&fit=crop",
    title: "Modern Living Room",
    tag: "Virtual Staging"
  },
  {
    id: 2,
    image: "https://images.unsplash.com/photo-1613490493576-7fde63acd811?q=80&w=1000&auto=format&fit=crop",
    title: "Luxury Villa",
    tag: "Twilight"
  },
  {
    id: 3,
    image: "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?q=80&w=1000&auto=format&fit=crop",
    title: "Gourmet Kitchen",
    tag: "Enhancement"
  },
  {
    id: 4,
    image: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?q=80&w=1000&auto=format&fit=crop",
    title: "Curb Appeal",
    tag: "Lawn Enhancement"
  },
  {
    id: 5,
    image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=1000&auto=format&fit=crop",
    title: "Penthouse View",
    tag: "Sky Replacement"
  },
  {
    id: 6,
    image: "https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?q=80&w=1000&auto=format&fit=crop",
    title: "Craftsman Home",
    tag: "Photo Enhancement"
  },
  {
    id: 7,
    image: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?q=80&w=1000&auto=format&fit=crop",
    title: "Open Floor Plan",
    tag: "Declutter"
  },
  {
    id: 8,
    image: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=1000&auto=format&fit=crop",
    title: "Contemporary Estate",
    tag: "Twilight"
  },
];

const SHOWCASE_ITEMS_BOTTOM = [
  {
    id: 9,
    image: "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?q=80&w=1000&auto=format&fit=crop",
    title: "Primary Bedroom",
    tag: "Virtual Staging"
  },
  {
    id: 10,
    image: "https://images.unsplash.com/photo-1600585154526-990dced4db0d?q=80&w=1000&auto=format&fit=crop",
    title: "Spa Bathroom",
    tag: "Enhancement"
  },
  {
    id: 11,
    image: "https://images.unsplash.com/photo-1600573472550-8090b5e0745e?q=80&w=1000&auto=format&fit=crop",
    title: "Dining Space",
    tag: "Virtual Staging"
  },
  {
    id: 12,
    image: "https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?q=80&w=1000&auto=format&fit=crop",
    title: "Waterfront Property",
    tag: "Sky Replacement"
  },
  {
    id: 13,
    image: "https://images.unsplash.com/photo-1560185893-a55cbc8c57e8?q=80&w=1000&auto=format&fit=crop",
    title: "Cozy Reading Nook",
    tag: "Virtual Staging"
  },
  {
    id: 14,
    image: "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?q=80&w=1000&auto=format&fit=crop",
    title: "Backyard Oasis",
    tag: "Lawn Enhancement"
  },
  {
    id: 15,
    image: "https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?q=80&w=1000&auto=format&fit=crop",
    title: "Home Office",
    tag: "Declutter"
  },
  {
    id: 16,
    image: "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?q=80&w=1000&auto=format&fit=crop",
    title: "Great Room",
    tag: "Photo Enhancement"
  },
];

interface ShowcaseItemProps {
  item: typeof SHOWCASE_ITEMS_TOP[0];
  index: number;
}

const ShowcaseCard: React.FC<ShowcaseItemProps> = ({ item }) => {
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
        className="absolute -inset-4 bg-gradient-to-r from-teal-500/30 via-emerald-500/30 to-fuchsia-500/30 blur-2xl z-0"
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
            <span className="text-[10px] font-bold uppercase tracking-widest text-teal-400 block mb-1">
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
          className="absolute inset-0 rounded-2xl border-2 border-teal-500/0"
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
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-teal-600/10 blur-[200px] rounded-full pointer-events-none" />

      {/* Mouse-following spotlight */}
      <div
        className="absolute w-[400px] h-[400px] bg-emerald-500/10 blur-[100px] rounded-full pointer-events-none transition-all duration-300 ease-out z-5"
        style={{
          left: mousePosition.x - 200,
          top: mousePosition.y - 200,
        }}
      />

      {/* Tilted Wall */}
      <div className="relative z-0 space-y-8 rotate-[-2deg] scale-110">
        {/* Row 1: Left */}
        <div className="flex gap-6 animate-marquee-left w-max">
          {topRow.map((item, idx) => (
            <ShowcaseCard
              key={`top-${item.id}-${idx}`}
              item={item}
              index={idx}
            />
          ))}
        </div>

        {/* Row 2: Right */}
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
