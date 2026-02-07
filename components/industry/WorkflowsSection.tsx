import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Workflow, Zap } from 'lucide-react';
import type { IndustryWorkflow, IndustryConfig } from '../../lib/data/industries';

interface WorkflowCardProps {
    workflow: IndustryWorkflow;
    accentColor: string;
    icon?: React.ComponentType<{ size?: number; className?: string }>;
}

export const WorkflowCard: React.FC<WorkflowCardProps> = ({ workflow, accentColor, icon: CustomIcon }) => {
    const navigate = useNavigate();
    const Icon = CustomIcon || Workflow;

    const accentClasses = {
        indigo: {
            badge: 'bg-teal-100 dark:bg-teal-950 text-teal-600 dark:text-teal-400',
            icon: 'text-teal-600 dark:text-teal-400',
        },
        red: {
            badge: 'bg-red-100 dark:bg-red-950 text-red-600 dark:text-red-400',
            icon: 'text-red-600 dark:text-red-400',
        },
    }[accentColor] || {
        badge: 'bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400',
        icon: 'text-emerald-600 dark:text-emerald-400',
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -4 }}
            onClick={() => navigate('/studio/workflow')}
            className="group bg-gradient-to-br from-zinc-50 to-zinc-100 dark:from-zinc-800 dark:to-zinc-900 rounded-2xl p-6 cursor-pointer hover:shadow-lg transition-all border border-zinc-200 dark:border-zinc-700 min-w-[280px] flex-shrink-0"
        >
            <div className="flex items-start justify-between mb-4">
                <div className="p-3 rounded-xl bg-white dark:bg-zinc-800 shadow-sm">
                    <Icon size={20} className={accentClasses.icon} />
                </div>
                <div className="flex gap-2">
                    <span className="px-2 py-1 bg-white dark:bg-zinc-800 rounded-full text-xs text-zinc-600 dark:text-zinc-400">
                        {workflow.steps} steps
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${accentClasses.badge}`}>
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
    );
};

interface WorkflowsSectionProps {
    workflows: IndustryWorkflow[];
    accentColor: string;
    industryIcon?: React.ComponentType<{ size?: number; className?: string }>;
    title?: string;
    subtitle?: string;
}

export const WorkflowsSection: React.FC<WorkflowsSectionProps> = ({
    workflows,
    accentColor,
    industryIcon,
    title = 'Quick Workflows',
    subtitle = 'Pre-built automation for common tasks',
}) => {
    const navigate = useNavigate();

    const accentClasses = {
        indigo: 'text-teal-600 dark:text-teal-400',
        red: 'text-red-600 dark:text-red-400',
    }[accentColor] || 'text-emerald-600 dark:text-emerald-400';

    return (
        <div className="py-8">
            {/* Section Header */}
            <div className="max-w-7xl mx-auto px-6 mb-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center">
                            <Zap size={20} className="text-white" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-zinc-900 dark:text-white">
                                {title}
                            </h2>
                            <p className="text-sm text-zinc-500 dark:text-zinc-400">
                                {subtitle}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={() => navigate('/studio/workflow')}
                        className={`text-sm font-medium hover:underline flex items-center gap-1 ${accentClasses}`}
                    >
                        View All Workflows <ArrowRight size={16} />
                    </button>
                </div>
            </div>

            {/* Workflow Cards - Horizontal Scroll */}
            <div className="flex gap-5 overflow-x-auto px-6 pb-4 scrollbar-hide">
                {/* Left spacer for alignment */}
                <div className="flex-shrink-0 w-[calc((100vw-1280px)/2-24px)] max-w-0 lg:max-w-none" />

                {workflows.map((workflow, index) => (
                    <motion.div
                        key={workflow.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 + index * 0.05 }}
                    >
                        <WorkflowCard
                            workflow={workflow}
                            accentColor={accentColor}
                            icon={industryIcon}
                        />
                    </motion.div>
                ))}

                {/* Right spacer */}
                <div className="flex-shrink-0 w-6" />
            </div>

            <style>{`
                .scrollbar-hide::-webkit-scrollbar {
                    display: none;
                }
                .scrollbar-hide {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                }
            `}</style>
        </div>
    );
};
