import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Home,
  LayoutGrid,
  Image as ImageIcon,
  Video,
  Wand2,
  Mic2,
  Workflow,
  Moon,
  Sun,
  HelpCircle,
  MoreHorizontal,
} from 'lucide-react';
import { cn } from '../../../lib/utils';
import { useTheme } from '../../common/ThemeProvider';

export type FlyoutType = 'image' | 'video' | 'edit' | null;

interface NavItem {
  id: string;
  label: string;
  icon: any;
  path?: string;
  flyout?: FlyoutType;
  action?: () => void;
}

interface NavigationRailProps {
  activeFlyout: FlyoutType;
  onFlyoutChange: (flyout: FlyoutType) => void;
}

export function NavigationRail({ activeFlyout, onFlyoutChange }: NavigationRailProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();
  const [showMoreMenu, setShowMoreMenu] = useState(false);

  const mainItems: NavItem[] = [
    {
      id: 'home',
      label: 'Home',
      icon: Home,
      path: '/studio',
    },
    {
      id: 'apps',
      label: 'Apps',
      icon: LayoutGrid,
      path: '/studio/apps',
    },
    {
      id: 'image',
      label: 'Image',
      icon: ImageIcon,
      path: '/studio/image',
    },
    {
      id: 'video',
      label: 'Video',
      icon: Video,
      flyout: 'video',
    },
    {
      id: 'edit',
      label: 'Edit',
      icon: Wand2,
      flyout: 'edit',
    },
    {
      id: 'lipsync',
      label: 'Lipsync',
      icon: Mic2,
      path: '/studio/lipsync',
    },
    {
      id: 'workflow',
      label: 'Workflow',
      icon: Workflow,
      path: '/studio/workflow',
    },
  ];

  const utilityItems: NavItem[] = [
    {
      id: 'theme',
      label: 'Theme',
      icon: theme === 'dark' ? Sun : Moon,
      action: toggleTheme,
    },
    {
      id: 'help',
      label: 'Help',
      icon: HelpCircle,
      path: '/studio/help',
    },
    {
      id: 'more',
      label: 'More',
      icon: MoreHorizontal,
      action: () => setShowMoreMenu(!showMoreMenu),
    },
  ];

  const handleItemClick = (item: NavItem) => {
    if (item.flyout) {
      // Toggle flyout
      onFlyoutChange(activeFlyout === item.flyout ? null : item.flyout);
    } else if (item.action) {
      item.action();
    } else if (item.path) {
      navigate(item.path);
      onFlyoutChange(null); // Close flyouts when navigating
    }
  };

  const isItemActive = (item: NavItem) => {
    if (item.flyout) {
      return activeFlyout === item.flyout;
    }
    if (item.path) {
      return location.pathname === item.path;
    }
    return false;
  };

  return (
    <>
      <div className="fixed left-0 top-0 bottom-0 w-[72px] bg-white dark:bg-zinc-950 border-r border-zinc-200 dark:border-zinc-800 flex flex-col justify-between z-50">
        {/* Top Section: Logo + Main Nav */}
        <div className="flex flex-col items-center">
          {/* Logo */}
          <div className="w-full flex items-center justify-center py-4 border-b border-zinc-200 dark:border-zinc-800">
            <button
              onClick={() => {
                navigate('/studio');
                onFlyoutChange(null);
              }}
              className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center hover:scale-105 transition-transform"
            >
              <span className="text-white font-bold text-sm">PV</span>
            </button>
          </div>

          {/* Main Navigation Items */}
          <nav className="w-full py-4 px-2 space-y-1">
            {mainItems.map((item) => {
              const Icon = item.icon;
              const active = isItemActive(item);

              return (
                <button
                  key={item.id}
                  onClick={() => handleItemClick(item)}
                  className={cn(
                    'w-full flex flex-col items-center gap-1 py-2.5 group relative',
                    'transition-all duration-200'
                  )}
                >
                  {/* Icon Container with Squircle Background */}
                  <div
                    className={cn(
                      'w-10 h-10 rounded-2xl flex items-center justify-center transition-all duration-200',
                      active
                        ? 'bg-indigo-100 dark:bg-indigo-950/50'
                        : 'group-hover:bg-zinc-100 dark:group-hover:bg-zinc-800'
                    )}
                  >
                    <Icon
                      size={24}
                      className={cn(
                        'transition-colors',
                        active
                          ? 'text-indigo-600 dark:text-indigo-400'
                          : 'text-zinc-600 dark:text-zinc-400 group-hover:text-zinc-900 dark:group-hover:text-zinc-100'
                      )}
                      strokeWidth={2}
                    />
                  </div>

                  {/* Text Label */}
                  <span
                    className={cn(
                      'text-[10px] font-medium transition-colors',
                      active
                        ? 'text-indigo-600 dark:text-indigo-400'
                        : 'text-zinc-600 dark:text-zinc-400 group-hover:text-zinc-900 dark:group-hover:text-zinc-100'
                    )}
                  >
                    {item.label}
                  </span>

                  {/* Active Indicator */}
                  {active && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-indigo-600 dark:bg-indigo-400 rounded-r-full" />
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom Section: Utility Items */}
        <div className="flex flex-col items-center w-full py-4 px-2 space-y-1 border-t border-zinc-200 dark:border-zinc-800">
          {utilityItems.map((item) => {
            const Icon = item.icon;
            const active = isItemActive(item);

            return (
              <button
                key={item.id}
                onClick={() => handleItemClick(item)}
                className={cn(
                  'w-full flex flex-col items-center gap-1 py-2.5 group relative',
                  'transition-all duration-200'
                )}
              >
                {/* Icon Container */}
                <div
                  className={cn(
                    'w-10 h-10 rounded-2xl flex items-center justify-center transition-all duration-200',
                    active
                      ? 'bg-indigo-100 dark:bg-indigo-950/50'
                      : 'group-hover:bg-zinc-100 dark:group-hover:bg-zinc-800'
                  )}
                >
                  <Icon
                    size={24}
                    className={cn(
                      'transition-colors',
                      active
                        ? 'text-indigo-600 dark:text-indigo-400'
                        : 'text-zinc-600 dark:text-zinc-400 group-hover:text-zinc-900 dark:group-hover:text-zinc-100'
                    )}
                    strokeWidth={2}
                  />
                </div>

                {/* Text Label */}
                <span
                  className={cn(
                    'text-[10px] font-medium transition-colors',
                    active
                      ? 'text-indigo-600 dark:text-indigo-400'
                      : 'text-zinc-600 dark:text-zinc-400 group-hover:text-zinc-900 dark:group-hover:text-zinc-100'
                  )}
                >
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* More Menu Popup */}
      {showMoreMenu && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setShowMoreMenu(false)}
          />
          <div className="fixed left-[72px] bottom-4 z-50 w-56 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-xl py-2">
            <button className="w-full flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors text-left text-zinc-700 dark:text-zinc-300">
              Settings
            </button>
            <button className="w-full flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors text-left text-zinc-700 dark:text-zinc-300">
              Keyboard Shortcuts
            </button>
            <button className="w-full flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors text-left text-zinc-700 dark:text-zinc-300">
              API Documentation
            </button>
            <div className="border-t border-zinc-200 dark:border-zinc-800 my-2" />
            <button className="w-full flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors text-left text-red-600">
              Sign Out
            </button>
          </div>
        </>
      )}

      <style>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </>
  );
}
