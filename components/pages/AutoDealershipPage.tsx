import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    Car,
    Camera,
    Sparkles,
    ArrowRight,
    Play,
    Image as ImageIcon,
    Video,
    Wand2,
    RotateCcw,
    Palette,
    Zap
} from 'lucide-react';
import { NavigationRail, FlyoutType } from '../dashboard/navigation/NavigationRail';
import { FlyoutPanels } from '../dashboard/navigation/FlyoutPanels';

// Auto Dealership specific tools/features
const AUTO_TOOLS = [
    {
        id: 'vehicle-360',
        name: '360° Vehicle Spin',
        description: 'Create stunning rotating showcases of any vehicle',
        icon: RotateCcw,
        gradient: 'from-red-500 to-rose-600',
        isPremium: true,
    },
    {
        id: 'background-swap',
        name: 'Showroom Background',
        description: 'Replace lot backgrounds with premium showroom settings',
        icon: ImageIcon,
        gradient: 'from-blue-500 to-indigo-600',
    },
    {
        id: 'vehicle-enhancement',
        name: 'Vehicle Enhancement',
        description: 'Enhance vehicle photos with perfect lighting and shine',
        icon: Sparkles,
        gradient: 'from-amber-500 to-orange-600',
    },
    {
        id: 'color-change',
        name: 'Color Visualizer',
        description: 'Show vehicles in different colors for customers',
        icon: Palette,
        gradient: 'from-violet-500 to-purple-600',
    },
    {
        id: 'blemish-removal',
        name: 'Blemish Removal',
        description: 'Remove scratches, dents, and imperfections from photos',
        icon: Wand2,
        gradient: 'from-emerald-500 to-teal-600',
    },
    {
        id: 'motion-video',
        name: 'Motion Video',
        description: 'Bring static car photos to life with cinematic motion',
        icon: Video,
        gradient: 'from-pink-500 to-rose-600',
        isPremium: true,
    },
];

// Quick-start workflows
const QUICK_WORKFLOWS = [
    {
        id: 'inventory-photos',
        name: 'Inventory Photo Package',
        description: 'Process your entire inventory in one batch',
        steps: 3,
        credits: 25,
    },
    {
        id: 'social-reel',
        name: 'Social Media Reel',
        description: 'Create engaging video reels for Instagram/TikTok',
        steps: 4,
        credits: 15,
    },
    {
        id: 'listing-ready',
        name: 'Listing Ready',
        description: 'One-click enhance for marketplace listings',
        steps: 2,
        credits: 5,
    },
];

