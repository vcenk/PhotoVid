import React, { useState, useCallback, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Sparkles,
  Download,
  Loader2,
  AlertCircle,
  Zap,
  BookmarkPlus,
  Instagram,
  Facebook,
  Linkedin,
  Type,
  Layout,
  MapPin,
  DollarSign,
  User,
  Building2,
  Check,
  UploadCloud,
  X,
  Bed,
  Bath,
  Square,
  Wand2,
  Eye,
  Phone,
  Mail,
  Globe,
  AtSign,
  MessageSquare,
  RefreshCw,
} from 'lucide-react';
import { AssetProvider, useAssets } from '@/lib/store/contexts/AssetContext';
import { NavigationRail } from '../../dashboard/navigation/NavigationRail';
import { useCredits } from '@/lib/store/contexts/CreditsContext';
import { toPng } from 'html-to-image';

// ============ ANIMATION STYLES ============

const AnimationStyles = () => (
  <style>{`
    @keyframes slideInLeft {
      from { opacity: 0; transform: translateX(-30px); }
      to { opacity: 1; transform: translateX(0); }
    }
    @keyframes slideInRight {
      from { opacity: 0; transform: translateX(30px); }
      to { opacity: 1; transform: translateX(0); }
    }
    @keyframes slideInUp {
      from { opacity: 0; transform: translateY(30px); }
      to { opacity: 1; transform: translateY(0); }
    }
    @keyframes slideInDown {
      from { opacity: 0; transform: translateY(-30px); }
      to { opacity: 1; transform: translateY(0); }
    }
    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
    @keyframes scaleIn {
      from { opacity: 0; transform: scale(0.8); }
      to { opacity: 1; transform: scale(1); }
    }
    @keyframes bounceIn {
      0% { opacity: 0; transform: scale(0.3); }
      50% { transform: scale(1.05); }
      70% { transform: scale(0.9); }
      100% { opacity: 1; transform: scale(1); }
    }
    @keyframes expandWidth {
      from { width: 0; }
      to { width: 100%; }
    }
    @keyframes neonPulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.7; }
    }
    @keyframes neonFlicker {
      0%, 19%, 21%, 23%, 25%, 54%, 56%, 100% { opacity: 1; }
      20%, 24%, 55% { opacity: 0.6; }
    }
    .animate-slideInLeft {
      animation: slideInLeft 0.6s ease-out forwards;
    }
    .animate-slideInRight {
      animation: slideInRight 0.6s ease-out forwards;
    }
    .animate-slideInUp {
      animation: slideInUp 0.6s ease-out forwards;
    }
    .animate-slideInDown {
      animation: slideInDown 0.6s ease-out forwards;
    }
    .animate-fadeIn {
      animation: fadeIn 0.6s ease-out forwards;
    }
    .animate-scaleIn {
      animation: scaleIn 0.5s ease-out forwards;
    }
    .animate-bounceIn {
      animation: bounceIn 0.6s ease-out forwards;
    }
    .animate-expandWidth {
      animation: expandWidth 0.8s ease-out forwards;
    }
    .animate-neonPulse {
      animation: neonPulse 2s ease-in-out infinite;
    }
    .animate-neonFlicker {
      animation: neonFlicker 3s linear infinite;
    }
    .animation-delay-100 { animation-delay: 0.1s; opacity: 0; }
    .animation-delay-200 { animation-delay: 0.2s; opacity: 0; }
    .animation-delay-300 { animation-delay: 0.3s; opacity: 0; }
    .animation-delay-400 { animation-delay: 0.4s; opacity: 0; }
    .animation-delay-500 { animation-delay: 0.5s; opacity: 0; }
    .animation-delay-600 { animation-delay: 0.6s; opacity: 0; }
    .custom-scrollbar::-webkit-scrollbar {
      width: 4px;
    }
    .custom-scrollbar::-webkit-scrollbar-track {
      background: transparent;
    }
    .custom-scrollbar::-webkit-scrollbar-thumb {
      background: rgba(255,255,255,0.1);
      border-radius: 4px;
    }
    .custom-scrollbar::-webkit-scrollbar-thumb:hover {
      background: rgba(255,255,255,0.2);
    }
  `}</style>
);

// ============ TYPES ============

type PlatformId = 'instagram-square' | 'instagram-story' | 'facebook-post' | 'linkedin-post';
type TemplateId = 'modern-banner' | 'elegant-frame' | 'bold-diagonal' | 'minimal-bottom' | 'luxury-overlay' | 'gradient-fade' | 'split-screen' | 'corner-accent' | 'floating-card' | 'neon-glow' | 'magazine-cover' | 'polaroid-style';
type PosterType = 'just-listed' | 'open-house' | 'price-reduced' | 'sold' | 'coming-soon' | 'new-listing' | 'custom';

interface Platform {
  id: PlatformId;
  label: string;
  icon: React.ReactNode;
  width: number;
  height: number;
}

interface PosterTemplate {
  id: TemplateId;
  name: string;
  description: string;
  preview: string; // Color for preview
}

// ============ DATA ============

const PLATFORMS: Platform[] = [
  { id: 'instagram-square', label: 'Instagram Square', icon: <Instagram className="w-4 h-4" />, width: 1080, height: 1080 },
  { id: 'instagram-story', label: 'Story/Reels', icon: <Instagram className="w-4 h-4" />, width: 1080, height: 1920 },
  { id: 'facebook-post', label: 'Facebook Post', icon: <Facebook className="w-4 h-4" />, width: 1200, height: 630 },
  { id: 'linkedin-post', label: 'LinkedIn Post', icon: <Linkedin className="w-4 h-4" />, width: 1200, height: 627 },
];

const TEMPLATES: PosterTemplate[] = [
  { id: 'modern-banner', name: 'Modern Banner', description: 'Clean top banner with property details', preview: '#3b82f6' },
  { id: 'elegant-frame', name: 'Elegant Frame', description: 'Sophisticated border frame design', preview: '#8b5cf6' },
  { id: 'bold-diagonal', name: 'Bold Diagonal', description: 'Eye-catching diagonal ribbon', preview: '#ef4444' },
  { id: 'minimal-bottom', name: 'Minimal Bottom', description: 'Simple bottom bar with info', preview: '#10b981' },
  { id: 'luxury-overlay', name: 'Luxury Overlay', description: 'Premium gradient overlay', preview: '#f59e0b' },
  { id: 'gradient-fade', name: 'Gradient Fade', description: 'Smooth gradient with centered text', preview: '#ec4899' },
  { id: 'split-screen', name: 'Split Screen', description: 'Half image, half content panel', preview: '#06b6d4' },
  { id: 'corner-accent', name: 'Corner Accent', description: 'Bold corner badge design', preview: '#84cc16' },
  { id: 'floating-card', name: 'Floating Card', description: 'Elevated card with shadow', preview: '#a855f7' },
  { id: 'neon-glow', name: 'Neon Glow', description: 'Vibrant neon border effect', preview: '#f43f5e' },
  { id: 'magazine-cover', name: 'Magazine Cover', description: 'Editorial magazine style', preview: '#0ea5e9' },
  { id: 'polaroid-style', name: 'Polaroid Style', description: 'Classic instant photo look', preview: '#fbbf24' },
];

const POSTER_TYPES: { id: PosterType; label: string; color: string }[] = [
  { id: 'just-listed', label: 'JUST LISTED', color: '#3b82f6' },
  { id: 'open-house', label: 'OPEN HOUSE', color: '#10b981' },
  { id: 'price-reduced', label: 'PRICE REDUCED', color: '#ef4444' },
  { id: 'sold', label: 'SOLD', color: '#f59e0b' },
  { id: 'coming-soon', label: 'COMING SOON', color: '#8b5cf6' },
  { id: 'new-listing', label: 'NEW LISTING', color: '#ec4899' },
  { id: 'custom', label: 'Custom', color: '#6b7280' },
];

// ============ TEMPLATE RENDERERS ============

interface TemplateProps {
  imageUrl: string;
  posterType: PosterType;
  customHeadline?: string;
  tagline?: string;
  price?: string;
  address?: string;
  beds?: string;
  baths?: string;
  sqft?: string;
  agentName?: string;
  brokerage?: string;
  phone?: string;
  email?: string;
  website?: string;
  socialHandle?: string;
  accentColor: string;
  platform: Platform;
}

