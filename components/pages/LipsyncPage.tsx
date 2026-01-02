import React, { useState } from 'react';
import { LipsyncStudio } from '../dashboard/lipsync/LipsyncStudio';
import { NavigationRail, FlyoutType } from '../dashboard/navigation/NavigationRail';
import { FlyoutPanels } from '../dashboard/navigation/FlyoutPanels';

export const LipsyncPage: React.FC = () => {
  const [activeFlyout, setActiveFlyout] = useState<FlyoutType>(null);

  return (
    <div className="h-screen flex bg-zinc-50">
      {/* Navigation Rail */}
      <NavigationRail activeFlyout={activeFlyout} onFlyoutChange={setActiveFlyout} />

      {/* Flyout Panels */}
      <FlyoutPanels activeFlyout={activeFlyout} onClose={() => setActiveFlyout(null)} />

      {/* Main Content - Lipsync Studio (Full Height) */}
      <div className="flex-1 overflow-hidden ml-[72px]">
        <LipsyncStudio />
      </div>
    </div>
  );
};
