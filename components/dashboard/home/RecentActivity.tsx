import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAssets } from '../../../lib/store/contexts/AssetContext';
import { motion } from 'framer-motion';
import {
  Image as ImageIcon,
  Video,
  Play,
  ArrowRight,
  Clock,
  FolderOpen,
  Sparkles,
  ExternalLink,
} from 'lucide-react';

export const RecentActivity: React.FC = () => {
  const navigate = useNavigate();
  const { assets, loading } = useAssets();

  // Get recent assets (last 8)
  const recentAssets = assets.slice(0, 8);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  };

  if (loading && assets.length === 0) {
    return (
      <div className="animate-pulse">
        <div className="h-6 bg-zinc-200 dark:bg-zinc-800 rounded w-48 mb-4"></div>
        <div className="grid grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="aspect-square bg-zinc-200 dark:bg-zinc-800 rounded-xl"></div>
          ))}
        </div>
      </div>
    );
  }

  if (recentAssets.length === 0) {
    return (
      <div className="bg-gradient-to-br from-zinc-50 to-zinc-100 dark:from-zinc-900 dark:to-zinc-800 rounded-2xl p-8 border border-zinc-200 dark:border-zinc-700">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-indigo-100 dark:bg-indigo-900/30 rounded-2xl flex items-center justify-center">
            <Sparkles size={24} className="text-indigo-600 dark:text-indigo-400" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-zinc-900 dark:text-white">
              Start creating
            </h3>
            <p className="text-zinc-500 dark:text-zinc-400 text-sm">
              Your generated images and videos will appear here
            </p>
          </div>
          <button
            onClick={() => navigate('/studio/apps')}
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl transition-colors flex items-center gap-2"
          >
            Explore Tools
            <ArrowRight size={16} />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-zinc-900 dark:text-white flex items-center gap-2">
          <Clock size={18} className="text-indigo-500" />
          Recent Activity
        </h2>
        <button
          onClick={() => navigate('/studio/library')}
          className="text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 flex items-center gap-1"
        >
          View Library
          <ArrowRight size={14} />
        </button>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-4 gap-4">
        {recentAssets.map((asset, index) => (
          <motion.div
            key={asset.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="group relative bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden hover:border-indigo-500 dark:hover:border-indigo-500 transition-all duration-200 hover:shadow-lg cursor-pointer"
            onClick={() => window.open(asset.url, '_blank')}
          >
            {/* Thumbnail */}
            <div className="aspect-square bg-zinc-100 dark:bg-zinc-800 relative overflow-hidden">
              {asset.type === 'image' ? (
                <img
                  src={asset.url}
                  alt={asset.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              ) : (
                <>
                  <video
                    src={asset.url}
                    className="w-full h-full object-cover"
                    muted
                    onMouseEnter={(e) => e.currentTarget.play()}
                    onMouseLeave={(e) => {
                      e.currentTarget.pause();
                      e.currentTarget.currentTime = 0;
                    }}
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/30 transition-colors">
                    <div className="w-10 h-10 rounded-full bg-white/90 flex items-center justify-center">
                      <Play size={16} className="text-zinc-900 ml-0.5" />
                    </div>
                  </div>
                </>
              )}

              {/* Type Badge */}
              <div className="absolute top-2 left-2">
                <span
                  className={`px-2 py-0.5 text-[10px] font-semibold rounded-md ${
                    asset.type === 'image'
                      ? 'bg-blue-500/90 text-white'
                      : 'bg-purple-500/90 text-white'
                  }`}
                >
                  {asset.type === 'image' ? 'IMG' : 'VID'}
                </span>
              </div>

              {/* Hover Overlay */}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                <ExternalLink size={20} className="text-white" />
              </div>
            </div>

            {/* Info */}
            <div className="p-2.5">
              <p className="text-xs font-medium text-zinc-900 dark:text-white truncate">
                {asset.name || (asset.type === 'image' ? 'Image' : 'Video')}
              </p>
              <p className="text-[10px] text-zinc-500 dark:text-zinc-400 mt-0.5">
                {formatDate(asset.created_at)}
              </p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
