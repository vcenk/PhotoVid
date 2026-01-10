import React, { useState } from 'react';
import { Bell, Crown, Users, User, Settings, LogOut, Menu } from 'lucide-react';
import { cn } from '../../lib/utils';

interface DashboardTopbarProps {
  onMenuClick?: () => void;
}

export function DashboardTopbar({ onMenuClick }: DashboardTopbarProps) {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  return (
    <header className="sticky top-0 z-10 h-16 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between px-8 shrink-0">
      {/* Left Spacer */}
      <div />

      {/* Right actions */}
      <div className="flex items-center gap-3">
        {/* Upgrade to Pro */}
        <button className="hidden sm:flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-xl text-sm font-bold hover:from-violet-700 hover:to-indigo-700 transition-all shadow-lg shadow-violet-500/20">
          <Crown size={16} />
          <span>Upgrade to Pro</span>
        </button>

        {/* Invite Team */}
        <button className="hidden sm:flex items-center gap-2 px-4 py-2 border border-zinc-200 dark:border-zinc-800 rounded-xl text-sm font-medium hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors">
          <Users size={16} />
          <span>Invite Team</span>
        </button>

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2.5 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors relative"
            aria-label="Notifications"
          >
            <Bell size={20} />
            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full" />
          </button>

          {showNotifications && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setShowNotifications(false)}
              />
              <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-xl z-20 p-4">
                <h3 className="font-semibold text-sm mb-3">Notifications</h3>
                <div className="space-y-3">
                  <div className="text-sm text-zinc-600 dark:text-zinc-400 py-8 text-center">
                    No new notifications
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* User menu */}
        <div className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2 p-1 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors"
            aria-label="User menu"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center">
              <User size={16} className="text-white" />
            </div>
          </button>

          {showUserMenu && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setShowUserMenu(false)}
              />
              <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-xl z-20 py-2">
                <div className="px-4 py-3 border-b border-zinc-200 dark:border-zinc-800">
                  <p className="text-sm font-medium">John Doe</p>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">john@photovid.com</p>
                </div>

                <button className="w-full flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors text-left">
                  <User size={16} />
                  <span>Profile</span>
                </button>

                <button className="w-full flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors text-left">
                  <Settings size={16} />
                  <span>Settings</span>
                </button>

                <div className="border-t border-zinc-200 dark:border-zinc-800 mt-2 pt-2">
                  <button className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors text-left">
                    <LogOut size={16} />
                    <span>Sign out</span>
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
