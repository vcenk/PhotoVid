import React, { useState } from 'react';
import { NavigationRail } from '../dashboard/navigation/NavigationRail';

interface IndustryPageLayoutProps {
    children: React.ReactNode;
}

export const IndustryPageLayout: React.FC<IndustryPageLayoutProps> = ({ children }) => {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    return (
        <div className="h-screen flex bg-white dark:bg-[#09090b]">
            {/* Navigation Rail */}
            <NavigationRail isMobileOpen={mobileMenuOpen} onMobileClose={() => setMobileMenuOpen(false)} />

            {/* Main Content */}
            <div className="flex-1 overflow-y-auto ml-0 lg:ml-16">
                {children}
            </div>
        </div>
    );
};
