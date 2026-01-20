import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAssets } from '../../../lib/store/contexts/AssetContext';
import { useCredits } from '../../../lib/store/contexts/CreditsContext';
import {
  Image as ImageIcon,
  Video,
  Coins,
  TrendingUp,
  FolderOpen,
  Sparkles,
} from 'lucide-react';

export const DashboardStats: React.FC = () => {
  const navigate = useNavigate();
  const { assets } = useAssets();
  const { credits, loading: creditsLoading } = useCredits();

  const stats = {
    totalAssets: assets.length,
    images: assets.filter((a) => a.type === 'image').length,
    videos: assets.filter((a) => a.type === 'video').length,
    credits: credits,
  };

  const statCards = [
    {
      label: 'Total Assets',
      value: stats.totalAssets,
      icon: FolderOpen,
      color: 'bg-indigo-500',
      lightColor: 'bg-indigo-100 dark:bg-indigo-900/30',
      textColor: 'text-indigo-600 dark:text-indigo-400',
      onClick: () => navigate('/studio/library'),
    },
    {
      label: 'Images',
      value: stats.images,
      icon: ImageIcon,
      color: 'bg-blue-500',
      lightColor: 'bg-blue-100 dark:bg-blue-900/30',
      textColor: 'text-blue-600 dark:text-blue-400',
      onClick: () => navigate('/studio/library'),
    },
    {
      label: 'Videos',
      value: stats.videos,
      icon: Video,
      color: 'bg-purple-500',
      lightColor: 'bg-purple-100 dark:bg-purple-900/30',
      textColor: 'text-purple-600 dark:text-purple-400',
      onClick: () => navigate('/studio/library'),
    },
    {
      label: 'Credits',
      value: creditsLoading ? '...' : stats.credits,
      icon: Coins,
      color: 'bg-amber-500',
      lightColor: 'bg-amber-100 dark:bg-amber-900/30',
      textColor: 'text-amber-600 dark:text-amber-400',
      onClick: () => navigate('/studio/credits'),
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {statCards.map((stat) => {
        const Icon = stat.icon;
        return (
          <button
            key={stat.label}
            onClick={stat.onClick}
            className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-4 text-left hover:border-indigo-500 dark:hover:border-indigo-500 transition-all hover:shadow-md group"
          >
            <div className="flex items-center justify-between mb-3">
              <div className={`w-10 h-10 rounded-xl ${stat.lightColor} flex items-center justify-center`}>
                <Icon size={20} className={stat.textColor} />
              </div>
              <TrendingUp
                size={16}
                className="text-zinc-300 dark:text-zinc-600 group-hover:text-green-500 transition-colors"
              />
            </div>
            <p className="text-2xl font-bold text-zinc-900 dark:text-white">{stat.value}</p>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">{stat.label}</p>
          </button>
        );
      })}
    </div>
  );
};
