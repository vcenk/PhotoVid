import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  Link2,
  Facebook,
  Instagram,
  Plus,
  Check,
  AlertCircle,
  Loader2,
  ExternalLink,
  Trash2,
  RefreshCw,
  Clock,
  Calendar,
  ChevronRight,
} from 'lucide-react';
import { NavigationRail } from '../dashboard/navigation/NavigationRail';
import { DashboardTopbar } from '../dashboard/navigation/DashboardTopbar';
import { useSocialIntegrations } from '@/lib/store/contexts/SocialIntegrationsContext';
import { SocialIntegration } from '@/lib/types/social';

export function IntegrationsPage() {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [disconnectingId, setDisconnectingId] = useState<string | null>(null);

  const {
    integrations,
    scheduledPosts,
    loading,
    error,
    initiateOAuth,
    disconnectIntegration,
    fetchIntegrations,
  } = useSocialIntegrations();

  const handleConnectFacebook = async () => {
    setConnecting(true);
    const oauthUrl = await initiateOAuth();
    if (oauthUrl) {
      window.location.href = oauthUrl;
    }
    setConnecting(false);
  };

  const handleDisconnect = async (id: string) => {
    setDisconnectingId(id);
    await disconnectIntegration(id, true);
    setDisconnectingId(null);
  };

  // Group integrations by page
  const facebookIntegrations = integrations.filter(i => i.platform === 'facebook');
  const instagramIntegrations = integrations.filter(i => i.platform === 'instagram');

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'text-emerald-400 bg-emerald-500/10';
      case 'expired':
        return 'text-amber-400 bg-amber-500/10';
      case 'error':
        return 'text-red-400 bg-red-500/10';
      default:
        return 'text-zinc-400 bg-zinc-500/10';
    }
  };

  const formatDate = (date: Date | null) => {
    if (!date) return 'Never';
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(date);
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
          <div className="max-w-4xl mx-auto px-6 py-12">
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
                  <Link2 className="text-violet-500" size={24} />
                  Integrations
                </h1>
                <p className="text-zinc-500 dark:text-zinc-400 text-sm">
                  Connect your social media accounts to publish content directly
                </p>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center gap-3">
                <AlertCircle className="text-red-500 shrink-0" size={20} />
                <span className="text-red-400 text-sm">{error}</span>
              </div>
            )}

            {/* Connect New Section */}
            <div className="mb-8">
              <h2 className="text-lg font-semibold mb-4">Connect Account</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Facebook/Instagram Card */}
                <button
                  onClick={handleConnectFacebook}
                  disabled={connecting}
                  className="p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 hover:border-violet-500/50 dark:hover:border-violet-500/50 transition-all text-left group"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                      <Facebook size={24} className="text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold group-hover:text-violet-500 transition-colors">
                        Facebook & Instagram
                      </h3>
                      <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
                        Connect your Facebook Pages and linked Instagram Business accounts
                      </p>
                    </div>
                    {connecting ? (
                      <Loader2 className="animate-spin text-violet-500" size={20} />
                    ) : (
                      <Plus className="text-zinc-400 group-hover:text-violet-500 transition-colors" size={20} />
                    )}
                  </div>
                </button>

                {/* Coming Soon Placeholder */}
                <div className="p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 opacity-50 cursor-not-allowed">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-sky-400 to-blue-500 flex items-center justify-center">
                      <svg viewBox="0 0 24 24" className="w-6 h-6 text-white" fill="currentColor">
                        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold">X (Twitter)</h3>
                      <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">Coming soon</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Connected Accounts */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">Connected Accounts</h2>
                <button
                  onClick={() => fetchIntegrations()}
                  disabled={loading}
                  className="p-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                >
                  <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
                </button>
              </div>

              {loading && integrations.length === 0 ? (
                <div className="p-12 text-center">
                  <Loader2 className="animate-spin mx-auto text-violet-500 mb-4" size={32} />
                  <p className="text-zinc-500">Loading integrations...</p>
                </div>
              ) : integrations.length === 0 ? (
                <div className="p-12 rounded-2xl border border-dashed border-zinc-200 dark:border-zinc-800 text-center">
                  <Link2 className="mx-auto text-zinc-400 mb-4" size={40} />
                  <h3 className="font-semibold mb-2">No accounts connected</h3>
                  <p className="text-sm text-zinc-500 dark:text-zinc-400">
                    Connect your social media accounts to start publishing content
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  <AnimatePresence>
                    {integrations.map((integration) => (
                      <IntegrationCard
                        key={integration.id}
                        integration={integration}
                        onDisconnect={handleDisconnect}
                        isDisconnecting={disconnectingId === integration.id}
                        formatDate={formatDate}
                        getStatusColor={getStatusColor}
                      />
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </div>

            {/* Scheduled Posts */}
            {scheduledPosts.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold flex items-center gap-2">
                    <Calendar size={18} className="text-violet-500" />
                    Scheduled Posts
                  </h2>
                  <span className="text-sm text-zinc-500">{scheduledPosts.length} pending</span>
                </div>
                <div className="space-y-2">
                  {scheduledPosts.map((post) => (
                    <div
                      key={post.id}
                      className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex items-center gap-4"
                    >
                      <div className="w-10 h-10 rounded-lg bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center">
                        {post.platform === 'facebook' ? (
                          <Facebook size={18} className="text-blue-500" />
                        ) : (
                          <Instagram size={18} className="text-pink-500" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {post.caption || 'No caption'}
                        </p>
                        <p className="text-xs text-zinc-500 flex items-center gap-1">
                          <Clock size={12} />
                          {post.scheduledFor ? formatDate(post.scheduledFor) : 'Not scheduled'}
                        </p>
                      </div>
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-amber-500/10 text-amber-400">
                        Scheduled
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Help Section */}
            <div className="mt-12 p-6 rounded-2xl bg-gradient-to-br from-violet-500/5 to-purple-500/5 border border-violet-500/10">
              <h3 className="font-semibold mb-2">Need help?</h3>
              <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-4">
                Make sure you have a Facebook Page and that your Instagram account is a Business or Creator account linked to your Facebook Page.
              </p>
              <a
                href="https://www.facebook.com/business/help/898752960195806"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-violet-500 hover:text-violet-400 font-medium inline-flex items-center gap-1"
              >
                Learn how to set up
                <ExternalLink size={14} />
              </a>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

// Integration Card Component
function IntegrationCard({
  integration,
  onDisconnect,
  isDisconnecting,
  formatDate,
  getStatusColor,
}: {
  integration: SocialIntegration;
  onDisconnect: (id: string) => void;
  isDisconnecting: boolean;
  formatDate: (date: Date | null) => string;
  getStatusColor: (status: string) => string;
}) {
  const [expanded, setExpanded] = useState(false);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="rounded-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden"
    >
      <div
        className="p-4 flex items-center gap-4 cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        {/* Platform Icon */}
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
          integration.platform === 'facebook'
            ? 'bg-blue-500/10'
            : 'bg-gradient-to-br from-purple-500/10 to-pink-500/10'
        }`}>
          {integration.platform === 'facebook' ? (
            <Facebook size={24} className="text-blue-500" />
          ) : (
            <Instagram size={24} className="text-pink-500" />
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold truncate">
              {integration.platform === 'instagram'
                ? `@${integration.instagramUsername}`
                : integration.pageName}
            </h3>
            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(integration.status)}`}>
              {integration.status}
            </span>
          </div>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 truncate">
            {integration.platform === 'facebook' ? 'Facebook Page' : 'Instagram Business'}
            {integration.lastUsedAt && ` • Last used ${formatDate(integration.lastUsedAt)}`}
          </p>
        </div>

        {/* Actions */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDisconnect(integration.id);
          }}
          disabled={isDisconnecting}
          className="p-2 rounded-lg hover:bg-red-500/10 text-zinc-400 hover:text-red-500 transition-colors"
        >
          {isDisconnecting ? (
            <Loader2 size={18} className="animate-spin" />
          ) : (
            <Trash2 size={18} />
          )}
        </button>

        <ChevronRight
          size={18}
          className={`text-zinc-400 transition-transform ${expanded ? 'rotate-90' : ''}`}
        />
      </div>

      {/* Expanded Details */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-t border-zinc-200 dark:border-zinc-800 overflow-hidden"
          >
            <div className="p-4 space-y-3 bg-zinc-50 dark:bg-zinc-900/50">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-zinc-500">Connected</span>
                  <p className="font-medium">{formatDate(integration.connectedAt)}</p>
                </div>
                {integration.tokenExpiresAt && (
                  <div>
                    <span className="text-zinc-500">Token expires</span>
                    <p className="font-medium">{formatDate(integration.tokenExpiresAt)}</p>
                  </div>
                )}
                {integration.instagramUsername && integration.platform === 'facebook' && (
                  <div>
                    <span className="text-zinc-500">Linked Instagram</span>
                    <p className="font-medium">@{integration.instagramUsername}</p>
                  </div>
                )}
              </div>
              {integration.errorMessage && (
                <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                  <p className="text-sm text-red-400">{integration.errorMessage}</p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default IntegrationsPage;
