import React, { useState } from 'react';
import { NavigationRail, FlyoutType } from '../dashboard/navigation/NavigationRail';
import { FlyoutPanels } from '../dashboard/navigation/FlyoutPanels';
import { DashboardTopbar } from '../dashboard/navigation/DashboardTopbar';
import { HeroComposer } from '../dashboard/home/HeroComposer';
import { IndustryModelsStrip } from '../dashboard/home/IndustryModelsStrip';
import { WorkflowLibrary } from '../dashboard/home/WorkflowLibrary';
import { RecentCreations } from '../dashboard/home/RecentCreations';
import { TemplateCarousels } from '../dashboard/home/TemplateCarousels';

export function DashboardPage() {
  const [activeFlyout, setActiveFlyout] = useState<FlyoutType>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="flex h-screen bg-white dark:bg-[#09090b] text-zinc-900 dark:text-white overflow-hidden">
      {/* Navigation Rail */}
      <NavigationRail
        activeFlyout={activeFlyout}
        onFlyoutChange={setActiveFlyout}
      />

      {/* Flyout Panels */}
      <FlyoutPanels
        activeFlyout={activeFlyout}
        onClose={() => setActiveFlyout(null)}
      />

      {/* Main Content Area */}
      <div
        className="flex-1 flex flex-col min-w-0 overflow-hidden"
        style={{ marginLeft: '224px' }}
      >
        {/* Topbar */}
        <DashboardTopbar onMenuClick={() => setMobileMenuOpen(true)} />

        {/* Scrollable Content */}
        <main className="flex-1 overflow-y-auto bg-white dark:bg-[#09090b]">
          {/* Hero Composer */}
          <HeroComposer />

          {/* Industry Models Strip */}
          <IndustryModelsStrip />

          {/* Workflow Library */}
          <WorkflowLibrary />

          {/* Recent Creations */}
          <RecentCreations />

          {/* Template Carousels */}
          <TemplateCarousels />

          {/* Footer Spacer */}
          <div className="h-16" />
        </main>
      </div>
    </div>
  );
}
