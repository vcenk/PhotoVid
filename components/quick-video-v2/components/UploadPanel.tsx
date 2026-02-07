/**
 * UploadPanel - Left panel for image upload, templates, and settings
 */

import React, { useCallback, useRef, useState } from 'react';
import { motion, AnimatePresence, Reorder } from 'framer-motion';
import {
  Upload,
  Image as ImageIcon,
  X,
  GripVertical,
  Sparkles,
  ChevronDown,
  ChevronUp,
  User,
} from 'lucide-react';
import { useQuickVideoV2 } from '../QuickVideoV2Context';
import { getTemplatePreviews } from '@/lib/data/video-templates-v2';
import { VIDEO_V2_CONFIG } from '@/lib/types/quick-video-v2';
import type { ExportFormat } from '@/lib/types/video-project';
import { SUPPORTED_LANGUAGES } from '@/lib/data/deepgram-voices';

// ============================================================================
// Drop Zone
// ============================================================================

function DropZone() {
  const { addImages, project } = useQuickVideoV2();
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const files = Array.from(e.dataTransfer.files);
      addImages(files);
    },
    [addImages]
  );

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files) {
        addImages(Array.from(e.target.files));
      }
    },
    [addImages]
  );

  const remaining = VIDEO_V2_CONFIG.maxImages - project.images.length;

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={() => inputRef.current?.click()}
      className={`
        relative cursor-pointer rounded-2xl border-2 border-dashed transition-all duration-300
        ${isDragging
          ? 'border-emerald-500 bg-emerald-500/10'
          : 'border-zinc-300 dark:border-white/10 hover:border-zinc-400 dark:hover:border-white/20 bg-zinc-50 dark:bg-white/5 hover:bg-zinc-100 dark:hover:bg-white/[0.07]'
        }
      `}
    >
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleFileSelect}
        className="hidden"
      />

      <div className="flex flex-col items-center justify-center py-8 px-4">
        <div
          className={`
            w-12 h-12 rounded-2xl flex items-center justify-center mb-3 transition-colors
            ${isDragging ? 'bg-emerald-500/20 text-emerald-400' : 'bg-zinc-200 dark:bg-white/10 text-zinc-500 dark:text-zinc-400'}
          `}
        >
          <Upload size={24} />
        </div>
        <p className="text-sm font-medium text-zinc-900 dark:text-white mb-1">
          Drop images here
        </p>
        <p className="text-xs text-zinc-500">
          or click to browse ({remaining} remaining)
        </p>
      </div>
    </div>
  );
}

// ============================================================================
// Image Thumbnails
// ============================================================================

function ImageThumbnails() {
  const { project, removeImage, reorderImages, updateImageLabel } = useQuickVideoV2();

  if (project.images.length === 0) return null;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
          Images ({project.images.length}/{VIDEO_V2_CONFIG.maxImages})
        </p>
        <p className="text-xs text-zinc-500">Drag to reorder</p>
      </div>

      <Reorder.Group
        axis="y"
        values={project.images}
        onReorder={(newOrder) => {
          // Find the indices that changed
          const fromIndex = project.images.findIndex(
            (img, i) => img.id !== newOrder[i]?.id
          );
          if (fromIndex !== -1) {
            const item = project.images[fromIndex];
            const toIndex = newOrder.findIndex((img) => img.id === item.id);
            if (toIndex !== -1) {
              reorderImages(fromIndex, toIndex);
            }
          }
        }}
        className="space-y-2"
      >
        {project.images.map((image, index) => (
          <Reorder.Item
            key={image.id}
            value={image}
            className="flex items-center gap-3 p-2 bg-zinc-50 dark:bg-white/5 rounded-xl border border-zinc-200 dark:border-white/5 group cursor-grab active:cursor-grabbing"
          >
            <GripVertical size={14} className="text-zinc-600 flex-shrink-0" />

            {/* Thumbnail */}
            <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 bg-zinc-200 dark:bg-zinc-800">
              <img
                src={image.url}
                alt={image.label || `Image ${index + 1}`}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Label Input */}
            <input
              type="text"
              value={image.label || ''}
              onChange={(e) => updateImageLabel(image.id, e.target.value)}
              placeholder={`Room ${index + 1}`}
              className="flex-1 min-w-0 bg-transparent text-sm text-zinc-900 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-600 focus:outline-none"
            />

            {/* Remove Button */}
            <button
              onClick={() => removeImage(image.id)}
              className="p-1.5 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-red-500/20 transition-all"
            >
              <X size={14} className="text-red-400" />
            </button>
          </Reorder.Item>
        ))}
      </Reorder.Group>
    </div>
  );
}

