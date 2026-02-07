import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Home,
  LayoutGrid,
  Image as ImageIcon,
  Video,
  Wand2,
  Languages,
  Workflow,
  FolderOpen,
  Building2,
  Moon,
  Sun,
  LogOut,
  Settings,
  ChevronDown,
  Shield,
  Sparkles,
  Zap,
  X,
  FileText,
  Film,
  Clapperboard,
} from 'lucide-react';
import { cn } from '../../../lib/utils';
import { useTheme } from '../../common/ThemeProvider';
import { createClient } from '../../../lib/database/client';
import { useCredits } from '@/lib/store/contexts/CreditsContext';

interface NavItem {
  id: string;
  label: string;
  icon: React.ElementType;
  path?: string;
  children?: NavItem[];
}

interface NavigationRailProps {
  isMobileOpen: boolean;
  onMobileClose: () => void;
}

export function NavigationRail({ isMobileOpen, onMobileClose }: NavigationRailProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();
  const supabase = createClient();
  const { balance, isAdmin } = useCredits();
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeSubmenu, setActiveSubmenu] = useState<string | null>(null);
  const railRef = useRef<HTMLDivElement>(null);

  // Close mobile drawer on route change
  useEffect(() => {
    onMobileClose();
  }, [location.pathname]);

  const handleSignOut = async () => {
    if (supabase) {
      await supabase.auth.signOut();
    }
    navigate('/');
  };

  const navItems: NavItem[] = [
    { id: 'home', label: 'Home', icon: Home, path: '/studio' },
    { id: 'apps', label: 'Real Estate', icon: Building2, path: '/studio/real-estate' },
    {
      id: 'create',
      label: 'Create',
      icon: Sparkles,
      children: [
        { id: 'image', label: 'Image', icon: ImageIcon, path: '/studio/image' },
        { id: 'video', label: 'Video', icon: Video, path: '/studio/video' },
        { id: 'edit', label: 'Edit', icon: Wand2, path: '/studio/edit' },
        { id: 'dubbing', label: 'Dubbing', icon: Languages, path: '/studio/dubbing' },
        { id: 'listing', label: 'Listing', icon: FileText, path: '/studio/listing' },
        { id: 'video-editor', label: 'Video Editor', icon: Film, path: '/studio/real-estate/video-builder' },
        { id: 'quick-video', label: 'Quick Video', icon: Clapperboard, path: '/studio/real-estate/quick-video' },
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
    } else if (item.path) {
      navigate(item.path);
      setActiveSubmenu(null);
    }
  };

  const isItemActive = (item: NavItem): boolean => {
    if (item.path) return location.pathname === item.path;
    if (item.children) {
      return item.children.some(child => child.path === location.pathname);
    }
    return false;
  };

  const expanded = isExpanded || isMobileOpen;

  // Sidebar content (shared between desktop rail and mobile drawer)
  const sidebarContent = (
    <div className="flex-1 flex flex-col h-full">
      {/* Logo */}
      <div className="h-14 flex items-center gap-2.5 px-4 border-b border-zinc-200 dark:border-white/5 shrink-0">
        <button
          onClick={() => {
            navigate('/studio');
            setActiveSubmenu(null);
          }}
          className="flex items-center gap-2.5 hover:opacity-80 transition-opacity min-w-0"
        >
          <img
            src="/logo.png"
            alt="Photovid"
            className="h-8 w-auto object-contain"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
          <span
            className={cn(
              'text-sm font-semibold tracking-wide text-zinc-900 dark:text-white whitespace-nowrap transition-opacity duration-200',
              expanded ? 'opacity-100' : 'opacity-0 w-0 overflow-hidden'
            )}
          >
            PHOTOVID
          </span>
        </button>

        {/* Mobile close button */}
        {isMobileOpen && (
          <button
            onClick={onMobileClose}
            className="ml-auto p-1.5 rounded-lg text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-white/5 transition-colors lg:hidden"
          >
            <X size={20} />
          </button>
        )}
      </div>

      {/* Navigation */}
      <div className="flex-1 flex flex-col py-3 px-3 overflow-x-hidden overflow-y-auto scrollbar-none bg-white dark:bg-transparent">
        {/* Main Nav Items */}
        <div className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isItemActive(item);
            const hasChildren = !!item.children;
            const isOpen = activeSubmenu === item.id;

            return (
              <div key={item.id}>
                {/* Nav button */}
                <button
                  onClick={() => handleItemClick(item)}
                  className={cn(
                    'w-full flex items-center gap-3 rounded-xl text-sm font-medium transition-all duration-200 relative group',
                    expanded ? 'px-3 py-2.5 justify-between' : 'px-0 py-2.5 justify-center',
                    active
                      ? 'bg-emerald-100 dark:bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                      : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-white/5',
                    isOpen && 'bg-zinc-100 dark:bg-white/5 text-zinc-900 dark:text-white'
                  )}
                >
                  <div className={cn('flex items-center gap-3', !expanded && 'justify-center w-full')}>
                    <Icon size={20} strokeWidth={1.75} className="shrink-0" />
                    <span
                      className={cn(
                        'whitespace-nowrap transition-opacity duration-200',
                        expanded ? 'opacity-100' : 'opacity-0 w-0 overflow-hidden'
                      )}
                    >
                      {item.label}
                    </span>
                  </div>
                  {hasChildren && expanded && (
                    <ChevronDown
                      size={16}
                      className={cn(
                        'text-zinc-400 dark:text-zinc-500 transition-transform duration-200 shrink-0',
                        isOpen && 'rotate-180 text-zinc-600 dark:text-zinc-300'
                      )}
                    />
                  )}
                  {/* Dot indicator for collapsed items with children */}
                  {hasChildren && !expanded && (
                    <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-zinc-400 dark:bg-zinc-500" />
                  )}
                  {/* Tooltip for collapsed state */}
                  {!expanded && (
                    <span className="absolute left-full ml-2 px-2 py-1 rounded-md bg-zinc-900 dark:bg-zinc-800 text-white text-xs font-medium whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-150 z-[60]">
                      {item.label}
                    </span>
                  )}
                </button>

                {/* Accordion submenu */}
                <AnimatePresence initial={false}>
                  {hasChildren && isOpen && expanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2, ease: 'easeInOut' }}
                      className="overflow-hidden"
                    >
                      <div className="py-1 space-y-0.5">
                        {item.children!.map((child) => {
                          const ChildIcon = child.icon;
                          const childActive = child.path === location.pathname;

                          return (
                            <button
                              key={child.id}
                              onClick={() => {
                                if (child.path) navigate(child.path);
                                setActiveSubmenu(null);
                              }}
                              className={cn(
                                'w-full flex items-center gap-3 pl-10 pr-3 py-2 rounded-lg text-sm font-medium transition-all duration-150',
                                childActive
                                  ? 'bg-emerald-100 dark:bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                                  : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-white/5'
                              )}
                            >
                              <ChildIcon size={18} strokeWidth={1.75} />
                              <span>{child.label}</span>
                            </button>
                          );
                        })}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>

        {/* Spacer */}
        <div className="flex-1 min-h-8" />

        {/* Bottom Section */}
        <div className="space-y-1 pt-3 border-t border-zinc-200 dark:border-white/5">
          {/* Admin */}
          {isAdmin && (
            <button
              onClick={() => navigate('/studio/admin')}
              className={cn(
                'w-full flex items-center gap-3 rounded-xl text-sm font-medium text-amber-600 dark:text-amber-400/80 hover:text-amber-700 dark:hover:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-500/10 transition-all duration-200 relative group',
                expanded ? 'px-3 py-2.5' : 'px-0 py-2.5 justify-center'
              )}
            >
              <Shield size={20} strokeWidth={1.75} className="shrink-0" />
              <span
                className={cn(
                  'whitespace-nowrap transition-opacity duration-200',
                  expanded ? 'opacity-100' : 'opacity-0 w-0 overflow-hidden'
                )}
              >
                Admin
              </span>
              {!expanded && (
                <span className="absolute left-full ml-2 px-2 py-1 rounded-md bg-zinc-900 dark:bg-zinc-800 text-amber-400 text-xs font-medium whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-150 z-[60]">
                  Admin
                </span>
              )}
            </button>
          )}

          {/* Credits */}
          <button
            onClick={() => navigate('/studio/credits')}
            className={cn(
              'w-full flex items-center gap-3 rounded-xl text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-white/5 transition-all duration-200 relative group',
              expanded ? 'px-3 py-2.5 justify-between' : 'px-0 py-2.5 justify-center'
            )}
          >
            <div className={cn('flex items-center gap-3', !expanded && 'justify-center w-full')}>
              <Zap size={20} strokeWidth={1.75} className="text-yellow-500 shrink-0" />
              <span
                className={cn(
                  'whitespace-nowrap transition-opacity duration-200',
                  expanded ? 'opacity-100' : 'opacity-0 w-0 overflow-hidden'
                )}
              >
                Credits
              </span>
            </div>
            {expanded && (
              <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-semibold">
                {balance}
              </span>
            )}
            {!expanded && (
              <span className="absolute left-full ml-2 px-2 py-1 rounded-md bg-zinc-900 dark:bg-zinc-800 text-white text-xs font-medium whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-150 z-[60]">
                Credits: {balance}
              </span>
            )}
          </button>

          {/* Settings */}
          <button
            onClick={() => navigate('/studio/settings')}
            className={cn(
              'w-full flex items-center gap-3 rounded-xl text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-white/5 transition-all duration-200 relative group',
              expanded ? 'px-3 py-2.5' : 'px-0 py-2.5 justify-center'
            )}
          >
            <Settings size={20} strokeWidth={1.75} className="shrink-0" />
            <span
              className={cn(
                'whitespace-nowrap transition-opacity duration-200',
                expanded ? 'opacity-100' : 'opacity-0 w-0 overflow-hidden'
              )}
            >
              Settings
            </span>
            {!expanded && (
              <span className="absolute left-full ml-2 px-2 py-1 rounded-md bg-zinc-900 dark:bg-zinc-800 text-white text-xs font-medium whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-150 z-[60]">
                Settings
              </span>
            )}
          </button>
        </div>

        {/* Footer */}
        <div className={cn(
          'pt-3 mt-3 border-t border-zinc-200 dark:border-white/5',
          expanded ? 'flex items-center justify-between' : 'flex flex-col items-center gap-1'
        )}>
          <button
            onClick={toggleTheme}
            className="p-2.5 rounded-xl text-zinc-500 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-white/5 transition-all relative group"
            title={theme === 'dark' ? 'Light mode' : 'Dark mode'}
          >
            {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
            {!expanded && (
              <span className="absolute left-full ml-2 px-2 py-1 rounded-md bg-zinc-900 dark:bg-zinc-800 text-white text-xs font-medium whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-150 z-[60]">
                {theme === 'dark' ? 'Light mode' : 'Dark mode'}
              </span>
            )}
          </button>
          <button
            onClick={handleSignOut}
            className="p-2.5 rounded-xl text-zinc-500 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all relative group"
            title="Sign Out"
          >
            <LogOut size={20} />
            {!expanded && (
              <span className="absolute left-full ml-2 px-2 py-1 rounded-md bg-zinc-900 dark:bg-zinc-800 text-white text-xs font-medium whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-150 z-[60]">
                Sign Out
              </span>
            )}
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Rail */}
      <div
        ref={railRef}
        onMouseEnter={() => setIsExpanded(true)}
        onMouseLeave={() => {
          setIsExpanded(false);
          if (!isMobileOpen) setActiveSubmenu(null);
        }}
        className={cn(
          'fixed left-0 top-0 bottom-0 bg-white dark:bg-zinc-950 border-r border-zinc-200 dark:border-white/5 flex flex-col z-50 transition-all duration-300 ease-in-out hidden lg:flex font-[Space_Grotesk]',
          isExpanded ? 'w-56' : 'w-16'
        )}
      >
        {sidebarContent}
      </div>

      {/* Mobile Drawer Backdrop */}
      <AnimatePresence>
        {isMobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 lg:hidden"
            onClick={onMobileClose}
          />
        )}
      </AnimatePresence>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {isMobileOpen && (
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="fixed left-0 top-0 bottom-0 w-56 bg-white dark:bg-zinc-950 border-r border-zinc-200 dark:border-white/5 flex flex-col z-[51] lg:hidden font-[Space_Grotesk]"
          >
            {sidebarContent}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
