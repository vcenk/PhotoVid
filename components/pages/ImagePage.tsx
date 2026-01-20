import React, { useState } from 'react';
import { ImageStudio } from '../dashboard/image/ImageStudio';
import { NavigationRail, FlyoutType } from '../dashboard/navigation/NavigationRail';
import { FlyoutPanels } from '../dashboard/navigation/FlyoutPanels';

export const ImagePage: React.FC = () => {
    const [activeFlyout, setActiveFlyout] = useState<FlyoutType>(null);

    return (
        <div className="h-screen flex bg-white dark:bg-[#09090b]">
            {/* Navigation Rail */}
            <NavigationRail activeFlyout={activeFlyout} onFlyoutChange={setActiveFlyout} />

            {/* Flyout Panels */}
            <FlyoutPanels activeFlyout={activeFlyout} onClose={() => setActiveFlyout(null)} />

            {/* Main Content - Image Studio (Full Height) */}
            <div className="flex-1 overflow-hidden ml-56">
                <ImageStudio />
            </div>
        </div>
    );
};
