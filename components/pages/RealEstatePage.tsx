import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    Building2,
    Home,
    Camera,
    Sparkles,
    ArrowRight,
    Play,
    Image as ImageIcon,
    Video,
    Wand2,
    ScanLine,
    Sofa,
    Sun
} from 'lucide-react';
import { NavigationRail, FlyoutType } from '../dashboard/navigation/NavigationRail';
import { FlyoutPanels } from '../dashboard/navigation/FlyoutPanels';

// Real Estate specific tools/features
const REAL_ESTATE_TOOLS = [
    {
        id: 'virtual-staging',
        name: 'Virtual Staging',
        description: 'Transform empty rooms with AI-generated furniture and decor',
        icon: Sofa,
        gradient: 'from-blue-500 to-indigo-600',
        isPremium: true,
    },
    {
        id: 'property-enhancement',
        name: 'Property Enhancement',
        description: 'Enhance property photos with better lighting and colors',
        icon: Sun,
        gradient: 'from-amber-500 to-orange-600',
    },
    {
        id: 'sky-replacement',
        name: 'Sky Replacement',
        description: 'Replace overcast skies with beautiful blue skies',
        icon: ImageIcon,
        gradient: 'from-cyan-500 to-blue-600',
    },
    {
        id: 'room-tour',
        name: 'Room Tour Video',
        description: 'Create smooth walkthrough videos from photos',
        icon: Video,
        gradient: 'from-violet-500 to-purple-600',
        isPremium: true,
    },
    {
        id: 'declutter',
        name: 'AI Declutter',
        description: 'Remove unwanted objects from property photos',
        icon: Wand2,
        gradient: 'from-rose-500 to-pink-600',
    },
    {
        id: 'floor-plan',
        name: 'Floor Plan Generator',
        description: 'Generate 2D floor plans from room photos',
        icon: ScanLine,
        gradient: 'from-emerald-500 to-teal-600',
    },
];

// Quick-start workflows
const QUICK_WORKFLOWS = [
    {
        id: 'property-showcase',
        name: 'Property Showcase',
        description: 'Cinematic fly-through of a single property',
        steps: 4,
        credits: 10,
    },
    {
        id: 'listing-photos',
        name: 'Listing Photo Package',
        description: 'Enhance all listing photos in one go',
        steps: 3,
        credits: 15,
    },
    {
        id: 'virtual-tour',
        name: 'Virtual Tour Creator',
        description: 'Create an interactive virtual tour',
        steps: 5,
        credits: 20,
    },
];

export const RealEstatePage: React.FC = () => {
    const [activeFlyout, setActiveFlyout] = useState<FlyoutType>(null);
    const navigate = useNavigate();

    const handleToolClick = (toolId: string) => {
        // Navigate to appropriate tool page based on tool
        switch (toolId) {
            case 'virtual-staging':
                navigate('/studio/apps/real-estate/virtual-staging');
                break;
            case 'room-tour':
                navigate('/studio');
                break;
            case 'property-enhancement':
            case 'sky-replacement':
            case 'declutter':
            case 'floor-plan':
                // TODO: Create dedicated pages for these tools
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
                <div className="relative bg-gradient-to-br from-blue-600 via-indigo-600 to-violet-700 overflow-hidden">
                    {/* Background Pattern */}
                    <div className="absolute inset-0 opacity-10">
                        <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
                        <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />
                    </div>

                    <div className="relative max-w-7xl mx-auto px-6 py-16">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex items-start gap-6"
                        >
                            {/* Icon */}
                            <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center flex-shrink-0">
                                <Building2 size={32} className="text-white" />
                            </div>

                            {/* Content */}
                            <div className="flex-1">
                                <h1 className="text-4xl font-bold text-white mb-3">
                                    Real Estate Studio
                                </h1>
                                <p className="text-xl text-white/80 max-w-2xl mb-6">
                                    Transform your property listings with AI-powered virtual staging,
                                    photo enhancement, and cinematic video tours.
                                </p>
                                <div className="flex gap-4">
                                    <button
                                        onClick={() => navigate('/studio/image')}
                                        className="px-6 py-3 bg-white text-indigo-600 font-semibold rounded-xl hover:bg-white/90 transition-colors flex items-center gap-2"
                                    >
                                        <Sparkles size={18} />
                                        Start Creating
                                    </button>
                                    <button className="px-6 py-3 bg-white/20 text-white font-semibold rounded-xl hover:bg-white/30 transition-colors flex items-center gap-2 backdrop-blur-sm">
                                        <Play size={18} />
                                        Watch Demo
                                    </button>
                                </div>
                            </div>
                        </motion.div>

                        {/* Stats */}
                        <div className="flex gap-12 mt-12 pt-8 border-t border-white/20">
                            <div>
                                <p className="text-3xl font-bold text-white">50K+</p>
                                <p className="text-white/60 text-sm">Properties Enhanced</p>
                            </div>
                            <div>
                                <p className="text-3xl font-bold text-white">85%</p>
                                <p className="text-white/60 text-sm">Faster Listings</p>
                            </div>
                            <div>
                                <p className="text-3xl font-bold text-white">3x</p>
                                <p className="text-white/60 text-sm">More Engagement</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tools Grid */}
                <div className="max-w-7xl mx-auto px-6 py-12">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h2 className="text-2xl font-bold text-zinc-900 dark:text-white">
                                Real Estate AI Tools
                            </h2>
                            <p className="text-zinc-500 dark:text-zinc-400 mt-1">
                                Everything you need to create stunning property visuals
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                        {REAL_ESTATE_TOOLS.map((tool, index) => {
                            const Icon = tool.icon;
                            return (
                                <motion.div
                                    key={tool.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                    onClick={() => handleToolClick(tool.id)}
                                    className="group relative bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6 cursor-pointer hover:shadow-xl hover:border-indigo-200 dark:hover:border-indigo-900/50 transition-all"
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
                                    <h3 className="text-lg font-semibold text-zinc-900 dark:text-white mb-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                                        {tool.name}
                                    </h3>
                                    <p className="text-zinc-500 dark:text-zinc-400 text-sm">
                                        {tool.description}
                                    </p>

                                    {/* Arrow */}
                                    <div className="absolute bottom-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <ArrowRight size={20} className="text-indigo-600 dark:text-indigo-400" />
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
                                Pre-built automation for common real estate tasks
                            </p>
                        </div>
                        <button
                            onClick={() => navigate('/studio/workflow')}
                            className="text-sm text-indigo-600 dark:text-indigo-400 font-medium hover:underline flex items-center gap-1"
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
                                        <Home size={20} className="text-indigo-600 dark:text-indigo-400" />
                                    </div>
                                    <div className="flex gap-2">
                                        <span className="px-2 py-1 bg-white dark:bg-zinc-800 rounded-full text-xs text-zinc-600 dark:text-zinc-400">
                                            {workflow.steps} steps
                                        </span>
                                        <span className="px-2 py-1 bg-indigo-100 dark:bg-indigo-950 rounded-full text-xs text-indigo-600 dark:text-indigo-400 font-medium">
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
