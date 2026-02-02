import React, { useState } from 'react';
import { NavigationRail } from '../dashboard/navigation/NavigationRail';
import { DashboardTopbar } from '../dashboard/navigation/DashboardTopbar';
import { AssetProvider } from '../../lib/store/contexts/AssetContext';
import { EditHub } from '../dashboard/edit/EditHub';

export const EditPage: React.FC = () => {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    return (
        <AssetProvider>
            <div className="flex h-screen bg-white dark:bg-[#09090b] text-zinc-900 dark:text-white overflow-hidden">
                <NavigationRail isMobileOpen={mobileMenuOpen} onMobileClose={() => setMobileMenuOpen(false)} />

                <div className="flex-1 flex flex-col min-w-0 overflow-hidden ml-0 lg:ml-16">
                    <DashboardTopbar onMenuClick={() => setMobileMenuOpen(true)} />

                    <main className="flex-1 overflow-y-auto bg-white dark:bg-[#09090b]">
                        <EditHub />
                    </main>
                </div>
            </div>
        </AssetProvider>
    );
};
