import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { NavigationRail } from '../dashboard/navigation/NavigationRail';
import { DashboardTopbar } from '../dashboard/navigation/DashboardTopbar';
import { useCredits } from '@/lib/store/contexts/CreditsContext';
import { createClient } from '@/lib/database/client';
import {
  ArrowLeft,
  Users,
  CreditCard,
  Activity,
  Settings,
  Shield,
  Search,
  MoreVertical,
  Plus,
  Minus,
  Loader2,
  Check,
  AlertCircle,
} from 'lucide-react';

interface UserData {
  id: string;
  email: string;
  full_name: string;
  credits: number;
  created_at: string;
  is_admin: boolean;
}

export function AdminPage() {
  const navigate = useNavigate();
  const { isAdmin } = useCredits();
  const supabase = createClient();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'users' | 'credits' | 'stats'>('users');
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null);
  const [creditAmount, setCreditAmount] = useState('');
  const [adjustingCredits, setAdjustingCredits] = useState(false);
  const [adjustStatus, setAdjustStatus] = useState<'idle' | 'success' | 'error'>('idle');

  // Redirect non-admins
  useEffect(() => {
    if (!isAdmin) {
      navigate('/studio');
    }
  }, [isAdmin, navigate]);

  // Fetch users
  useEffect(() => {
    async function fetchUsers() {
      if (!supabase) {
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('user_credits')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;

        // Map to UserData format
        const mappedUsers: UserData[] = (data || []).map((row: any) => ({
          id: row.user_id,
          email: row.email || 'Unknown',
          full_name: row.full_name || 'Unknown User',
          credits: row.balance || 0,
          created_at: row.created_at,
          is_admin: row.is_admin || false,
        }));

        setUsers(mappedUsers);
      } catch (error) {
        console.error('Failed to fetch users:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchUsers();
  }, [supabase]);

  const filteredUsers = users.filter(user =>
    user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.full_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAdjustCredits = async (action: 'add' | 'subtract') => {
    if (!selectedUser || !creditAmount || !supabase) return;

    const amount = parseInt(creditAmount);
    if (isNaN(amount) || amount <= 0) return;

    setAdjustingCredits(true);
    setAdjustStatus('idle');

    try {
      const newBalance = action === 'add'
        ? selectedUser.credits + amount
        : Math.max(0, selectedUser.credits - amount);

      const { error } = await supabase
        .from('user_credits')
        .update({ balance: newBalance })
        .eq('user_id', selectedUser.id);

      if (error) throw error;

      // Update local state
      setUsers(users.map(u =>
        u.id === selectedUser.id ? { ...u, credits: newBalance } : u
      ));
      setSelectedUser({ ...selectedUser, credits: newBalance });
      setAdjustStatus('success');
      setCreditAmount('');

      setTimeout(() => setAdjustStatus('idle'), 2000);
    } catch (error) {
      console.error('Failed to adjust credits:', error);
      setAdjustStatus('error');
    } finally {
      setAdjustingCredits(false);
    }
  };

  const stats = {
    totalUsers: users.length,
    totalCredits: users.reduce((sum, u) => sum + u.credits, 0),
    avgCredits: users.length > 0 ? Math.round(users.reduce((sum, u) => sum + u.credits, 0) / users.length) : 0,
    admins: users.filter(u => u.is_admin).length,
  };

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="flex h-screen bg-white dark:bg-[#09090b] text-zinc-900 dark:text-white font-[Space_Grotesk] overflow-hidden">
      <NavigationRail
        isMobileOpen={mobileMenuOpen}
        onMobileClose={() => setMobileMenuOpen(false)}
      />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden ml-0 lg:ml-16">
        <DashboardTopbar onMenuClick={() => setMobileMenuOpen(true)} />

        <main className="flex-1 overflow-y-auto">
          <div className="max-w-6xl mx-auto px-6 py-8">
            {/* Header */}
            <div className="flex items-center gap-4 mb-8">
              <button
                onClick={() => navigate(-1)}
                className="p-2 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
              >
                <ArrowLeft size={20} />
              </button>
              <div>
                <h1 className="text-2xl font-bold flex items-center gap-2">
                  <Shield size={24} className="text-amber-500" />
                  Admin Panel
                </h1>
                <p className="text-zinc-500 dark:text-zinc-400 text-sm">Manage users and credits</p>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <div className="bg-zinc-50 dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-4">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-500/20">
                    <Users size={18} className="text-emerald-600" />
                  </div>
                  <span className="text-sm text-zinc-500 dark:text-zinc-400">Total Users</span>
                </div>
                <p className="text-2xl font-bold">{stats.totalUsers}</p>
              </div>
              <div className="bg-zinc-50 dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-4">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 rounded-lg bg-yellow-100 dark:bg-yellow-500/20">
                    <CreditCard size={18} className="text-yellow-600" />
                  </div>
                  <span className="text-sm text-zinc-500 dark:text-zinc-400">Total Credits</span>
                </div>
                <p className="text-2xl font-bold">{stats.totalCredits.toLocaleString()}</p>
              </div>
              <div className="bg-zinc-50 dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-4">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-500/20">
                    <Activity size={18} className="text-blue-600" />
                  </div>
                  <span className="text-sm text-zinc-500 dark:text-zinc-400">Avg Credits</span>
                </div>
                <p className="text-2xl font-bold">{stats.avgCredits.toLocaleString()}</p>
              </div>
              <div className="bg-zinc-50 dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-4">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 rounded-lg bg-amber-100 dark:bg-amber-500/20">
                    <Shield size={18} className="text-amber-600" />
                  </div>
                  <span className="text-sm text-zinc-500 dark:text-zinc-400">Admins</span>
                </div>
                <p className="text-2xl font-bold">{stats.admins}</p>
              </div>
            </div>

            {/* Users Section */}
            <div className="bg-zinc-50 dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
              <div className="px-6 py-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
                <h2 className="font-semibold">Users</h2>
                <div className="relative">
                  <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                  <input
                    type="text"
                    placeholder="Search users..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 pr-4 py-2 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 size={24} className="animate-spin text-zinc-400" />
                </div>
              ) : filteredUsers.length === 0 ? (
                <div className="text-center py-12 text-zinc-500">
                  {searchQuery ? 'No users found matching your search' : 'No users yet'}
                </div>
              ) : (
                <div className="divide-y divide-zinc-200 dark:divide-zinc-800">
                  {filteredUsers.map((user) => (
                    <div
                      key={user.id}
                      className="flex items-center justify-between px-6 py-4 hover:bg-zinc-100 dark:hover:bg-zinc-800/50 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
                          <span className="text-white text-sm font-bold">
                            {user.full_name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                          </span>
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-medium">{user.full_name}</p>
                            {user.is_admin && (
                              <span className="px-1.5 py-0.5 rounded text-xs bg-amber-100 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400">
                                Admin
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-zinc-500 dark:text-zinc-400">{user.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-sm font-semibold">
                          {user.credits.toLocaleString()} credits
                        </span>
                        <button
                          onClick={() => setSelectedUser(user)}
                          className="p-2 rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
                        >
                          <MoreVertical size={18} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </main>
      </div>

      {/* Credit Adjustment Modal */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 w-full max-w-md shadow-xl">
            <div className="px-6 py-4 border-b border-zinc-200 dark:border-zinc-800">
              <h3 className="font-semibold text-lg">Adjust Credits</h3>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">{selectedUser.email}</p>
            </div>
            <div className="p-6 space-y-4">
              <div className="text-center">
                <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-1">Current Balance</p>
                <p className="text-3xl font-bold text-emerald-600">{selectedUser.credits.toLocaleString()}</p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Amount</label>
                <input
                  type="number"
                  value={creditAmount}
                  onChange={(e) => setCreditAmount(e.target.value)}
                  className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="Enter amount"
                  min="1"
                />
              </div>

              {adjustStatus === 'success' && (
                <div className="flex items-center gap-2 text-emerald-600 text-sm">
                  <Check size={16} />
                  Credits adjusted successfully
                </div>
              )}

              {adjustStatus === 'error' && (
                <div className="flex items-center gap-2 text-red-500 text-sm">
                  <AlertCircle size={16} />
                  Failed to adjust credits
                </div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={() => handleAdjustCredits('subtract')}
                  disabled={adjustingCredits || !creditAmount}
                  className="flex-1 flex items-center justify-center gap-2 py-3 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700 transition-colors disabled:opacity-50"
                >
                  <Minus size={18} />
                  Subtract
                </button>
                <button
                  onClick={() => handleAdjustCredits('add')}
                  disabled={adjustingCredits || !creditAmount}
                  className="flex-1 flex items-center justify-center gap-2 py-3 bg-emerald-600 text-white rounded-xl font-semibold hover:bg-emerald-700 transition-colors disabled:opacity-50"
                >
                  <Plus size={18} />
                  Add
                </button>
              </div>

              <button
                onClick={() => {
                  setSelectedUser(null);
                  setCreditAmount('');
                  setAdjustStatus('idle');
                }}
                className="w-full py-3 border border-zinc-300 dark:border-zinc-700 rounded-xl font-medium hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
