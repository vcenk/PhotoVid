/**
 * AssetSidebar
 * Left sidebar with tabs for Media, Music, SFX, Text, Transitions, Effects
 * Glassmorphism card design with placeholder stock images
 */

import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Image,
  Music,
  Volume2,
  Type,
  Sparkles,
  Layers,
  Upload,
  Trash2,
  Play,
  Plus,
  Clock,
  ArrowRight,
  ArrowLeft,
  ArrowUp,
  ArrowDown,
  Minus,
  ZoomIn,
  ZoomOut,
  Droplets,
  Sun,
  Contrast,
  Palette,
  CircleDot,
  Eye,
  Zap,
  Flame,
  FileVideo,
} from 'lucide-react';
import { useVideoEditor } from '../VideoEditorContext';
import { TRANSITION_PRESETS, EFFECT_PRESETS, TEXT_PRESETS, createDefaultTextContent } from '@/lib/data/editor-presets';
import type { TransitionType, EffectType, TrackType } from '@/lib/types/video-editor';

type TabId = 'media' | 'music' | 'sfx' | 'text' | 'transitions' | 'effects';

const TABS: { id: TabId; label: string; icon: React.ReactNode }[] = [
  { id: 'media', label: 'Media', icon: <Image size={16} /> },
  { id: 'music', label: 'Music', icon: <Music size={16} /> },
  { id: 'sfx', label: 'SFX', icon: <Volume2 size={16} /> },
  { id: 'text', label: 'Text', icon: <Type size={16} /> },
  { id: 'transitions', label: 'Transitions', icon: <Layers size={16} /> },
  { id: 'effects', label: 'Effects', icon: <Sparkles size={16} /> },
];

// Placeholder stock images (Unsplash)
const STOCK_IMAGES = [
  { id: 'stock-1', name: 'Modern Kitchen', url: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=300&fit=crop', thumb: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=120&h=120&fit=crop' },
  { id: 'stock-2', name: 'Living Room', url: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=300&fit=crop', thumb: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=120&h=120&fit=crop' },
  { id: 'stock-3', name: 'House Exterior', url: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=400&h=300&fit=crop', thumb: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=120&h=120&fit=crop' },
  { id: 'stock-4', name: 'Bedroom', url: 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=400&h=300&fit=crop', thumb: 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=120&h=120&fit=crop' },
  { id: 'stock-5', name: 'Pool Area', url: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=400&h=300&fit=crop', thumb: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=120&h=120&fit=crop' },
  { id: 'stock-6', name: 'Bathroom', url: 'https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?w=400&h=300&fit=crop', thumb: 'https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?w=120&h=120&fit=crop' },
];

// ============================================
// GLASS CARD COMPONENT
// ============================================

const GlassCard: React.FC<{
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  hover?: boolean;
  disabled?: boolean;
}> = ({ children, className = '', onClick, hover = true, disabled }) => (
  <div
    onClick={disabled ? undefined : onClick}
    className={`
      relative overflow-hidden rounded-xl
      bg-white/[0.04] backdrop-blur-sm
      border border-white/[0.08]
      ${hover && !disabled ? 'hover:bg-white/[0.08] hover:border-purple-500/30 hover:shadow-lg hover:shadow-purple-500/5 cursor-pointer' : ''}
      ${disabled ? 'opacity-40 cursor-not-allowed' : ''}
      transition-all duration-300
      ${className}
    `}
  >
    {/* Glass highlight */}
    <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
    {children}
  </div>
);

// ============================================
// MAIN SIDEBAR
// ============================================

