import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Crown, LayoutGrid } from 'lucide-react';
import type { IndustryTool } from '../../lib/data/industries';

interface IndustryToolCardProps {
    tool: IndustryTool;
    accentColor: string;
    onClick?: () => void;
}

export const IndustryToolCard: React.FC<IndustryToolCardProps> = ({ tool, accentColor, onClick }) => {
    const navigate = useNavigate();

    const handleClick = () => {
        if (onClick) {
            onClick();
        } else if (tool.route) {
            navigate(tool.route);
        } else {
            navigate('/studio/image');
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -4 }}
            onClick={handleClick}
            className="group relative bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden cursor-pointer hover:shadow-xl transition-all"
        >
            {/* Image */}
            <div className="relative h-36 overflow-hidden">
                <img
                    src={tool.image}
                    alt={tool.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                {/* Premium Badge */}
                {tool.isPremium && (
                    <div className="absolute top-3 right-3">
                        <span className="px-2 py-1 bg-gradient-to-r from-amber-400 to-yellow-500 text-black text-[10px] font-bold uppercase rounded-full flex items-center gap-1">
                            <Crown size={10} />
                            Pro
                        </span>
                    </div>
                )}

                {/* Title on image */}
                <div className="absolute bottom-3 left-3 right-3">
                    <h3 className="text-base font-bold text-white">
                        {tool.name}
                    </h3>
                </div>
            </div>

            {/* Content */}
            <div className="p-4">
                <p className="text-zinc-500 dark:text-zinc-400 text-sm line-clamp-2">
                    {tool.description}
                </p>
            </div>

            {/* Arrow */}
            <div className={`absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity ${accentColor === 'red' ? 'text-red-600 dark:text-red-400' : 'text-indigo-600 dark:text-indigo-400'}`}>
                <ArrowRight size={20} />
            </div>
        </motion.div>
    );
};

interface ToolsGridProps {
    tools: IndustryTool[];
    accentColor: string;
    title?: string;
    subtitle?: string;
}

export const ToolsGrid: React.FC<ToolsGridProps> = ({
    tools,
    accentColor,
    title = 'All Tools',
    subtitle = 'Everything you need to create stunning visuals',
}) => {
    return (
        <div className="max-w-7xl mx-auto px-6 py-8">
            <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
                    <LayoutGrid size={20} className="text-white" />
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

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {tools.map((tool, index) => (
                    <motion.div
                        key={tool.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                    >
                        <IndustryToolCard tool={tool} accentColor={accentColor} />
                    </motion.div>
                ))}
            </div>
        </div>
    );
};
