import { useState, useMemo } from 'react';
import { Property } from '@/lib/store/contexts/PropertyContext';
import { useToolGeneration } from '@/lib/hooks/useToolGeneration';
import { generateEmailContent } from '@/lib/api/listingContent';
import type { EmailType, EmailOptions, EmailContent } from '@/lib/types/listing';
import { EMAIL_TYPE_LABELS } from '@/lib/types/listing';
import { motion } from 'framer-motion';
import { Copy, RefreshCw, Check, Zap, Mail, Code } from 'lucide-react';
import { cn } from '@/lib/utils';
import DOMPurify from 'dompurify';

interface EmailTabProps {
  property: Property;
  onGenerated?: () => void;
}

const EMAIL_TYPES: { value: EmailType; label: string; desc: string }[] = [
  { value: 'just-listed', label: 'Just Listed', desc: 'Announce a new listing' },
  { value: 'open-house', label: 'Open House', desc: 'Invite to open house' },
  { value: 'price-reduction', label: 'Price Reduction', desc: 'Price drop announcement' },
  { value: 'just-sold', label: 'Just Sold', desc: 'Celebrate a sale' },
];

export function EmailTab({ property, onGenerated }: EmailTabProps) {
  const [emailType, setEmailType] = useState<EmailType>('just-listed');
  const [agentName, setAgentName] = useState(() => {
    try {
      const stored = localStorage.getItem('photovid_agent_info');
      return stored ? JSON.parse(stored).agentName || '' : '';
    } catch { return ''; }
  });
  const [ctaText, setCtaText] = useState('Schedule a Showing');
  const [includeVirtualTourLink, setIncludeVirtualTourLink] = useState(false);
  const [emailContent, setEmailContent] = useState<EmailContent | null>(null);
  const [showHtml, setShowHtml] = useState(false);
  const [copiedType, setCopiedType] = useState<string | null>(null);

  const { isGenerating, hasCredits, creditCost, generate, error } = useToolGeneration({
    toolId: 'listing-email',
  });

  const handleGenerate = async () => {
    const options: EmailOptions = {
      emailType,
      agentName,
      ctaText,
      includeVirtualTourLink,
    };
    const result = await generate(async () => {
      return generateEmailContent(property, options);
    });
    if (result) {
      setEmailContent(result);
      onGenerated?.();
    }
  };

  const handleCopy = async (type: 'html' | 'text' | 'subject') => {
    if (!emailContent) return;
    let text = '';
    if (type === 'subject') text = emailContent.subject;
    else if (type === 'html') text = emailContent.body;
    else text = emailContent.body.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();

    await navigator.clipboard.writeText(text);
    setCopiedType(type);
    setTimeout(() => setCopiedType(null), 2000);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Config Panel */}
      <div className="space-y-5">
        {/* Email type */}
        <div>
          <label className="block text-sm font-medium text-zinc-600 dark:text-zinc-300 mb-2">Email Type</label>
          <div className="grid grid-cols-2 gap-2">
            {EMAIL_TYPES.map((t) => (
              <button
                key={t.value}
                onClick={() => setEmailType(t.value)}
                className={cn(
                  'flex flex-col items-start p-3 rounded-xl border text-left transition-all',
                  emailType === t.value
                    ? 'border-emerald-500/30 bg-emerald-500/10'
                    : 'border-zinc-200 dark:border-white/5 bg-zinc-50 dark:bg-white/5 hover:bg-zinc-100 dark:hover:bg-white/10'
                )}
              >
                <span className="text-sm font-medium text-zinc-900 dark:text-white">{t.label}</span>
                <span className="text-xs text-zinc-500">{t.desc}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Agent Name */}
        <div>
          <label className="block text-xs text-zinc-400 mb-1">Agent Name</label>
          <input
            type="text"
            placeholder="Your name"
            value={agentName}
            onChange={(e) => setAgentName(e.target.value)}
            className="w-full px-3 py-2 rounded-lg bg-zinc-50 dark:bg-white/5 border border-zinc-200 dark:border-white/10 text-sm text-zinc-900 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-600 focus:outline-none focus:border-emerald-500/30"
          />
        </div>

        {/* CTA Text */}
        <div>
          <label className="block text-xs text-zinc-400 mb-1">CTA Button Text</label>
          <input
            type="text"
            placeholder="Schedule a Showing"
            value={ctaText}
            onChange={(e) => setCtaText(e.target.value)}
            className="w-full px-3 py-2 rounded-lg bg-zinc-50 dark:bg-white/5 border border-zinc-200 dark:border-white/10 text-sm text-zinc-900 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-600 focus:outline-none focus:border-emerald-500/30"
          />
        </div>

        {/* Options */}
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={includeVirtualTourLink}
            onChange={(e) => setIncludeVirtualTourLink(e.target.checked)}
            className="rounded border-white/20 bg-white/5 text-emerald-600 focus:ring-emerald-500 focus:ring-offset-0"
          />
          <span className="text-sm text-zinc-600 dark:text-zinc-300">Include virtual tour link mention</span>
        </label>

        {/* Generate Button */}
        <button
          onClick={handleGenerate}
          disabled={isGenerating || !hasCredits}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-emerald-600 text-white font-medium hover:bg-emerald-500 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {isGenerating ? (
            <>
              <RefreshCw size={16} className="animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Zap size={16} />
              Generate Email — {creditCost} credit
            </>
          )}
        </button>

        {error && <p className="text-sm text-red-400">{error}</p>}
      </div>

      {/* Preview Panel */}
      <div className="rounded-2xl border border-zinc-200 dark:border-white/10 bg-white dark:bg-zinc-900/50 p-5 min-h-[400px] flex flex-col">
        {emailContent ? (
          <>
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-medium text-zinc-600 dark:text-zinc-300">
                {EMAIL_TYPE_LABELS[emailType]} Email
              </h4>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setShowHtml(!showHtml)}
                  className={cn(
                    'p-1.5 rounded-lg transition-colors',
                    showHtml
                      ? 'bg-emerald-500/20 text-emerald-400'
                      : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-white/5'
                  )}
                  title={showHtml ? 'Show preview' : 'Show HTML'}
                >
                  <Code size={14} />
                </button>
                <button
                  onClick={() => handleCopy('html')}
                  className="p-1.5 rounded-lg text-zinc-500 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-white/5 transition-colors"
                  title="Copy HTML"
                >
                  {copiedType === 'html' ? <Check size={14} className="text-green-400" /> : <Copy size={14} />}
                </button>
                <button
                  onClick={handleGenerate}
                  disabled={isGenerating}
                  className="p-1.5 rounded-lg text-zinc-500 hover:text-white hover:bg-white/5 transition-colors disabled:opacity-40"
                >
                  <RefreshCw size={14} className={isGenerating ? 'animate-spin' : ''} />
                </button>
              </div>
            </div>

            {/* Subject line */}
            <div className="mb-3 p-3 rounded-lg bg-zinc-50 dark:bg-white/5 border border-zinc-200 dark:border-white/5">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs text-zinc-500">Subject: </span>
                  <span className="text-sm text-zinc-900 dark:text-white font-medium">{emailContent.subject}</span>
                </div>
                <button
                  onClick={() => handleCopy('subject')}
                  className="p-1 rounded text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors"
                >
                  {copiedType === 'subject' ? (
                    <Check size={12} className="text-green-400" />
                  ) : (
                    <Copy size={12} />
                  )}
                </button>
              </div>
            </div>

            {/* Email body */}
            <div className="flex-1 rounded-xl border border-zinc-200 dark:border-white/5 overflow-y-auto">
              {showHtml ? (
                <pre className="p-4 text-xs text-zinc-400 whitespace-pre-wrap font-mono leading-relaxed">
                  {emailContent.body}
                </pre>
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="p-4 bg-white rounded-xl"
                  dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(emailContent.body) }}
                />
              )}
            </div>

            {/* Copy actions */}
            <div className="mt-3 flex gap-2">
              <button
                onClick={() => handleCopy('html')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-100 dark:bg-white/5 text-xs text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors"
              >
                <Copy size={12} />
                Copy HTML
              </button>
              <button
                onClick={() => handleCopy('text')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-100 dark:bg-white/5 text-xs text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors"
              >
                <Copy size={12} />
                Copy Plain Text
              </button>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-sm text-zinc-600">
            <div className="text-center">
              <Mail size={24} className="mx-auto mb-2 text-zinc-700" />
              Select email type and generate
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