export const AssetSidebar: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabId>('media');

  return (
    <div className="w-[300px] flex-shrink-0 bg-[#0c0c0e]/80 backdrop-blur-xl border-r border-white/[0.06] flex flex-col">
      {/* Tab Navigation */}
      <div className="flex-shrink-0 border-b border-white/[0.06]">
        <div className="flex px-1.5 py-1.5 gap-0.5 overflow-x-auto scrollbar-hide">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex flex-col items-center gap-1 px-2.5 py-2 rounded-lg transition-all flex-shrink-0 relative ${
                activeTab === tab.id
                  ? 'text-purple-400'
                  : 'text-zinc-500 hover:text-zinc-300 hover:bg-white/[0.04]'
              }`}
            >
              {activeTab === tab.id && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute inset-0 rounded-lg bg-purple-500/15 border border-purple-500/20"
                  transition={{ type: 'spring', bounce: 0.15, duration: 0.4 }}
                />
              )}
              <span className="relative z-10">{tab.icon}</span>
              <span className="relative z-10 text-[9px] font-medium leading-none">{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
        <AnimatePresence mode="wait">
          {activeTab === 'media' && <MediaTab key="media" />}
          {activeTab === 'music' && <AudioTab key="music" type="music" />}
          {activeTab === 'sfx' && <AudioTab key="sfx" type="sfx" />}
          {activeTab === 'text' && <TextTab key="text" />}
          {activeTab === 'transitions' && <TransitionsTab key="transitions" />}
          {activeTab === 'effects' && <EffectsTab key="effects" />}
        </AnimatePresence>
      </div>
    </div>
  );
};

// ============================================
// MEDIA TAB
// ============================================

const MediaTab: React.FC = () => {
  const { project, addAsset, addAssets, removeAsset, addClip } = useVideoEditor();
  const [isDragging, setIsDragging] = useState(false);

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files).filter(
      f => f.type.startsWith('image/') || f.type.startsWith('video/')
    );
    if (files.length > 0) {
      await addAssets(files);
    }
  }, [addAssets]);

  const handleFileInput = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      await addAssets(files);
    }
    e.target.value = '';
  }, [addAssets]);

  const mediaAssets = Object.values(project.assets).filter(
    a => a.type === 'image' || a.type === 'video'
  );

  const handleAddToTimeline = useCallback((assetId: string) => {
    const visualTrack = project.tracks.find(t => t.type === 'visual');
    if (visualTrack) {
      addClip(assetId, visualTrack.id, project.currentFrame);
    }
  }, [project.tracks, project.currentFrame, addClip]);

  // Add stock image as asset, then to timeline
  const handleAddStock = useCallback(async (stock: typeof STOCK_IMAGES[0]) => {
    try {
      const response = await fetch(stock.url);
      const blob = await response.blob();
      const file = new File([blob], `${stock.name}.jpg`, { type: 'image/jpeg' });
      const asset = await addAsset(file);
      const visualTrack = project.tracks.find(t => t.type === 'visual');
      if (visualTrack) {
        addClip(asset.id, visualTrack.id, project.currentFrame);
      }
    } catch {
      // Silently fail for stock images
    }
  }, [addAsset, addClip, project.tracks, project.currentFrame]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.2 }}
      className="p-3 space-y-3"
    >
      {/* Upload Zone */}
      <GlassCard hover={false} className="!cursor-default">
        <div
          onDrop={handleDrop}
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          className={`relative p-5 text-center transition-all cursor-pointer ${
            isDragging ? 'bg-purple-500/10' : ''
          }`}
        >
          <input
            type="file"
            accept="image/*,video/*"
            multiple
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
            onChange={handleFileInput}
          />
          <div className={`w-10 h-10 mx-auto mb-2.5 rounded-full flex items-center justify-center transition-all ${
            isDragging
              ? 'bg-purple-500/20 border border-purple-500/40'
              : 'bg-white/[0.06] border border-white/[0.08]'
          }`}>
            <Upload size={18} className={isDragging ? 'text-purple-400' : 'text-zinc-400'} />
          </div>
          <p className="text-sm font-medium text-zinc-300">Drop images or videos</p>
          <p className="text-[11px] text-zinc-500 mt-1">or click to browse</p>
        </div>
      </GlassCard>

      {/* Uploaded Assets */}
      {mediaAssets.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-2 px-0.5">
            <span className="text-[11px] font-medium text-zinc-400 uppercase tracking-wider">Your Media</span>
            <span className="text-[10px] text-zinc-600">{mediaAssets.length} items</span>
          </div>
          <div className="grid grid-cols-3 gap-1.5">
            {mediaAssets.map((asset) => (
              <GlassCard key={asset.id} className="!rounded-lg" onClick={() => handleAddToTimeline(asset.id)}>
                <div className="relative aspect-square group">
                  {asset.type === 'image' ? (
                    <img
                      src={asset.url}
                      alt={asset.name}
                      className="w-full h-full object-cover rounded-lg"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-lg flex items-center justify-center">
                      <FileVideo size={20} className="text-blue-400" />
                    </div>
                  )}
                  {/* Hover overlay */}
                  <div className="absolute inset-0 rounded-lg bg-black/0 group-hover:bg-black/40 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                    <Plus size={20} className="text-white" />
                  </div>
                  {/* Delete button */}
                  <button
                    onClick={(e) => { e.stopPropagation(); removeAsset(asset.id); }}
                    className="absolute top-1 right-1 p-0.5 rounded-md bg-black/60 backdrop-blur-sm border border-white/10 opacity-0 group-hover:opacity-100 hover:bg-red-500/80 transition-all"
                  >
                    <Trash2 size={10} className="text-white" />
                  </button>
                  {/* Video badge */}
                  {asset.type === 'video' && (
                    <div className="absolute bottom-1 left-1 px-1 py-0.5 rounded bg-black/60 backdrop-blur-sm border border-white/10">
                      <Play size={8} className="text-white" />
                    </div>
                  )}
                </div>
              </GlassCard>
            ))}
          </div>
        </div>
      )}

      {/* Stock Photos Section */}
      <div>
        <div className="flex items-center justify-between mb-2 px-0.5">
          <span className="text-[11px] font-medium text-zinc-400 uppercase tracking-wider">Stock Photos</span>
          <span className="text-[10px] text-purple-400/70">Real Estate</span>
        </div>
        <div className="grid grid-cols-3 gap-1.5">
          {STOCK_IMAGES.map((stock) => (
            <GlassCard key={stock.id} className="!rounded-lg" onClick={() => handleAddStock(stock)}>
              <div className="relative aspect-square group">
                <img
                  src={stock.thumb}
                  alt={stock.name}
                  className="w-full h-full object-cover rounded-lg"
                  loading="lazy"
                />
                {/* Glass overlay on hover */}
                <div className="absolute inset-0 rounded-lg bg-black/0 group-hover:bg-black/40 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                  <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20">
                    <Plus size={12} className="text-white" />
                    <span className="text-[10px] text-white font-medium">Add</span>
                  </div>
                </div>
                {/* Name label */}
                <div className="absolute bottom-0 inset-x-0 p-1.5 bg-gradient-to-t from-black/80 to-transparent rounded-b-lg">
                  <p className="text-[9px] text-white/80 truncate">{stock.name}</p>
                </div>
              </div>
            </GlassCard>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

// ============================================
// AUDIO TAB (Music/SFX)
// ============================================

const AudioTab: React.FC<{ type: 'music' | 'sfx' }> = ({ type }) => {
  const { project, addAssets, removeAsset, addClip } = useVideoEditor();
  const [isDragging, setIsDragging] = useState(false);

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith('audio/'));
    if (files.length > 0) {
      await addAssets(files);
    }
  }, [addAssets]);

  const handleFileInput = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      await addAssets(files);
    }
    e.target.value = '';
  }, [addAssets]);

  const audioAssets = Object.values(project.assets).filter(a => a.type === 'audio');

  const handleAddToTimeline = useCallback((assetId: string) => {
    const trackName = type === 'music' ? 'Music' : 'SFX';
    const audioTrack = project.tracks.find(t => t.type === 'audio' && t.name === trackName);
    if (audioTrack) {
      addClip(assetId, audioTrack.id, project.currentFrame);
    }
  }, [project.tracks, project.currentFrame, addClip, type]);

  const formatDuration = (frames?: number) => {
    if (!frames) return '--:--';
    const seconds = Math.floor(frames / 30);
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.2 }}
      className="p-3 space-y-3"
    >
      {/* Upload Zone */}
      <GlassCard hover={false}>
        <div
          onDrop={handleDrop}
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          className={`relative p-5 text-center transition-all cursor-pointer ${
            isDragging ? 'bg-purple-500/10' : ''
          }`}
        >
          <input
            type="file"
            accept="audio/*"
            multiple
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
            onChange={handleFileInput}
          />
          <div className={`w-10 h-10 mx-auto mb-2.5 rounded-full flex items-center justify-center transition-all ${
            isDragging
              ? 'bg-purple-500/20 border border-purple-500/40'
              : 'bg-white/[0.06] border border-white/[0.08]'
          }`}>
            {type === 'music'
              ? <Music size={18} className={isDragging ? 'text-purple-400' : 'text-zinc-400'} />
              : <Volume2 size={18} className={isDragging ? 'text-purple-400' : 'text-zinc-400'} />
            }
          </div>
          <p className="text-sm font-medium text-zinc-300">
            Drop {type === 'music' ? 'music files' : 'sound effects'}
          </p>
          <p className="text-[11px] text-zinc-500 mt-1">MP3, WAV, M4A supported</p>
        </div>
      </GlassCard>

      {/* Audio List */}
      {audioAssets.length > 0 ? (
        <div className="space-y-1.5">
          {audioAssets.map((asset) => (
            <GlassCard key={asset.id} onClick={() => handleAddToTimeline(asset.id)}>
              <div className="flex items-center gap-3 p-3 group">
                <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-purple-500/20 to-indigo-500/20 border border-purple-500/10 flex items-center justify-center flex-shrink-0">
                  {type === 'music' ? <Music size={16} className="text-purple-400" /> : <Volume2 size={16} className="text-purple-400" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] text-white truncate">{asset.name}</p>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <Clock size={10} className="text-zinc-600" />
                    <p className="text-[11px] text-zinc-500">{formatDuration(asset.duration)}</p>
                  </div>
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); removeAsset(asset.id); }}
                  className="p-1 rounded-md opacity-0 group-hover:opacity-100 hover:bg-red-500/20 transition-all"
                >
                  <Trash2 size={12} className="text-red-400" />
                </button>
              </div>
            </GlassCard>
          ))}
        </div>
      ) : (
        <div className="text-center py-6">
          <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-white/[0.04] border border-white/[0.06] flex items-center justify-center">
            {type === 'music'
              ? <Music size={20} className="text-zinc-600" />
              : <Volume2 size={20} className="text-zinc-600" />
            }
          </div>
          <p className="text-sm text-zinc-500">No {type === 'music' ? 'music' : 'sound effects'} yet</p>
          <p className="text-[11px] text-zinc-600 mt-1">Upload audio to add to your video</p>
        </div>
      )}
    </motion.div>
  );
};

// ============================================
// TEXT TAB
// ============================================

const TextTab: React.FC = () => {
  const { project, addTextClip } = useVideoEditor();

  const handleAddText = useCallback((presetId: string) => {
    const textTrack = project.tracks.find(t => t.type === 'text');
    if (textTrack) {
      const content = createDefaultTextContent(presetId);
      addTextClip(textTrack.id, project.currentFrame, content);
    }
  }, [project.tracks, project.currentFrame, addTextClip]);

  const presetIcons: Record<string, React.ReactNode> = {
    'title': <span className="text-lg font-bold">T</span>,
    'subtitle': <span className="text-sm font-medium">Aa</span>,
    'lower-third': <Minus size={16} />,
    'caption': <span className="text-[10px]">CC</span>,
    'heading-top': <ArrowUp size={14} />,
    'quote': <span className="text-lg italic font-serif">"</span>,
    'price-tag': <span className="text-sm font-bold">$</span>,
    'cta': <Zap size={14} />,
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.2 }}
      className="p-3 space-y-1.5"
    >
      <p className="text-[11px] text-zinc-500 px-0.5 mb-2">Click to add text at playhead</p>

      {TEXT_PRESETS.map((preset, i) => (
        <motion.div
          key={preset.id}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.03 }}
        >
          <GlassCard onClick={() => handleAddText(preset.id)}>
            <div className="flex items-center gap-3 p-3 group">
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center text-center flex-shrink-0 border border-white/[0.06]"
                style={{
                  background: preset.content.backgroundColor
                    ? `linear-gradient(135deg, ${preset.content.backgroundColor}, ${preset.content.backgroundColor}88)`
                    : 'linear-gradient(135deg, rgba(139, 92, 246, 0.15), rgba(99, 102, 241, 0.1))',
                }}
              >
                <span style={{ color: preset.content.color || '#FFFFFF' }}>
                  {presetIcons[preset.id] || <Type size={14} />}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[13px] text-white font-medium">{preset.name}</p>
                <p className="text-[11px] text-zinc-500 truncate">{preset.description}</p>
              </div>
              <Plus size={14} className="text-zinc-600 group-hover:text-purple-400 transition-colors flex-shrink-0" />
            </div>
          </GlassCard>
        </motion.div>
      ))}
    </motion.div>
  );
};

// ============================================
// TRANSITIONS TAB
// ============================================

const transitionIcons: Record<string, React.ReactNode> = {
  'fade': <Droplets size={18} />,
  'dissolve': <CircleDot size={18} />,
  'slide-left': <ArrowLeft size={18} />,
  'slide-right': <ArrowRight size={18} />,
  'slide-up': <ArrowUp size={18} />,
  'slide-down': <ArrowDown size={18} />,
  'wipe-left': <ArrowLeft size={18} />,
  'wipe-right': <ArrowRight size={18} />,
  'zoom-in': <ZoomIn size={18} />,
  'zoom-out': <ZoomOut size={18} />,
};

const transitionGradients: Record<string, string> = {
  'fade': 'from-amber-500/20 to-orange-500/20',
  'dissolve': 'from-pink-500/20 to-rose-500/20',
  'slide-left': 'from-blue-500/20 to-cyan-500/20',
  'slide-right': 'from-cyan-500/20 to-blue-500/20',
  'slide-up': 'from-emerald-500/20 to-green-500/20',
  'slide-down': 'from-green-500/20 to-emerald-500/20',
  'wipe-left': 'from-violet-500/20 to-purple-500/20',
  'wipe-right': 'from-purple-500/20 to-violet-500/20',
  'zoom-in': 'from-indigo-500/20 to-blue-500/20',
  'zoom-out': 'from-blue-500/20 to-indigo-500/20',
};

const TransitionsTab: React.FC = () => {
  const { project, addTransition } = useVideoEditor();
  const selectedClipId = project.selectedClipId;

  const handleApplyTransition = useCallback((type: TransitionType) => {
    if (!selectedClipId) return;
    const clip = project.clips[selectedClipId];
    if (!clip) return;
    const track = project.tracks.find(t => t.id === clip.trackId);
    if (!track) return;
    const clipIndex = track.clips.indexOf(selectedClipId);
    const nextClipId = track.clips[clipIndex + 1];
    if (nextClipId) {
      addTransition(selectedClipId, nextClipId, type);
    }
  }, [selectedClipId, project.clips, project.tracks, addTransition]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.2 }}
      className="p-3"
    >
      <p className="text-[11px] text-zinc-500 px-0.5 mb-3">
        {selectedClipId ? 'Apply transition after selected clip' : 'Select a clip first to apply transitions'}
      </p>

      <div className="grid grid-cols-2 gap-1.5">
        {TRANSITION_PRESETS.map((preset, i) => (
          <motion.div
            key={preset.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.03 }}
          >
            <GlassCard
              onClick={() => handleApplyTransition(preset.type)}
              disabled={!selectedClipId}
            >
              <div className="p-3 text-center group">
                <div className={`w-full h-14 rounded-lg bg-gradient-to-br ${transitionGradients[preset.id] || 'from-purple-500/20 to-indigo-500/20'} border border-white/[0.04] flex items-center justify-center mb-2`}>
                  <span className="text-white/70 group-hover:text-white transition-colors">
                    {transitionIcons[preset.id] || <Layers size={18} />}
                  </span>
                </div>
                <span className="text-[11px] text-zinc-300 font-medium">{preset.name}</span>
              </div>
            </GlassCard>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

// ============================================
// EFFECTS TAB
// ============================================

const effectIcons: Record<string, React.ReactNode> = {
  'brightness': <Sun size={16} />,
  'contrast': <Contrast size={16} />,
  'saturation': <Palette size={16} />,
  'sepia': <Flame size={16} />,
  'grayscale': <Eye size={16} />,
  'blur': <Droplets size={16} />,
  'glitch': <Zap size={16} />,
  'vignette': <CircleDot size={16} />,
  'light-leak': <Sparkles size={16} />,
};

const effectGradients: Record<string, string> = {
  'brightness': 'from-yellow-500/20 to-amber-500/20',
  'contrast': 'from-zinc-500/20 to-neutral-500/20',
  'saturation': 'from-pink-500/20 to-rose-500/20',
  'sepia': 'from-amber-500/20 to-orange-500/20',
  'grayscale': 'from-zinc-500/20 to-slate-500/20',
  'blur': 'from-sky-500/20 to-blue-500/20',
  'glitch': 'from-red-500/20 to-pink-500/20',
  'vignette': 'from-indigo-500/20 to-purple-500/20',
  'light-leak': 'from-orange-500/20 to-yellow-500/20',
};

const EffectsTab: React.FC = () => {
  const { project, addEffect } = useVideoEditor();
  const selectedClipId = project.selectedClipId;

  const handleApplyEffect = useCallback((type: EffectType, intensity: number) => {
    if (!selectedClipId) return;
    addEffect(selectedClipId, type, intensity);
  }, [selectedClipId, addEffect]);

  const effectsByCategory = EFFECT_PRESETS.reduce((acc, effect) => {
    if (!acc[effect.category]) acc[effect.category] = [];
    acc[effect.category].push(effect);
    return acc;
  }, {} as Record<string, typeof EFFECT_PRESETS>);

  const categoryLabels: Record<string, string> = {
    color: 'Color',
    blur: 'Blur',
    stylize: 'Stylize',
    overlay: 'Overlays',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.2 }}
      className="p-3"
    >
      <p className="text-[11px] text-zinc-500 px-0.5 mb-3">
        {selectedClipId ? 'Apply effect to selected clip' : 'Select a clip first to apply effects'}
      </p>

      {Object.entries(effectsByCategory).map(([category, effects]) => (
        <div key={category} className="mb-4">
          <h4 className="text-[10px] font-semibold text-zinc-400 uppercase tracking-widest mb-2 px-0.5">
            {categoryLabels[category] || category}
          </h4>
          <div className="grid grid-cols-3 gap-1.5">
            {effects.map((effect, i) => (
              <motion.div
                key={effect.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.03 }}
              >
                <GlassCard
                  onClick={() => handleApplyEffect(effect.type, effect.defaultIntensity)}
                  disabled={!selectedClipId}
                >
                  <div className="p-2 text-center group">
                    <div className={`w-full h-10 rounded-lg bg-gradient-to-br ${effectGradients[effect.id] || 'from-purple-500/20 to-indigo-500/20'} border border-white/[0.04] flex items-center justify-center mb-1.5`}>
                      <span className="text-white/70 group-hover:text-white transition-colors">
                        {effectIcons[effect.id] || <Sparkles size={16} />}
                      </span>
                    </div>
                    <span className="text-[10px] text-zinc-300 font-medium">{effect.name}</span>
                  </div>
                </GlassCard>
              </motion.div>
            ))}
          </div>
        </div>
      ))}
    </motion.div>
  );
};
