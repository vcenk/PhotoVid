import { useState, useEffect } from 'react';
import { Property } from '@/lib/store/contexts/PropertyContext';
import { useToolGeneration } from '@/lib/hooks/useToolGeneration';
import { generateFlyerCopy } from '@/lib/api/listingContent';
import type { FlyerTemplate, FlyerOptions, FlyerCopy } from '@/lib/types/listing';
import { FLYER_TEMPLATE_LABELS } from '@/lib/types/listing';
import { motion } from 'framer-motion';
import { Copy, RefreshCw, Check, Zap, LayoutTemplate } from 'lucide-react';
import { cn } from '@/lib/utils';

const AGENT_STORAGE_KEY = 'photovid_agent_info';

interface FlyerTabProps {
  property: Property;
  onGenerated?: () => void;
}

const TEMPLATES: { value: FlyerTemplate; label: string; desc: string }[] = [
  { value: 'classic', label: 'Classic', desc: 'Photo top, details below' },
  { value: 'modern-grid', label: 'Modern Grid', desc: '4-photo mosaic + overlay' },
  { value: 'luxury', label: 'Luxury', desc: 'Full-bleed hero, minimal text' },
  { value: 'open-house', label: 'Open House', desc: 'Event-focused with date/time' },
];

function loadAgentInfo() {
  try {
    const stored = localStorage.getItem(AGENT_STORAGE_KEY);
    return stored ? JSON.parse(stored) : { agentName: '', agentPhone: '', agentEmail: '', brokerage: '' };
  } catch {
    return { agentName: '', agentPhone: '', agentEmail: '', brokerage: '' };
  }
}

