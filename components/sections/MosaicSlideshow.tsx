"use client";

import React, { useEffect, useRef } from 'react';

// Refined list of 30 Industry-Specific Images
const IMAGES = [
  // --- REAL ESTATE ---
  "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?q=80&w=800&auto=format&fit=crop", // Modern Living
  "https://images.unsplash.com/photo-1613490493576-7fde63acd811?q=80&w=800&auto=format&fit=crop", // Villa Pool
  "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?q=80&w=800&auto=format&fit=crop", // Kitchen
  "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?q=80&w=800&auto=format&fit=crop", // Bedroom
  "https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=800&auto=format&fit=crop", // Office
  "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=800&auto=format&fit=crop", // Penthouse
  
  // --- FASHION ---
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=800&auto=format&fit=crop", // Model 1
  "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?q=80&w=800&auto=format&fit=crop", // Model 2
  "https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?q=80&w=800&auto=format&fit=crop", // Editorial
  "https://images.unsplash.com/photo-1469334031218-e382a71b716b?q=80&w=800&auto=format&fit=crop", // Runway
  "https://images.unsplash.com/photo-1509631179647-0177331693ae?q=80&w=800&auto=format&fit=crop", // Street Style
  "https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=800&auto=format&fit=crop", // Shopping Luxury
  
  // --- E-COMMERCE / PRODUCT ---
  "https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=800&auto=format&fit=crop", // Watch
  "https://images.unsplash.com/photo-1549298916-b41d501d3772?q=80&w=800&auto=format&fit=crop", // Sneakers
  "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=800&auto=format&fit=crop", // Headphones
  "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?q=80&w=800&auto=format&fit=crop", // Camera
  "https://images.unsplash.com/photo-1572635196237-14b3f281503f?q=80&w=800&auto=format&fit=crop", // Sunglasses
  "https://images.unsplash.com/photo-1511499767013-91c222df3a01?q=80&w=800&auto=format&fit=crop", // Cosmetics
  
  // --- FOOD / HOSPITALITY ---
  "https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=800&auto=format&fit=crop", // Platter
  "https://images.unsplash.com/photo-1544145945-f904253d0c71?q=80&w=800&auto=format&fit=crop", // Cocktail
  "https://images.unsplash.com/photo-1473093226795-af9932fe5856?q=80&w=800&auto=format&fit=crop", // Pasta
  "https://images.unsplash.com/photo-1513104890138-7c749659a591?q=80&w=800&auto=format&fit=crop", // Pizza
  "https://images.unsplash.com/photo-1559339352-11d035aa65de?q=80&w=800&auto=format&fit=crop", // Bakery
  "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?q=80&w=800&auto=format&fit=crop", // Pouring
  
  // --- TECH / STUDIO ---
  "https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=800&auto=format&fit=crop", // Retro PC
  "https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=800&auto=format&fit=crop", // CPU
  "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?q=80&w=800&auto=format&fit=crop", // Robot
  "https://images.unsplash.com/photo-1593640408182-31c70c8268f5?q=80&w=800&auto=format&fit=crop", // Creative Desk
  "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?q=80&w=800&auto=format&fit=crop", // Lens Studio
  "https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=800&auto=format&fit=crop", // Network
];

const TILE_COUNT = 28; // Increased for full-screen density

export const MosaicSlideshow = () => {
  const tilesRef = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    let index = 0;
    let intervalId: NodeJS.Timeout;

    const tiles = tilesRef.current.filter(Boolean);
    if (tiles.length === 0) return;

    function shuffleArray(array: number[]) {
      let arr = array.slice();
      for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
      }
      return arr;
    }

    function animateTile(tile: HTMLDivElement, imgIndex: number, delay: number) {
      setTimeout(() => {
        if (!tile) return;
        tile.style.backgroundImage = `url(${IMAGES[imgIndex % IMAGES.length]})`;
        tile.classList.add("show");
        setTimeout(() => {
          if (tile) tile.classList.remove("show");
        }, 2500);
      }, delay);
    }

    function animateGridContinuously() {
      const order = shuffleArray([...Array(tiles.length).keys()]);
      order.forEach((i, idx) => {
        const tile = tiles[i];
        if (tile) {
          animateTile(tile, index + idx, idx * 300); // Faster overlap for density
        }
      });
      index = (index + tiles.length) % IMAGES.length;
    }

    animateGridContinuously();
    intervalId = setInterval(animateGridContinuously, 2000);

    return () => clearInterval(intervalId);
  }, []);

  return (
    <section className="relative w-full overflow-hidden bg-black py-10">
      <div className="slideshow-full">
        <div className="grid-layout-full">
          {Array.from({ length: TILE_COUNT }).map((_, i) => (
            <div 
              key={i} 
              ref={el => { tilesRef.current[i] = el; }} 
              className="tile-item"
            />
          ))}
        </div>
      </div>

      <style>{`
        .slideshow-full {
          width: 100vw;
          height: 60vh;
          overflow: hidden;
          background: #000;
        }

        .grid-layout-full {
          display: grid;
          gap: 6px;
          width: 100%;
          height: 100%;
          /* 4 cols on mobile, 7 on tablet, 10 on desktop */
          grid-template-columns: repeat(4, 1fr);
          grid-auto-rows: 1fr;
        }

        @media (min-width: 768px) {
          .grid-layout-full { grid-template-columns: repeat(7, 1fr); }
          .slideshow-full { height: 70vh; }
        }

        @media (min-width: 1280px) {
          .grid-layout-full { grid-template-columns: repeat(10, 1fr); }
          .slideshow-full { height: 80vh; }
        }

        .tile-item {
          width: 100%;
          height: 100%;
          border-radius: 4px;
          background-size: cover;
          background-position: center;
          opacity: 0;
          transform: scale(0.85);
          transition: opacity 1.2s ease, transform 1.2s ease;
          background-color: #111;
        }

        .tile-item.show {
          opacity: 1;
          transform: scale(1);
        }
      `}</style>
    </section>
  );
};
