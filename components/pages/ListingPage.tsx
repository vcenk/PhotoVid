import { useState } from 'react';
import { PropertyProvider } from '@/lib/store/contexts/PropertyContext';
import { NavigationRail } from '@/components/dashboard/navigation/NavigationRail';
import { DashboardTopbar } from '@/components/dashboard/navigation/DashboardTopbar';
import { ListingCreator } from '@/components/listing/ListingCreator';

export function ListingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <PropertyProvider>
      <div className="flex h-screen bg-white dark:bg-[#09090b] text-zinc-900 dark:text-white font-[Space_Grotesk] overflow-hidden">
        <NavigationRail
          isMobileOpen={mobileMenuOpen}
          onMobileClose={() => setMobileMenuOpen(false)}
        />
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden ml-0 lg:ml-16">
          <DashboardTopbar onMenuClick={() => setMobileMenuOpen(true)} />
          <main className="flex-1 overflow-y-auto bg-white dark:bg-[#09090b]">
            <ListingCreator />
          </main>
        </div>
      </div>
    </PropertyProvider>
  );
}
