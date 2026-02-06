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
          ? 'border-violet-500 bg-violet-500/10'
          : 'border-white/10 hover:border-white/20 bg-white/5 hover:bg-white/[0.07]'
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
            ${isDragging ? 'bg-violet-500/20 text-violet-400' : 'bg-white/10 text-zinc-400'}
          `}
        >
          <Upload size={24} />
        </div>
        <p className="text-sm font-medium text-white mb-1">
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
        <p className="text-xs font-medium text-zinc-400 uppercase tracking-wider">
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
            className="flex items-center gap-3 p-2 bg-white/5 rounded-xl border border-white/5 group cursor-grab active:cursor-grabbing"
          >
            <GripVertical size={14} className="text-zinc-600 flex-shrink-0" />

            {/* Thumbnail */}
            <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 bg-zinc-800">
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
              className="flex-1 min-w-0 bg-transparent text-sm text-white placeholder:text-zinc-600 focus:outline-none"
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
// Template Selector
// ============================================================================

function TemplateSelector() {
  const { project, setTemplate } = useQuickVideoV2();
  const templates = getTemplatePreviews();

  return (
    <div className="space-y-3">
      <p className="text-xs font-medium text-zinc-400 uppercase tracking-wider">
        Style
      </p>

      <div className="grid grid-cols-2 gap-2">
        {templates.map((template) => {
          const isSelected = project.templateId === template.id;

          return (
            <button
              key={template.id}
              onClick={() => setTemplate(template.id)}
              className={`
                relative p-3 rounded-xl border transition-all duration-200 text-left
                ${isSelected
                  ? 'border-violet-500 bg-violet-500/10'
                  : 'border-white/5 hover:border-white/15 bg-white/5 hover:bg-white/[0.07]'
                }
              `}
            >
              {/* Color Accent */}
              <div
                className="w-8 h-8 rounded-lg mb-2"
                style={{ backgroundColor: template.accentColor }}
              />

              <p className="text-sm font-medium text-white truncate">
                {template.name}
              </p>
              <p className="text-xs text-zinc-500 truncate">
                {template.description}
              </p>

              {/* Tags */}
              <div className="flex gap-1 mt-2">
                {template.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-1.5 py-0.5 text-[10px] font-medium rounded bg-white/10 text-zinc-400"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              {/* Selection Indicator */}
              {isSelected && (
                <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-violet-500" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ============================================================================
// Format Selector
// ============================================================================

function FormatSelector() {
  const { project, setFormat } = useQuickVideoV2();

  const formats: { id: ExportFormat; label: string; icon: string }[] = [
    { id: 'vertical', label: '9:16', icon: '📱' },
    { id: 'square', label: '1:1', icon: '⬜' },
    { id: 'landscape', label: '16:9', icon: '🖥️' },
  ];

  return (
    <div className="space-y-2">
      <p className="text-xs font-medium text-zinc-400 uppercase tracking-wider">
        Format
      </p>
      <div className="flex gap-2">
        {formats.map((format) => (
          <button
            key={format.id}
            onClick={() => setFormat(format.id)}
            className={`
              flex-1 flex flex-col items-center gap-1 py-2.5 rounded-xl border transition-all
              ${project.format === format.id
                ? 'border-violet-500 bg-violet-500/10 text-white'
                : 'border-white/5 hover:border-white/15 bg-white/5 text-zinc-400'
              }
            `}
          >
            <span className="text-lg">{format.icon}</span>
            <span className="text-xs font-medium">{format.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

// ============================================================================
// Language Selector
// ============================================================================

function LanguageSelector() {
  const { project, setLanguage } = useQuickVideoV2();

  return (
    <div className="space-y-2">
      <p className="text-xs font-medium text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
        🌐 Language
      </p>
      <p className="text-xs text-zinc-600">
        Script and voice narration language
      </p>

      <div className="grid grid-cols-4 gap-1.5">
        {SUPPORTED_LANGUAGES.map((lang) => (
          <button
            key={lang.code}
            onClick={() => setLanguage(lang.code)}
            className={`
              flex flex-col items-center gap-1 py-2 px-1 rounded-xl border transition-all
              ${project.language === lang.code
                ? 'border-violet-500 bg-violet-500/10 text-white'
                : 'border-white/5 hover:border-white/15 bg-white/5 text-zinc-400 hover:text-white'
              }
            `}
          >
            <span className="text-lg">{lang.flag}</span>
            <span className="text-[10px] font-medium truncate w-full text-center">
              {lang.name}
            </span>
          </button>
        ))}
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
      <p className="text-xs font-medium text-zinc-400 uppercase tracking-wider">
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
          className="flex-1 px-3 py-2 rounded-xl bg-white/5 border border-white/5 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-violet-500/50"
        />
        <button
          onClick={handleAdd}
          disabled={!input.trim()}
          className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-sm font-medium text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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
              className="inline-flex items-center gap-1 px-2 py-1 bg-violet-500/20 text-violet-300 rounded-lg text-xs"
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
    <div className="border border-white/5 rounded-xl overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-3 bg-white/5 hover:bg-white/[0.07] transition-colors"
      >
        <div className="flex items-center gap-2">
          <User size={16} className="text-zinc-400" />
          <span className="text-sm font-medium text-white">Agent Branding</span>
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
            <div className="p-3 space-y-3 border-t border-white/5">
              <input
                type="text"
                value={project.agentBranding?.name || ''}
                onChange={(e) => updateAgentBranding({ name: e.target.value })}
                placeholder="Your name"
                className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/5 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-violet-500/50"
              />
              <input
                type="text"
                value={project.agentBranding?.phone || ''}
                onChange={(e) => updateAgentBranding({ phone: e.target.value })}
                placeholder="Phone number"
                className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/5 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-violet-500/50"
              />
              <input
                type="text"
                value={project.agentBranding?.brokerageName || ''}
                onChange={(e) => updateAgentBranding({ brokerageName: e.target.value })}
                placeholder="Brokerage name"
                className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/5 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-violet-500/50"
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
          ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white hover:from-violet-500 hover:to-indigo-500 shadow-lg shadow-violet-900/25'
          : 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
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
      <div className="h-px bg-white/5" />

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
      <div className="sticky bottom-0 pt-4 bg-gradient-to-t from-[#050505] via-[#050505] to-transparent">
        <GenerateScriptButton />
      </div>
    </div>
  );
}

export default UploadPanel;
