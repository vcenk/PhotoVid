import React, { useState } from 'react';
import { VideoStudio } from '../dashboard/video/VideoStudio';
import { NavigationRail } from '../dashboard/navigation/NavigationRail';
import { DashboardTopbar } from '../dashboard/navigation/DashboardTopbar';
import { AssetProvider } from '../../lib/store/contexts/AssetContext';

export const VideoPage: React.FC = () => {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    return (
        <AssetProvider>
            <div className="flex h-screen bg-white dark:bg-[#09090b] text-zinc-900 dark:text-white font-[Space_Grotesk] overflow-hidden">
                {/* Navigation Rail */}
                <NavigationRail isMobileOpen={mobileMenuOpen} onMobileClose={() => setMobileMenuOpen(false)} />

                {/* Main Content Area */}
                <div className="flex-1 flex flex-col min-w-0 overflow-hidden ml-0 lg:ml-16">
                    {/* Topbar */}
                    <DashboardTopbar onMenuClick={() => setMobileMenuOpen(true)} />

                    {/* Content */}
                    <main className="flex-1 overflow-hidden bg-[#0a0a0b]">
                        <VideoStudio />
                    </main>
                </div>
            </div>
        </AssetProvider>
    );
};
