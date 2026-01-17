import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { IndustryPageLayout } from './IndustryPageLayout';
import { IndustryHero } from './IndustryHero';
import { FeaturedToolsCarousel } from './FeaturedToolsCarousel';
import { ToolsGrid } from './ToolsGrid';
import { WorkflowsSection } from './WorkflowsSection';
import { getIndustryConfig } from '../../lib/data/industries';

interface IndustryPageProps {
    industryId?: string; // Can be passed as prop or from route params
}

export const IndustryPage: React.FC<IndustryPageProps> = ({ industryId: propIndustryId }) => {
    const navigate = useNavigate();
    const params = useParams<{ industryId: string }>();

    // Use prop or route param
    const industryId = propIndustryId || params.industryId;

    // Get industry configuration
    const config = industryId ? getIndustryConfig(industryId) : undefined;

    // 404 state
    if (!config) {
        return (
            <IndustryPageLayout>
                <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-6">
                    <h1 className="text-2xl font-bold text-zinc-900 dark:text-white mb-4">
                        Industry Not Found
                    </h1>
                    <p className="text-zinc-500 dark:text-zinc-400 mb-6">
                        The industry page you're looking for doesn't exist.
                    </p>
                    <button
                        onClick={() => navigate('/studio/apps')}
                        className="px-6 py-3 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 transition-colors"
                    >
                        Back to Apps
                    </button>
                </div>
            </IndustryPageLayout>
        );
    }

    return (
        <IndustryPageLayout>
            {/* Hero Section */}
            <IndustryHero config={config} />

            {/* Featured Tools Carousel */}
            {config.featuredTools.length > 0 && (
                <FeaturedToolsCarousel
                    tools={config.featuredTools}
                    accentColor={config.accentColor}
                    title="Featured Tools"
                    subtitle="Click to expand and learn more"
                />
            )}

            {/* All Tools Grid */}
            {config.tools.length > 0 && (
                <ToolsGrid
                    tools={config.tools}
                    accentColor={config.accentColor}
                    title={`${config.name} Tools`}
                    subtitle="Everything you need to create stunning visuals"
                />
            )}

            {/* Workflows Section */}
            {config.workflows.length > 0 && (
                <WorkflowsSection
                    workflows={config.workflows}
                    accentColor={config.accentColor}
                    industryIcon={config.icon}
                    title="Quick Workflows"
                    subtitle="Pre-built automation for common tasks"
                />
            )}

            {/* Back to Apps */}
            <div className="max-w-7xl mx-auto px-6 pb-12">
                <button
                    onClick={() => navigate('/studio/apps')}
                    className="text-sm text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 flex items-center gap-2"
                >
                    ← Back to All Apps
                </button>
            </div>
        </IndustryPageLayout>
    );
};

// Export a barrel file for easy imports
export { IndustryPageLayout } from './IndustryPageLayout';
export { IndustryHero } from './IndustryHero';
export { FeaturedToolsCarousel } from './FeaturedToolsCarousel';
export { ExpandableToolCard } from './ExpandableToolCard';
export { ToolsGrid, IndustryToolCard } from './ToolsGrid';
export { WorkflowsSection, WorkflowCard } from './WorkflowsSection';
