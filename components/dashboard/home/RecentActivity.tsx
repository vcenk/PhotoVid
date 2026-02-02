import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAssets } from '../../../lib/store/contexts/AssetContext';
import {
  Play,
  ArrowRight,
  Clock,
  Sparkles,
} from 'lucide-react';

export const RecentActivity: React.FC = () => {
  const navigate = useNavigate();
  const { assets, loading } = useAssets();

  const recentAssets = assets.slice(0, 6);

  if (loading && assets.length === 0) {
    return (
      <div className="animate-pulse">
        <div className="h-5 bg-zinc-200 dark:bg-zinc-800 rounded w-36 mb-3" />
        <div className="flex gap-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="w-20 h-20 bg-zinc-200 dark:bg-zinc-800 rounded-lg flex-shrink-0" />
          ))}
        </div>
      </div>
    );
  }

  if (recentAssets.length === 0) {
    return (
      <div className="flex items-center gap-3 py-4 px-5 bg-zinc-50 dark:bg-zinc-900/50 rounded-xl border border-zinc-200 dark:border-zinc-800">
        <Sparkles size={18} className="text-indigo-500 flex-shrink-0" />
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          No recent work yet — start creating!
        </p>
        <button
          onClick={() => navigate('/studio/apps')}
          className="ml-auto text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 flex items-center gap-1 whitespace-nowrap"
        >
          Explore Tools <ArrowRight size={14} />
        </button>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 flex items-center gap-2">
          <Clock size={14} className="text-zinc-400" />
          Recent Work
        </h2>
        <button
          onClick={() => navigate('/studio/library')}
          className="text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 flex items-center gap-1"
        >
          View All <ArrowRight size={12} />
        </button>
      </div>

      {/* Horizontal thumbnails */}
      <div className="flex gap-3 overflow-x-auto pb-1 scrollbar-hide">
        {recentAssets.map((asset) => (
          <div
            key={asset.id}
            onClick={() => window.open(asset.url, '_blank')}
            className="w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden bg-zinc-100 dark:bg-zinc-800 cursor-pointer group relative"
          >
            {asset.type === 'image' ? (
              <img
                src={asset.url}
                alt={asset.name}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
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
                <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                  <div className="w-6 h-6 rounded-full bg-white/80 flex items-center justify-center">
                    <Play size={10} className="text-zinc-900 ml-0.5" />
                  </div>
                </div>
              </>
            )}
            {/* Type indicator dot */}
            <div className={`absolute top-1 left-1 w-2 h-2 rounded-full ${
              asset.type === 'image' ? 'bg-blue-500' : 'bg-purple-500'
            }`} />
          </div>
        ))}
      </div>

      <style>{`
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
};
