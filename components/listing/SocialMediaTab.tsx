import React, { useState } from 'react';
import { Property } from '@/lib/store/contexts/PropertyContext';
import { useToolGeneration } from '@/lib/hooks/useToolGeneration';
import { generateSocialPost } from '@/lib/api/listingContent';
import type { ContentTone, SocialPlatform, SocialPostOptions } from '@/lib/types/listing';
import { SOCIAL_PLATFORM_LABELS } from '@/lib/types/listing';
import { motion } from 'framer-motion';
import { Copy, RefreshCw, Check, Zap, Instagram, Facebook, Linkedin } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SocialMediaTabProps {
  property: Property;
  onGenerated?: () => void;
}

const PLATFORMS: { value: SocialPlatform; label: string; icon: React.ElementType; color: string }[] = [
  { value: 'instagram', label: 'Instagram', icon: Instagram, color: 'from-teal-500 to-pink-500' },
  { value: 'facebook', label: 'Facebook', icon: Facebook, color: 'from-blue-600 to-blue-500' },
  { value: 'tiktok', label: 'TikTok', icon: () => <span className="text-sm font-bold">TT</span>, color: 'from-zinc-900 to-zinc-800' },
  { value: 'linkedin', label: 'LinkedIn', icon: Linkedin, color: 'from-blue-700 to-blue-600' },
];

