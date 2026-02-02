import React, { useState } from 'react';
import { LipsyncStudio } from '../dashboard/lipsync/LipsyncStudio';
import { NavigationRail } from '../dashboard/navigation/NavigationRail';

export const LipsyncPage: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="h-screen flex bg-white dark:bg-[#09090b]">
      {/* Navigation Rail */}
      <NavigationRail isMobileOpen={mobileMenuOpen} onMobileClose={() => setMobileMenuOpen(false)} />

      {/* Flyout Panels */}
{/* Main Content - Lipsync Studio (Full Height) */}
      <div className="flex-1 overflow-hidden ml-0 lg:ml-16">
        <LipsyncStudio />
      </div>
    </div>
  );
};
