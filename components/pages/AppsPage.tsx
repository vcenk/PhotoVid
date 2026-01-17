import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Building2, Car, ArrowRight, Sparkles } from 'lucide-react';
import { AppsGrid } from '../dashboard/apps/AppsGrid';
import { NavigationRail, FlyoutType } from '../dashboard/navigation/NavigationRail';
import { FlyoutPanels } from '../dashboard/navigation/FlyoutPanels';
import type { AIApp } from '../../lib/data/apps';

// Industry portal definitions
const INDUSTRY_PORTALS = [
    {
        id: 'real-estate',
        name: 'Real Estate',
        description: 'Virtual staging, property enhancement, and room tours',
        icon: Building2,
        gradient: 'from-blue-600 to-indigo-700',
        path: '/studio/apps/real-estate',
        stats: '50K+ properties',
    },
    {
        id: 'auto',
        name: 'Auto Dealerships',
        description: '360° spins, showroom backgrounds, and vehicle showcases',
        icon: Car,
        gradient: 'from-zinc-800 to-zinc-900',
        path: '/studio/apps/auto',
        stats: '100K+ vehicles',
    },
];

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

            {/* Main Content */}
            <div className="flex-1 overflow-y-auto ml-[72px]">
                {/* Industries Section */}
                <div className="bg-gradient-to-b from-violet-50 to-white dark:from-zinc-900 dark:to-[#09090b] border-b border-zinc-100 dark:border-zinc-800">
                    <div className="max-w-7xl mx-auto px-6 py-8">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
                                <Sparkles size={20} className="text-white" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-zinc-900 dark:text-white">
                                    Industry Solutions
                                </h2>
                                <p className="text-sm text-zinc-500 dark:text-zinc-400">
                                    Tailored AI tools for your specific industry
                                </p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {INDUSTRY_PORTALS.map((industry, index) => {
                                const Icon = industry.icon;
                                return (
                                    <motion.div
                                        key={industry.id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.1 }}
                                        onClick={() => navigate(industry.path)}
                                        className="group relative cursor-pointer rounded-2xl overflow-hidden hover:shadow-2xl transition-all duration-300"
                                    >
                                        {/* Background */}
                                        <div className={`absolute inset-0 bg-gradient-to-br ${industry.gradient}`} />

                                        {/* Pattern overlay */}
                                        <div className="absolute inset-0 opacity-10">
                                            <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full blur-3xl translate-x-1/2 -translate-y-1/2" />
                                        </div>

                                        {/* Content */}
                                        <div className="relative p-6 flex items-center justify-between">
                                            <div className="flex items-center gap-4">
                                                <div className="w-14 h-14 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center group-hover:scale-110 transition-transform">
                                                    <Icon size={28} className="text-white" />
                                                </div>
                                                <div>
                                                    <h3 className="text-lg font-bold text-white mb-1">
                                                        {industry.name}
                                                    </h3>
                                                    <p className="text-sm text-white/70">
                                                        {industry.description}
                                                    </p>
                                                    <span className="text-xs text-white/50 mt-1 inline-block">
                                                        {industry.stats}
                                                    </span>
                                                </div>
                                            </div>
                                            <motion.div
                                                animate={{ x: [0, 4, 0] }}
                                                transition={{ repeat: Infinity, duration: 1.5 }}
                                                className="p-3 rounded-full bg-white/20 backdrop-blur-sm"
                                            >
                                                <ArrowRight size={20} className="text-white" />
                                            </motion.div>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Apps Grid */}
                <AppsGrid onAppSelect={handleAppSelect} />
            </div>
        </div>
    );
};
