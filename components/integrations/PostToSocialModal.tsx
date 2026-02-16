import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Facebook,
  Instagram,
  Send,
  Clock,
  Calendar,
  Loader2,
  CheckCircle,
  AlertCircle,
  Image as ImageIcon,
  Video,
} from 'lucide-react';
import { useSocialIntegrations } from '@/lib/store/contexts/SocialIntegrationsContext';
import { SocialIntegration } from '@/lib/types/social';

interface PostToSocialModalProps {
  isOpen: boolean;
  onClose: () => void;
  mediaUrl: string;
  mediaType: 'image' | 'video';
  defaultCaption?: string;
  onSuccess?: () => void;
}

type PostMode = 'now' | 'schedule';

export function PostToSocialModal({
  isOpen,
  onClose,
  mediaUrl,
  mediaType,
  defaultCaption = '',
  onSuccess,
}: PostToSocialModalProps) {
  const { integrations, postToSocial, loading } = useSocialIntegrations();
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [caption, setCaption] = useState(defaultCaption);
  const [postMode, setPostMode] = useState<PostMode>('now');
  const [scheduledDate, setScheduledDate] = useState('');
  const [scheduledTime, setScheduledTime] = useState('');
  const [posting, setPosting] = useState(false);
  const [results, setResults] = useState<{
    success: boolean;
    message: string;
  } | null>(null);

  const activeIntegrations = integrations.filter((i) => i.status === 'active');

  const toggleIntegration = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handlePost = async () => {
    if (selectedIds.length === 0) return;

    setPosting(true);
    setResults(null);

    let scheduledFor: Date | undefined;
    if (postMode === 'schedule' && scheduledDate && scheduledTime) {
      scheduledFor = new Date(`${scheduledDate}T${scheduledTime}`);
    }

    const result = await postToSocial({
      integrationIds: selectedIds,
      mediaUrl,
      mediaType,
      caption,
      scheduledFor,
    });

    setPosting(false);

    if (result.success) {
      setResults({
        success: true,
        message:
          postMode === 'schedule'
            ? `Successfully scheduled to ${selectedIds.length} account(s)`
            : `Successfully posted to ${selectedIds.length} account(s)`,
      });
      setTimeout(() => {
        onSuccess?.();
        onClose();
      }, 2000);
    } else {
      const failedCount = result.posts.filter((p) => p.status === 'failed').length;
      setResults({
        success: false,
        message: `Failed to post to ${failedCount} account(s)`,
      });
    }
  };

  const getMinDateTime = () => {
    const now = new Date();
    now.setMinutes(now.getMinutes() + 15);
    return {
      date: now.toISOString().split('T')[0],
      time: now.toTimeString().slice(0, 5),
    };
  };

  const minDateTime = getMinDateTime();

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-lg bg-white dark:bg-zinc-900 rounded-2xl shadow-xl overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-zinc-200 dark:border-zinc-800">
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">
              Post to Social Media
            </h2>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            >
              <X size={20} className="text-zinc-500" />
            </button>
          </div>

          {/* Content */}
          <div className="p-4 space-y-6 max-h-[70vh] overflow-y-auto">
            {/* Media Preview */}
            <div className="flex items-center gap-4 p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/50">
              <div className="w-16 h-16 rounded-lg overflow-hidden bg-zinc-200 dark:bg-zinc-700 flex items-center justify-center">
                {mediaType === 'video' ? (
                  <video
                    src={mediaUrl}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <img
                    src={mediaUrl}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                )}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400">
                  {mediaType === 'video' ? (
                    <Video size={16} />
                  ) : (
                    <ImageIcon size={16} />
                  )}
                  <span className="capitalize">{mediaType}</span>
                </div>
                <p className="text-xs text-zinc-500 dark:text-zinc-500 mt-1 truncate max-w-[200px]">
                  {mediaUrl}
                </p>
              </div>
            </div>

            {/* Select Accounts */}
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-3">
                Select Accounts
              </label>
              {activeIntegrations.length === 0 ? (
                <div className="p-4 rounded-xl border border-dashed border-zinc-200 dark:border-zinc-700 text-center">
                  <p className="text-sm text-zinc-500">
                    No connected accounts.{' '}
                    <a
                      href="/studio/integrations"
                      className="text-violet-500 hover:underline"
                    >
                      Connect an account
                    </a>
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {activeIntegrations.map((integration) => (
                    <IntegrationOption
                      key={integration.id}
                      integration={integration}
                      selected={selectedIds.includes(integration.id)}
                      onToggle={() => toggleIntegration(integration.id)}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Caption */}
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                Caption
              </label>
              <textarea
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                placeholder="Write a caption for your post..."
                rows={3}
                className="w-full px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent resize-none"
              />
              <p className="mt-1 text-xs text-zinc-500">
                {caption.length}/2200 characters
              </p>
            </div>

            {/* Post Mode */}
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-3">
                When to Post
              </label>
              <div className="flex gap-2">
                <button
                  onClick={() => setPostMode('now')}
                  className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl border transition-colors ${
                    postMode === 'now'
                      ? 'border-violet-500 bg-violet-500/10 text-violet-600 dark:text-violet-400'
                      : 'border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:border-zinc-300 dark:hover:border-zinc-600'
                  }`}
                >
                  <Send size={18} />
                  Post Now
                </button>
                <button
                  onClick={() => setPostMode('schedule')}
                  className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl border transition-colors ${
                    postMode === 'schedule'
                      ? 'border-violet-500 bg-violet-500/10 text-violet-600 dark:text-violet-400'
                      : 'border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:border-zinc-300 dark:hover:border-zinc-600'
                  }`}
                >
                  <Clock size={18} />
                  Schedule
                </button>
              </div>

              {/* Schedule DateTime */}
              {postMode === 'schedule' && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-4 grid grid-cols-2 gap-3"
                >
                  <div>
                    <label className="block text-xs text-zinc-500 mb-1">Date</label>
                    <input
                      type="date"
                      value={scheduledDate}
                      onChange={(e) => setScheduledDate(e.target.value)}
                      min={minDateTime.date}
                      className="w-full px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-zinc-500 mb-1">Time</label>
                    <input
                      type="time"
                      value={scheduledTime}
                      onChange={(e) => setScheduledTime(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
                    />
                  </div>
                </motion.div>
              )}
            </div>

            {/* Results */}
            {results && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`p-4 rounded-xl flex items-center gap-3 ${
                  results.success
                    ? 'bg-emerald-500/10 border border-emerald-500/20'
                    : 'bg-red-500/10 border border-red-500/20'
                }`}
              >
                {results.success ? (
                  <CheckCircle className="text-emerald-500 shrink-0" size={20} />
                ) : (
                  <AlertCircle className="text-red-500 shrink-0" size={20} />
                )}
                <span
                  className={`text-sm ${
                    results.success ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'
                  }`}
                >
                  {results.message}
                </span>
              </motion.div>
            )}
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-zinc-200 dark:border-zinc-800">
            <button
              onClick={handlePost}
              disabled={
                posting ||
                selectedIds.length === 0 ||
                (postMode === 'schedule' && (!scheduledDate || !scheduledTime))
              }
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-violet-600 hover:bg-violet-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl font-medium transition-colors"
            >
              {posting ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  {postMode === 'schedule' ? 'Scheduling...' : 'Posting...'}
                </>
              ) : (
                <>
                  {postMode === 'schedule' ? <Calendar size={18} /> : <Send size={18} />}
                  {postMode === 'schedule'
                    ? `Schedule to ${selectedIds.length} Account(s)`
                    : `Post to ${selectedIds.length} Account(s)`}
                </>
              )}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

// Integration Option Component
function IntegrationOption({
  integration,
  selected,
  onToggle,
}: {
  integration: SocialIntegration;
  selected: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      onClick={onToggle}
      className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-colors ${
        selected
          ? 'border-violet-500 bg-violet-500/5'
          : 'border-zinc-200 dark:border-zinc-700 hover:border-zinc-300 dark:hover:border-zinc-600'
      }`}
    >
      {/* Checkbox */}
      <div
        className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-colors ${
          selected
            ? 'border-violet-500 bg-violet-500'
            : 'border-zinc-300 dark:border-zinc-600'
        }`}
      >
        {selected && <CheckCircle size={14} className="text-white" />}
      </div>

      {/* Platform Icon */}
      <div
        className={`w-10 h-10 rounded-lg flex items-center justify-center ${
          integration.platform === 'facebook'
            ? 'bg-blue-500/10'
            : 'bg-gradient-to-br from-purple-500/10 to-pink-500/10'
        }`}
      >
        {integration.platform === 'facebook' ? (
          <Facebook size={20} className="text-blue-500" />
        ) : (
          <Instagram size={20} className="text-pink-500" />
        )}
      </div>

      {/* Info */}
      <div className="flex-1 text-left">
        <p className="font-medium text-zinc-900 dark:text-white">
          {integration.platform === 'instagram'
            ? `@${integration.instagramUsername}`
            : integration.pageName}
        </p>
        <p className="text-xs text-zinc-500">
          {integration.platform === 'facebook' ? 'Facebook Page' : 'Instagram Business'}
        </p>
      </div>
    </button>
  );
}

export default PostToSocialModal;