// ============================================================================
// Template Selector - Visual Style Cards
// ============================================================================

// Style visual configurations with gradients and icons
const STYLE_VISUALS: Record<string, { gradient: string; icon: string; pattern?: string }> = {
  'luxe-estate': {
    gradient: 'linear-gradient(135deg, #1c1917 0%, #292524 50%, #d4af37 150%)',
    icon: '🏛️',
    pattern: 'radial-gradient(circle at 80% 20%, rgba(212, 175, 55, 0.3) 0%, transparent 50%)',
  },
  'modern-living': {
    gradient: 'linear-gradient(135deg, #09090b 0%, #18181b 50%, #8b5cf6 150%)',
    icon: '🏢',
    pattern: 'linear-gradient(45deg, rgba(139, 92, 246, 0.2) 0%, transparent 60%)',
  },
  'cozy-home': {
    gradient: 'linear-gradient(135deg, #1c1917 0%, #292524 50%, #f59e0b 150%)',
    icon: '🏡',
    pattern: 'radial-gradient(circle at 20% 80%, rgba(245, 158, 11, 0.3) 0%, transparent 50%)',
  },
  'urban-loft': {
    gradient: 'linear-gradient(135deg, #0f0f0f 0%, #171717 50%, #06b6d4 150%)',
    icon: '🌆',
    pattern: 'linear-gradient(135deg, rgba(6, 182, 212, 0.2) 0%, transparent 70%)',
  },
  'classic-elegance': {
    gradient: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #a78bfa 150%)',
    icon: '✨',
    pattern: 'radial-gradient(circle at 50% 0%, rgba(167, 139, 250, 0.25) 0%, transparent 50%)',
  },
  'quick-tour': {
    gradient: 'linear-gradient(135deg, #0f0f0f 0%, #171717 50%, #f43f5e 150%)',
    icon: '⚡',
    pattern: 'linear-gradient(90deg, rgba(244, 63, 94, 0.2) 0%, transparent 50%)',
  },
};

