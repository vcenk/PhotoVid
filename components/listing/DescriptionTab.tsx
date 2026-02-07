import { useState } from 'react';
import { Property } from '@/lib/store/contexts/PropertyContext';
import { useToolGeneration } from '@/lib/hooks/useToolGeneration';
import { generateMLSDescription } from '@/lib/api/listingContent';
import type { ContentTone, DescriptionLength, DescriptionOptions } from '@/lib/types/listing';
import { motion } from 'framer-motion';
import { Copy, RefreshCw, Edit3, Check, Zap, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DescriptionTabProps {
  property: Property;
  onGenerated?: () => void;
}

const TONES: { value: ContentTone; label: string }[] = [
  { value: 'professional', label: 'Professional' },
  { value: 'luxury', label: 'Luxury' },
  { value: 'friendly', label: 'Friendly' },
  { value: 'casual', label: 'Casual' },
];

const LENGTHS: { value: DescriptionLength; label: string; words: string }[] = [
  { value: 'short', label: 'Short', words: '~100 words' },
  { value: 'medium', label: 'Medium', words: '~250 words' },
  { value: 'long', label: 'Long', words: '~500 words' },
];

export function DescriptionTab({ property, onGenerated }: DescriptionTabProps) {
  const [tone, setTone] = useState<ContentTone>('professional');
  const [length, setLength] = useState<DescriptionLength>('medium');
  const [highlightFeatures, setHighlightFeatures] = useState<string[]>(
    property.features?.slice() || []
  );
  const [customKeywords, setCustomKeywords] = useState('');
  const [includeNeighborhood, setIncludeNeighborhood] = useState(true);
  const [result, setResult] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedText, setEditedText] = useState('');
  const [copied, setCopied] = useState(false);

  const { isGenerating, hasCredits, creditCost, generate, error } = useToolGeneration({
    toolId: 'listing-description',
  });

  const handleGenerate = async () => {
    const options: DescriptionOptions = {
      tone,
      length,
      highlightFeatures,
      customKeywords,
      includeNeighborhood,
    };
    const text = await generate(async () => {
      return generateMLSDescription(property, options);
    });
    if (text) {
      setResult(text);
      setEditedText(text);
      onGenerated?.();
    }
  };

  const handleCopy = async () => {
    const text = isEditing ? editedText : result;
    if (text) {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const toggleFeature = (feat: string) => {
    setHighlightFeatures((prev) =>
      prev.includes(feat) ? prev.filter((f) => f !== feat) : [...prev, feat]
    );
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Config Panel */}
      <div className="space-y-5">
        {/* Tone */}
        <div>
          <label className="block text-sm font-medium text-zinc-600 dark:text-zinc-300 mb-2">Tone</label>
          <div className="flex flex-wrap gap-2">
            {TONES.map((t) => (
              <button
                key={t.value}
                onClick={() => setTone(t.value)}
                className={cn(
                  'px-3.5 py-1.5 rounded-full text-sm font-medium transition-colors',
                  tone === t.value
                    ? 'bg-emerald-600 text-white'
                    : 'bg-zinc-100 dark:bg-white/5 text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-200 dark:hover:bg-white/10'
                )}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Length */}
        <div>
          <label className="block text-sm font-medium text-zinc-600 dark:text-zinc-300 mb-2">Length</label>
          <div className="flex flex-wrap gap-2">
            {LENGTHS.map((l) => (
              <button
                key={l.value}
                onClick={() => setLength(l.value)}
                className={cn(
                  'px-3.5 py-1.5 rounded-full text-sm font-medium transition-colors',
                  length === l.value
                    ? 'bg-emerald-600 text-white'
                    : 'bg-zinc-100 dark:bg-white/5 text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-200 dark:hover:bg-white/10'
                )}
              >
                {l.label}
                <span className="ml-1 text-xs opacity-60">{l.words}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Highlight Features */}
        <div>
          <label className="block text-sm font-medium text-zinc-600 dark:text-zinc-300 mb-2">
            Highlight Features
          </label>
          {property.features && property.features.length > 0 ? (
            <div className="flex flex-wrap gap-2 mb-2">
              {property.features.map((feat) => (
                <button
                  key={feat}
                  onClick={() => toggleFeature(feat)}
                  className={cn(
                    'px-2.5 py-1 rounded-lg text-xs font-medium transition-colors',
                    highlightFeatures.includes(feat)
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      : 'bg-zinc-100 dark:bg-white/5 text-zinc-500 border border-zinc-200 dark:border-white/5 hover:text-zinc-700 dark:hover:text-zinc-300'
                  )}
                >
                  {feat}
                </button>
              ))}
            </div>
          ) : (
            <p className="text-xs text-zinc-600 mb-2">
              No features on this property — add keywords below.
            </p>
          )}
          <input
            type="text"
            placeholder="Custom keywords (comma-separated)"
            value={customKeywords}
            onChange={(e) => setCustomKeywords(e.target.value)}
            className="w-full px-3 py-2 rounded-lg bg-zinc-50 dark:bg-white/5 border border-zinc-200 dark:border-white/10 text-sm text-zinc-900 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-600 focus:outline-none focus:border-emerald-500/30"
          />
        </div>

        {/* Include Neighborhood */}
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={includeNeighborhood}
            onChange={(e) => setIncludeNeighborhood(e.target.checked)}
            className="rounded border-white/20 bg-white/5 text-emerald-600 focus:ring-emerald-500 focus:ring-offset-0"
          />
          <span className="text-sm text-zinc-600 dark:text-zinc-300">Include neighborhood info</span>
        </label>

        {/* Fair housing note */}
        <div className="flex items-start gap-2 p-3 rounded-lg bg-amber-500/5 border border-amber-500/10">
          <AlertTriangle size={14} className="text-amber-500 mt-0.5 shrink-0" />
          <p className="text-xs text-amber-400/80 leading-relaxed">
            Fair Housing reminder: Avoid references to protected classes (race, religion, familial status, etc.) in your listing descriptions. Review generated content before publishing.
          </p>
        </div>

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
              Generate Description — {creditCost} credit
            </>
          )}
        </button>

        {error && <p className="text-sm text-red-400">{error}</p>}
      </div>

      {/* Preview Panel */}
      <div className="rounded-2xl border border-zinc-200 dark:border-white/10 bg-white dark:bg-zinc-900/50 p-5 min-h-[300px] flex flex-col">
        {result ? (
          <>
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-medium text-zinc-600 dark:text-zinc-300">Generated Description</h4>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => {
                    setIsEditing(!isEditing);
                    if (!isEditing) setEditedText(result);
                  }}
                  className={cn(
                    'p-1.5 rounded-lg transition-colors',
                    isEditing
                      ? 'bg-emerald-500/20 text-emerald-400'
                      : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-white/5'
                  )}
                  title={isEditing ? 'Done editing' : 'Edit'}
                >
                  <Edit3 size={14} />
                </button>
                <button
                  onClick={handleCopy}
                  className="p-1.5 rounded-lg text-zinc-500 hover:text-white hover:bg-white/5 transition-colors"
                  title="Copy to clipboard"
                >
                  {copied ? <Check size={14} className="text-green-400" /> : <Copy size={14} />}
                </button>
                <button
                  onClick={handleGenerate}
                  disabled={isGenerating}
                  className="p-1.5 rounded-lg text-zinc-500 hover:text-white hover:bg-white/5 transition-colors disabled:opacity-40"
                  title="Regenerate"
                >
                  <RefreshCw size={14} className={isGenerating ? 'animate-spin' : ''} />
                </button>
              </div>
            </div>
            {isEditing ? (
              <textarea
                value={editedText}
                onChange={(e) => setEditedText(e.target.value)}
                className="flex-1 w-full p-3 rounded-lg bg-zinc-50 dark:bg-white/5 border border-emerald-500/20 text-sm text-zinc-800 dark:text-zinc-200 leading-relaxed resize-none focus:outline-none focus:border-emerald-500/40"
              />
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed whitespace-pre-wrap"
              >
                {result}
              </motion.div>
            )}
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-sm text-zinc-600">
            Generated description will appear here
          </div>
        )}
      </div>
    </div>
  );
}
