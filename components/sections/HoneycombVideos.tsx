"use client";

import React, { useEffect, useRef, useState } from 'react';

// High-quality vertical/cinematic video sources
const BASE_VIDEOS = [
  "https://cdn.coverr.co/videos/coverr-tokyo-street-at-night-4678/1080p.mp4",
  "https://cdn.coverr.co/videos/coverr-drone-shot-of-a-luxury-hotel-5203/1080p.mp4",
  "https://cdn.coverr.co/videos/coverr-applying-face-cream-5347/1080p.mp4",
  "https://cdn.coverr.co/videos/coverr-fashion-photoshoot-4592/1080p.mp4",
  "https://cdn.coverr.co/videos/coverr-driving-at-night-4611/1080p.mp4",
  "https://cdn.coverr.co/videos/coverr-friends-running-into-the-ocean-at-sunset-4638/1080p.mp4",
  "https://cdn.coverr.co/videos/coverr-skateboarding-at-sunset-4600/1080p.mp4",
  "https://cdn.coverr.co/videos/coverr-living-room-interior-2616/1080p.mp4",
  "https://cdn.coverr.co/videos/coverr-pouring-coffee-in-slow-motion-4616/1080p.mp4",
  "https://cdn.coverr.co/videos/coverr-woman-dancing-in-the-sunset-4438/1080p.mp4",
  "https://cdn.coverr.co/videos/coverr-walking-in-a-city-at-night-4690/1080p.mp4",
  "https://cdn.coverr.co/videos/coverr-limes-falling-into-water-5302/1080p.mp4",
];

// Duplicate list to ensure full screen coverage (3x)
const VIDEOS = [...BASE_VIDEOS, ...BASE_VIDEOS, ...BASE_VIDEOS];

/* --- INDIVIDUAL VIDEO TILE COMPONENT --- 
   Handles the complex logic of forcing autoplay on strict browsers 
*/
const HexVideo = ({ src, index }: { src: string; index: number }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // 1. Force Muted (Critical for Autoplay)
    video.muted = true;
    
    // 2. Play immediately
    const playPromise = video.play();
    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          // Autoplay started!
        })
        .catch((error) => {
          console.warn("Autoplay prevented by browser:", error);
          // Fallback: Mute again and try playing
          video.muted = true;
          video.play().catch(() => {});
        });
    }
  }, []);

  return (
    <div className="hex-tile">
      <div className="hex-content">
        {/* Background placeholder while video loads */}
        <div className={`hex-placeholder ${isLoaded ? 'opacity-0' : 'opacity-100'}`} />
        
        <video
          ref={videoRef}
          src={src}
          className={`hex-video ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
          loop
          muted
          playsInline // Essential for iOS
          autoPlay
          onLoadedData={() => setIsLoaded(true)}
        />
        
        {/* Border Overlay */}
        <div className="hex-border" />
      </div>
    </div>
  );
};

export const HoneycombVideos = () => {
  return (
    <section className="honeycomb-section">
      <div className="honeycomb-wrapper">
        {VIDEOS.map((src, i) => (
          <HexVideo key={i} src={src} index={i} />
        ))}
      </div>

      <style jsx global>{`
        /* 1. SECTION SETUP */
        .honeycomb-section {
          width: 100%;
          min-height: 100vh;
          background: #050505;
          display: flex;
          justify-content: center;
          align-items: center;
          padding: 4rem 2rem;
          overflow: hidden;
        }

        /* 2. GRID SYSTEM (Responsive) */
        .honeycomb-wrapper {
          display: flex;
          flex-wrap: wrap;
          justify-content: center;
          /* Maximum width to prevent it from looking stretched on huge monitors */
          max-width: 1800px;
          /* Adjust gap here for spacing between tiles */
          gap: 1.5rem; 
        }

        /* 3. TILE SHAPE & SIZE */
        .hex-tile {
          /* Desktop Size */
          width: 250px; 
          height: 220px; /* Aspect ratio roughly 1.15 */
          
          position: relative;
          /* The Hexagon Shape */
          clip-path: polygon(10% 0, 100% 0, 90% 100%, 0% 100%); /* Parallelogram/Slant fallback */
          clip-path: polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%);
          
          transition: transform 0.3s ease;
          margin-bottom: -1rem; /* Compact vertical stacking */
        }

        /* 4. HOVER EFFECTS */
        .hex-tile:hover {
          transform: scale(1.15);
          z-index: 10;
        }

        /* 5. STAGGER LOGIC (The Honeycomb Effect) 
           We shift every EVEN row slightly to create the honeycomb look.
           We use 'nth-child' ranges based on screen width.
        */

        /* LARGE SCREENS (5 items per row) */
        @media (min-width: 1100px) {
          .hex-tile {
             width: 200px;
             height: 230px;
             margin: 0.5rem;
          }
          /* Shift the start of every even row (assuming ~6 items per row fit) */
          .hex-tile:nth-child(12n + 7) {
             margin-left: 100px; /* Shift by half tile width */
          }
        }

        /* MEDIUM SCREENS (Tablet) */
        @media (max-width: 1099px) and (min-width: 700px) {
           .hex-tile {
             width: 160px;
             height: 184px;
             margin: 0.25rem;
           }
           /* Pattern for smaller grid */
           .hex-tile:nth-child(8n + 5) {
             margin-left: 80px;
           }
        }

        /* MOBILE SCREENS */
        @media (max-width: 699px) {
           .hex-tile {
             width: 120px;
             height: 138px;
             margin: 0.25rem;
           }
           /* Simple shift every 4 items */
           .hex-tile:nth-child(4n + 3) {
             margin-left: 60px;
           }
        }

        /* 6. INNER CONTENT */
        .hex-content {
          width: 100%;
          height: 100%;
          background: #111;
          position: relative;
        }

        .hex-placeholder {
          position: absolute;
          inset: 0;
          background-color: #1a1a1a;
          transition: opacity 0.5s ease;
        }

        .hex-video {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transform: scale(1.05); /* Zoom to avoid hairlines */
          filter: grayscale(0.2) brightness(0.8);
          transition: all 0.5s ease;
        }

        .hex-tile:hover .hex-video {
          filter: grayscale(0) brightness(1.1);
          transform: scale(1.2);
        }

        .hex-border {
          position: absolute;
          inset: 0;
          border: 2px solid rgba(255,255,255,0.1);
          pointer-events: none;
          /* Clip path must match parent */
          clip-path: polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%);
        }
      `}</style>
    </section>
  );
};