import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, Copy, Download, ChevronDown, Sparkles, X } from 'lucide-react';
import { cn } from '../../../lib/utils';
import { useDashboardStore, AssetType } from '../../../lib/store/dashboard';

type AssetFilter = 'all' | 'image' | 'video';

export function RecentCreations() {
  const navigate = useNavigate();
  const { recentGenerations } = useDashboardStore();
  const [activeTab, setActiveTab] = useState<AssetFilter>('all');
  const [selectedTeam, setSelectedTeam] = useState('personal');
  const [previewAsset, setPreviewAsset] = useState<typeof recentGenerations[0] | null>(null);

  const tabs: { value: AssetFilter; label: string }[] = [
    { value: 'all', label: 'All' },
    { value: 'image', label: 'Images' },
    { value: 'video', label: 'Videos' },
  ];

  const filteredAssets =
    activeTab === 'all'
      ? recentGenerations
      : recentGenerations.filter((asset) => asset.type === activeTab);

  const handleCopyPrompt = (prompt: string) => {
    navigator.clipboard.writeText(prompt);
    // TODO: Replace with proper toast notification
    alert('Prompt copied to clipboard!');
  };

  const handleDownload = (id: string) => {
    // TODO: Implement actual download
    alert('Download functionality coming soon!');
  };

  const getRelativeTime = (timestamp: number) => {
    const seconds = Math.floor((Date.now() - timestamp) / 1000);
    if (seconds < 60) return 'Just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  const getIndustryLabel = (industry: string) => {
    switch (industry) {
      case 'real-estate':
        return 'Real Estate';
      case 'hospitality':
        return 'Hospitality';
      case 'retail':
        return 'Retail';
      default:
        return industry;
    }
  };

  return (
    <section className="max-w-7xl mx-auto px-6 py-12">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Your Assets</h2>

        {/* Team Selector (optional mock) */}
        <div className="relative hidden sm:block">
          <select
            value={selectedTeam}
            onChange={(e) => setSelectedTeam(e.target.value)}
            className={cn(
              'appearance-none px-4 py-2 pr-10 bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700',
              'rounded-xl text-sm font-medium cursor-pointer focus:outline-none focus:ring-2 focus:ring-violet-600 transition-all'
            )}
          >
            <option value="personal">Personal</option>
            <option value="marketing">Marketing Team</option>
          </select>
          <ChevronDown
            size={14}
            className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-500"
          />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-8">
        {tabs.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setActiveTab(tab.value)}
            className={cn(
              'px-5 py-2.5 rounded-full text-sm font-medium transition-all',
              activeTab === tab.value
                ? 'bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 shadow-lg'
                : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700'
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Empty State */}
      {filteredAssets.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-16 h-16 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center mb-4">
            <Sparkles size={28} className="text-zinc-400" />
          </div>
          <h3 className="text-xl font-bold mb-2">No assets found.</h3>
          <p className="text-zinc-600 dark:text-zinc-400 mb-6 max-w-md">
            Start a new project to fill your portfolio.
          </p>
          <button
            onClick={() => navigate('/dashboard/studio')}
            className={cn(
              'px-6 py-3 bg-gradient-to-r from-violet-600 to-indigo-600 text-white',
              'rounded-xl text-sm font-bold hover:from-violet-700 hover:to-indigo-700',
              'transition-all shadow-lg shadow-violet-500/30 hover:shadow-violet-500/40'
            )}
          >
            Get Started
          </button>
        </div>
      )}

      {/* Assets Grid */}
      {filteredAssets.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredAssets.map((asset) => (
            <div
              key={asset.id}
              className={cn(
                'bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800',
                'rounded-2xl overflow-hidden hover:border-violet-300 dark:hover:border-violet-700 hover:shadow-lg transition-all group'
              )}
            >
              {/* Thumbnail */}
              <div className="aspect-video bg-zinc-100 dark:bg-zinc-800 relative overflow-hidden">
                {asset.thumbnailUrl ? (
                  <img
                    src={asset.thumbnailUrl}
                    alt={asset.prompt}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="text-zinc-400 text-sm font-medium">
                      {asset.type === 'image' ? 'Image' : 'Video'}
                    </div>
                  </div>
                )}
                {/* Type badge overlay */}
                <div className="absolute top-2 right-2">
                  <span
                    className={cn(
                      'px-2.5 py-1 rounded-full text-xs font-medium uppercase backdrop-blur-sm',
                      asset.type === 'image'
                        ? 'bg-blue-100/90 text-blue-700 dark:bg-blue-950/90 dark:text-blue-400'
                        : 'bg-purple-100/90 text-purple-700 dark:bg-purple-950/90 dark:text-purple-400'
                    )}
                  >
                    {asset.type}
                  </span>
                </div>
              </div>

              {/* Content */}
              <div className="p-4">
                {/* Prompt snippet */}
                <p className="text-sm text-zinc-700 dark:text-zinc-300 mb-3 line-clamp-2 min-h-[2.5rem]">
                  {asset.prompt}
                </p>

                {/* Meta info */}
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-xs text-zinc-500 dark:text-zinc-400">
                    {getRelativeTime(asset.createdAt)}
                  </span>
                  <span className="text-zinc-300 dark:text-zinc-700">•</span>
                  <span className="px-2 py-0.5 bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-400 rounded text-xs font-medium">
                    {getIndustryLabel(asset.industry)}
                  </span>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPreviewAsset(asset)}
                    className={cn(
                      'flex-1 flex items-center justify-center gap-2 px-3 py-2',
                      'bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700',
                      'rounded-lg text-xs font-medium transition-colors'
                    )}
                    title="View"
                  >
                    <Eye size={14} />
                    <span>View</span>
                  </button>
                  <button
                    onClick={() => handleCopyPrompt(asset.prompt)}
                    className={cn(
                      'p-2 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700',
                      'rounded-lg transition-colors'
                    )}
                    title="Copy prompt"
                  >
                    <Copy size={14} />
                  </button>
                  <button
                    onClick={() => handleDownload(asset.id)}
                    className={cn(
                      'p-2 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700',
                      'rounded-lg transition-colors'
                    )}
                    title="Download"
                  >
                    <Download size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Preview Modal */}
      {previewAsset && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          onClick={() => setPreviewAsset(null)}
        >
          <div
            className="relative max-w-4xl w-full bg-white dark:bg-zinc-900 rounded-3xl overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              onClick={() => setPreviewAsset(null)}
              className="absolute top-4 right-4 z-10 p-2 bg-black/50 hover:bg-black/70 rounded-full transition-colors"
            >
              <X size={20} className="text-white" />
            </button>

            {/* Preview content */}
            <div className="aspect-video bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
              {previewAsset.thumbnailUrl ? (
                <img
                  src={previewAsset.thumbnailUrl}
                  alt={previewAsset.prompt}
                  className="w-full h-full object-contain"
                />
              ) : (
                <div className="text-zinc-400 text-lg font-medium">
                  {previewAsset.type === 'image' ? 'Image Preview' : 'Video Preview'}
                </div>
              )}
            </div>

            {/* Preview info */}
            <div className="p-6 border-t border-zinc-200 dark:border-zinc-800">
              <p className="text-sm text-zinc-700 dark:text-zinc-300 mb-3">
                {previewAsset.prompt}
              </p>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-xs text-zinc-500 dark:text-zinc-400">
                    {getRelativeTime(previewAsset.createdAt)}
                  </span>
                  <span
                    className={cn(
                      'px-2.5 py-1 rounded-full text-xs font-medium uppercase',
                      previewAsset.type === 'image'
                        ? 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400'
                        : 'bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-400'
                    )}
                  >
                    {previewAsset.type}
                  </span>
                  <span className="px-2.5 py-1 bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-400 rounded-full text-xs font-medium">
                    {getIndustryLabel(previewAsset.industry)}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleCopyPrompt(previewAsset.prompt)}
                    className={cn(
                      'flex items-center gap-2 px-4 py-2 bg-zinc-100 dark:bg-zinc-800',
                      'hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-lg text-sm font-medium transition-colors'
                    )}
                  >
                    <Copy size={14} />
                    <span>Copy</span>
                  </button>
                  <button
                    onClick={() => handleDownload(previewAsset.id)}
                    className={cn(
                      'flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-violet-600 to-indigo-600',
                      'text-white hover:from-violet-700 hover:to-indigo-700 rounded-lg text-sm font-bold transition-all'
                    )}
                  >
                    <Download size={14} />
                    <span>Download</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