export function FlyerTab({ property, onGenerated }: FlyerTabProps) {
  const [template, setTemplate] = useState<FlyerTemplate>('classic');
  const [agentInfo, setAgentInfo] = useState(loadAgentInfo);
  const [openHouseDate, setOpenHouseDate] = useState('');
  const [openHouseTime, setOpenHouseTime] = useState('');
  const [flyerCopy, setFlyerCopy] = useState<FlyerCopy | null>(null);
  const [copied, setCopied] = useState(false);

  const { isGenerating, hasCredits, creditCost, generate, error } = useToolGeneration({
    toolId: 'listing-flyer',
  });

  // Persist agent info
  useEffect(() => {
    try {
      localStorage.setItem(AGENT_STORAGE_KEY, JSON.stringify(agentInfo));
    } catch { /* ignore */ }
  }, [agentInfo]);

  const handleGenerate = async () => {
    const options: FlyerOptions = {
      template,
      agentName: agentInfo.agentName,
      agentPhone: agentInfo.agentPhone,
      agentEmail: agentInfo.agentEmail,
      brokerage: agentInfo.brokerage,
      openHouseDate: template === 'open-house' ? openHouseDate : undefined,
      openHouseTime: template === 'open-house' ? openHouseTime : undefined,
      selectedPhotos: property.assets?.filter((a) => a.type === 'image').map((a) => a.url) || [],
    };
    const result = await generate(async () => {
      return generateFlyerCopy(property, options);
    });
    if (result) {
      setFlyerCopy(result);
      onGenerated?.();
    }
  };

  const handleCopyText = async () => {
    if (!flyerCopy) return;
    const text = `${flyerCopy.headline}\n\n${flyerCopy.body}\n\n${flyerCopy.tagline}`;
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const price = property.price ? `$${property.price.toLocaleString()}` : '';
  const beds = property.bedrooms ? `${property.bedrooms} Bed` : '';
  const baths = property.bathrooms ? `${property.bathrooms} Bath` : '';
  const sqft = property.squareFeet ? `${property.squareFeet.toLocaleString()} sqft` : '';
  const details = [beds, baths, sqft].filter(Boolean).join(' | ');

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Config Panel */}
      <div className="space-y-5">
        {/* Template selector */}
        <div>
          <label className="block text-sm font-medium text-zinc-300 mb-2">Template</label>
          <div className="grid grid-cols-2 gap-2">
            {TEMPLATES.map((t) => (
              <button
                key={t.value}
                onClick={() => setTemplate(t.value)}
                className={cn(
                  'flex flex-col items-start p-3 rounded-xl border text-left transition-all',
                  template === t.value
                    ? 'border-violet-500/30 bg-violet-500/10'
                    : 'border-white/5 bg-white/5 hover:bg-white/10'
                )}
              >
                <div className="flex items-center gap-2 mb-1">
                  <LayoutTemplate size={14} className="text-zinc-400" />
                  <span className="text-sm font-medium text-white">{t.label}</span>
                </div>
                <span className="text-xs text-zinc-500">{t.desc}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Open House date/time */}
        {template === 'open-house' && (
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs text-zinc-400 mb-1">Date</label>
              <input
                type="date"
                value={openHouseDate}
                onChange={(e) => setOpenHouseDate(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-sm text-white focus:outline-none focus:border-violet-500/30"
              />
            </div>
            <div>
              <label className="block text-xs text-zinc-400 mb-1">Time</label>
              <input
                type="time"
                value={openHouseTime}
                onChange={(e) => setOpenHouseTime(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-sm text-white focus:outline-none focus:border-violet-500/30"
              />
            </div>
          </div>
        )}

        {/* Agent Info */}
        <div>
          <label className="block text-sm font-medium text-zinc-300 mb-2">Agent Information</label>
          <div className="grid grid-cols-2 gap-2">
            <input
              placeholder="Your Name"
              value={agentInfo.agentName}
              onChange={(e) => setAgentInfo((p: any) => ({ ...p, agentName: e.target.value }))}
              className="px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-violet-500/30"
            />
            <input
              placeholder="Phone"
              value={agentInfo.agentPhone}
              onChange={(e) => setAgentInfo((p: any) => ({ ...p, agentPhone: e.target.value }))}
              className="px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-violet-500/30"
            />
            <input
              placeholder="Email"
              value={agentInfo.agentEmail}
              onChange={(e) => setAgentInfo((p: any) => ({ ...p, agentEmail: e.target.value }))}
              className="px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-violet-500/30"
            />
            <input
              placeholder="Brokerage"
              value={agentInfo.brokerage}
              onChange={(e) => setAgentInfo((p: any) => ({ ...p, brokerage: e.target.value }))}
              className="px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-violet-500/30"
            />
          </div>
        </div>

        {/* Generate Button */}
        <button
          onClick={handleGenerate}
          disabled={isGenerating || !hasCredits}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-violet-600 text-white font-medium hover:bg-violet-500 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {isGenerating ? (
            <>
              <RefreshCw size={16} className="animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Zap size={16} />
              Generate Flyer Copy — {creditCost} credit
            </>
          )}
        </button>

        {error && <p className="text-sm text-red-400">{error}</p>}
      </div>

      {/* Flyer Preview */}
      <div className="rounded-2xl border border-white/10 bg-zinc-900/50 p-5 min-h-[400px] flex flex-col">
        {flyerCopy ? (
          <>
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-medium text-zinc-300">Flyer Preview — {FLYER_TEMPLATE_LABELS[template]}</h4>
              <div className="flex items-center gap-1">
                <button
                  onClick={handleCopyText}
                  className="p-1.5 rounded-lg text-zinc-500 hover:text-white hover:bg-white/5 transition-colors"
                >
                  {copied ? <Check size={14} className="text-green-400" /> : <Copy size={14} />}
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

            {/* Rendered Flyer (letter-size aspect ratio 8.5:11) */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex-1 rounded-xl overflow-hidden bg-white text-zinc-900"
              style={{ aspectRatio: '8.5/11', maxHeight: 600 }}
            >
              {/* Hero image */}
              <div className="relative h-[45%] bg-zinc-200 overflow-hidden">
                {property.thumbnailUrl ? (
                  <img
                    src={property.thumbnailUrl}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-violet-200 to-purple-300 flex items-center justify-center">
                    <span className="text-violet-600/50 text-lg font-semibold">Property Photo</span>
                  </div>
                )}
                {template === 'luxury' && (
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-6">
                    <h2 className="text-white text-2xl font-bold font-serif">{flyerCopy.headline}</h2>
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="p-5 flex flex-col justify-between" style={{ height: '55%' }}>
                {template !== 'luxury' && (
                  <h2 className="text-xl font-bold font-serif text-zinc-900 mb-2">
                    {flyerCopy.headline}
                  </h2>
                )}

                <div className="text-xs text-zinc-500 font-medium mb-2">
                  {property.address}, {property.city}, {property.state} {property.zipCode}
                </div>

                {price && (
                  <div className="text-lg font-bold text-violet-700 mb-2">{price}</div>
                )}

                {details && (
                  <div className="text-xs text-zinc-600 font-medium mb-3">{details}</div>
                )}

                <p className="text-sm text-zinc-700 leading-relaxed mb-3">
                  {flyerCopy.body}
                </p>

                {template === 'open-house' && openHouseDate && (
                  <div className="px-3 py-2 rounded-lg bg-violet-50 border border-violet-100 text-sm text-violet-800 font-medium mb-3">
                    Open House: {openHouseDate} {openHouseTime && `at ${openHouseTime}`}
                  </div>
                )}

                <p className="text-xs text-violet-600 font-semibold italic mb-4">
                  {flyerCopy.tagline}
                </p>

                {/* Agent info footer */}
                <div className="mt-auto pt-3 border-t border-zinc-200 flex items-center justify-between">
                  <div className="text-xs text-zinc-600">
                    {agentInfo.agentName && <div className="font-semibold text-zinc-800">{agentInfo.agentName}</div>}
                    {agentInfo.agentPhone && <div>{agentInfo.agentPhone}</div>}
                    {agentInfo.agentEmail && <div>{agentInfo.agentEmail}</div>}
                  </div>
                  {agentInfo.brokerage && (
                    <div className="text-[10px] text-zinc-400 text-right">{agentInfo.brokerage}</div>
                  )}
                </div>
              </div>
            </motion.div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-sm text-zinc-600">
            Select a template and generate flyer copy
          </div>
        )}
      </div>
    </div>
  );
}