function TemplateSelector() {
  const { project, setTemplate } = useQuickVideoV2();
  const templates = getTemplatePreviews();

  return (
    <div className="space-y-3">
      <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
        Style
      </p>

      <div className="grid grid-cols-2 gap-2">
        {templates.map((template) => {
          const isSelected = project.templateId === template.id;
          const visual = STYLE_VISUALS[template.id] || {
            gradient: `linear-gradient(135deg, #09090b 0%, #18181b 50%, ${template.accentColor} 150%)`,
            icon: '🎬',
          };

          return (
            <button
              key={template.id}
              onClick={() => setTemplate(template.id)}
              className={`
                relative overflow-hidden rounded-xl border-2 transition-all duration-300 text-left group
                ${isSelected
                  ? 'border-emerald-500 ring-2 ring-emerald-500/20'
                  : 'border-zinc-200 dark:border-white/10 hover:border-zinc-300 dark:hover:border-white/20'
                }
              `}
            >
              {/* Visual Background */}
              <div
                className="absolute inset-0 transition-transform duration-500 group-hover:scale-110"
                style={{ background: visual.gradient }}
              />

              {/* Pattern Overlay */}
              {visual.pattern && (
                <div
                  className="absolute inset-0 opacity-60"
                  style={{ background: visual.pattern }}
                />
              )}

              {/* Content */}
              <div className="relative p-3">
                {/* Icon */}
                <div className="w-10 h-10 rounded-xl bg-black/30 backdrop-blur-sm flex items-center justify-center mb-2 text-xl border border-white/10">
                  {visual.icon}
                </div>

                <p className="text-sm font-semibold text-white truncate drop-shadow-md">
                  {template.name}
                </p>
                <p className="text-xs text-white/70 truncate">
                  {template.description}
                </p>

                {/* Tags */}
                <div className="flex gap-1 mt-2">
                  {template.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-1.5 py-0.5 text-[10px] font-medium rounded bg-black/30 backdrop-blur-sm text-white/80 border border-white/10"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                {/* Selection Indicator */}
                {isSelected && (
                  <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center">
                    <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ============================================================================
// Format Selector - Social Platform Icons
// ============================================================================

// Social platform SVG icons
const SocialIcons = {
  tiktok: (
    <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
      <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-1-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1-.1z"/>
    </svg>
  ),
  instagram: (
    <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
    </svg>
  ),
  youtube: (
    <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
      <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
    </svg>
  ),
  facebook: (
    <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
    </svg>
  ),
};

function FormatSelector() {
  const { project, setFormat } = useQuickVideoV2();

  const formats: {
    id: ExportFormat;
    label: string;
    ratio: string;
    platforms: { name: string; icon: React.ReactNode; color: string }[];
  }[] = [
    {
      id: 'vertical',
      label: 'Reels & TikTok',
      ratio: '9:16',
      platforms: [
        { name: 'TikTok', icon: SocialIcons.tiktok, color: '#000000' },
        { name: 'Reels', icon: SocialIcons.instagram, color: '#E4405F' },
        { name: 'Shorts', icon: SocialIcons.youtube, color: '#FF0000' },
      ]
    },
    {
      id: 'square',
      label: 'Feed Posts',
      ratio: '1:1',
      platforms: [
        { name: 'Instagram', icon: SocialIcons.instagram, color: '#E4405F' },
        { name: 'Facebook', icon: SocialIcons.facebook, color: '#1877F2' },
      ]
    },
    {
      id: 'landscape',
      label: 'YouTube & Web',
      ratio: '16:9',
      platforms: [
        { name: 'YouTube', icon: SocialIcons.youtube, color: '#FF0000' },
        { name: 'Facebook', icon: SocialIcons.facebook, color: '#1877F2' },
      ]
    },
  ];

  return (
    <div className="space-y-2">
      <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
        Format
      </p>
      <div className="flex gap-2">
        {formats.map((format) => {
          const isSelected = project.format === format.id;

          return (
            <button
              key={format.id}
              onClick={() => setFormat(format.id)}
              className={`
                flex-1 flex flex-col items-center gap-2 py-3 px-2 rounded-xl border-2 transition-all duration-300
                ${isSelected
                  ? 'border-emerald-500 bg-emerald-500/10'
                  : 'border-zinc-200 dark:border-white/10 hover:border-zinc-300 dark:hover:border-white/20 bg-zinc-50 dark:bg-white/5'
                }
              `}
            >
              {/* Platform Icons */}
              <div className="flex items-center justify-center gap-1">
                {format.platforms.slice(0, 3).map((platform, idx) => (
                  <div
                    key={platform.name}
                    className={`
                      w-7 h-7 rounded-lg flex items-center justify-center transition-all
                      ${isSelected ? 'text-white' : 'text-zinc-400 dark:text-zinc-500'}
                    `}
                    style={{
                      backgroundColor: isSelected ? platform.color : 'transparent',
                      border: isSelected ? 'none' : '1px solid rgba(255,255,255,0.1)'
                    }}
                    title={platform.name}
                  >
                    {platform.icon}
                  </div>
                ))}
              </div>

              {/* Ratio */}
              <span className={`
                text-xs font-bold
                ${isSelected ? 'text-emerald-400' : 'text-zinc-500 dark:text-zinc-400'}
              `}>
                {format.ratio}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ============================================================================
// Language Selector - Visual Cards
// ============================================================================

// Language visual configurations
const LANGUAGE_VISUALS: Record<string, { gradient: string; pattern?: string }> = {
  'en': {
    gradient: 'linear-gradient(135deg, #1e3a5f 0%, #2d5a87 100%)',
    pattern: 'radial-gradient(circle at 80% 20%, rgba(255,255,255,0.1) 0%, transparent 50%)',
  },
  'es': {
    gradient: 'linear-gradient(135deg, #c60b1e 0%, #ffc400 100%)',
    pattern: 'radial-gradient(circle at 20% 80%, rgba(255,255,255,0.15) 0%, transparent 50%)',
  },
  'fr': {
    gradient: 'linear-gradient(135deg, #002395 0%, #ed2939 100%)',
    pattern: 'linear-gradient(90deg, rgba(255,255,255,0.1) 33%, transparent 33%, transparent 66%, rgba(255,255,255,0.1) 66%)',
  },
  'de': {
    gradient: 'linear-gradient(180deg, #000000 0%, #dd0000 50%, #ffcc00 100%)',
  },
  'it': {
    gradient: 'linear-gradient(90deg, #009246 0%, #ffffff 50%, #ce2b37 100%)',
  },
  'pt': {
    gradient: 'linear-gradient(135deg, #006600 0%, #ff0000 100%)',
  },
  'nl': {
    gradient: 'linear-gradient(180deg, #ae1c28 0%, #ffffff 50%, #21468b 100%)',
  },
};

function LanguageSelector() {
  const { project, setLanguage } = useQuickVideoV2();

  return (
    <div className="space-y-2">
      <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
        Language
      </p>

      <div className="grid grid-cols-4 gap-2">
        {SUPPORTED_LANGUAGES.map((lang) => {
          const isSelected = project.language === lang.code;
          const visual = LANGUAGE_VISUALS[lang.code] || {
            gradient: 'linear-gradient(135deg, #374151 0%, #4b5563 100%)',
          };

          return (
            <button
              key={lang.code}
              onClick={() => setLanguage(lang.code)}
              className={`
                relative overflow-hidden rounded-xl border-2 transition-all duration-300 group
                ${isSelected
                  ? 'border-emerald-500 ring-2 ring-emerald-500/20'
                  : 'border-zinc-200 dark:border-white/10 hover:border-zinc-300 dark:hover:border-white/20'
                }
              `}
            >
              {/* Visual Background */}
              <div
                className="absolute inset-0 transition-transform duration-500 group-hover:scale-110"
                style={{ background: visual.gradient }}
              />

              {/* Pattern Overlay */}
              {visual.pattern && (
                <div
                  className="absolute inset-0 opacity-60"
                  style={{ background: visual.pattern }}
                />
              )}

              {/* Darkening overlay for better text readability */}
              <div className="absolute inset-0 bg-black/20" />

              {/* Content */}
              <div className="relative flex flex-col items-center py-2.5 px-1">
                <span className="text-2xl drop-shadow-lg mb-0.5">{lang.flag}</span>
                <span className="text-[10px] font-bold text-white truncate w-full text-center drop-shadow-md">
                  {lang.name}
                </span>
              </div>

              {/* Selection Indicator */}
              {isSelected && (
                <div className="absolute top-1 right-1 w-4 h-4 rounded-full bg-emerald-500 flex items-center justify-center">
                  <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ============================================================================
// Highlights Input
// ============================================================================

function HighlightsInput() {
  const { project, addHighlight, removeHighlight } = useQuickVideoV2();
  const [input, setInput] = useState('');

  const handleAdd = () => {
    if (input.trim()) {
      addHighlight(input.trim());
      setInput('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAdd();
    }
  };

  return (
    <div className="space-y-2">
      <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
        Property Highlights (Optional)
      </p>
      <p className="text-xs text-zinc-600">
        Add features the AI should mention
      </p>

      <div className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="e.g., Pool, Mountain views..."
          className="flex-1 px-3 py-2 rounded-xl bg-zinc-50 dark:bg-white/5 border border-zinc-200 dark:border-white/5 text-sm text-zinc-900 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-600 focus:outline-none focus:border-emerald-500/50"
        />
        <button
          onClick={handleAdd}
          disabled={!input.trim()}
          className="px-3 py-2 rounded-xl bg-zinc-200 dark:bg-white/10 hover:bg-zinc-300 dark:hover:bg-white/15 text-sm font-medium text-zinc-900 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Add
        </button>
      </div>

      {/* Tags */}
      {project.propertyHighlights.length > 0 && (
        <div className="flex flex-wrap gap-1.5 pt-1">
          {project.propertyHighlights.map((highlight) => (
            <span
              key={highlight}
              className="inline-flex items-center gap-1 px-2 py-1 bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 rounded-lg text-xs"
            >
              {highlight}
              <button
                onClick={() => removeHighlight(highlight)}
                className="hover:text-white transition-colors"
              >
                <X size={12} />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

// ============================================================================
// Agent Branding (Collapsible)
// ============================================================================

function AgentBrandingSection() {
  const { project, updateAgentBranding } = useQuickVideoV2();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border border-zinc-200 dark:border-white/5 rounded-xl overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-3 bg-zinc-50 dark:bg-white/5 hover:bg-zinc-100 dark:hover:bg-white/[0.07] transition-colors"
      >
        <div className="flex items-center gap-2">
          <User size={16} className="text-zinc-500 dark:text-zinc-400" />
          <span className="text-sm font-medium text-zinc-900 dark:text-white">Agent Branding</span>
          <span className="text-xs text-zinc-500">(Optional)</span>
        </div>
        {isOpen ? (
          <ChevronUp size={16} className="text-zinc-400" />
        ) : (
          <ChevronDown size={16} className="text-zinc-400" />
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: 'auto' }}
            exit={{ height: 0 }}
            className="overflow-hidden"
          >
            <div className="p-3 space-y-3 border-t border-zinc-200 dark:border-white/5">
              <input
                type="text"
                value={project.agentBranding?.name || ''}
                onChange={(e) => updateAgentBranding({ name: e.target.value })}
                placeholder="Your name"
                className="w-full px-3 py-2 rounded-lg bg-zinc-50 dark:bg-white/5 border border-zinc-200 dark:border-white/5 text-sm text-zinc-900 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-600 focus:outline-none focus:border-emerald-500/50"
              />
              <input
                type="text"
                value={project.agentBranding?.phone || ''}
                onChange={(e) => updateAgentBranding({ phone: e.target.value })}
                placeholder="Phone number"
                className="w-full px-3 py-2 rounded-lg bg-zinc-50 dark:bg-white/5 border border-zinc-200 dark:border-white/5 text-sm text-zinc-900 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-600 focus:outline-none focus:border-emerald-500/50"
              />
              <input
                type="text"
                value={project.agentBranding?.brokerageName || ''}
                onChange={(e) => updateAgentBranding({ brokerageName: e.target.value })}
                placeholder="Brokerage name"
                className="w-full px-3 py-2 rounded-lg bg-zinc-50 dark:bg-white/5 border border-zinc-200 dark:border-white/5 text-sm text-zinc-900 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-600 focus:outline-none focus:border-emerald-500/50"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ============================================================================
// Generate Script Button
// ============================================================================

function GenerateScriptButton() {
  const {
    project,
    isGeneratingScript,
    canGenerateScript,
    generateScript,
  } = useQuickVideoV2();

  return (
    <button
      onClick={generateScript}
      disabled={!canGenerateScript()}
      className={`
        w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-semibold transition-all duration-300
        ${canGenerateScript()
          ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white hover:from-emerald-500 hover:to-teal-500 shadow-lg shadow-emerald-600/25 dark:shadow-emerald-900/25'
          : 'bg-zinc-200 dark:bg-zinc-800 text-zinc-400 dark:text-zinc-500 cursor-not-allowed'
        }
      `}
    >
      {isGeneratingScript ? (
        <>
          <Sparkles size={18} className="animate-pulse" />
          <span>Generating Script...</span>
        </>
      ) : project.script ? (
        <>
          <Sparkles size={18} />
          <span>Regenerate Script</span>
        </>
      ) : (
        <>
          <Sparkles size={18} />
          <span>Generate AI Script</span>
        </>
      )}
    </button>
  );
}

// ============================================================================
// Main Upload Panel
// ============================================================================

export function UploadPanel() {
  return (
    <div className="h-full flex flex-col p-4 space-y-5 overflow-y-auto custom-scrollbar">
      {/* Drop Zone */}
      <DropZone />

      {/* Image Thumbnails */}
      <ImageThumbnails />

      {/* Divider */}
      <div className="h-px bg-zinc-200 dark:bg-white/5" />

      {/* Template Selector */}
      <TemplateSelector />

      {/* Format */}
      <FormatSelector />

      {/* Language */}
      <LanguageSelector />

      {/* Highlights */}
      <HighlightsInput />

      {/* Agent Branding */}
      <AgentBrandingSection />

      {/* Spacer */}
      <div className="flex-1" />

      {/* Generate Button */}
      <div className="sticky bottom-0 pt-4 bg-gradient-to-t from-white via-white dark:from-[#050505] dark:via-[#050505] to-transparent">
        <GenerateScriptButton />
      </div>
    </div>
  );
}

export default UploadPanel;
