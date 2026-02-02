import React, { useState } from 'react';
import { ImageStudio } from '../dashboard/image/ImageStudio';
import { NavigationRail } from '../dashboard/navigation/NavigationRail';
import { DashboardTopbar } from '../dashboard/navigation/DashboardTopbar';
import { AssetProvider } from '../../lib/store/contexts/AssetContext';

export const ImagePage: React.FC = () => {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    return (
        <AssetProvider>
            <div className="flex h-screen bg-white dark:bg-[#09090b] text-zinc-900 dark:text-white overflow-hidden">
                {/* Navigation Rail */}
                <NavigationRail isMobileOpen={mobileMenuOpen} onMobileClose={() => setMobileMenuOpen(false)} />

                {/* Main Content Area */}
                <div className="flex-1 flex flex-col min-w-0 overflow-hidden ml-0 lg:ml-16">
                    {/* Topbar */}
                    <DashboardTopbar onMenuClick={() => setMobileMenuOpen(true)} />

                    {/* Scrollable Content */}
                    <main className="flex-1 overflow-y-auto bg-white dark:bg-[#09090b]">
                        <ImageStudio />
                    </main>
                </div>
            </div>
        </AssetProvider>
    );
};
