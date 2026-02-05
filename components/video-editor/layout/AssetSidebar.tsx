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
import { MUSIC_LIBRARY, GENRE_COLORS, formatDuration as formatMusicDuration } from '@/lib/data/music-library';
import { SFX_LIBRARY, CATEGORY_COLORS } from '@/lib/data/sfx-library';
import type { TransitionType, EffectType, TrackType, EditorAsset } from '@/lib/types/video-editor';
import type { MusicTrack } from '@/lib/data/music-library';
import type { SoundEffect } from '@/lib/data/sfx-library';

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
      relative overflow-hidden rounded-2xl
      bg-white/5 backdrop-blur-md
      border border-white/5
      ${hover && !disabled ? 'hover:bg-white/10 hover:border-purple-500/30 hover:shadow-xl hover:shadow-purple-900/10 cursor-pointer active:scale-[0.98]' : ''}
      ${disabled ? 'opacity-30 cursor-not-allowed' : ''}
      transition-all duration-300
      ${className}
    `}
  >
    {children}
  </div>
);

// ============================================
// MAIN SIDEBAR
// ============================================

export const AssetSidebar: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabId>('media');

  return (
    <div className="w-[380px] flex-shrink-0 bg-zinc-950/40 backdrop-blur-2xl border-r border-white/5 flex flex-col relative z-20">
      {/* Tab Navigation */}
      <div className="flex-shrink-0 p-3">
        <div className="flex bg-black/40 rounded-2xl p-1.5 gap-1 overflow-x-auto scrollbar-hide border border-white/5 shadow-inner shadow-black/50">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex flex-col items-center justify-center gap-1.5 px-2 py-2.5 rounded-xl transition-all duration-300 flex-1 min-w-[50px] relative group ${
                activeTab === tab.id
                  ? 'text-white'
                  : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              {activeTab === tab.id && (
                <motion.div
                  layoutId="activeTabSidebar"
                  className="absolute inset-0 rounded-xl bg-gradient-to-br from-purple-600 to-indigo-600 shadow-lg shadow-purple-900/30"
                  transition={{ type: 'spring', bounce: 0.2, duration: 0.5 }}
                />
              )}
              <span className="relative z-10 transition-transform duration-300 group-hover:scale-110">{tab.icon}</span>
              <span className="relative z-10 text-[9px] font-bold uppercase tracking-tighter leading-none">{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
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
    const allFiles: File[] = Array.from(e.dataTransfer.files);
    const files = allFiles.filter(
      f => f.type.startsWith('image/') || f.type.startsWith('video/')
    );
    if (files.length > 0) {
      await addAssets(files);
    }
  }, [addAssets]);

  const handleFileInput = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []) as File[];
    if (files.length > 0) {
      await addAssets(files);
    }
    e.target.value = '';
  }, [addAssets]);

  const mediaAssets = (Object.values(project.assets) as EditorAsset[]).filter(
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
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -10 }}
      transition={{ duration: 0.3 }}
      className="p-4 space-y-6"
    >
      {/* Upload Zone */}
      <div
        onDrop={handleDrop}
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        className={`relative p-8 text-center rounded-2xl border-2 border-dashed transition-all duration-300 group overflow-hidden ${
          isDragging 
            ? 'border-purple-500 bg-purple-600/10 scale-[1.02]' 
            : 'border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10'
        }`}
      >
        <input
          type="file"
          accept="image/*,video/*"
          multiple
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
          onChange={handleFileInput}
        />
        <div className={`w-12 h-12 mx-auto mb-3 rounded-2xl flex items-center justify-center transition-all duration-300 ${
          isDragging
            ? 'bg-purple-600 text-white shadow-lg shadow-purple-900/40'
            : 'bg-white/5 text-zinc-400 group-hover:bg-purple-600/20 group-hover:text-purple-300'
        }`}>
          <Upload size={20} />
        </div>
        <p className="text-sm font-semibold text-white">Upload Assets</p>
        <p className="text-[10px] text-zinc-500 mt-1 uppercase tracking-widest font-bold">Images & Videos</p>
        
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:12px_12px]" />
      </div>

      {/* Uploaded Assets */}
      {mediaAssets.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Your Gallery</span>
            <span className="text-[10px] font-bold bg-white/5 px-2 py-0.5 rounded-full text-zinc-400">{mediaAssets.length}</span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {mediaAssets.map((asset) => (
              <GlassCard key={asset.id} onClick={() => handleAddToTimeline(asset.id)}>
                <div className="relative aspect-video group overflow-hidden">
                  {asset.type === 'image' ? (
                    <img
                      src={asset.url}
                      alt={asset.name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center">
                      <FileVideo size={24} className="text-blue-400" />
                    </div>
                  )}
                  {/* Hover overlay */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-purple-600/40 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                    <div className="bg-white text-black p-1.5 rounded-full shadow-lg">
                        <Plus size={18} />
                    </div>
                  </div>
                  {/* Delete button */}
                  <button
                    onClick={(e) => { e.stopPropagation(); removeAsset(asset.id); }}
                    className="absolute top-2 right-2 p-1.5 rounded-xl bg-black/60 backdrop-blur-md border border-white/10 opacity-0 group-hover:opacity-100 hover:bg-red-500 transition-all"
                  >
                    <Trash2 size={12} className="text-white" />
                  </button>
                </div>
              </GlassCard>
            ))}
          </div>
        </div>
      )}

      {/* Stock Photos Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Quick Templates</span>
          <span className="text-[10px] font-bold text-purple-400">Premium</span>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {STOCK_IMAGES.map((stock) => (
            <GlassCard key={stock.id} onClick={() => handleAddStock(stock)}>
              <div className="relative aspect-square group overflow-hidden">
                <img
                  src={stock.thumb}
                  alt={stock.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60 group-hover:opacity-20 transition-opacity" />
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all">
                    <div className="bg-white/20 backdrop-blur-md border border-white/30 px-3 py-1.5 rounded-full flex items-center gap-1.5">
                        <Plus size={14} className="text-white" />
                        <span className="text-[10px] font-bold text-white uppercase tracking-wider">Use</span>
                    </div>
                </div>
                <div className="absolute bottom-2 left-2 right-2">
                  <p className="text-[9px] font-bold text-white/90 truncate uppercase tracking-tighter">{stock.name}</p>
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
// AUDIO TAB (Music/SFX) - with built-in library
// ============================================

const AudioTab: React.FC<{ type: 'music' | 'sfx' }> = ({ type }) => {
  const { project, addAssets, addAsset, removeAsset, addClip } = useVideoEditor();
  const [isDragging, setIsDragging] = useState(false);
  const [loadingTrack, setLoadingTrack] = useState<string | null>(null);
  const [selectedGenre, setSelectedGenre] = useState<string | null>(null);

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const allFiles: File[] = Array.from(e.dataTransfer.files);
    const files = allFiles.filter(f => f.type.startsWith('audio/'));
    if (files.length > 0) {
      await addAssets(files);
    }
  }, [addAssets]);

  const handleFileInput = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []) as File[];
    if (files.length > 0) {
      await addAssets(files);
    }
    e.target.value = '';
  }, [addAssets]);

  const audioAssets = (Object.values(project.assets) as EditorAsset[]).filter(a => a.type === 'audio');

  const handleAddToTimeline = useCallback((assetId: string) => {
    const trackName = type === 'music' ? 'Music' : 'SFX';
    const audioTrack = project.tracks.find(t => t.type === 'audio' && t.name === trackName);
    if (audioTrack) {
      addClip(assetId, audioTrack.id, project.currentFrame);
    }
  }, [project.tracks, project.currentFrame, addClip, type]);

  // Add library track to timeline
  const handleAddLibraryTrack = useCallback(async (track: MusicTrack | SoundEffect) => {
    setLoadingTrack(track.id);
    try {
      const response = await fetch(track.url);
      const blob = await response.blob();
      const file = new File([blob], `${track.name}.mp3`, { type: 'audio/mpeg' });
      const asset = await addAsset(file);

      const trackName = type === 'music' ? 'Music' : 'SFX';
      const audioTrack = project.tracks.find(t => t.type === 'audio' && t.name === trackName);
      if (audioTrack) {
        addClip(asset.id, audioTrack.id, project.currentFrame);
      }
    } catch (err) {
      console.error('Failed to load track:', err);
    } finally {
      setLoadingTrack(null);
    }
  }, [addAsset, addClip, project.tracks, project.currentFrame, type]);

  const formatDuration = (frames?: number) => {
    if (!frames) return '--:--';
    const seconds = Math.floor(frames / 30);
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Get library items based on type
  const library = type === 'music' ? MUSIC_LIBRARY : SFX_LIBRARY;
  const genres = type === 'music'
    ? ['upbeat', 'elegant', 'cinematic', 'corporate', 'ambient', 'inspiring']
    : ['whoosh', 'impact', 'transition', 'ui', 'nature', 'notification'];
  const colorMap = type === 'music' ? GENRE_COLORS : CATEGORY_COLORS;

  const filteredLibrary = selectedGenre
    ? library.filter((item: any) => (type === 'music' ? item.genre : item.category) === selectedGenre)
    : library;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.2 }}
      className="p-3 space-y-4"
    >
      {/* Upload Zone - Compact */}
      <GlassCard hover={false}>
        <div
          onDrop={handleDrop}
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          className={`relative p-3 text-center transition-all cursor-pointer ${
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
          <div className="flex items-center justify-center gap-3">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
              isDragging ? 'bg-purple-500/20' : 'bg-white/[0.06]'
            }`}>
              <Upload size={14} className={isDragging ? 'text-purple-400' : 'text-zinc-400'} />
            </div>
            <div className="text-left">
              <p className="text-[11px] font-medium text-zinc-300">Upload your own</p>
              <p className="text-[9px] text-zinc-500">MP3, WAV, M4A</p>
            </div>
          </div>
        </div>
      </GlassCard>

      {/* Uploaded Audio */}
      {audioAssets.length > 0 && (
        <div className="space-y-2">
          <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest px-1">Your Files</span>
          <div className="space-y-1">
            {audioAssets.map((asset) => (
              <GlassCard key={asset.id} onClick={() => handleAddToTimeline(asset.id)}>
                <div className="flex items-center gap-2 p-2 group">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500/20 to-indigo-500/20 flex items-center justify-center flex-shrink-0">
                    {type === 'music' ? <Music size={14} className="text-purple-400" /> : <Volume2 size={14} className="text-purple-400" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] text-white truncate">{asset.name}</p>
                    <p className="text-[9px] text-zinc-500">{formatDuration(asset.duration)}</p>
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); removeAsset(asset.id); }}
                    className="p-1 rounded-md opacity-0 group-hover:opacity-100 hover:bg-red-500/20 transition-all"
                  >
                    <Trash2 size={10} className="text-red-400" />
                  </button>
                </div>
              </GlassCard>
            ))}
          </div>
        </div>
      )}

      {/* Library Section */}
      <div className="space-y-2">
        <div className="flex items-center justify-between px-1">
          <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">
            {type === 'music' ? 'Music Library' : 'Sound Effects'}
          </span>
          <span className="text-[9px] text-emerald-400 font-bold">FREE</span>
        </div>

        {/* Genre/Category Filter */}
        <div className="flex flex-wrap gap-1">
          <button
            onClick={() => setSelectedGenre(null)}
            className={`px-2 py-1 rounded-lg text-[9px] font-bold uppercase tracking-wider transition-all ${
              selectedGenre === null
                ? 'bg-purple-500/30 text-purple-300 border border-purple-500/30'
                : 'bg-white/5 text-zinc-500 border border-white/5 hover:bg-white/10'
            }`}
          >
            All
          </button>
          {genres.map((genre) => (
            <button
              key={genre}
              onClick={() => setSelectedGenre(genre)}
              className={`px-2 py-1 rounded-lg text-[9px] font-bold uppercase tracking-wider transition-all ${
                selectedGenre === genre
                  ? 'bg-purple-500/30 text-purple-300 border border-purple-500/30'
                  : 'bg-white/5 text-zinc-500 border border-white/5 hover:bg-white/10'
              }`}
            >
              {genre}
            </button>
          ))}
        </div>

        {/* Library Items */}
        <div className="space-y-1.5 max-h-[400px] overflow-y-auto custom-scrollbar">
          {filteredLibrary.map((item: any, i: number) => {
            const genre = type === 'music' ? item.genre : item.category;
            const gradientClass = colorMap[genre as keyof typeof colorMap] || 'from-purple-500/20 to-indigo-500/20';
            const isLoading = loadingTrack === item.id;

            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.02 }}
              >
                <GlassCard onClick={() => !isLoading && handleAddLibraryTrack(item)} disabled={isLoading}>
                  <div className="flex items-center gap-3 p-2.5 group">
                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${gradientClass} border border-white/5 flex items-center justify-center flex-shrink-0 relative overflow-hidden`}>
                      {isLoading ? (
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        <>
                          {type === 'music' ? <Music size={16} className="text-white/70" /> : <Volume2 size={16} className="text-white/70" />}
                          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <Plus size={16} className="text-white" />
                          </div>
                        </>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[12px] text-white font-medium truncate">{item.name}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[9px] text-zinc-500 uppercase">{genre}</span>
                        <span className="text-[9px] text-zinc-600">•</span>
                        <span className="text-[9px] text-zinc-500">
                          {type === 'music' ? formatMusicDuration(item.duration) : `${item.duration}s`}
                        </span>
                      </div>
                    </div>
                  </div>
                </GlassCard>
              </motion.div>
            );
          })}
        </div>
      </div>
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

  // Check if there's a next clip to transition to
  const canApplyTransition = React.useMemo(() => {
    if (!selectedClipId) return false;
    const clip = project.clips[selectedClipId];
    if (!clip) return false;
    const track = project.tracks.find(t => t.id === clip.trackId);
    if (!track) return false;
    const clipIndex = track.clips.indexOf(selectedClipId);
    return clipIndex >= 0 && clipIndex < track.clips.length - 1;
  }, [selectedClipId, project.clips, project.tracks]);

  const handleApplyTransition = useCallback((type: TransitionType) => {
    if (!selectedClipId) return;
    const clip = project.clips[selectedClipId];
    if (!clip) return;
    const track = project.tracks.find(t => t.id === clip.trackId);
    if (!track) return;
    const clipIndex = track.clips.indexOf(selectedClipId);
    const nextClipId = track.clips[clipIndex + 1];
    if (nextClipId) {
      console.log('[TransitionsTab] Applying transition:', type, 'from', selectedClipId, 'to', nextClipId);
      addTransition(selectedClipId, nextClipId, type, 20); // 20 frames = ~0.67 seconds
    } else {
      console.log('[TransitionsTab] No next clip to transition to');
    }
  }, [selectedClipId, project.clips, project.tracks, addTransition]);

  const getMessage = () => {
    if (!selectedClipId) return 'Select a clip first to apply transitions';
    if (!canApplyTransition) return 'Add another clip after this one to create a transition';
    return 'Click a transition to apply after selected clip';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.2 }}
      className="p-3"
    >
      <p className={`text-[11px] px-0.5 mb-3 ${canApplyTransition ? 'text-green-400' : 'text-zinc-500'}`}>
        {getMessage()}
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
