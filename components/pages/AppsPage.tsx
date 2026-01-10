import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppsGrid } from '../dashboard/apps/AppsGrid';
import { NavigationRail, FlyoutType } from '../dashboard/navigation/NavigationRail';
import { FlyoutPanels } from '../dashboard/navigation/FlyoutPanels';
import type { AIApp } from '../../lib/data/apps';

export const AppsPage: React.FC = () => {
    const [activeFlyout, setActiveFlyout] = useState<FlyoutType>(null);
    const navigate = useNavigate();

    const handleAppSelect = (app: AIApp) => {
        // Navigate to appropriate page based on app type
        switch (app.id) {
            case 'text-to-image':
            case 'image-upscaler':
            case 'style-transfer':
            case 'manga-generator':
            case 'polygon-art':
            case 'watercolor':
                navigate('/studio/image');
                break;
            case 'lipsync':
                navigate('/studio/lipsync');
                break;
            case 'image-to-video':
                navigate('/studio');
                break;
            default:
                // For other apps, navigate to image studio for now
                navigate('/studio/image');
        }
    };

    return (
        <div className="h-screen flex bg-white dark:bg-[#09090b]">
            {/* Navigation Rail */}
            <NavigationRail activeFlyout={activeFlyout} onFlyoutChange={setActiveFlyout} />

            {/* Flyout Panels */}
            <FlyoutPanels activeFlyout={activeFlyout} onClose={() => setActiveFlyout(null)} />

            {/* Main Content - Apps Grid */}
            <div className="flex-1 overflow-hidden ml-[72px]">
                <AppsGrid onAppSelect={handleAppSelect} />
            </div>
        </div>
    );
};
