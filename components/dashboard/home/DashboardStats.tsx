import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAssets } from '../../../lib/store/contexts/AssetContext';
import { useCredits } from '../../../lib/store/contexts/CreditsContext';
import {
  Image as ImageIcon,
  Video,
  Coins,
  FolderOpen,
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

  const pills = [
    {
      label: 'Assets',
      value: stats.totalAssets,
      icon: FolderOpen,
      iconColor: 'text-teal-400',
      onClick: () => navigate('/studio/library'),
    },
    {
      label: 'Images',
      value: stats.images,
      icon: ImageIcon,
      iconColor: 'text-blue-400',
      onClick: () => navigate('/studio/library'),
    },
    {
      label: 'Videos',
      value: stats.videos,
      icon: Video,
      iconColor: 'text-teal-400',
      onClick: () => navigate('/studio/library'),
    },
    {
      label: 'Credits',
      value: creditsLoading ? '...' : stats.credits,
      icon: Coins,
      iconColor: 'text-amber-400',
      onClick: () => navigate('/studio/credits'),
    },
  ];

  return (
    <div className="flex flex-wrap gap-3">
      {pills.map((pill) => {
        const Icon = pill.icon;
        return (
          <button
            key={pill.label}
            onClick={pill.onClick}
            className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:border-teal-500 dark:hover:border-teal-500 transition-all text-left group"
          >
            <Icon size={16} className={pill.iconColor} />
            <span className="text-sm font-bold text-zinc-900 dark:text-white">{pill.value}</span>
            <span className="text-xs text-zinc-500 dark:text-zinc-400">{pill.label}</span>
          </button>
        );
      })}
    </div>
  );
};
