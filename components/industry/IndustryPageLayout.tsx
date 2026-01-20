import React, { useState } from 'react';
import { NavigationRail, FlyoutType } from '../dashboard/navigation/NavigationRail';
import { FlyoutPanels } from '../dashboard/navigation/FlyoutPanels';

interface IndustryPageLayoutProps {
    children: React.ReactNode;
}

export const IndustryPageLayout: React.FC<IndustryPageLayoutProps> = ({ children }) => {
    const [activeFlyout, setActiveFlyout] = useState<FlyoutType>(null);

    return (
        <div className="h-screen flex bg-white dark:bg-[#09090b]">
            {/* Navigation Rail */}
            <NavigationRail activeFlyout={activeFlyout} onFlyoutChange={setActiveFlyout} />

            {/* Flyout Panels */}
            <FlyoutPanels activeFlyout={activeFlyout} onClose={() => setActiveFlyout(null)} />

            {/* Main Content */}
            <div className="flex-1 overflow-y-auto ml-56">
                {children}
            </div>
        </div>
    );
};