export const AutoDealershipPage: React.FC = () => {
    const [activeFlyout, setActiveFlyout] = useState<FlyoutType>(null);
    const navigate = useNavigate();

    const handleToolClick = (toolId: string) => {
        // Navigate to appropriate studio page based on tool
        switch (toolId) {
            case 'vehicle-360':
            case 'motion-video':
                navigate('/studio');
                break;
            case 'background-swap':
            case 'vehicle-enhancement':
            case 'color-change':
            case 'blemish-removal':
                navigate('/studio/image');
                break;
            default:
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
            <div className="flex-1 overflow-y-auto ml-56">
                {/* Hero Section */}
                <div className="relative bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900 overflow-hidden">
                    {/* Background Pattern */}
                    <div className="absolute inset-0">
                        <div className="absolute top-0 left-0 w-96 h-96 bg-red-500/20 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
                        <div className="absolute bottom-0 right-0 w-96 h-96 bg-orange-500/20 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />
                    </div>

                    <div className="relative max-w-7xl mx-auto px-6 py-16">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex items-start gap-6"
                        >
                            {/* Icon */}
                            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center flex-shrink-0">
                                <Car size={32} className="text-white" />
                            </div>

                            {/* Content */}
                            <div className="flex-1">
                                <h1 className="text-4xl font-bold text-white mb-3">
                                    Auto Dealership Studio
                                </h1>
                                <p className="text-xl text-zinc-400 max-w-2xl mb-6">
                                    Elevate your vehicle inventory with AI-powered photo enhancement,
                                    360° spins, and dynamic video showcases.
                                </p>
                                <div className="flex gap-4">
                                    <button
                                        onClick={() => navigate('/studio/image')}
                                        className="px-6 py-3 bg-gradient-to-r from-red-500 to-orange-500 text-white font-semibold rounded-xl hover:from-red-600 hover:to-orange-600 transition-colors flex items-center gap-2"
                                    >
                                        <Zap size={18} />
                                        Start Creating
                                    </button>
                                    <button className="px-6 py-3 bg-white/10 text-white font-semibold rounded-xl hover:bg-white/20 transition-colors flex items-center gap-2 backdrop-blur-sm">
                                        <Play size={18} />
                                        Watch Demo
                                    </button>
                                </div>
                            </div>
                        </motion.div>

                        {/* Stats */}
                        <div className="flex gap-12 mt-12 pt-8 border-t border-white/10">
                            <div>
                                <p className="text-3xl font-bold text-white">100K+</p>
                                <p className="text-zinc-500 text-sm">Vehicles Enhanced</p>
                            </div>
                            <div>
                                <p className="text-3xl font-bold text-white">40%</p>
                                <p className="text-zinc-500 text-sm">Faster Sales</p>
                            </div>
                            <div>
                                <p className="text-3xl font-bold text-white">5x</p>
                                <p className="text-zinc-500 text-sm">More Engagement</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tools Grid */}
                <div className="max-w-7xl mx-auto px-6 py-12">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h2 className="text-2xl font-bold text-zinc-900 dark:text-white">
                                Auto Dealership AI Tools
                            </h2>
                            <p className="text-zinc-500 dark:text-zinc-400 mt-1">
                                Professional tools to showcase your inventory
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                        {AUTO_TOOLS.map((tool, index) => {
                            const Icon = tool.icon;
                            return (
                                <motion.div
                                    key={tool.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                    onClick={() => handleToolClick(tool.id)}
                                    className="group relative bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6 cursor-pointer hover:shadow-xl hover:border-red-200 dark:hover:border-red-900/50 transition-all"
                                >
                                    {/* Premium Badge */}
                                    {tool.isPremium && (
                                        <div className="absolute top-4 right-4">
                                            <span className="px-2 py-1 bg-gradient-to-r from-amber-400 to-yellow-500 text-black text-[10px] font-bold uppercase rounded-full">
                                                Pro
                                            </span>
                                        </div>
                                    )}

                                    {/* Icon */}
                                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${tool.gradient} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                                        <Icon size={24} className="text-white" />
                                    </div>

                                    {/* Content */}
                                    <h3 className="text-lg font-semibold text-zinc-900 dark:text-white mb-2 group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors">
                                        {tool.name}
                                    </h3>
                                    <p className="text-zinc-500 dark:text-zinc-400 text-sm">
                                        {tool.description}
                                    </p>

                                    {/* Arrow */}
                                    <div className="absolute bottom-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <ArrowRight size={20} className="text-red-600 dark:text-red-400" />
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                </div>

                {/* Quick Workflows */}
                <div className="max-w-7xl mx-auto px-6 pb-12">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h2 className="text-2xl font-bold text-zinc-900 dark:text-white">
                                Quick Workflows
                            </h2>
                            <p className="text-zinc-500 dark:text-zinc-400 mt-1">
                                Pre-built automation for dealership needs
                            </p>
                        </div>
                        <button
                            onClick={() => navigate('/studio/workflow')}
                            className="text-sm text-red-600 dark:text-red-400 font-medium hover:underline flex items-center gap-1"
                        >
                            View All Workflows <ArrowRight size={16} />
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                        {QUICK_WORKFLOWS.map((workflow, index) => (
                            <motion.div
                                key={workflow.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 + index * 0.05 }}
                                onClick={() => navigate('/studio/workflow')}
                                className="group bg-gradient-to-br from-zinc-50 to-zinc-100 dark:from-zinc-800 dark:to-zinc-900 rounded-2xl p-6 cursor-pointer hover:shadow-lg transition-all border border-zinc-200 dark:border-zinc-700"
                            >
                                <div className="flex items-start justify-between mb-4">
                                    <div className="p-3 rounded-xl bg-white dark:bg-zinc-800 shadow-sm">
                                        <Car size={20} className="text-red-600 dark:text-red-400" />
                                    </div>
                                    <div className="flex gap-2">
                                        <span className="px-2 py-1 bg-white dark:bg-zinc-800 rounded-full text-xs text-zinc-600 dark:text-zinc-400">
                                            {workflow.steps} steps
                                        </span>
                                        <span className="px-2 py-1 bg-red-100 dark:bg-red-950 rounded-full text-xs text-red-600 dark:text-red-400 font-medium">
                                            {workflow.credits} credits
                                        </span>
                                    </div>
                                </div>
                                <h3 className="text-lg font-semibold text-zinc-900 dark:text-white mb-2">
                                    {workflow.name}
                                </h3>
                                <p className="text-zinc-500 dark:text-zinc-400 text-sm">
                                    {workflow.description}
                                </p>
                            </motion.div>
                        ))}
                    </div>
                </div>

                {/* Back to Apps */}
                <div className="max-w-7xl mx-auto px-6 pb-12">
                    <button
                        onClick={() => navigate('/studio/apps')}
                        className="text-sm text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 flex items-center gap-2"
                    >
                        ← Back to All Apps
                    </button>
                </div>
            </div>
        </div>
    );
};