export function SocialMediaTab({ property, onGenerated }: SocialMediaTabProps) {
  const [platform, setPlatform] = useState<SocialPlatform>('instagram');
  const [tone, setTone] = useState<ContentTone>('friendly');
  const [includePrice, setIncludePrice] = useState(true);
  const [includeAddress, setIncludeAddress] = useState(true);
  const [ctaType, setCtaType] = useState<'dm' | 'call' | 'link-in-bio'>('dm');
  const [posts, setPosts] = useState<Partial<Record<SocialPlatform, string>>>({});
  const [copiedPlatform, setCopiedPlatform] = useState<string | null>(null);

  const { isGenerating, hasCredits, creditCost, generate, error } = useToolGeneration({
    toolId: 'listing-social-post',
  });

  const handleGenerate = async (targetPlatform: SocialPlatform) => {
    const options: SocialPostOptions = {
      platform: targetPlatform,
      tone,
      includePrice,
      includeAddress,
      ctaType,
    };
    const text = await generate(async () => {
      return generateSocialPost(property, options);
    });
    if (text) {
      setPosts((prev) => ({ ...prev, [targetPlatform]: text }));
      onGenerated?.();
    }
  };

  const handleGenerateAll = async () => {
    for (const p of PLATFORMS) {
      await handleGenerate(p.value);
    }
  };

  const handleCopy = async (text: string, plat: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedPlatform(plat);
    setTimeout(() => setCopiedPlatform(null), 2000);
  };

  const currentPost = posts[platform];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Config Panel */}
      <div className="space-y-5">
        {/* Platform selector */}
        <div>
          <label className="block text-sm font-medium text-zinc-600 dark:text-zinc-300 mb-2">Platform</label>
          <div className="grid grid-cols-4 gap-2">
            {PLATFORMS.map((p) => {
              const Icon = p.icon;
              const hasPost = !!posts[p.value];
              return (
                <button
                  key={p.value}
                  onClick={() => setPlatform(p.value)}
                  className={cn(
                    'relative flex flex-col items-center gap-1.5 px-3 py-3 rounded-xl border text-sm font-medium transition-all',
                    platform === p.value
                      ? 'border-emerald-500/30 bg-emerald-500/10 text-white'
                      : 'border-zinc-200 dark:border-white/5 bg-zinc-50 dark:bg-white/5 text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-white/10'
                  )}
                >
                  <Icon size={18} />
                  <span className="text-xs">{p.label}</span>
                  {hasPost && (
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-green-500" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Tone */}
        <div>
          <label className="block text-sm font-medium text-zinc-600 dark:text-zinc-300 mb-2">Tone</label>
          <div className="flex flex-wrap gap-2">
            {(['professional', 'luxury', 'friendly', 'casual'] as ContentTone[]).map((t) => (
              <button
                key={t}
                onClick={() => setTone(t)}
                className={cn(
                  'px-3.5 py-1.5 rounded-full text-sm font-medium transition-colors capitalize',
                  tone === t
                    ? 'bg-emerald-600 text-white'
                    : 'bg-zinc-100 dark:bg-white/5 text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-200 dark:hover:bg-white/10'
                )}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* Options */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={includePrice}
              onChange={(e) => setIncludePrice(e.target.checked)}
              className="rounded border-white/20 bg-white/5 text-emerald-600 focus:ring-emerald-500 focus:ring-offset-0"
            />
            <span className="text-sm text-zinc-600 dark:text-zinc-300">Include price</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={includeAddress}
              onChange={(e) => setIncludeAddress(e.target.checked)}
              className="rounded border-white/20 bg-white/5 text-emerald-600 focus:ring-emerald-500 focus:ring-offset-0"
            />
            <span className="text-sm text-zinc-600 dark:text-zinc-300">Include address</span>
          </label>
        </div>

        {/* CTA Type */}
        <div>
          <label className="block text-sm font-medium text-zinc-600 dark:text-zinc-300 mb-2">Call to Action</label>
          <div className="flex flex-wrap gap-2">
            {([
              { value: 'dm', label: 'DM Me' },
              { value: 'call', label: 'Call/Text' },
              { value: 'link-in-bio', label: 'Link in Bio' },
            ] as const).map((c) => (
              <button
                key={c.value}
                onClick={() => setCtaType(c.value)}
                className={cn(
                  'px-3.5 py-1.5 rounded-full text-sm font-medium transition-colors',
                  ctaType === c.value
                    ? 'bg-emerald-600 text-white'
                    : 'bg-zinc-100 dark:bg-white/5 text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-200 dark:hover:bg-white/10'
                )}
              >
                {c.label}
              </button>
            ))}
          </div>
        </div>

        {/* Buttons */}
        <div className="flex gap-2">
          <button
            onClick={() => handleGenerate(platform)}
            disabled={isGenerating || !hasCredits}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-emerald-600 text-white font-medium hover:bg-emerald-500 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {isGenerating ? (
              <>
                <RefreshCw size={16} className="animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Zap size={16} />
                Generate {SOCIAL_PLATFORM_LABELS[platform]} — {creditCost} cr
              </>
            )}
          </button>
          <button
            onClick={handleGenerateAll}
            disabled={isGenerating || !hasCredits}
            className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-zinc-200 dark:border-white/10 text-sm font-medium text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-white/5 transition-colors disabled:opacity-40 disabled:cursor-not-allowed whitespace-nowrap"
          >
            All Platforms
          </button>
        </div>

        {error && <p className="text-sm text-red-400">{error}</p>}
      </div>

      {/* Preview Panel */}
      <div className="rounded-2xl border border-zinc-200 dark:border-white/10 bg-white dark:bg-zinc-900/50 p-5 min-h-[300px] flex flex-col">
        {currentPost ? (
          <>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                {(() => {
                  const plat = PLATFORMS.find((p) => p.value === platform);
                  const Icon = plat?.icon || Instagram;
                  return <Icon size={16} className="text-zinc-400" />;
                })()}
                <h4 className="text-sm font-medium text-zinc-600 dark:text-zinc-300">
                  {SOCIAL_PLATFORM_LABELS[platform]} Post
                </h4>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => handleCopy(currentPost, platform)}
                  className="p-1.5 rounded-lg text-zinc-500 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-white/5 transition-colors"
                >
                  {copiedPlatform === platform ? (
                    <Check size={14} className="text-green-400" />
                  ) : (
                    <Copy size={14} />
                  )}
                </button>
                <button
                  onClick={() => handleGenerate(platform)}
                  disabled={isGenerating}
                  className="p-1.5 rounded-lg text-zinc-500 hover:text-white hover:bg-white/5 transition-colors disabled:opacity-40"
                >
                  <RefreshCw size={14} className={isGenerating ? 'animate-spin' : ''} />
                </button>
              </div>
            </div>

            {/* Mock platform card */}
            <div className="flex-1 rounded-xl border border-zinc-200 dark:border-white/5 bg-zinc-50 dark:bg-zinc-950 p-4">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600" />
                <div>
                  <div className="text-xs font-semibold text-zinc-900 dark:text-white">Your Agency</div>
                  <div className="text-[10px] text-zinc-500">{SOCIAL_PLATFORM_LABELS[platform]}</div>
                </div>
              </div>
              {property.thumbnailUrl && (
                <img
                  src={property.thumbnailUrl}
                  alt=""
                  className="w-full aspect-video rounded-lg object-cover mb-3"
                />
              )}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed whitespace-pre-wrap"
              >
                {currentPost}
              </motion.div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-sm text-zinc-600">
            Select a platform and generate a post
          </div>
        )}

        {/* Generated posts summary */}
        {Object.keys(posts).length > 0 && (
          <div className="mt-4 pt-3 border-t border-zinc-200 dark:border-white/5">
            <div className="flex items-center gap-2 flex-wrap">
              {PLATFORMS.map((p) => (
                posts[p.value] && (
                  <button
                    key={p.value}
                    onClick={() => setPlatform(p.value)}
                    className={cn(
                      'flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-colors',
                      platform === p.value
                        ? 'bg-emerald-500/20 text-emerald-300'
                        : 'bg-zinc-100 dark:bg-white/5 text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'
                    )}
                  >
                    <Check size={10} className="text-green-500" />
                    {p.label}
                  </button>
                )
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
