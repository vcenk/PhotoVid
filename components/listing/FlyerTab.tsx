import { useState, useEffect, useRef, useCallback } from 'react';
import { Property } from '@/lib/store/contexts/PropertyContext';
import { useToolGeneration } from '@/lib/hooks/useToolGeneration';
import { generateFlyerCopy } from '@/lib/api/listingContent';
import type { FlyerTemplate, FlyerOptions, FlyerCopy } from '@/lib/types/listing';
import { FLYER_TEMPLATE_LABELS } from '@/lib/types/listing';
import { motion } from 'framer-motion';
import { Copy, RefreshCw, Check, Zap, LayoutTemplate, Download, Image as ImageIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import html2canvas from 'html2canvas';
import { createClient } from '@/lib/database/client';

const AGENT_STORAGE_KEY = 'photovid_agent_info';

interface FlyerTabProps {
  property: Property;
  onGenerated?: () => void;
}

const TEMPLATES: { value: FlyerTemplate; label: string; desc: string }[] = [
  { value: 'classic', label: 'Classic', desc: 'Clean photo top, details below' },
  { value: 'modern-grid', label: 'Modern Grid', desc: 'Multi-photo mosaic layout' },
  { value: 'luxury', label: 'Luxury', desc: 'Full-bleed hero, dark overlay' },
  { value: 'open-house', label: 'Open House', desc: 'Event-focused with date/time' },
  { value: 'minimal', label: 'Minimal', desc: 'Whitespace-focused, clean' },
  { value: 'bold', label: 'Bold', desc: 'Strong typography, vibrant' },
  { value: 'photo-strip', label: 'Photo Strip', desc: 'Vertical photo gallery' },
  { value: 'elegant', label: 'Elegant', desc: 'Sophisticated with accents' },
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
  const [isDownloading, setIsDownloading] = useState(false);
  const previewRef = useRef<HTMLDivElement>(null);

  // Get all available images from property
  const availableImages = [
    ...(property.thumbnailUrl ? [property.thumbnailUrl] : []),
    ...(property.assets?.filter(a => a.type === 'image').map(a => a.url) || []),
  ].filter((url, index, self) => self.indexOf(url) === index);

  const [selectedImageUrl, setSelectedImageUrl] = useState(availableImages[0] || '');

  // Update selected image when property changes
  useEffect(() => {
    if (availableImages.length > 0 && (!selectedImageUrl || !availableImages.includes(selectedImageUrl))) {
      setSelectedImageUrl(availableImages[0]);
    }
  }, [property.id, property.thumbnailUrl, property.assets?.length]);

  const { isGenerating, hasCredits, creditCost, generate, error } = useToolGeneration({
    toolId: 'listing-flyer',
  });

  // Persist agent info
  useEffect(() => {
    try {
      localStorage.setItem(AGENT_STORAGE_KEY, JSON.stringify(agentInfo));
    } catch { /* ignore */ }
  }, [agentInfo]);

  // Convert image URL to base64 for html2canvas (uses proxy to bypass CORS)
  const imageToBase64 = useCallback(async (url: string): Promise<string | null> => {
    // First try direct fetch (works for same-origin or CORS-enabled)
    try {
      const response = await fetch(url);
      if (response.ok) {
        const blob = await response.blob();
        return new Promise((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.onerror = () => resolve(null);
          reader.readAsDataURL(blob);
        });
      }
    } catch {
      // Direct fetch failed, try proxy
    }

    // Use Supabase edge function proxy
    try {
      const supabase = createClient();
      if (!supabase) return null;

      const { data, error } = await supabase.functions.invoke('proxy-image', {
        body: { url },
      });

      if (error) throw error;
      return data?.dataUrl || null;
    } catch (err) {
      console.warn('Failed to fetch image via proxy:', err);
      return null;
    }
  }, []);

  const handleDownloadImage = useCallback(async () => {
    if (!previewRef.current) return;
    setIsDownloading(true);
    try {
      // Pre-fetch and convert all images to base64
      const imageUrls = availableImages.slice(0, 4);
      const base64Map: Record<string, string> = {};

      for (const url of imageUrls) {
        const base64 = await imageToBase64(url);
        if (base64) base64Map[url] = base64;
      }

      const canvas = await html2canvas(previewRef.current, {
        backgroundColor: '#ffffff',
        scale: 2,
        useCORS: false,
        allowTaint: true,
        logging: false,
        imageTimeout: 15000,
        onclone: (clonedDoc) => {
          // Replace images with base64 versions
          const imgs = clonedDoc.querySelectorAll('img');
          imgs.forEach((img) => {
            for (const [url, base64] of Object.entries(base64Map)) {
              if (img.src === url || img.src.includes(url.split('/').pop() || '')) {
                img.src = base64;
                break;
              }
            }
          });
        },
      });
      const link = document.createElement('a');
      link.download = `flyer-${template}-${Date.now()}.jpg`;
      link.href = canvas.toDataURL('image/jpeg', 0.95);
      link.click();
    } catch (err) {
      console.error('Failed to download flyer:', err);
      alert('Download failed. Please try again.');
    } finally {
      setIsDownloading(false);
    }
  }, [template, availableImages, imageToBase64]);

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
  const address = `${property.address}, ${property.city}, ${property.state} ${property.zipCode}`;

  // Template-specific rendering
  const renderFlyerContent = () => {
    if (!flyerCopy) return null;

    const photos = availableImages.slice(0, 4);

    switch (template) {
      case 'classic':
        return (
          <div className="h-full flex flex-col" style={{ backgroundColor: '#ffffff' }}>
            {/* Hero image */}
            <div className="h-[40%] overflow-hidden">
              {selectedImageUrl ? (
                <img src={selectedImageUrl} alt="" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-emerald-200 to-teal-300 flex items-center justify-center">
                  <span className="text-emerald-600/50 text-lg font-semibold">Property Photo</span>
                </div>
              )}
            </div>
            {/* Content */}
            <div className="flex-1 p-5 flex flex-col">
              <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#18181b', marginBottom: '8px', fontFamily: 'serif' }}>
                {flyerCopy.headline}
              </h2>
              <div style={{ fontSize: '11px', color: '#71717a', marginBottom: '8px' }}>{address}</div>
              {price && <div style={{ fontSize: '20px', fontWeight: 700, color: '#059669', marginBottom: '8px' }}>{price}</div>}
              {details && <div style={{ fontSize: '11px', color: '#52525b', fontWeight: 500, marginBottom: '12px' }}>{details}</div>}
              <p style={{ fontSize: '12px', color: '#3f3f46', lineHeight: 1.6, marginBottom: '12px' }}>{flyerCopy.body}</p>
              {template === 'open-house' && openHouseDate && (
                <div style={{ padding: '8px 12px', borderRadius: '8px', backgroundColor: '#ecfdf5', border: '1px solid #a7f3d0', fontSize: '12px', color: '#065f46', fontWeight: 500, marginBottom: '12px' }}>
                  Open House: {openHouseDate} {openHouseTime && `at ${openHouseTime}`}
                </div>
              )}
              <p style={{ fontSize: '11px', color: '#059669', fontWeight: 600, fontStyle: 'italic', marginBottom: '16px' }}>{flyerCopy.tagline}</p>
              {/* Agent footer */}
              <div className="mt-auto pt-3" style={{ borderTop: '1px solid #e4e4e7' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ fontSize: '10px', color: '#52525b' }}>
                    {agentInfo.agentName && <div style={{ fontWeight: 600, color: '#27272a' }}>{agentInfo.agentName}</div>}
                    {agentInfo.agentPhone && <div>{agentInfo.agentPhone}</div>}
                    {agentInfo.agentEmail && <div>{agentInfo.agentEmail}</div>}
                  </div>
                  {agentInfo.brokerage && <div style={{ fontSize: '9px', color: '#a1a1aa', textAlign: 'right' }}>{agentInfo.brokerage}</div>}
                </div>
              </div>
            </div>
          </div>
        );

      case 'modern-grid':
        return (
          <div className="h-full flex flex-col" style={{ backgroundColor: '#fafafa' }}>
            {/* Photo grid */}
            <div className="h-[45%] grid grid-cols-2 gap-1 p-1">
              {photos.slice(0, 4).map((url, i) => (
                <div key={i} className="overflow-hidden rounded">
                  <img src={url} alt="" className="w-full h-full object-cover" />
                </div>
              ))}
              {photos.length < 4 && Array.from({ length: 4 - photos.length }).map((_, i) => (
                <div key={`empty-${i}`} className="rounded" style={{ backgroundColor: '#e4e4e7' }} />
              ))}
            </div>
            {/* Content with colored accent */}
            <div className="flex-1 p-5 flex flex-col">
              <div style={{ width: '40px', height: '3px', backgroundColor: '#059669', marginBottom: '12px' }} />
              <h2 style={{ fontSize: '16px', fontWeight: 700, color: '#18181b', marginBottom: '6px' }}>{flyerCopy.headline}</h2>
              <div style={{ fontSize: '10px', color: '#71717a', marginBottom: '6px' }}>{address}</div>
              <div style={{ display: 'flex', gap: '12px', marginBottom: '10px', alignItems: 'baseline' }}>
                {price && <span style={{ fontSize: '18px', fontWeight: 700, color: '#059669' }}>{price}</span>}
                {details && <span style={{ fontSize: '10px', color: '#52525b' }}>{details}</span>}
              </div>
              <p style={{ fontSize: '11px', color: '#3f3f46', lineHeight: 1.5, marginBottom: '10px' }}>{flyerCopy.body}</p>
              <p style={{ fontSize: '10px', color: '#059669', fontWeight: 600, fontStyle: 'italic' }}>{flyerCopy.tagline}</p>
              <div className="mt-auto pt-3" style={{ borderTop: '1px solid #e4e4e7', display: 'flex', justifyContent: 'space-between' }}>
                <div style={{ fontSize: '9px', color: '#52525b' }}>
                  {agentInfo.agentName && <div style={{ fontWeight: 600 }}>{agentInfo.agentName}</div>}
                  <div>{[agentInfo.agentPhone, agentInfo.agentEmail].filter(Boolean).join(' | ')}</div>
                </div>
                {agentInfo.brokerage && <div style={{ fontSize: '8px', color: '#a1a1aa' }}>{agentInfo.brokerage}</div>}
              </div>
            </div>
          </div>
        );

      case 'luxury':
        return (
          <div className="h-full relative" style={{ backgroundColor: '#18181b' }}>
            {/* Full bleed image with overlay */}
            <div className="absolute inset-0">
              {selectedImageUrl ? (
                <img src={selectedImageUrl} alt="" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-zinc-700 to-zinc-900" />
              )}
              <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.4) 50%, rgba(0,0,0,0.2) 100%)' }} />
            </div>
            {/* Content overlay */}
            <div className="relative h-full flex flex-col justify-end p-6">
              <div style={{ borderLeft: '2px solid #d4af37', paddingLeft: '16px', marginBottom: '16px' }}>
                <h2 style={{ fontSize: '22px', fontWeight: 300, color: '#ffffff', letterSpacing: '1px', marginBottom: '8px', fontFamily: 'serif' }}>
                  {flyerCopy.headline}
                </h2>
                <div style={{ fontSize: '11px', color: '#d4d4d8', letterSpacing: '0.5px' }}>{address}</div>
              </div>
              <div style={{ display: 'flex', gap: '16px', marginBottom: '12px' }}>
                {price && <span style={{ fontSize: '24px', fontWeight: 300, color: '#d4af37' }}>{price}</span>}
              </div>
              {details && <div style={{ fontSize: '11px', color: '#a1a1aa', marginBottom: '12px', letterSpacing: '1px' }}>{details}</div>}
              <p style={{ fontSize: '11px', color: '#d4d4d8', lineHeight: 1.7, marginBottom: '12px', maxWidth: '90%' }}>{flyerCopy.body}</p>
              <p style={{ fontSize: '10px', color: '#d4af37', fontStyle: 'italic', marginBottom: '20px' }}>{flyerCopy.tagline}</p>
              <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '12px', display: 'flex', justifyContent: 'space-between' }}>
                <div style={{ fontSize: '9px', color: '#a1a1aa' }}>
                  {agentInfo.agentName && <div style={{ color: '#ffffff', fontWeight: 500 }}>{agentInfo.agentName}</div>}
                  <div>{[agentInfo.agentPhone, agentInfo.agentEmail].filter(Boolean).join(' | ')}</div>
                </div>
                {agentInfo.brokerage && <div style={{ fontSize: '8px', color: '#71717a' }}>{agentInfo.brokerage}</div>}
              </div>
            </div>
          </div>
        );

      case 'open-house':
        return (
          <div className="h-full flex flex-col" style={{ backgroundColor: '#ffffff' }}>
            {/* Event banner */}
            <div style={{ backgroundColor: '#059669', padding: '12px', textAlign: 'center' }}>
              <div style={{ fontSize: '11px', color: '#ffffff', fontWeight: 600, letterSpacing: '2px', textTransform: 'uppercase' }}>Open House</div>
              <div style={{ fontSize: '18px', color: '#ffffff', fontWeight: 700, marginTop: '4px' }}>
                {openHouseDate || 'Date TBD'} {openHouseTime && `• ${openHouseTime}`}
              </div>
            </div>
            {/* Image */}
            <div className="h-[35%] overflow-hidden">
              {selectedImageUrl ? (
                <img src={selectedImageUrl} alt="" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-emerald-100 to-teal-200" />
              )}
            </div>
            {/* Content */}
            <div className="flex-1 p-5 flex flex-col">
              <h2 style={{ fontSize: '16px', fontWeight: 700, color: '#18181b', marginBottom: '6px' }}>{flyerCopy.headline}</h2>
              <div style={{ fontSize: '10px', color: '#71717a', marginBottom: '8px' }}>{address}</div>
              <div style={{ display: 'flex', gap: '16px', alignItems: 'baseline', marginBottom: '10px' }}>
                {price && <span style={{ fontSize: '20px', fontWeight: 700, color: '#059669' }}>{price}</span>}
                {details && <span style={{ fontSize: '10px', color: '#52525b' }}>{details}</span>}
              </div>
              <p style={{ fontSize: '11px', color: '#3f3f46', lineHeight: 1.5, marginBottom: '10px' }}>{flyerCopy.body}</p>
              <p style={{ fontSize: '10px', color: '#059669', fontStyle: 'italic' }}>{flyerCopy.tagline}</p>
              <div className="mt-auto pt-3" style={{ borderTop: '1px solid #e4e4e7' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <div style={{ fontSize: '9px', color: '#52525b' }}>
                    {agentInfo.agentName && <div style={{ fontWeight: 600, color: '#18181b' }}>{agentInfo.agentName}</div>}
                    <div>{[agentInfo.agentPhone, agentInfo.agentEmail].filter(Boolean).join(' | ')}</div>
                  </div>
                  {agentInfo.brokerage && <div style={{ fontSize: '8px', color: '#a1a1aa' }}>{agentInfo.brokerage}</div>}
                </div>
              </div>
            </div>
          </div>
        );

      case 'minimal':
        return (
          <div className="h-full flex flex-col p-8" style={{ backgroundColor: '#ffffff' }}>
            {/* Minimal header */}
            <div style={{ marginBottom: '24px' }}>
              <div style={{ fontSize: '9px', color: '#a1a1aa', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '8px' }}>For Sale</div>
              <h2 style={{ fontSize: '20px', fontWeight: 400, color: '#18181b', lineHeight: 1.3, fontFamily: 'serif' }}>{flyerCopy.headline}</h2>
            </div>
            {/* Centered image */}
            <div className="flex-1 overflow-hidden rounded-lg" style={{ marginBottom: '24px' }}>
              {selectedImageUrl ? (
                <img src={selectedImageUrl} alt="" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full" style={{ backgroundColor: '#f4f4f5' }} />
              )}
            </div>
            {/* Minimal info */}
            <div style={{ textAlign: 'center' }}>
              {price && <div style={{ fontSize: '28px', fontWeight: 300, color: '#18181b', marginBottom: '8px' }}>{price}</div>}
              <div style={{ fontSize: '10px', color: '#71717a', marginBottom: '4px' }}>{address}</div>
              {details && <div style={{ fontSize: '10px', color: '#a1a1aa', marginBottom: '16px' }}>{details}</div>}
              <p style={{ fontSize: '11px', color: '#52525b', lineHeight: 1.6, marginBottom: '16px', maxWidth: '90%', margin: '0 auto 16px' }}>{flyerCopy.body}</p>
            </div>
            {/* Footer */}
            <div style={{ textAlign: 'center', fontSize: '9px', color: '#71717a', borderTop: '1px solid #f4f4f5', paddingTop: '12px' }}>
              {agentInfo.agentName && <span style={{ fontWeight: 500, color: '#18181b' }}>{agentInfo.agentName}</span>}
              {agentInfo.agentPhone && <span> • {agentInfo.agentPhone}</span>}
            </div>
          </div>
        );

      case 'bold':
        return (
          <div className="h-full flex flex-col" style={{ backgroundColor: '#18181b' }}>
            {/* Bold header */}
            <div style={{ padding: '20px', backgroundColor: '#059669' }}>
              <h2 style={{ fontSize: '22px', fontWeight: 900, color: '#ffffff', textTransform: 'uppercase', letterSpacing: '1px', lineHeight: 1.2 }}>
                {flyerCopy.headline}
              </h2>
            </div>
            {/* Image */}
            <div className="h-[40%] overflow-hidden">
              {selectedImageUrl ? (
                <img src={selectedImageUrl} alt="" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full" style={{ backgroundColor: '#27272a' }} />
              )}
            </div>
            {/* Content on dark */}
            <div className="flex-1 p-5 flex flex-col">
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px', marginBottom: '8px' }}>
                {price && <span style={{ fontSize: '28px', fontWeight: 900, color: '#10b981' }}>{price}</span>}
              </div>
              <div style={{ fontSize: '10px', color: '#a1a1aa', marginBottom: '4px' }}>{address}</div>
              {details && <div style={{ fontSize: '12px', color: '#ffffff', fontWeight: 600, marginBottom: '12px' }}>{details}</div>}
              <p style={{ fontSize: '11px', color: '#d4d4d8', lineHeight: 1.5, marginBottom: '10px' }}>{flyerCopy.body}</p>
              <p style={{ fontSize: '10px', color: '#10b981', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px' }}>{flyerCopy.tagline}</p>
              <div className="mt-auto pt-3" style={{ borderTop: '1px solid #27272a' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <div style={{ fontSize: '9px', color: '#a1a1aa' }}>
                    {agentInfo.agentName && <div style={{ color: '#ffffff', fontWeight: 700 }}>{agentInfo.agentName}</div>}
                    <div>{[agentInfo.agentPhone, agentInfo.agentEmail].filter(Boolean).join(' | ')}</div>
                  </div>
                  {agentInfo.brokerage && <div style={{ fontSize: '8px', color: '#52525b' }}>{agentInfo.brokerage}</div>}
                </div>
              </div>
            </div>
          </div>
        );

      case 'photo-strip':
        return (
          <div className="h-full flex" style={{ backgroundColor: '#ffffff' }}>
            {/* Photo strip left */}
            <div className="w-[35%] flex flex-col gap-1 p-1">
              {photos.slice(0, 3).map((url, i) => (
                <div key={i} className="flex-1 overflow-hidden rounded">
                  <img src={url} alt="" className="w-full h-full object-cover" />
                </div>
              ))}
              {photos.length < 3 && Array.from({ length: 3 - photos.length }).map((_, i) => (
                <div key={`empty-${i}`} className="flex-1 rounded" style={{ backgroundColor: '#f4f4f5' }} />
              ))}
            </div>
            {/* Content right */}
            <div className="flex-1 p-5 flex flex-col">
              <div style={{ width: '30px', height: '2px', backgroundColor: '#059669', marginBottom: '12px' }} />
              <h2 style={{ fontSize: '16px', fontWeight: 600, color: '#18181b', marginBottom: '8px', fontFamily: 'serif' }}>{flyerCopy.headline}</h2>
              <div style={{ fontSize: '10px', color: '#71717a', marginBottom: '8px' }}>{address}</div>
              {price && <div style={{ fontSize: '22px', fontWeight: 700, color: '#059669', marginBottom: '6px' }}>{price}</div>}
              {details && <div style={{ fontSize: '10px', color: '#52525b', fontWeight: 500, marginBottom: '12px' }}>{details}</div>}
              <p style={{ fontSize: '10px', color: '#3f3f46', lineHeight: 1.6, marginBottom: '12px' }}>{flyerCopy.body}</p>
              <p style={{ fontSize: '9px', color: '#059669', fontStyle: 'italic' }}>{flyerCopy.tagline}</p>
              <div className="mt-auto pt-3" style={{ borderTop: '1px solid #e4e4e7' }}>
                <div style={{ fontSize: '8px', color: '#52525b' }}>
                  {agentInfo.agentName && <div style={{ fontWeight: 600, color: '#18181b' }}>{agentInfo.agentName}</div>}
                  <div>{[agentInfo.agentPhone, agentInfo.agentEmail].filter(Boolean).join(' | ')}</div>
                  {agentInfo.brokerage && <div style={{ color: '#a1a1aa', marginTop: '2px' }}>{agentInfo.brokerage}</div>}
                </div>
              </div>
            </div>
          </div>
        );

      case 'elegant':
        return (
          <div className="h-full flex flex-col p-4" style={{ backgroundColor: '#fefefe' }}>
            {/* Elegant border frame */}
            <div className="flex-1 flex flex-col" style={{ border: '1px solid #d4d4d8', padding: '16px' }}>
              {/* Image with gold accent */}
              <div className="h-[38%] overflow-hidden relative" style={{ marginBottom: '16px' }}>
                {selectedImageUrl ? (
                  <img src={selectedImageUrl} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full" style={{ backgroundColor: '#f4f4f5' }} />
                )}
                <div className="absolute bottom-0 left-0 right-0" style={{ height: '3px', backgroundColor: '#b8860b' }} />
              </div>
              {/* Content */}
              <div className="flex-1 flex flex-col">
                <h2 style={{ fontSize: '17px', fontWeight: 400, color: '#18181b', marginBottom: '8px', fontFamily: 'serif', letterSpacing: '0.5px' }}>
                  {flyerCopy.headline}
                </h2>
                <div style={{ fontSize: '10px', color: '#71717a', marginBottom: '10px' }}>{address}</div>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'baseline', marginBottom: '10px' }}>
                  {price && <span style={{ fontSize: '20px', fontWeight: 500, color: '#b8860b' }}>{price}</span>}
                  {details && <span style={{ fontSize: '10px', color: '#71717a' }}>{details}</span>}
                </div>
                <p style={{ fontSize: '10px', color: '#3f3f46', lineHeight: 1.6, marginBottom: '10px' }}>{flyerCopy.body}</p>
                <p style={{ fontSize: '9px', color: '#b8860b', fontStyle: 'italic' }}>{flyerCopy.tagline}</p>
                <div className="mt-auto pt-3" style={{ borderTop: '1px solid #e4e4e7' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                    <div style={{ fontSize: '8px', color: '#52525b' }}>
                      {agentInfo.agentName && <div style={{ fontWeight: 500, color: '#18181b', fontSize: '9px' }}>{agentInfo.agentName}</div>}
                      <div>{[agentInfo.agentPhone, agentInfo.agentEmail].filter(Boolean).join(' | ')}</div>
                    </div>
                    {agentInfo.brokerage && <div style={{ fontSize: '8px', color: '#a1a1aa', fontStyle: 'italic' }}>{agentInfo.brokerage}</div>}
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Config Panel */}
      <div className="space-y-5">
        {/* Template selector */}
        <div>
          <label className="block text-sm font-medium text-zinc-600 dark:text-zinc-300 mb-2">Template</label>
          <div className="grid grid-cols-2 gap-2">
            {TEMPLATES.map((t) => (
              <button
                key={t.value}
                onClick={() => setTemplate(t.value)}
                className={cn(
                  'flex flex-col items-start p-3 rounded-xl border text-left transition-all',
                  template === t.value
                    ? 'border-emerald-500/30 bg-emerald-500/10'
                    : 'border-zinc-200 dark:border-white/5 bg-zinc-50 dark:bg-white/5 hover:bg-zinc-100 dark:hover:bg-white/10'
                )}
              >
                <div className="flex items-center gap-2 mb-1">
                  <LayoutTemplate size={14} className="text-zinc-400" />
                  <span className="text-sm font-medium text-zinc-900 dark:text-white">{t.label}</span>
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
                className="w-full px-3 py-2 rounded-lg bg-zinc-50 dark:bg-white/5 border border-zinc-200 dark:border-white/10 text-sm text-zinc-900 dark:text-white focus:outline-none focus:border-emerald-500/30"
              />
            </div>
            <div>
              <label className="block text-xs text-zinc-400 mb-1">Time</label>
              <input
                type="time"
                value={openHouseTime}
                onChange={(e) => setOpenHouseTime(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-zinc-50 dark:bg-white/5 border border-zinc-200 dark:border-white/10 text-sm text-zinc-900 dark:text-white focus:outline-none focus:border-emerald-500/30"
              />
            </div>
          </div>
        )}

        {/* Photo Selector */}
        {availableImages.length > 0 && (
          <div>
            <label className="block text-sm font-medium text-zinc-600 dark:text-zinc-300 mb-2">
              <span className="flex items-center gap-1.5">
                <ImageIcon size={14} />
                Main Photo
              </span>
            </label>
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin">
              {availableImages.map((url, index) => (
                <button
                  key={url}
                  onClick={() => setSelectedImageUrl(url)}
                  className={cn(
                    'relative flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all',
                    selectedImageUrl === url
                      ? 'border-emerald-500 ring-2 ring-emerald-500/30'
                      : 'border-transparent hover:border-zinc-400 dark:hover:border-zinc-600'
                  )}
                >
                  <img src={url} alt={`Photo ${index + 1}`} className="w-full h-full object-cover" />
                  {selectedImageUrl === url && (
                    <div className="absolute inset-0 bg-emerald-500/20 flex items-center justify-center">
                      <Check size={16} className="text-white drop-shadow-lg" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Agent Info */}
        <div>
          <label className="block text-sm font-medium text-zinc-600 dark:text-zinc-300 mb-2">Agent Information</label>
          <div className="grid grid-cols-2 gap-2">
            <input
              placeholder="Your Name"
              value={agentInfo.agentName}
              onChange={(e) => setAgentInfo((p: any) => ({ ...p, agentName: e.target.value }))}
              className="px-3 py-2 rounded-lg bg-zinc-50 dark:bg-white/5 border border-zinc-200 dark:border-white/10 text-sm text-zinc-900 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-600 focus:outline-none focus:border-emerald-500/30"
            />
            <input
              placeholder="Phone"
              value={agentInfo.agentPhone}
              onChange={(e) => setAgentInfo((p: any) => ({ ...p, agentPhone: e.target.value }))}
              className="px-3 py-2 rounded-lg bg-zinc-50 dark:bg-white/5 border border-zinc-200 dark:border-white/10 text-sm text-zinc-900 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-600 focus:outline-none focus:border-emerald-500/30"
            />
            <input
              placeholder="Email"
              value={agentInfo.agentEmail}
              onChange={(e) => setAgentInfo((p: any) => ({ ...p, agentEmail: e.target.value }))}
              className="px-3 py-2 rounded-lg bg-zinc-50 dark:bg-white/5 border border-zinc-200 dark:border-white/10 text-sm text-zinc-900 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-600 focus:outline-none focus:border-emerald-500/30"
            />
            <input
              placeholder="Brokerage"
              value={agentInfo.brokerage}
              onChange={(e) => setAgentInfo((p: any) => ({ ...p, brokerage: e.target.value }))}
              className="px-3 py-2 rounded-lg bg-zinc-50 dark:bg-white/5 border border-zinc-200 dark:border-white/10 text-sm text-zinc-900 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-600 focus:outline-none focus:border-emerald-500/30"
            />
          </div>
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
              Generate Flyer Copy — {creditCost} credit
            </>
          )}
        </button>

        {error && <p className="text-sm text-red-400">{error}</p>}
      </div>

      {/* Flyer Preview */}
      <div className="rounded-2xl border border-zinc-200 dark:border-white/10 bg-white dark:bg-zinc-900/50 p-5 min-h-[400px] flex flex-col">
        {flyerCopy ? (
          <>
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-medium text-zinc-600 dark:text-zinc-300">Flyer Preview — {FLYER_TEMPLATE_LABELS[template]}</h4>
              <div className="flex items-center gap-1">
                <button
                  onClick={handleCopyText}
                  className="p-1.5 rounded-lg text-zinc-500 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-white/5 transition-colors"
                  title="Copy text"
                >
                  {copied ? <Check size={14} className="text-green-400" /> : <Copy size={14} />}
                </button>
                <button
                  onClick={handleDownloadImage}
                  disabled={isDownloading}
                  className="p-1.5 rounded-lg text-zinc-500 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-white/5 transition-colors disabled:opacity-40"
                  title="Download as image"
                >
                  <Download size={14} className={isDownloading ? 'animate-pulse' : ''} />
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

            {/* Rendered Flyer (letter-size aspect ratio 8.5:11) */}
            <motion.div
              ref={previewRef}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex-1 rounded-xl overflow-hidden"
              style={{ aspectRatio: '8.5/11', maxHeight: 600 }}
            >
              {renderFlyerContent()}
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