const ModernBannerTemplate: React.FC<TemplateProps> = ({
  imageUrl, posterType, customHeadline, tagline, price, address, beds, baths, sqft, agentName, brokerage, phone, email, website, socialHandle, accentColor
}) => {
  const headline = customHeadline || POSTER_TYPES.find(p => p.id === posterType)?.label || 'JUST LISTED';
  const hasContact = phone || email || website || socialHandle;

  return (
    <div className="relative w-full h-full">
      <img src={imageUrl} alt="Property" className="w-full h-full object-cover" />

      {/* Top Banner */}
      <div className="absolute top-0 left-0 right-0 p-6" style={{ background: `linear-gradient(180deg, ${accentColor}ee 0%, ${accentColor}00 100%)` }}>
        <div className="text-white font-bold text-2xl tracking-wider animate-slideInDown">{headline}</div>
        {price && <div className="text-white text-4xl font-bold mt-2 animate-slideInDown animation-delay-100">{price}</div>}
        {tagline && <div className="text-white/90 text-sm mt-2 italic animate-fadeIn animation-delay-200">{tagline}</div>}
      </div>

      {/* Bottom Info Bar */}
      <div className="absolute bottom-0 left-0 right-0 p-6" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.9) 0%, transparent 100%)' }}>
        {address && <div className="text-white text-lg font-medium mb-2 animate-slideInUp">{address}</div>}
        <div className="flex items-center gap-4 text-white/90 text-sm animate-slideInUp animation-delay-100">
          {beds && <span className="flex items-center gap-1"><Bed className="w-4 h-4" /> {beds} Beds</span>}
          {baths && <span className="flex items-center gap-1"><Bath className="w-4 h-4" /> {baths} Baths</span>}
          {sqft && <span className="flex items-center gap-1"><Square className="w-4 h-4" /> {sqft} sqft</span>}
        </div>
        {(agentName || brokerage || hasContact) && (
          <div className="mt-3 pt-3 border-t border-white/20 text-white/80 text-sm animate-fadeIn animation-delay-300">
            <div>{agentName}{agentName && brokerage && ' | '}{brokerage}</div>
            {hasContact && (
              <div className="flex flex-wrap gap-3 mt-1 text-xs text-white/70">
                {phone && <span>{phone}</span>}
                {email && <span>{email}</span>}
                {website && <span>{website}</span>}
                {socialHandle && <span>@{socialHandle}</span>}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

const ElegantFrameTemplate: React.FC<TemplateProps> = ({
  imageUrl, posterType, customHeadline, tagline, price, address, beds, baths, sqft, agentName, brokerage, phone, email, website, socialHandle, accentColor
}) => {
  const headline = customHeadline || POSTER_TYPES.find(p => p.id === posterType)?.label || 'JUST LISTED';
  const hasContact = phone || email || website || socialHandle;

  return (
    <div className="relative w-full h-full bg-white">
      {/* Frame Border */}
      <div className="absolute inset-4 border-4 animate-scaleIn" style={{ borderColor: accentColor }} />

      {/* Image with padding */}
      <div className="absolute inset-8">
        <img src={imageUrl} alt="Property" className="w-full h-full object-cover" />
      </div>

      {/* Top Badge */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 px-8 py-3 text-white font-bold text-xl tracking-widest animate-slideInDown"
        style={{ backgroundColor: accentColor }}
      >
        {headline}
      </div>

      {/* Bottom Info */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4/5 bg-white px-6 py-4 text-center animate-slideInUp">
        {price && <div className="text-3xl font-bold mb-1" style={{ color: accentColor }}>{price}</div>}
        {address && <div className="text-gray-700 text-lg">{address}</div>}
        {tagline && <div className="text-gray-500 text-sm italic mt-1 max-w-xs mx-auto">{tagline}</div>}
        <div className="flex items-center justify-center gap-4 text-gray-600 text-sm mt-2">
          {beds && <span>{beds} Beds</span>}
          {baths && <span>{baths} Baths</span>}
          {sqft && <span>{sqft} sqft</span>}
        </div>
        {(agentName || brokerage || hasContact) && (
          <div className="mt-2 text-gray-500 text-sm">
            <div>{agentName}{agentName && brokerage && ' | '}{brokerage}</div>
            {hasContact && (
              <div className="flex flex-wrap justify-center gap-2 mt-1 text-xs text-gray-400">
                {phone && <span>{phone}</span>}
                {email && <span>{email}</span>}
                {website && <span>{website}</span>}
                {socialHandle && <span>@{socialHandle}</span>}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

const BoldDiagonalTemplate: React.FC<TemplateProps> = ({
  imageUrl, posterType, customHeadline, tagline, price, address, beds, baths, sqft, agentName, brokerage, phone, email, website, socialHandle, accentColor
}) => {
  const headline = customHeadline || POSTER_TYPES.find(p => p.id === posterType)?.label || 'JUST LISTED';
  const hasContact = phone || email || website || socialHandle;

  return (
    <div className="relative w-full h-full overflow-hidden">
      <img src={imageUrl} alt="Property" className="w-full h-full object-cover" />

      {/* Diagonal Ribbon */}
      <div
        className="absolute -left-20 top-12 w-96 py-4 text-center text-white font-bold text-xl tracking-wider shadow-lg animate-slideInLeft"
        style={{ backgroundColor: accentColor, transform: 'rotate(-35deg)' }}
      >
        {headline}
      </div>

      {/* Price Badge */}
      {price && (
        <div
          className="absolute top-6 right-6 px-6 py-3 text-white font-bold text-2xl rounded-lg shadow-lg animate-bounceIn animation-delay-200"
          style={{ backgroundColor: accentColor }}
        >
          {price}
        </div>
      )}

      {/* Bottom Info */}
      <div className="absolute bottom-0 left-0 right-0 p-6" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.6) 50%, transparent 100%)' }}>
        {address && <div className="text-white text-xl font-semibold mb-1 animate-slideInUp">{address}</div>}
        {tagline && <div className="text-white/80 text-sm italic mb-2 animate-fadeIn animation-delay-100">{tagline}</div>}
        <div className="flex items-center gap-4 text-white/90 animate-slideInUp animation-delay-100">
          {beds && <span className="flex items-center gap-1"><Bed className="w-4 h-4" /> {beds}</span>}
          {baths && <span className="flex items-center gap-1"><Bath className="w-4 h-4" /> {baths}</span>}
          {sqft && <span className="flex items-center gap-1"><Square className="w-4 h-4" /> {sqft}</span>}
        </div>
        {(agentName || brokerage || hasContact) && (
          <div className="mt-2 text-white/70 text-sm animate-fadeIn animation-delay-300">
            <div>{agentName}{agentName && brokerage && ' | '}{brokerage}</div>
            {hasContact && (
              <div className="flex flex-wrap gap-3 mt-1 text-xs text-white/60">
                {phone && <span>{phone}</span>}
                {email && <span>{email}</span>}
                {website && <span>{website}</span>}
                {socialHandle && <span>@{socialHandle}</span>}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

const MinimalBottomTemplate: React.FC<TemplateProps> = ({
  imageUrl, posterType, customHeadline, tagline, price, address, beds, baths, sqft, agentName, brokerage, phone, email, website, socialHandle, accentColor
}) => {
  const headline = customHeadline || POSTER_TYPES.find(p => p.id === posterType)?.label || 'JUST LISTED';
  const hasContact = phone || email || website || socialHandle;

  return (
    <div className="relative w-full h-full">
      <img src={imageUrl} alt="Property" className="w-full h-full object-cover" />

      {/* Small Top Badge */}
      <div
        className="absolute top-4 left-4 px-4 py-2 text-white font-semibold text-sm tracking-wider rounded animate-bounceIn"
        style={{ backgroundColor: accentColor }}
      >
        {headline}
      </div>

      {/* Tagline overlay */}
      {tagline && (
        <div className="absolute top-4 right-4 left-24 text-right">
          <div className="text-white text-sm italic backdrop-blur-sm px-3 py-2 rounded-lg animate-fadeIn" style={{ backgroundColor: 'rgba(0,0,0,0.4)' }}>
            {tagline}
          </div>
        </div>
      )}

      {/* Bottom Bar */}
      <div className="absolute bottom-0 left-0 right-0 p-5 animate-slideInUp" style={{ backgroundColor: accentColor }}>
        <div className="flex items-center justify-between text-white">
          <div>
            {price && <div className="text-2xl font-bold">{price}</div>}
            {address && <div className="text-sm opacity-90">{address}</div>}
            {hasContact && (
              <div className="flex flex-wrap gap-2 mt-1 text-xs opacity-80">
                {phone && <span>{phone}</span>}
                {email && <span>{email}</span>}
                {socialHandle && <span>@{socialHandle}</span>}
              </div>
            )}
          </div>
          <div className="text-right text-sm">
            <div className="flex items-center gap-3 mb-1">
              {beds && <span>{beds} Beds</span>}
              {baths && <span>{baths} Baths</span>}
              {sqft && <span>{sqft} sqft</span>}
            </div>
            {(agentName || brokerage) && (
              <div className="opacity-80 text-xs">
                {agentName}{agentName && brokerage && ' | '}{brokerage}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const LuxuryOverlayTemplate: React.FC<TemplateProps> = ({
  imageUrl, posterType, customHeadline, tagline, price, address, beds, baths, sqft, agentName, brokerage, phone, email, website, socialHandle, accentColor
}) => {
  const headline = customHeadline || POSTER_TYPES.find(p => p.id === posterType)?.label || 'JUST LISTED';
  const hasContact = phone || email || website || socialHandle;

  return (
    <div className="relative w-full h-full">
      <img src={imageUrl} alt="Property" className="w-full h-full object-cover" />

      {/* Dark Overlay */}
      <div className="absolute inset-0" style={{ backgroundColor: 'rgba(0,0,0,0.4)' }} />

      {/* Centered Content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-8">
        <div
          className="px-8 py-2 text-white font-light text-lg tracking-[0.3em] border-2 border-white mb-6 animate-scaleIn"
        >
          {headline}
        </div>

        {price && <div className="text-white text-5xl font-light tracking-wide mb-4 animate-fadeIn animation-delay-200">{price}</div>}
        {address && <div className="text-white/90 text-xl mb-2 animate-fadeIn animation-delay-300">{address}</div>}
        {tagline && <div className="text-white/70 text-sm italic max-w-md mb-4 animate-fadeIn animation-delay-300">{tagline}</div>}

        <div className="flex items-center gap-6 text-white/80 text-lg animate-fadeIn animation-delay-400">
          {beds && <span>{beds} Bedrooms</span>}
          {baths && <span>{baths} Bathrooms</span>}
          {sqft && <span>{sqft} Sq Ft</span>}
        </div>

        {(agentName || brokerage || hasContact) && (
          <div className="absolute bottom-8 text-center animate-fadeIn animation-delay-500">
            <div className="text-white/70 text-sm tracking-wider">
              {agentName}{agentName && brokerage && ' | '}{brokerage}
            </div>
            {hasContact && (
              <div className="flex flex-wrap justify-center gap-3 mt-2 text-xs text-white/60">
                {phone && <span>{phone}</span>}
                {email && <span>{email}</span>}
                {website && <span>{website}</span>}
                {socialHandle && <span>@{socialHandle}</span>}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Corner Accents - Animated */}
      <div className="absolute top-4 left-4 w-16 h-16 border-t-2 border-l-2 animate-slideInLeft" style={{ borderColor: accentColor }} />
      <div className="absolute top-4 right-4 w-16 h-16 border-t-2 border-r-2 animate-slideInRight" style={{ borderColor: accentColor }} />
      <div className="absolute bottom-4 left-4 w-16 h-16 border-b-2 border-l-2 animate-slideInLeft animation-delay-100" style={{ borderColor: accentColor }} />
      <div className="absolute bottom-4 right-4 w-16 h-16 border-b-2 border-r-2 animate-slideInRight animation-delay-100" style={{ borderColor: accentColor }} />
    </div>
  );
};

const GradientFadeTemplate: React.FC<TemplateProps> = ({
  imageUrl, posterType, customHeadline, tagline, price, address, beds, baths, sqft, agentName, brokerage, phone, email, website, socialHandle, accentColor
}) => {
  const headline = customHeadline || POSTER_TYPES.find(p => p.id === posterType)?.label || 'JUST LISTED';
  const hasContact = phone || email || website || socialHandle;

  return (
    <div className="relative w-full h-full">
      <img src={imageUrl} alt="Property" className="w-full h-full object-cover" />

      {/* Gradient Overlay */}
      <div
        className="absolute inset-0"
        style={{ background: `linear-gradient(135deg, ${accentColor}cc 0%, transparent 50%, ${accentColor}99 100%)` }}
      />

      {/* Top Left Content */}
      <div className="absolute top-8 left-8 max-w-[60%]">
        <div className="text-white font-bold text-3xl tracking-wider mb-2 animate-slideInLeft">{headline}</div>
        {price && <div className="text-white text-5xl font-bold animate-slideInLeft animation-delay-200">{price}</div>}
        {tagline && <div className="text-white/80 text-sm italic mt-3 animate-fadeIn animation-delay-300">{tagline}</div>}
      </div>

      {/* Bottom Right Content */}
      <div className="absolute bottom-8 right-8 text-right">
        {address && <div className="text-white text-xl font-medium mb-2 animate-slideInRight">{address}</div>}
        <div className="flex items-center justify-end gap-4 text-white/90 animate-slideInRight animation-delay-200">
          {beds && <span>{beds} Beds</span>}
          {baths && <span>{baths} Baths</span>}
          {sqft && <span>{sqft} sqft</span>}
        </div>
        {(agentName || brokerage || hasContact) && (
          <div className="mt-3 text-white/80 text-sm animate-fadeIn animation-delay-400">
            <div>{agentName}{agentName && brokerage && ' | '}{brokerage}</div>
            {hasContact && (
              <div className="flex flex-wrap justify-end gap-2 mt-1 text-xs text-white/60">
                {phone && <span>{phone}</span>}
                {email && <span>{email}</span>}
                {website && <span>{website}</span>}
                {socialHandle && <span>@{socialHandle}</span>}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// ============ NEW TEMPLATES WITH ANIMATIONS ============

const SplitScreenTemplate: React.FC<TemplateProps> = ({
  imageUrl, posterType, customHeadline, tagline, price, address, beds, baths, sqft, agentName, brokerage, phone, email, website, socialHandle, accentColor
}) => {
  const headline = customHeadline || POSTER_TYPES.find(p => p.id === posterType)?.label || 'JUST LISTED';
  const hasContact = phone || email || website || socialHandle;

  return (
    <div className="relative w-full h-full flex">
      {/* Image Side */}
      <div className="w-1/2 h-full relative overflow-hidden">
        <img src={imageUrl} alt="Property" className="w-full h-full object-cover" />
      </div>

      {/* Content Side */}
      <div className="w-1/2 h-full flex flex-col justify-center p-8" style={{ backgroundColor: accentColor }}>
        <div className="text-white/80 text-sm tracking-[0.3em] mb-2 animate-slideInRight">{headline}</div>
        {price && <div className="text-white text-4xl font-bold mb-4 animate-slideInRight animation-delay-100">{price}</div>}
        {address && <div className="text-white/90 text-lg mb-2 animate-slideInRight animation-delay-200">{address}</div>}
        {tagline && <div className="text-white/70 text-sm italic mb-4 animate-fadeIn animation-delay-300">{tagline}</div>}

        <div className="space-y-2 text-white/80 animate-slideInRight animation-delay-300">
          {beds && <div className="flex items-center gap-2"><Bed className="w-5 h-5" /> {beds} Bedrooms</div>}
          {baths && <div className="flex items-center gap-2"><Bath className="w-5 h-5" /> {baths} Bathrooms</div>}
          {sqft && <div className="flex items-center gap-2"><Square className="w-5 h-5" /> {sqft} Sq Ft</div>}
        </div>

        {(agentName || brokerage || hasContact) && (
          <div className="mt-auto pt-6 border-t border-white/20 animate-fadeIn animation-delay-500">
            <div className="text-white font-medium">{agentName}</div>
            {brokerage && <div className="text-white/70 text-sm">{brokerage}</div>}
            {hasContact && (
              <div className="flex flex-wrap gap-2 mt-2 text-xs text-white/60">
                {phone && <span>{phone}</span>}
                {email && <span>{email}</span>}
                {website && <span>{website}</span>}
                {socialHandle && <span>@{socialHandle}</span>}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

const CornerAccentTemplate: React.FC<TemplateProps> = ({
  imageUrl, posterType, customHeadline, tagline, price, address, beds, baths, sqft, agentName, brokerage, phone, email, website, socialHandle, accentColor
}) => {
  const headline = customHeadline || POSTER_TYPES.find(p => p.id === posterType)?.label || 'JUST LISTED';
  const hasContact = phone || email || website || socialHandle;

  return (
    <div className="relative w-full h-full overflow-hidden">
      <img src={imageUrl} alt="Property" className="w-full h-full object-cover" />

      {/* Large Corner Triangle */}
      <div
        className="absolute -top-2 -left-2 w-64 h-64"
        style={{
          background: `linear-gradient(135deg, ${accentColor} 50%, transparent 50%)`,
        }}
      />

      {/* Top Left Content */}
      <div className="absolute top-6 left-6 text-white">
        <div className="text-lg font-bold tracking-wider animate-slideInLeft">{headline}</div>
        {price && <div className="text-3xl font-bold mt-1 animate-slideInLeft animation-delay-100">{price}</div>}
      </div>

      {/* Tagline overlay in top right */}
      {tagline && (
        <div className="absolute top-6 right-6 left-40 text-right">
          <div className="text-white/90 text-sm italic backdrop-blur-sm px-3 py-2 rounded-lg animate-fadeIn animation-delay-200" style={{ backgroundColor: 'rgba(0,0,0,0.3)' }}>
            {tagline}
          </div>
        </div>
      )}

      {/* Bottom Content Bar */}
      <div className="absolute bottom-0 left-0 right-0 p-6" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, transparent 100%)' }}>
        <div className="flex items-end justify-between">
          <div className="animate-slideInUp">
            {address && <div className="text-white text-xl font-medium mb-2">{address}</div>}
            <div className="flex items-center gap-4 text-white/80 text-sm">
              {beds && <span>{beds} Beds</span>}
              {baths && <span>{baths} Baths</span>}
              {sqft && <span>{sqft} sqft</span>}
            </div>
          </div>
          {(agentName || brokerage || hasContact) && (
            <div className="text-right text-white/80 text-sm animate-slideInUp animation-delay-200">
              <div className="font-medium">{agentName}</div>
              <div className="text-white/60">{brokerage}</div>
              {hasContact && (
                <div className="flex flex-wrap justify-end gap-2 mt-1 text-xs text-white/50">
                  {phone && <span>{phone}</span>}
                  {email && <span>{email}</span>}
                  {socialHandle && <span>@{socialHandle}</span>}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const FloatingCardTemplate: React.FC<TemplateProps> = ({
  imageUrl, posterType, customHeadline, tagline, price, address, beds, baths, sqft, agentName, brokerage, phone, email, website, socialHandle, accentColor
}) => {
  const headline = customHeadline || POSTER_TYPES.find(p => p.id === posterType)?.label || 'JUST LISTED';
  const hasContact = phone || email || website || socialHandle;

  return (
    <div className="relative w-full h-full">
      <img src={imageUrl} alt="Property" className="w-full h-full object-cover" />

      {/* Floating Card */}
      <div className="absolute bottom-8 left-8 right-8 bg-white rounded-2xl p-6 shadow-2xl animate-slideInUp">
        {/* Badge */}
        <div
          className="absolute -top-4 left-6 px-4 py-1.5 rounded-full text-white text-sm font-bold tracking-wider animate-bounceIn"
          style={{ backgroundColor: accentColor }}
        >
          {headline}
        </div>

        <div className="mt-2">
          {price && <div className="text-3xl font-bold text-gray-900 animate-fadeIn animation-delay-200">{price}</div>}
          {address && <div className="text-gray-600 mt-1 animate-fadeIn animation-delay-300">{address}</div>}
          {tagline && <div className="text-gray-500 text-sm italic mt-2 animate-fadeIn animation-delay-300">{tagline}</div>}

          <div className="flex items-center gap-4 mt-4 text-gray-500 text-sm animate-fadeIn animation-delay-400">
            {beds && <span className="flex items-center gap-1"><Bed className="w-4 h-4" /> {beds}</span>}
            {baths && <span className="flex items-center gap-1"><Bath className="w-4 h-4" /> {baths}</span>}
            {sqft && <span className="flex items-center gap-1"><Square className="w-4 h-4" /> {sqft} sqft</span>}
          </div>

          {(agentName || brokerage || hasContact) && (
            <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200 animate-fadeIn animation-delay-500">
              <div>
                <div className="font-medium text-gray-900">{agentName}</div>
                <div className="text-sm text-gray-500">{brokerage}</div>
              </div>
              {(phone || socialHandle) && (
                <div className="text-right text-sm text-gray-500">
                  {phone && <div>{phone}</div>}
                  {socialHandle && <div>@{socialHandle}</div>}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const NeonGlowTemplate: React.FC<TemplateProps> = ({
  imageUrl, posterType, customHeadline, tagline, price, address, beds, baths, sqft, agentName, brokerage, phone, email, website, socialHandle, accentColor
}) => {
  const headline = customHeadline || POSTER_TYPES.find(p => p.id === posterType)?.label || 'JUST LISTED';
  const hasContact = phone || email || website || socialHandle;

  return (
    <div className="relative w-full h-full bg-black">
      <img src={imageUrl} alt="Property" className="w-full h-full object-cover opacity-80" />

      {/* Neon Border */}
      <div
        className="absolute inset-4 border-4 rounded-lg animate-neonPulse"
        style={{
          borderColor: accentColor,
          boxShadow: `0 0 20px ${accentColor}, 0 0 40px ${accentColor}40, inset 0 0 20px ${accentColor}20`,
        }}
      />

      {/* Top Neon Badge */}
      <div className="absolute top-8 left-1/2 -translate-x-1/2">
        <div
          className="px-8 py-3 text-2xl font-bold tracking-[0.2em] animate-neonFlicker"
          style={{
            color: accentColor,
            textShadow: `0 0 10px ${accentColor}, 0 0 20px ${accentColor}, 0 0 40px ${accentColor}`,
          }}
        >
          {headline}
        </div>
      </div>

      {/* Center Price */}
      {price && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
          <div
            className="text-6xl font-bold animate-scaleIn"
            style={{
              color: 'white',
              textShadow: `0 0 20px ${accentColor}, 0 0 40px ${accentColor}`,
            }}
          >
            {price}
          </div>
          {tagline && (
            <div className="text-white/70 text-sm italic mt-3 max-w-md animate-fadeIn animation-delay-200">
              {tagline}
            </div>
          )}
        </div>
      )}

      {/* Bottom Content */}
      <div className="absolute bottom-8 left-8 right-8 text-center">
        {address && <div className="text-white text-xl mb-2 animate-fadeIn">{address}</div>}
        <div className="flex items-center justify-center gap-6 text-white/80 animate-fadeIn animation-delay-200">
          {beds && <span>{beds} Beds</span>}
          {baths && <span>{baths} Baths</span>}
          {sqft && <span>{sqft} sqft</span>}
        </div>
        {(agentName || brokerage || hasContact) && (
          <div className="mt-4 text-white/60 text-sm animate-fadeIn animation-delay-400">
            <div>{agentName}{agentName && brokerage && ' • '}{brokerage}</div>
            {hasContact && (
              <div className="flex items-center justify-center gap-3 mt-1 text-xs text-white/50">
                {phone && <span>{phone}</span>}
                {email && <span>{email}</span>}
                {website && <span>{website}</span>}
                {socialHandle && <span>@{socialHandle}</span>}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

const MagazineCoverTemplate: React.FC<TemplateProps> = ({
  imageUrl, posterType, customHeadline, tagline, price, address, beds, baths, sqft, agentName, brokerage, phone, email, website, socialHandle, accentColor
}) => {
  const headline = customHeadline || POSTER_TYPES.find(p => p.id === posterType)?.label || 'JUST LISTED';
  const hasContact = phone || email || website || socialHandle;

  return (
    <div className="relative w-full h-full">
      <img src={imageUrl} alt="Property" className="w-full h-full object-cover" />

      {/* Magazine Header */}
      <div className="absolute top-0 left-0 right-0 p-6">
        <div className="flex items-center justify-between">
          <div
            className="text-3xl font-serif font-bold tracking-wider animate-slideInLeft"
            style={{ color: accentColor }}
          >
            LUXE
          </div>
          <div className="text-white text-sm tracking-widest animate-slideInRight">REAL ESTATE</div>
        </div>
        <div className="h-0.5 mt-2 animate-expandWidth" style={{ backgroundColor: accentColor }} />
      </div>

      {/* Main Feature */}
      <div className="absolute left-6 top-1/3">
        <div
          className="text-sm tracking-[0.3em] mb-2 animate-slideInLeft"
          style={{ color: accentColor }}
        >
          {headline}
        </div>
        <div className="text-white text-5xl font-serif leading-tight animate-slideInLeft animation-delay-100">
          {price || 'EXCLUSIVE'}
        </div>
        <div className="text-white text-5xl font-serif leading-tight animate-slideInLeft animation-delay-200">
          LISTING
        </div>
        {tagline && (
          <div className="text-white/70 text-sm italic mt-4 max-w-xs animate-fadeIn animation-delay-300">
            {tagline}
          </div>
        )}
      </div>

      {/* Side Details */}
      <div className="absolute right-6 top-1/3 text-right">
        <div className="text-white/90 space-y-1 animate-slideInRight">
          {beds && <div className="text-lg">{beds} BEDROOMS</div>}
          {baths && <div className="text-lg">{baths} BATHROOMS</div>}
          {sqft && <div className="text-lg">{sqft} SQ FT</div>}
        </div>
      </div>

      {/* Bottom */}
      <div className="absolute bottom-0 left-0 right-0 p-6" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, transparent 100%)' }}>
        <div className="flex items-end justify-between animate-slideInUp">
          <div>
            {address && <div className="text-white text-xl font-serif">{address}</div>}
          </div>
          {(agentName || brokerage || hasContact) && (
            <div className="text-right">
              <div className="text-white font-medium">{agentName}</div>
              <div className="text-white/70 text-sm">{brokerage}</div>
              {hasContact && (
                <div className="flex flex-wrap justify-end gap-2 mt-1 text-xs text-white/50">
                  {phone && <span>{phone}</span>}
                  {email && <span>{email}</span>}
                  {website && <span>{website}</span>}
                  {socialHandle && <span>@{socialHandle}</span>}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const PolaroidStyleTemplate: React.FC<TemplateProps> = ({
  imageUrl, posterType, customHeadline, tagline, price, address, beds, baths, sqft, agentName, brokerage, phone, email, website, socialHandle, accentColor
}) => {
  const headline = customHeadline || POSTER_TYPES.find(p => p.id === posterType)?.label || 'JUST LISTED';
  const hasContact = phone || email || website || socialHandle;

  return (
    <div className="relative w-full h-full flex items-center justify-center" style={{ backgroundColor: accentColor }}>
      {/* Polaroid Frame */}
      <div className="bg-white p-4 pb-24 shadow-2xl transform rotate-2 animate-slideInUp" style={{ width: '85%', height: '90%' }}>
        {/* Photo */}
        <div className="w-full h-full relative overflow-hidden">
          <img src={imageUrl} alt="Property" className="w-full h-full object-cover" />

          {/* Badge */}
          <div
            className="absolute top-4 left-4 px-4 py-2 text-white font-bold text-sm tracking-wider animate-bounceIn"
            style={{ backgroundColor: accentColor }}
          >
            {headline}
          </div>

          {/* Price Sticker */}
          {price && (
            <div className="absolute top-4 right-4 bg-white px-4 py-2 rounded-full shadow-lg animate-bounceIn animation-delay-200">
              <span className="text-xl font-bold" style={{ color: accentColor }}>{price}</span>
            </div>
          )}
        </div>

        {/* Handwritten Style Bottom */}
        <div className="absolute bottom-4 left-4 right-4">
          {address && (
            <div className="text-gray-800 text-xl font-handwriting animate-fadeIn" style={{ fontFamily: 'cursive' }}>
              {address}
            </div>
          )}
          {tagline && (
            <div className="text-gray-500 text-sm italic mt-1 animate-fadeIn animation-delay-100">
              "{tagline}"
            </div>
          )}
          <div className="flex items-center gap-3 mt-2 text-gray-600 text-sm animate-fadeIn animation-delay-200">
            {beds && <span>{beds} bed</span>}
            {baths && <span>• {baths} bath</span>}
            {sqft && <span>• {sqft} sqft</span>}
          </div>
          {(agentName || brokerage || hasContact) && (
            <div className="mt-2 text-gray-500 text-xs animate-fadeIn animation-delay-400">
              <div>{agentName}{brokerage && ` • ${brokerage}`}</div>
              {hasContact && (
                <div className="flex flex-wrap gap-2 mt-1 text-gray-400">
                  {phone && <span>{phone}</span>}
                  {email && <span>{email}</span>}
                  {socialHandle && <span>@{socialHandle}</span>}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Template renderer map
const TEMPLATE_COMPONENTS: Record<TemplateId, React.FC<TemplateProps>> = {
  'modern-banner': ModernBannerTemplate,
  'elegant-frame': ElegantFrameTemplate,
  'bold-diagonal': BoldDiagonalTemplate,
  'minimal-bottom': MinimalBottomTemplate,
  'luxury-overlay': LuxuryOverlayTemplate,
  'gradient-fade': GradientFadeTemplate,
  'split-screen': SplitScreenTemplate,
  'corner-accent': CornerAccentTemplate,
  'floating-card': FloatingCardTemplate,
  'neon-glow': NeonGlowTemplate,
  'magazine-cover': MagazineCoverTemplate,
  'polaroid-style': PolaroidStyleTemplate,
};

// ============ MAIN COMPONENT ============

const SocialMediaPosterToolInner: React.FC = () => {
  const navigate = useNavigate();
  const { balance } = useCredits();
  const { addAsset } = useAssets();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const posterRef = useRef<HTMLDivElement>(null);

  // Image state
  const [uploadedImage, setUploadedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  // Template state
  const [platform, setPlatform] = useState<PlatformId>('instagram-square');
  const [template, setTemplate] = useState<TemplateId>('modern-banner');
  const [posterType, setPosterType] = useState<PosterType>('just-listed');
  const [accentColor, setAccentColor] = useState('#3b82f6');

  // Content state
  const [customHeadline, setCustomHeadline] = useState('');
  const [tagline, setTagline] = useState('');
  const [price, setPrice] = useState('');
  const [address, setAddress] = useState('');
  const [beds, setBeds] = useState('');
  const [baths, setBaths] = useState('');
  const [sqft, setSqft] = useState('');
  const [agentName, setAgentName] = useState('');
  const [brokerage, setBrokerage] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [website, setWebsite] = useState('');
  const [socialHandle, setSocialHandle] = useState('');

  // AI Tagline generation state
  const [isGeneratingTagline, setIsGeneratingTagline] = useState(false);

  // Generation state
  const [isDownloading, setIsDownloading] = useState(false);
  const [isGeneratingContent, setIsGeneratingContent] = useState(false);
  const [savedToLibrary, setSavedToLibrary] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [animationKey, setAnimationKey] = useState(0); // Key to trigger re-animation

  // Get current platform config
  const currentPlatform = PLATFORMS.find(p => p.id === platform) || PLATFORMS[0];

  // Update accent color when poster type changes
  useEffect(() => {
    const typeColor = POSTER_TYPES.find(p => p.id === posterType)?.color;
    if (typeColor && posterType !== 'custom') {
      setAccentColor(typeColor);
    }
  }, [posterType]);

  // Replay animations when template changes
  const handleTemplateChange = useCallback((newTemplate: TemplateId) => {
    setTemplate(newTemplate);
    setAnimationKey(prev => prev + 1);
  }, []);

  // Manual replay animation
  const handleReplayAnimation = useCallback(() => {
    setAnimationKey(prev => prev + 1);
  }, []);

  // Image upload handlers
  const handleImageUpload = useCallback((file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('Please upload an image file');
      return;
    }
    setUploadedImage(file);
    const reader = new FileReader();
    reader.onload = (e) => setImagePreview(e.target?.result as string);
    reader.readAsDataURL(file);
    setError(null);
    setSavedToLibrary(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleImageUpload(file);
  }, [handleImageUpload]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleImageUpload(file);
  }, [handleImageUpload]);

  const handleRemoveImage = useCallback(() => {
    setUploadedImage(null);
    setImagePreview(null);
    setSavedToLibrary(false);
  }, []);

  // AI-powered tagline suggestions based on poster type and property details
  const TAGLINE_SUGGESTIONS: Record<PosterType, string[]> = {
    'just-listed': [
      'Your dream home just hit the market! Don\'t miss this rare opportunity.',
      'Fresh on the market and ready for its new owners. Schedule your showing today!',
      'The wait is over! This stunning property is now available.',
      'Newly listed gem in a prime location. Act fast!',
      'Just listed and already turning heads. See why today!',
    ],
    'open-house': [
      'Join us this weekend and discover your future home!',
      'The doors are open and opportunity awaits. We can\'t wait to show you around!',
      'Experience luxury living firsthand. All are welcome!',
      'Your perfect home is waiting. Come see it in person!',
      'Step inside and fall in love. See you at the open house!',
    ],
    'price-reduced': [
      'Amazing value just got even better! New price, same incredible home.',
      'Priced to sell! This deal won\'t last long.',
      'The price dropped, but the quality didn\'t. Seize this opportunity!',
      'New price alert! Your dream home is now more affordable.',
      'Incredible savings on this stunning property. Don\'t wait!',
    ],
    'sold': [
      'Another happy family has found their forever home!',
      'Sold! Congratulations to the new homeowners!',
      'This beauty found its perfect match. Looking to sell? Let\'s talk!',
      'Mission accomplished! Another successful sale.',
      'SOLD above asking! Let me help you achieve the same results.',
    ],
    'coming-soon': [
      'Something special is coming to the market. Stay tuned!',
      'Get ready for an exclusive preview. Coming soon to your neighborhood!',
      'The countdown begins. Don\'t miss this upcoming listing!',
      'A new opportunity is on the horizon. Contact me for early access!',
      'Coming soon: A property that will take your breath away.',
    ],
    'new-listing': [
      'Brand new to the market! Be the first to see this incredible home.',
      'Hot off the press! This new listing won\'t last.',
      'Introducing a stunning new property to our portfolio.',
      'New listing alert! This one checks all the boxes.',
      'Fresh, new, and ready for you. Tour this beautiful home today!',
    ],
    'custom': [
      'Where memories are made and dreams come true.',
      'Luxury living at its finest. Experience the difference.',
      'Home is where your story begins. Start yours here.',
      'Exceptional homes for exceptional people.',
      'Find your happy place. It might just be here.',
    ],
  };

  // AI Content Generation (simple mock for now - can integrate with OpenAI/Claude)
  const handleGenerateContent = async () => {
    setIsGeneratingContent(true);

    // Simulate AI generation - in production, call an AI API
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Generate sample content based on poster type
    const contentSuggestions: Record<PosterType, { headline: string; price: string; address: string }> = {
      'just-listed': { headline: 'JUST LISTED', price: '$899,000', address: '123 Oak Street, Beverly Hills' },
      'open-house': { headline: 'OPEN HOUSE SAT & SUN', price: '$1,250,000', address: '456 Maple Avenue' },
      'price-reduced': { headline: 'PRICE REDUCED $50K!', price: '$749,000', address: '789 Pine Road' },
      'sold': { headline: 'SOLD OVER ASKING!', price: '$925,000', address: '321 Cedar Lane' },
      'coming-soon': { headline: 'COMING SOON', price: 'Price TBA', address: 'Exclusive Listing' },
      'new-listing': { headline: 'NEW ON MARKET', price: '$650,000', address: '555 Elm Street' },
      'custom': { headline: 'DREAM HOME AWAITS', price: '$799,000', address: 'Prime Location' },
    };

    const suggestion = contentSuggestions[posterType];
    if (!customHeadline) setCustomHeadline(suggestion.headline);
    if (!price) setPrice(suggestion.price);
    if (!address) setAddress(suggestion.address);
    if (!beds) setBeds('4');
    if (!baths) setBaths('3');
    if (!sqft) setSqft('2,500');

    // Also generate a tagline
    if (!tagline) {
      const taglines = TAGLINE_SUGGESTIONS[posterType];
      const randomTagline = taglines[Math.floor(Math.random() * taglines.length)];
      setTagline(randomTagline);
    }

    setIsGeneratingContent(false);
  };

  // Generate just a new tagline
  const handleGenerateTagline = async () => {
    setIsGeneratingTagline(true);

    // Simulate AI generation
    await new Promise(resolve => setTimeout(resolve, 800));

    const taglines = TAGLINE_SUGGESTIONS[posterType];
    // Get a different tagline than the current one
    let newTagline = taglines[Math.floor(Math.random() * taglines.length)];
    let attempts = 0;
    while (newTagline === tagline && attempts < 5) {
      newTagline = taglines[Math.floor(Math.random() * taglines.length)];
      attempts++;
    }
    setTagline(newTagline);

    setIsGeneratingTagline(false);
  };

  // Generate poster image using html-to-image (supports modern CSS colors like oklch/oklab)
  const generatePosterImage = async (): Promise<string | null> => {
    if (!posterRef.current || !imagePreview) return null;

    try {
      const dataUrl = await toPng(posterRef.current, {
        quality: 1,
        pixelRatio: 2, // Higher quality
        backgroundColor: '#ffffff',
      });

      return dataUrl;
    } catch (err) {
      console.error('Canvas generation error:', err);
      throw err;
    }
  };

  // Download poster as image
  const handleDownload = async () => {
    if (!posterRef.current || !imagePreview) return;

    setIsDownloading(true);
    setError(null);

    try {
      const dataUrl = await generatePosterImage();
      if (!dataUrl) {
        throw new Error('Failed to generate image');
      }

      // Create download link
      const a = document.createElement('a');
      a.href = dataUrl;
      a.download = `poster-${platform}-${posterType}-${Date.now()}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (err) {
      console.error('Download error:', err);
      setError('Failed to generate image. Please try again.');
    } finally {
      setIsDownloading(false);
    }
  };

  // Save to library
  const [isSavingToLibrary, setIsSavingToLibrary] = useState(false);
  const handleSaveToLibrary = async () => {
    if (!posterRef.current || !imagePreview) return;

    setIsSavingToLibrary(true);
    setError(null);

    try {
      const dataUrl = await generatePosterImage();
      if (!dataUrl) {
        throw new Error('Failed to generate image');
      }

      await addAsset(dataUrl, 'image', `Social Media Poster - ${POSTER_TYPES.find(p => p.id === posterType)?.label}`);
      setSavedToLibrary(true);
    } catch (err) {
      console.error('Save to library error:', err);
      setError('Failed to save to library. Please try again.');
    } finally {
      setIsSavingToLibrary(false);
    }
  };

  // Get template component
  const TemplateComponent = TEMPLATE_COMPONENTS[template];

  // Calculate preview size for display
  const getPreviewStyle = () => {
    // Use most of available space - will be constrained by container
    const maxWidth = 900;
    const maxHeight = 900;
    const ratio = currentPlatform.width / currentPlatform.height;

    let width = maxWidth;
    let height = width / ratio;

    if (height > maxHeight) {
      height = maxHeight;
      width = height * ratio;
    }

    return { width, height };
  };

  const previewStyle = getPreviewStyle();

  return (
    <div className="h-screen flex bg-[#0a0a0b]">
      <AnimationStyles />
      {/* Navigation Rail */}
      <NavigationRail
        isMobileOpen={mobileMenuOpen}
        onMobileClose={() => setMobileMenuOpen(false)}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden ml-16">
        {/* Top Bar */}
        <div className="h-14 border-b border-white/10 flex items-center justify-between px-4 bg-zinc-900/50">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/studio/real-estate')}
              className="p-2 rounded-lg hover:bg-white/5 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-zinc-400" />
            </button>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center">
                <Layout className="w-4 h-4 text-white" />
              </div>
              <div>
                <h1 className="text-sm font-medium text-white">Social Media Poster</h1>
                <p className="text-xs text-zinc-500">Create instant marketing posters</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-zinc-800/50 border border-white/5">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span className="text-xs font-medium text-zinc-300">{balance} credits</span>
            </div>
          </div>
        </div>

        {/* Main Area */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left Panel - Templates & Platform */}
          <div className="w-72 border-r border-white/10 bg-zinc-900/30 overflow-y-auto">
            <div className="p-4 space-y-6">
              {/* Platform Selection */}
              <div>
                <label className="text-xs font-medium text-zinc-400 uppercase tracking-wider mb-3 block">
                  Platform
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {PLATFORMS.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => setPlatform(p.id)}
                      className={`p-2.5 rounded-xl border transition-all text-left ${
                        platform === p.id
                          ? 'border-pink-500 bg-pink-500/10'
                          : 'border-white/10 bg-zinc-800/50 hover:bg-zinc-800'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <span className={platform === p.id ? 'text-pink-400' : 'text-zinc-400'}>
                          {p.icon}
                        </span>
                      </div>
                      <span className={`text-xs ${platform === p.id ? 'text-white' : 'text-zinc-300'}`}>
                        {p.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Template Selection */}
              <div>
                <label className="text-xs font-medium text-zinc-400 uppercase tracking-wider mb-3 block">
                  Template ({TEMPLATES.length})
                </label>
                <div className="space-y-2 max-h-80 overflow-y-auto pr-1 custom-scrollbar">
                  {TEMPLATES.map((t) => (
                    <button
                      key={t.id}
                      onClick={() => handleTemplateChange(t.id)}
                      className={`w-full p-3 rounded-xl border transition-all text-left ${
                        template === t.id
                          ? 'border-pink-500 bg-pink-500/10'
                          : 'border-white/10 bg-zinc-800/50 hover:bg-zinc-800'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className="w-8 h-8 rounded-lg"
                          style={{ backgroundColor: t.preview }}
                        />
                        <div>
                          <span className={`text-sm ${template === t.id ? 'text-white' : 'text-zinc-300'}`}>
                            {t.name}
                          </span>
                          <p className="text-xs text-zinc-500">{t.description}</p>
                        </div>
                        {template === t.id && <Check className="w-4 h-4 text-pink-400 ml-auto" />}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Poster Type */}
              <div>
                <label className="text-xs font-medium text-zinc-400 uppercase tracking-wider mb-3 block">
                  Poster Type
                </label>
                <div className="flex flex-wrap gap-2">
                  {POSTER_TYPES.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => setPosterType(p.id)}
                      className={`px-3 py-1.5 rounded-lg text-xs transition-all ${
                        posterType === p.id
                          ? 'text-white'
                          : 'bg-zinc-800/50 text-zinc-400 hover:bg-zinc-800'
                      }`}
                      style={posterType === p.id ? { backgroundColor: p.color } : {}}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Accent Color */}
              <div>
                <label className="text-xs font-medium text-zinc-400 uppercase tracking-wider mb-3 block">
                  Accent Color
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={accentColor}
                    onChange={(e) => setAccentColor(e.target.value)}
                    className="w-10 h-10 rounded-lg cursor-pointer border-2 border-white/10"
                  />
                  <input
                    type="text"
                    value={accentColor}
                    onChange={(e) => setAccentColor(e.target.value)}
                    className="flex-1 px-3 py-2 rounded-lg bg-zinc-800/50 border border-white/10 text-sm text-white"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Center - Preview Area */}
          <div className="flex-1 flex flex-col bg-zinc-950/50 overflow-hidden">
            {/* Preview Header */}
            <div className="flex items-center justify-between px-6 py-3 border-b border-white/5">
              <div className="flex items-center gap-3">
                <Eye className="w-4 h-4 text-zinc-500" />
                <span className="text-xs text-zinc-500 uppercase tracking-wider">Live Preview</span>
                <span className="px-2 py-0.5 rounded bg-zinc-800 text-[10px] text-zinc-400">
                  {currentPlatform.width} x {currentPlatform.height}
                </span>
              </div>
              <div className="flex items-center gap-2">
                {imagePreview && (
                  <>
                    <button
                      onClick={handleReplayAnimation}
                      className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs text-pink-400 hover:text-pink-300 hover:bg-pink-500/10 transition-colors"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      Replay
                    </button>
                    <button
                      onClick={handleRemoveImage}
                      className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs text-zinc-400 hover:text-white hover:bg-white/5 transition-colors"
                    >
                      <X className="w-3.5 h-3.5" />
                      Remove
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Preview Container */}
            <div className="flex-1 flex items-center justify-center p-6 overflow-auto">
              {imagePreview ? (
                <div
                  ref={posterRef}
                  data-poster-ref
                  className="rounded-xl overflow-hidden shadow-2xl border border-white/10"
                  style={{
                    width: previewStyle.width,
                    height: previewStyle.height,
                    backgroundColor: '#ffffff',
                  }}
                >
                  <TemplateComponent
                    key={animationKey}
                    imageUrl={imagePreview}
                    posterType={posterType}
                    customHeadline={posterType === 'custom' ? customHeadline : undefined}
                    tagline={tagline}
                    price={price}
                    address={address}
                    beds={beds}
                    baths={baths}
                    sqft={sqft}
                    agentName={agentName}
                    brokerage={brokerage}
                    phone={phone}
                    email={email}
                    website={website}
                    socialHandle={socialHandle}
                    accentColor={accentColor}
                    platform={currentPlatform}
                  />
                </div>
              ) : (
                /* Upload State */
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  className={`relative rounded-2xl border-2 border-dashed transition-all cursor-pointer ${
                    isDragging
                      ? 'border-pink-500 bg-pink-500/10'
                      : 'border-white/20 bg-zinc-900/50 hover:border-pink-500/50 hover:bg-zinc-900'
                  }`}
                  style={{
                    width: previewStyle.width,
                    height: previewStyle.height,
                  }}
                >
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  />
                  <div className="absolute inset-0 flex flex-col items-center justify-center p-8">
                    <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-pink-500/20 to-rose-600/20 flex items-center justify-center mb-6">
                      <UploadCloud className="w-10 h-10 text-pink-400" />
                    </div>
                    <h3 className="text-lg font-medium text-white mb-2">Upload Property Photo</h3>
                    <p className="text-sm text-zinc-400 text-center">
                      Drag & drop or click to upload your property image
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Action Bar */}
            <div className="px-6 py-4 border-t border-white/5 bg-zinc-900/30">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {error && (
                    <div className="flex items-center gap-2 text-red-400">
                      <AlertCircle className="w-4 h-4" />
                      <span className="text-sm">{error}</span>
                    </div>
                  )}
                  {savedToLibrary && (
                    <div className="flex items-center gap-1.5 text-green-400 text-sm">
                      <BookmarkPlus className="w-4 h-4" />
                      Saved to Library
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={handleSaveToLibrary}
                    disabled={!imagePreview || isSavingToLibrary || savedToLibrary}
                    className={`px-4 py-2.5 rounded-xl font-medium transition-all flex items-center gap-2 text-sm ${
                      !imagePreview || isSavingToLibrary || savedToLibrary
                        ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
                        : 'bg-zinc-700 text-white hover:bg-zinc-600'
                    }`}
                  >
                    {isSavingToLibrary ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : savedToLibrary ? (
                      <Check className="w-4 h-4" />
                    ) : (
                      <BookmarkPlus className="w-4 h-4" />
                    )}
                    {isSavingToLibrary ? 'Saving...' : savedToLibrary ? 'Saved' : 'Save to Library'}
                  </button>
                  <button
                    onClick={handleDownload}
                    disabled={!imagePreview || isDownloading}
                    className={`px-6 py-2.5 rounded-xl font-medium transition-all flex items-center gap-2 text-sm ${
                      !imagePreview || isDownloading
                        ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
                        : 'bg-gradient-to-r from-pink-500 to-rose-600 text-white hover:opacity-90 shadow-lg shadow-pink-500/25'
                    }`}
                  >
                    {isDownloading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Download className="w-4 h-4" />
                    )}
                    {isDownloading ? 'Generating...' : 'Download Poster'}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Right Panel - Content */}
          <div className="w-80 border-l border-white/10 bg-zinc-900/30 overflow-y-auto">
            <div className="p-4 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-medium text-zinc-400 uppercase tracking-wider">
                  Property Details
                </h3>
                <button
                  onClick={handleGenerateContent}
                  disabled={isGeneratingContent}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 transition-colors text-xs"
                >
                  {isGeneratingContent ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Wand2 className="w-3.5 h-3.5" />
                  )}
                  AI Fill
                </button>
              </div>

              {/* Custom Headline (only for custom type) */}
              {posterType === 'custom' && (
                <div>
                  <label className="text-xs text-zinc-500 mb-1.5 block flex items-center gap-1.5">
                    <Type className="w-3.5 h-3.5" />
                    Custom Headline
                  </label>
                  <input
                    type="text"
                    value={customHeadline}
                    onChange={(e) => setCustomHeadline(e.target.value)}
                    placeholder="YOUR HEADLINE HERE"
                    className="w-full px-3 py-2.5 rounded-xl bg-zinc-800/50 border border-white/10 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-pink-500/50"
                  />
                </div>
              )}

              {/* Price */}
              <div>
                <label className="text-xs text-zinc-500 mb-1.5 block flex items-center gap-1.5">
                  <DollarSign className="w-3.5 h-3.5" />
                  Price
                </label>
                <input
                  type="text"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="$899,000"
                  className="w-full px-3 py-2.5 rounded-xl bg-zinc-800/50 border border-white/10 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-pink-500/50"
                />
              </div>

              {/* Address */}
              <div>
                <label className="text-xs text-zinc-500 mb-1.5 block flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5" />
                  Address
                </label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="123 Oak Street, City"
                  className="w-full px-3 py-2.5 rounded-xl bg-zinc-800/50 border border-white/10 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-pink-500/50"
                />
              </div>

              {/* Property Stats */}
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="text-xs text-zinc-500 mb-1.5 block flex items-center gap-1">
                    <Bed className="w-3 h-3" />
                    Beds
                  </label>
                  <input
                    type="text"
                    value={beds}
                    onChange={(e) => setBeds(e.target.value)}
                    placeholder="4"
                    className="w-full px-3 py-2 rounded-xl bg-zinc-800/50 border border-white/10 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-pink-500/50"
                  />
                </div>
                <div>
                  <label className="text-xs text-zinc-500 mb-1.5 block flex items-center gap-1">
                    <Bath className="w-3 h-3" />
                    Baths
                  </label>
                  <input
                    type="text"
                    value={baths}
                    onChange={(e) => setBaths(e.target.value)}
                    placeholder="3"
                    className="w-full px-3 py-2 rounded-xl bg-zinc-800/50 border border-white/10 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-pink-500/50"
                  />
                </div>
                <div>
                  <label className="text-xs text-zinc-500 mb-1.5 block flex items-center gap-1">
                    <Square className="w-3 h-3" />
                    Sqft
                  </label>
                  <input
                    type="text"
                    value={sqft}
                    onChange={(e) => setSqft(e.target.value)}
                    placeholder="2,500"
                    className="w-full px-3 py-2 rounded-xl bg-zinc-800/50 border border-white/10 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-pink-500/50"
                  />
                </div>
              </div>

              {/* Marketing Copy Section */}
              <div className="border-t border-white/5 pt-4 mt-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xs font-medium text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
                    <MessageSquare className="w-3.5 h-3.5" />
                    Marketing Copy
                  </h3>
                  <button
                    onClick={handleGenerateTagline}
                    disabled={isGeneratingTagline}
                    className="flex items-center gap-1 px-2 py-1 rounded-lg bg-pink-500/20 text-pink-400 hover:bg-pink-500/30 transition-colors text-xs"
                    title="Generate new tagline with AI"
                  >
                    {isGeneratingTagline ? (
                      <Loader2 className="w-3 h-3 animate-spin" />
                    ) : (
                      <RefreshCw className="w-3 h-3" />
                    )}
                    AI
                  </button>
                </div>

                <textarea
                  value={tagline}
                  onChange={(e) => setTagline(e.target.value)}
                  placeholder="Add a catchy tagline or marketing copy... Click AI button for suggestions!"
                  rows={3}
                  className="w-full px-3 py-2.5 rounded-xl bg-zinc-800/50 border border-white/10 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-pink-500/50 resize-none"
                />
                <p className="text-xs text-zinc-600 mt-1.5">
                  Displayed on all templates
                </p>
              </div>

              <div className="border-t border-white/5 pt-4 mt-4">
                <h3 className="text-xs font-medium text-zinc-400 uppercase tracking-wider mb-4">
                  Agent Branding
                </h3>

                {/* Agent Name */}
                <div className="mb-4">
                  <label className="text-xs text-zinc-500 mb-1.5 block flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5" />
                    Agent Name
                  </label>
                  <input
                    type="text"
                    value={agentName}
                    onChange={(e) => setAgentName(e.target.value)}
                    placeholder="Jane Smith"
                    className="w-full px-3 py-2.5 rounded-xl bg-zinc-800/50 border border-white/10 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-pink-500/50"
                  />
                </div>

                {/* Brokerage */}
                <div className="mb-4">
                  <label className="text-xs text-zinc-500 mb-1.5 block flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5" />
                    Brokerage
                  </label>
                  <input
                    type="text"
                    value={brokerage}
                    onChange={(e) => setBrokerage(e.target.value)}
                    placeholder="RE/MAX"
                    className="w-full px-3 py-2.5 rounded-xl bg-zinc-800/50 border border-white/10 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-pink-500/50"
                  />
                </div>

                {/* Phone */}
                <div className="mb-4">
                  <label className="text-xs text-zinc-500 mb-1.5 block flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5" />
                    Phone
                  </label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="(555) 123-4567"
                    className="w-full px-3 py-2.5 rounded-xl bg-zinc-800/50 border border-white/10 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-pink-500/50"
                  />
                </div>

                {/* Email */}
                <div className="mb-4">
                  <label className="text-xs text-zinc-500 mb-1.5 block flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5" />
                    Email
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="agent@realty.com"
                    className="w-full px-3 py-2.5 rounded-xl bg-zinc-800/50 border border-white/10 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-pink-500/50"
                  />
                </div>

                {/* Website */}
                <div className="mb-4">
                  <label className="text-xs text-zinc-500 mb-1.5 block flex items-center gap-1.5">
                    <Globe className="w-3.5 h-3.5" />
                    Website
                  </label>
                  <input
                    type="text"
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                    placeholder="www.myrealty.com"
                    className="w-full px-3 py-2.5 rounded-xl bg-zinc-800/50 border border-white/10 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-pink-500/50"
                  />
                </div>

                {/* Social Handle */}
                <div>
                  <label className="text-xs text-zinc-500 mb-1.5 block flex items-center gap-1.5">
                    <AtSign className="w-3.5 h-3.5" />
                    Social Handle
                  </label>
                  <input
                    type="text"
                    value={socialHandle}
                    onChange={(e) => setSocialHandle(e.target.value)}
                    placeholder="janesmithrealty"
                    className="w-full px-3 py-2.5 rounded-xl bg-zinc-800/50 border border-white/10 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-pink-500/50"
                  />
                </div>
              </div>

              {/* Tips */}
              <div className="mt-6 p-3 rounded-xl bg-zinc-800/30 border border-white/5">
                <h4 className="text-xs font-medium text-zinc-400 mb-2">Tips:</h4>
                <ul className="text-xs text-zinc-500 space-y-1">
                  <li>• Changes appear instantly in preview</li>
                  <li>• Click "AI Fill" for sample content</li>
                  <li>• Your original photo stays untouched</li>
                  <li>• Download is free - no credits needed!</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Export with AssetProvider wrapper
export const SocialMediaPosterToolV2: React.FC = () => {
  return (
    <AssetProvider>
      <SocialMediaPosterToolInner />
    </AssetProvider>
  );
};
