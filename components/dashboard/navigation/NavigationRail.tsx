import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Home,
  LayoutGrid,
  Image as ImageIcon,
  Video,
  Wand2,
  Mic2,
  Workflow,
  FolderOpen,
  Building2,
  Moon,
  Sun,
  HelpCircle,
  LogOut,
  Settings,
  ChevronRight,
  Shield,
  Sparkles,
  Zap,
} from 'lucide-react';
import { cn } from '../../../lib/utils';
import { useTheme } from '../../common/ThemeProvider';
import { createClient } from '../../../lib/database/client';
import { useCredits } from '@/lib/store/contexts/CreditsContext';

export type FlyoutType = 'image' | 'video' | 'edit' | null;

interface NavItem {
  id: string;
  label: string;
  icon: React.ElementType;
  path?: string;
  children?: NavItem[];
  flyout?: FlyoutType;
}

interface NavigationRailProps {
  activeFlyout: FlyoutType;
  onFlyoutChange: (flyout: FlyoutType) => void;
}

export function NavigationRail({ activeFlyout, onFlyoutChange }: NavigationRailProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();
  const supabase = createClient();
  const { balance, isAdmin } = useCredits();
  const [activeSubmenu, setActiveSubmenu] = useState<string | null>(null);
  const sidebarRef = useRef<HTMLDivElement>(null);

  // Close submenu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (sidebarRef.current && !sidebarRef.current.contains(e.target as Node)) {
        setActiveSubmenu(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSignOut = async () => {
    if (supabase) {
      await supabase.auth.signOut();
    }
    navigate('/');
  };

  // Navigation structure with nested items
  const navItems: NavItem[] = [
    { id: 'home', label: 'Home', icon: Home, path: '/studio' },
    { id: 'apps', label: 'Apps', icon: LayoutGrid, path: '/studio/apps' },
    {
      id: 'create',
      label: 'Create',
      icon: Sparkles,
      children: [
        { id: 'image', label: 'Image', icon: ImageIcon, path: '/studio/image' },
        { id: 'video', label: 'Video', icon: Video, flyout: 'video' },
        { id: 'edit', label: 'Edit', icon: Wand2, flyout: 'edit' },
        { id: 'lipsync', label: 'Lipsync', icon: Mic2, path: '/studio/lipsync' },
      ],
    },
    {
      id: 'manage',
      label: 'Manage',
      icon: FolderOpen,
      children: [
        { id: 'library', label: 'Library', icon: FolderOpen, path: '/studio/library' },
        { id: 'properties', label: 'Properties', icon: Building2, path: '/studio/properties' },
        { id: 'workflow', label: 'Workflow', icon: Workflow, path: '/studio/workflow' },
      ],
    },
  ];

  const handleItemClick = (item: NavItem) => {
    if (item.children) {
      setActiveSubmenu(activeSubmenu === item.id ? null : item.id);
    } else if (item.flyout) {
      onFlyoutChange(activeFlyout === item.flyout ? null : item.flyout);
      setActiveSubmenu(null);
    } else if (item.path) {
      navigate(item.path);
      setActiveSubmenu(null);
      onFlyoutChange(null);
    }
  };

  const isItemActive = (item: NavItem): boolean => {
    if (item.flyout) return activeFlyout === item.flyout;
    if (item.path) return location.pathname === item.path;
    if (item.children) {
      return item.children.some(child =>
        child.path === location.pathname ||
        (child.flyout && activeFlyout === child.flyout)
      );
    }
    return false;
  };

  const isSubmenuItemActive = (item: NavItem): boolean => {
    if (item.flyout) return activeFlyout === item.flyout;
    if (item.path) return location.pathname === item.path;
    return false;
  };

  return (
    <div ref={sidebarRef} className="fixed left-0 top-0 bottom-0 w-56 bg-zinc-950 border-r border-white/5 flex flex-col z-50">
      {/* Main Sidebar Content */}
      <div className="flex-1 flex flex-col">
        {/* Logo */}
        <div className="h-14 flex items-center gap-2.5 px-4 border-b border-white/5">
          <button
            onClick={() => {
              navigate('/studio');
              setActiveSubmenu(null);
              onFlyoutChange(null);
            }}
            className="flex items-center gap-2.5 hover:opacity-80 transition-opacity"
          >
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
              <img
                src="/photovid.svg"
                alt="Photovid"
                className="w-5 h-5 object-contain"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            </div>
            <span className="text-sm font-semibold tracking-wide text-white">PHOTOVID</span>
          </button>
        </div>

        {/* Navigation */}
        <div className="flex-1 flex flex-col py-3 px-3 overflow-y-auto">
          {/* Main Nav Items */}
          <div className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isItemActive(item);
              const hasChildren = !!item.children;
              const isOpen = activeSubmenu === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => handleItemClick(item)}
                  className={cn(
                    'w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200',
                    active
                      ? 'bg-violet-500/15 text-violet-400'
                      : 'text-zinc-400 hover:text-white hover:bg-white/5',
                    isOpen && 'bg-white/5 text-white'
                  )}
                >
                  <div className="flex items-center gap-3">
                    <Icon size={18} strokeWidth={1.75} />
                    <span>{item.label}</span>
                  </div>
                  {hasChildren && (
                    <ChevronRight
                      size={16}
                      className={cn(
                        'text-zinc-500 transition-transform duration-200',
                        isOpen && 'rotate-90 text-zinc-300'
                      )}
                    />
                  )}
                </button>
              );
            })}
          </div>

          {/* Spacer */}
          <div className="flex-1 min-h-8" />

          {/* Bottom Section */}
          <div className="space-y-1 pt-3 border-t border-white/5">
            {/* Admin */}
            {isAdmin && (
              <button
                onClick={() => navigate('/studio/admin')}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-amber-400/80 hover:text-amber-400 hover:bg-amber-500/10 transition-all duration-200"
              >
                <Shield size={18} strokeWidth={1.75} />
                <span>Admin</span>
              </button>
            )}

            {/* Credits */}
            <button
              onClick={() => navigate('/studio/credits')}
              className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium text-zinc-400 hover:text-white hover:bg-white/5 transition-all duration-200"
            >
              <div className="flex items-center gap-3">
                <Zap size={18} strokeWidth={1.75} className="text-yellow-500" />
                <span>Credits</span>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-violet-500/20 text-violet-400 text-xs font-semibold">
                {balance}
              </span>
            </button>

            {/* Settings */}
            <button
              onClick={() => navigate('/studio/settings')}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-zinc-400 hover:text-white hover:bg-white/5 transition-all duration-200"
            >
              <Settings size={18} strokeWidth={1.75} />
              <span>Settings</span>
            </button>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between pt-3 mt-3 border-t border-white/5">
            <button
              onClick={toggleTheme}
              className="p-2.5 rounded-xl text-zinc-500 hover:text-white hover:bg-white/5 transition-all"
              title={theme === 'dark' ? 'Light mode' : 'Dark mode'}
            >
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <button
              onClick={() => navigate('/studio/help')}
              className="p-2.5 rounded-xl text-zinc-500 hover:text-white hover:bg-white/5 transition-all"
              title="Help"
            >
              <HelpCircle size={18} />
            </button>
            <button
              onClick={handleSignOut}
              className="p-2.5 rounded-xl text-zinc-500 hover:text-red-400 hover:bg-red-500/10 transition-all"
              title="Sign Out"
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* Flyout Submenu Popover */}
      <AnimatePresence>
        {activeSubmenu && (
          <motion.div
            initial={{ opacity: 0, x: -8, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: -8, scale: 0.95 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className="absolute left-56 top-0 z-50"
            style={{
              top: (() => {
                const index = navItems.findIndex(item => item.id === activeSubmenu);
                // Logo height (56px) + padding (12px) + items above * item height (44px)
                return 56 + 12 + (index * 44);
              })(),
            }}
          >
            <div className="bg-zinc-900 border border-white/10 rounded-xl shadow-2xl shadow-black/50 overflow-hidden min-w-[180px]">
              {/* Submenu Items */}
              <div className="py-2 px-2">
                {navItems
                  .find(item => item.id === activeSubmenu)
                  ?.children?.map((child, index) => {
                    const Icon = child.icon;
                    const active = isSubmenuItemActive(child);

                    return (
                      <motion.button
                        key={child.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.03 }}
                        onClick={() => handleItemClick(child)}
                        className={cn(
                          'w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150',
                          active
                            ? 'bg-violet-500/15 text-violet-400'
                            : 'text-zinc-400 hover:text-white hover:bg-white/10'
                        )}
                      >
                        <Icon size={16} strokeWidth={1.75} />
                        <span>{child.label}</span>
                      </motion.button>
                    );
                  })}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
