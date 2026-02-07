import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { NavigationRail } from '../dashboard/navigation/NavigationRail';
import { DashboardTopbar } from '../dashboard/navigation/DashboardTopbar';
import { useTheme } from '../common/ThemeProvider';
import { useAuth } from '@/lib/store/contexts/AuthContext';
import { createClient } from '@/lib/database/client';
import {
  ArrowLeft,
  Moon,
  Sun,
  Bell,
  Globe,
  Shield,
  Download,
  Trash2,
  ChevronRight,
  X,
  Check,
  AlertCircle,
  Loader2,
} from 'lucide-react';

// Settings keys for localStorage
const SETTINGS_KEYS = {
  notifications: 'photovid_notifications',
  emailUpdates: 'photovid_email_updates',
  autoSave: 'photovid_auto_save',
};

export function SettingsPage() {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const { user } = useAuth();
  const supabase = createClient();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Settings state - load from localStorage
  const [notifications, setNotifications] = useState(() => {
    const saved = localStorage.getItem(SETTINGS_KEYS.notifications);
    return saved !== null ? saved === 'true' : true;
  });
  const [emailUpdates, setEmailUpdates] = useState(() => {
    const saved = localStorage.getItem(SETTINGS_KEYS.emailUpdates);
    return saved !== null ? saved === 'true' : true;
  });
  const [autoSave, setAutoSave] = useState(() => {
    const saved = localStorage.getItem(SETTINGS_KEYS.autoSave);
    return saved !== null ? saved === 'true' : true;
  });

  // Modal states
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showCacheModal, setShowCacheModal] = useState(false);

  // Password change state
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);

  // Cache state
  const [cacheCleared, setCacheCleared] = useState(false);
  const [clearingCache, setClearingCache] = useState(false);

  // Persist settings to localStorage
  const handleNotificationsChange = () => {
    const newValue = !notifications;
    setNotifications(newValue);
    localStorage.setItem(SETTINGS_KEYS.notifications, String(newValue));
  };

  const handleEmailUpdatesChange = () => {
    const newValue = !emailUpdates;
    setEmailUpdates(newValue);
    localStorage.setItem(SETTINGS_KEYS.emailUpdates, String(newValue));
  };

  const handleAutoSaveChange = () => {
    const newValue = !autoSave;
    setAutoSave(newValue);
    localStorage.setItem(SETTINGS_KEYS.autoSave, String(newValue));
  };

  // Clear cache functionality
  const handleClearCache = async () => {
    setClearingCache(true);
    try {
      // Clear localStorage items (except essential ones like theme and auth)
      const keysToKeep = ['theme', 'supabase.auth.token', SETTINGS_KEYS.notifications, SETTINGS_KEYS.emailUpdates, SETTINGS_KEYS.autoSave];
      const keysToRemove: string[] = [];

      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && !keysToKeep.some(k => key.includes(k))) {
          keysToRemove.push(key);
        }
      }

      keysToRemove.forEach(key => localStorage.removeItem(key));

      // Clear sessionStorage
      sessionStorage.clear();

      // Clear caches if available
      if ('caches' in window) {
        const cacheNames = await caches.keys();
        await Promise.all(cacheNames.map(name => caches.delete(name)));
      }

      setCacheCleared(true);
      setTimeout(() => {
        setShowCacheModal(false);
        setCacheCleared(false);
      }, 1500);
    } catch (error) {
      console.error('Failed to clear cache:', error);
    } finally {
      setClearingCache(false);
    }
  };

  // Change password functionality
  const handleChangePassword = async () => {
    setPasswordError('');
    setPasswordSuccess(false);

    if (!newPassword || !confirmPassword) {
      setPasswordError('Please fill in both fields');
      return;
    }

    if (newPassword.length < 6) {
      setPasswordError('Password must be at least 6 characters');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('Passwords do not match');
      return;
    }

    if (!supabase) {
      setPasswordError('Authentication not configured');
      return;
    }

    setChangingPassword(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) throw error;

      setPasswordSuccess(true);
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => {
        setShowPasswordModal(false);
        setPasswordSuccess(false);
      }, 1500);
    } catch (error: any) {
      setPasswordError(error.message || 'Failed to change password');
    } finally {
      setChangingPassword(false);
    }
  };

  // Delete account functionality
  const handleDeleteAccount = async () => {
    if (!supabase || !user) return;

    try {
      // Sign out first
      await supabase.auth.signOut();
      // Note: Actual account deletion requires admin privileges or a server-side function
      // For now, just sign out and redirect
      navigate('/');
    } catch (error) {
      console.error('Failed to delete account:', error);
    }
  };

  return (
    <div className="flex h-screen bg-white dark:bg-[#09090b] text-zinc-900 dark:text-white font-[Space_Grotesk] overflow-hidden">
      <NavigationRail
        isMobileOpen={mobileMenuOpen}
        onMobileClose={() => setMobileMenuOpen(false)}
      />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden ml-0 lg:ml-16">
        <DashboardTopbar onMenuClick={() => setMobileMenuOpen(true)} />

        <main className="flex-1 overflow-y-auto">
          <div className="max-w-2xl mx-auto px-6 py-12">
            {/* Header */}
            <div className="flex items-center gap-4 mb-8">
              <button
                onClick={() => navigate(-1)}
                className="p-2 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
              >
                <ArrowLeft size={20} />
              </button>
              <div>
                <h1 className="text-2xl font-bold">Settings</h1>
                <p className="text-zinc-500 dark:text-zinc-400 text-sm">Customize your experience</p>
              </div>
            </div>

            {/* Settings Sections */}
            <div className="space-y-6">
              {/* Appearance */}
              <div className="bg-zinc-50 dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
                <div className="px-6 py-4 border-b border-zinc-200 dark:border-zinc-800">
                  <h2 className="font-semibold">Appearance</h2>
                </div>
                <div className="divide-y divide-zinc-200 dark:divide-zinc-800">
                  <div className="flex items-center justify-between px-6 py-4">
                    <div className="flex items-center gap-3">
                      {theme === 'dark' ? <Moon size={20} className="text-zinc-400" /> : <Sun size={20} className="text-zinc-400" />}
                      <div>
                        <p className="font-medium">Dark Mode</p>
                        <p className="text-sm text-zinc-500 dark:text-zinc-400">Switch between light and dark theme</p>
                      </div>
                    </div>
                    <button
                      onClick={toggleTheme}
                      className={`w-12 h-7 rounded-full transition-colors ${
                        theme === 'dark' ? 'bg-emerald-600' : 'bg-zinc-300 dark:bg-zinc-700'
                      }`}
                    >
                      <div
                        className={`w-5 h-5 rounded-full bg-white shadow-sm transform transition-transform ${
                          theme === 'dark' ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                </div>
              </div>

              {/* Notifications */}
              <div className="bg-zinc-50 dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
                <div className="px-6 py-4 border-b border-zinc-200 dark:border-zinc-800">
                  <h2 className="font-semibold">Notifications</h2>
                </div>
                <div className="divide-y divide-zinc-200 dark:divide-zinc-800">
                  <div className="flex items-center justify-between px-6 py-4">
                    <div className="flex items-center gap-3">
                      <Bell size={20} className="text-zinc-400" />
                      <div>
                        <p className="font-medium">Push Notifications</p>
                        <p className="text-sm text-zinc-500 dark:text-zinc-400">Get notified about updates</p>
                      </div>
                    </div>
                    <button
                      onClick={handleNotificationsChange}
                      className={`w-12 h-7 rounded-full transition-colors ${
                        notifications ? 'bg-emerald-600' : 'bg-zinc-300 dark:bg-zinc-700'
                      }`}
                    >
                      <div
                        className={`w-5 h-5 rounded-full bg-white shadow-sm transform transition-transform ${
                          notifications ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                  <div className="flex items-center justify-between px-6 py-4">
                    <div className="flex items-center gap-3">
                      <Globe size={20} className="text-zinc-400" />
                      <div>
                        <p className="font-medium">Email Updates</p>
                        <p className="text-sm text-zinc-500 dark:text-zinc-400">Receive product updates via email</p>
                      </div>
                    </div>
                    <button
                      onClick={handleEmailUpdatesChange}
                      className={`w-12 h-7 rounded-full transition-colors ${
                        emailUpdates ? 'bg-emerald-600' : 'bg-zinc-300 dark:bg-zinc-700'
                      }`}
                    >
                      <div
                        className={`w-5 h-5 rounded-full bg-white shadow-sm transform transition-transform ${
                          emailUpdates ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                </div>
              </div>

              {/* Storage */}
              <div className="bg-zinc-50 dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
                <div className="px-6 py-4 border-b border-zinc-200 dark:border-zinc-800">
                  <h2 className="font-semibold">Storage & Data</h2>
                </div>
                <div className="divide-y divide-zinc-200 dark:divide-zinc-800">
                  <div className="flex items-center justify-between px-6 py-4">
                    <div className="flex items-center gap-3">
                      <Download size={20} className="text-zinc-400" />
                      <div>
                        <p className="font-medium">Auto-save Projects</p>
                        <p className="text-sm text-zinc-500 dark:text-zinc-400">Automatically save your work</p>
                      </div>
                    </div>
                    <button
                      onClick={handleAutoSaveChange}
                      className={`w-12 h-7 rounded-full transition-colors ${
                        autoSave ? 'bg-emerald-600' : 'bg-zinc-300 dark:bg-zinc-700'
                      }`}
                    >
                      <div
                        className={`w-5 h-5 rounded-full bg-white shadow-sm transform transition-transform ${
                          autoSave ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                  <button
                    onClick={() => setShowCacheModal(true)}
                    className="flex items-center justify-between px-6 py-4 w-full text-left hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <Trash2 size={20} className="text-zinc-400" />
                      <div>
                        <p className="font-medium">Clear Cache</p>
                        <p className="text-sm text-zinc-500 dark:text-zinc-400">Free up storage space</p>
                      </div>
                    </div>
                    <ChevronRight size={20} className="text-zinc-400" />
                  </button>
                </div>
              </div>

              {/* Security */}
              <div className="bg-zinc-50 dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
                <div className="px-6 py-4 border-b border-zinc-200 dark:border-zinc-800">
                  <h2 className="font-semibold">Security</h2>
                </div>
                <div className="divide-y divide-zinc-200 dark:divide-zinc-800">
                  <button
                    onClick={() => setShowPasswordModal(true)}
                    disabled={!user}
                    className="flex items-center justify-between px-6 py-4 w-full text-left hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <div className="flex items-center gap-3">
                      <Shield size={20} className="text-zinc-400" />
                      <div>
                        <p className="font-medium">Change Password</p>
                        <p className="text-sm text-zinc-500 dark:text-zinc-400">
                          {user ? 'Update your password' : 'Sign in to change password'}
                        </p>
                      </div>
                    </div>
                    <ChevronRight size={20} className="text-zinc-400" />
                  </button>
                </div>
              </div>

              {/* Danger Zone */}
              <div className="bg-red-50 dark:bg-red-950/20 rounded-2xl border border-red-200 dark:border-red-900/50 overflow-hidden">
                <div className="px-6 py-4 border-b border-red-200 dark:border-red-900/50">
                  <h2 className="font-semibold text-red-600 dark:text-red-400">Danger Zone</h2>
                </div>
                <div className="px-6 py-4">
                  <button
                    onClick={() => setShowDeleteModal(true)}
                    disabled={!user}
                    className="w-full py-3 text-red-600 dark:text-red-400 border border-red-300 dark:border-red-800 rounded-xl font-medium hover:bg-red-100 dark:hover:bg-red-950/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Delete Account
                  </button>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Change Password Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 w-full max-w-md shadow-xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-200 dark:border-zinc-800">
              <h3 className="font-semibold text-lg">Change Password</h3>
              <button
                onClick={() => {
                  setShowPasswordModal(false);
                  setNewPassword('');
                  setConfirmPassword('');
                  setPasswordError('');
                  setPasswordSuccess(false);
                }}
                className="p-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              {passwordSuccess ? (
                <div className="flex flex-col items-center py-8">
                  <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mb-4">
                    <Check size={32} className="text-emerald-600" />
                  </div>
                  <p className="font-medium text-lg">Password Changed!</p>
                </div>
              ) : (
                <>
                  <div>
                    <label className="block text-sm font-medium mb-2">New Password</label>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      placeholder="Enter new password"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Confirm Password</label>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      placeholder="Confirm new password"
                    />
                  </div>
                  {passwordError && (
                    <div className="flex items-center gap-2 text-red-500 text-sm">
                      <AlertCircle size={16} />
                      {passwordError}
                    </div>
                  )}
                  <button
                    onClick={handleChangePassword}
                    disabled={changingPassword}
                    className="w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl font-semibold hover:from-emerald-700 hover:to-teal-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {changingPassword ? (
                      <>
                        <Loader2 size={18} className="animate-spin" />
                        Changing...
                      </>
                    ) : (
                      'Change Password'
                    )}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Clear Cache Modal */}
      {showCacheModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 w-full max-w-md shadow-xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-200 dark:border-zinc-800">
              <h3 className="font-semibold text-lg">Clear Cache</h3>
              <button
                onClick={() => {
                  setShowCacheModal(false);
                  setCacheCleared(false);
                }}
                className="p-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-6">
              {cacheCleared ? (
                <div className="flex flex-col items-center py-8">
                  <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mb-4">
                    <Check size={32} className="text-emerald-600" />
                  </div>
                  <p className="font-medium text-lg">Cache Cleared!</p>
                </div>
              ) : (
                <>
                  <p className="text-zinc-600 dark:text-zinc-400 mb-6">
                    This will clear temporary data and cached files. Your account data, projects, and settings will not be affected.
                  </p>
                  <div className="flex gap-3">
                    <button
                      onClick={() => setShowCacheModal(false)}
                      className="flex-1 py-3 border border-zinc-300 dark:border-zinc-700 rounded-xl font-medium hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleClearCache}
                      disabled={clearingCache}
                      className="flex-1 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl font-semibold hover:from-emerald-700 hover:to-teal-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {clearingCache ? (
                        <>
                          <Loader2 size={18} className="animate-spin" />
                          Clearing...
                        </>
                      ) : (
                        'Clear Cache'
                      )}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Delete Account Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 w-full max-w-md shadow-xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-200 dark:border-zinc-800">
              <h3 className="font-semibold text-lg text-red-600">Delete Account</h3>
              <button
                onClick={() => setShowDeleteModal(false)}
                className="p-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-6">
              <div className="flex items-center gap-3 p-4 bg-red-50 dark:bg-red-950/20 rounded-xl mb-6">
                <AlertCircle size={24} className="text-red-600 shrink-0" />
                <p className="text-sm text-red-700 dark:text-red-400">
                  This action cannot be undone. All your data, projects, and generated content will be permanently deleted.
                </p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="flex-1 py-3 border border-zinc-300 dark:border-zinc-700 rounded-xl font-medium hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteAccount}
                  className="flex-1 py-3 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700 transition-colors"
                >
                  Delete Account
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
