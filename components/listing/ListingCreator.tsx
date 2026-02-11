import React, { useState } from 'react';
import { Property } from '@/lib/store/contexts/PropertyContext';
import { PropertySelector } from './PropertySelector';
import { DescriptionTab } from './DescriptionTab';
import { SocialMediaTab } from './SocialMediaTab';
import { FlyerTab } from './FlyerTab';
import { EmailTab } from './EmailTab';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText,
  Share2,
  LayoutTemplate,
  Mail,
  Home,
  Check,
} from 'lucide-react';
import { cn } from '@/lib/utils';

type TabId = 'description' | 'social' | 'flyer' | 'email';

const TABS: { id: TabId; label: string; icon: React.ElementType }[] = [
  { id: 'description', label: 'Description', icon: FileText },
  { id: 'social', label: 'Social Media', icon: Share2 },
  { id: 'flyer', label: 'Flyer', icon: LayoutTemplate },
  { id: 'email', label: 'Email', icon: Mail },
];


export function ListingCreator() {
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [activeTab, setActiveTab] = useState<TabId>('description');
  const [generatedTabs, setGeneratedTabs] = useState<Set<TabId>>(new Set());

  const markGenerated = (tab: TabId) => {
    setGeneratedTabs((prev) => new Set(prev).add(tab));
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
      {/* Hero */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-zinc-900 dark:text-white mb-2">Listing Content Studio</h1>
        <p className="text-zinc-500 dark:text-zinc-400 text-sm">
          Generate MLS descriptions, social media posts, flyers, and email campaigns for your listings.
        </p>
      </div>

      {/* Property Selector */}
      <div className="mb-6">
        <PropertySelector
          selectedProperty={selectedProperty}
          onSelect={setSelectedProperty}
        />
      </div>

      {!selectedProperty ? (
        <div className="rounded-2xl border border-zinc-200 dark:border-white/5 bg-zinc-100 dark:bg-zinc-900/30 p-12 text-center">
          <Home size={32} className="mx-auto mb-3 text-zinc-400 dark:text-zinc-700" />
          <p className="text-zinc-500 text-sm">
            Select a property above to start generating listing content.
          </p>
        </div>
      ) : (
        <>
          {/* Tab Bar */}
          <div className="flex items-center gap-1 mb-6 overflow-x-auto pb-1 scrollbar-none">
            {TABS.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              const isGenerated = generatedTabs.has(tab.id);
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    'flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all whitespace-nowrap relative',
                    isActive
                      ? 'bg-emerald-600 text-white'
                      : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-white/5'
                  )}
                >
                  <Icon size={16} />
                  {tab.label}
                  {isGenerated && !isActive && (
                    <Check size={12} className="text-green-500" />
                  )}
                </button>
              );
            })}

          </div>

          {/* Tab Content */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.15 }}
            >
              {activeTab === 'description' && (
                <DescriptionTab
                  property={selectedProperty}
                  onGenerated={() => markGenerated('description')}
                />
              )}
              {activeTab === 'social' && (
                <SocialMediaTab
                  property={selectedProperty}
                  onGenerated={() => markGenerated('social')}
                />
              )}
              {activeTab === 'flyer' && (
                <FlyerTab
                  property={selectedProperty}
                  onGenerated={() => markGenerated('flyer')}
                />
              )}
              {activeTab === 'email' && (
                <EmailTab
                  property={selectedProperty}
                  onGenerated={() => markGenerated('email')}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </>
      )}
    </div>
  );
}
