
import React from 'react';

/**
 * MarqueeDivider Component
 * 
 * Provides a cinematic pause between large animated sections.
 */
export const MarqueeDivider: React.FC = () => {
  return (
    <div className="relative w-full py-14 md:py-16 flex justify-center overflow-hidden">
      <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent" />
    </div>
  );
};
