import React, { useState } from 'react';
import { DubbingStudio } from '../dashboard/dubbing/DubbingStudio';
import { NavigationRail } from '../dashboard/navigation/NavigationRail';

export const DubbingPage: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="h-screen flex bg-white dark:bg-[#09090b]">
      {/* Navigation Rail */}
      <NavigationRail isMobileOpen={mobileMenuOpen} onMobileClose={() => setMobileMenuOpen(false)} />

      {/* Main Content - Dubbing Studio (Full Height) */}
      <div className="flex-1 overflow-hidden ml-0 lg:ml-16">
        <DubbingStudio />
      </div>
    </div>
  );
};
