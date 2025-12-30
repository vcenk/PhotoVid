"use client";

import React, { useEffect, useRef, useState } from 'react';

// 29 Unique High-Quality Video Sources (Pexels & Pixabay)
const VIDEO_SOURCES = [
  // Abstract / Tech / Particles
  "https://videos.pexels.com/video-files/3129671/3129671-hd_1920_1080_30fps.mp4",
  "https://videos.pexels.com/video-files/852423/852423-hd_1920_1080_30fps.mp4",
  "https://videos.pexels.com/video-files/2659056/2659056-hd_1920_1080_30fps.mp4",
  "https://videos.pexels.com/video-files/1448735/1448735-hd_1920_1080_24fps.mp4",
  "https://videos.pexels.com/video-files/5532772/5532772-hd_1920_1080_25fps.mp4",
  
  // Lifestyle / Fashion
  "https://videos.pexels.com/video-files/3205917/3205917-hd_1920_1080_25fps.mp4",
  "https://videos.pexels.com/video-files/5664188/5664188-hd_1920_1080_24fps.mp4",
  "https://videos.pexels.com/video-files/6333333/6333333-hd_1920_1080_30fps.mp4",
  "https://videos.pexels.com/video-files/4820986/4820986-hd_1920_1080_25fps.mp4",
  "https://videos.pexels.com/video-files/6767568/6767568-hd_1920_1080_25fps.mp4",

  // City / Urban / Architecture
  "https://videos.pexels.com/video-files/3121459/3121459-hd_1920_1080_25fps.mp4",
  "https://videos.pexels.com/video-files/1536322/1536322-hd_1920_1080_30fps.mp4",
  "https://videos.pexels.com/video-files/3026363/3026363-hd_1920_1080_24fps.mp4",
  "https://videos.pexels.com/video-files/2169882/2169882-hd_1920_1080_30fps.mp4",
  "https://videos.pexels.com/video-files/2418367/2418367-hd_1920_1080_24fps.mp4",

  // Nature / Elements
  "https://videos.pexels.com/video-files/855564/855564-hd_1920_1080_25fps.mp4",
  "https://videos.pexels.com/video-files/1851001/1851001-hd_1920_1080_24fps.mp4",
  "https://videos.pexels.com/video-files/1409899/1409899-hd_1920_1080_25fps.mp4",
  "https://videos.pexels.com/video-files/2759484/2759484-hd_1920_1080_30fps.mp4",
  "https://videos.pexels.com/video-files/4763826/4763826-hd_1920_1080_24fps.mp4",

  // Creative / Studio
  "https://videos.pexels.com/video-files/5091624/5091624-hd_1920_1080_24fps.mp4",
  "https://videos.pexels.com/video-files/4114797/4114797-hd_1920_1080_25fps.mp4",
  "https://videos.pexels.com/video-files/1743606/1743606-hd_1920_1080_24fps.mp4",
  "https://videos.pexels.com/video-files/7565456/7565456-hd_1920_1080_25fps.mp4",
  "https://videos.pexels.com/video-files/3752528/3752528-hd_1920_1080_25fps.mp4",

  // Extra Fillers
  "https://videos.pexels.com/video-files/3133649/3133649-hd_1920_1080_30fps.mp4",
  "https://videos.pexels.com/video-files/3249935/3249935-hd_1920_1080_25fps.mp4",
  "https://videos.pexels.com/video-files/3252445/3252445-hd_1920_1080_25fps.mp4",
  "https://videos.pexels.com/video-files/2882798/2882798-hd_1920_1080_24fps.mp4"
];

const HexVideo = ({ src, index }: { src: string; index: number }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            if (videoRef.current) {
              videoRef.current.play().catch(() => {}); // Silent catch
            }
          } else {
            if (videoRef.current) {
              videoRef.current.pause();
            }
          }
        });
      },
      { threshold: 0.1 }
    );

    if (videoRef.current) {
      observer.observe(videoRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <div className="hex-wrapper">
      <div className="hex-inner">
        <video
          ref={videoRef}
          src={src}
          muted
          loop
          playsInline
          className="hex-video"
          preload="metadata" // Save bandwidth until visible
        />
        <div className="hex-border" />
      </div>
    </div>
  );
};

export const HoneycombVideos = () => {
  // Wide screen layout strategy: 8 - 7 - 8 - 6 pattern
  const row1 = VIDEO_SOURCES.slice(0, 8);
  const row2 = VIDEO_SOURCES.slice(8, 15);
  const row3 = VIDEO_SOURCES.slice(15, 23);
  const row4 = VIDEO_SOURCES.slice(23, 29);

  return (
    <section className="honeycomb-section bg-black">
      <div className="honeycomb-container">
        
        {/* ROW 1: 8 Items */}
        <div className="hex-row">
          {row1.map((vid, i) => <HexVideo key={`r1-${i}`} src={vid} index={i} />)}
        </div>

        {/* ROW 2: 7 Items */}
        <div className="hex-row">
          {row2.map((vid, i) => <HexVideo key={`r2-${i}`} src={vid} index={i} />)}
        </div>

        {/* ROW 3: 8 Items */}
        <div className="hex-row">
          {row3.map((vid, i) => <HexVideo key={`r3-${i}`} src={vid} index={i} />)}
        </div>

        {/* ROW 4: 6 Items */}
        <div className="hex-row">
          {row4.map((vid, i) => <HexVideo key={`r4-${i}`} src={vid} index={i} />)}
        </div>

      </div>

      <style>{`
        .honeycomb-section {
          width: 100%;
          min-height: 100vh;
          padding: 60px 0;
          overflow: hidden;
          background: #000;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
        }

        .honeycomb-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          /* Negative gap to interlock rows */
          gap: -30px; 
          transform: scale(0.9); /* Global scale adjustment if needed */
        }

        .hex-row {
          display: flex;
          gap: 12px;
          margin-bottom: -45px; /* Critical for honeycomb vertical overlap */
          z-index: 1;
        }
        
        /* Shift even rows to create the honeycomb weave pattern */
        .hex-row:nth-child(even) {
           transform: translateX(86px); /* Half the width of a hex + half gap */
        }

        .hex-wrapper {
          width: 160px;
          height: 184px; /* Exact hex ratio for pointy top */
          position: relative;
          /* Standard Hexagon Clip Path */
          clip-path: polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%);
          transition: transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275), z-index 0.3s;
          background: #111;
          z-index: 1;
          flex-shrink: 0; /* Prevent squishing on small screens */
        }

        .hex-wrapper:hover {
          transform: scale(1.3) !important;
          z-index: 100;
          box-shadow: 0 20px 50px rgba(0,0,0,0.5);
        }

        .hex-inner {
          width: 100%;
          height: 100%;
          background: #151515;
          position: relative;
        }

        .hex-video {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transform: scale(1.02); /* Slight zoom to remove hairlines */
        }

        .hex-border {
          position: absolute;
          inset: 0;
          border: 1px solid rgba(255,255,255,0.15);
          clip-path: polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%);
          pointer-events: none;
        }

        /* --- RESPONSIVE ADJUSTMENTS --- */
        
        @media (max-width: 1600px) {
          /* Scale down slightly for smaller desktops */
          .honeycomb-container { transform: scale(0.8); }
        }

        @media (max-width: 1200px) {
          .honeycomb-container { transform: scale(0.65); }
        }
        
        @media (max-width: 768px) {
           /* Force horizontal scroll on mobile instead of breaking layout */
           .honeycomb-section {
             align-items: flex-start;
             overflow-x: auto;
           }
           .honeycomb-container {
             transform: scale(0.5);
             transform-origin: top left;
             padding: 20px;
           }
        }
      `}</style>
    </section>
  );
};
