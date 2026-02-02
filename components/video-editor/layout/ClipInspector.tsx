/**
 * ClipInspector
 * Right-side panel for editing properties of the selected clip.
 * Shown conditionally when a clip is selected.
 */

import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  X,
  Film,
  Type,
  Move,
  AlignLeft,
  AlignCenter,
  AlignRight,
} from 'lucide-react';
import { useVideoEditor } from '../VideoEditorContext';
import type { TextAnimation, TextPosition } from '@/lib/types/video-editor';
import { FONT_OPTIONS, KEN_BURNS_PRESETS } from '@/lib/data/editor-presets';

export const ClipInspector: React.FC = () => {
  const { project, updateClip, selectClip, setKenBurns, removeKenBurns, removeEffect } = useVideoEditor();
  const selectedClip = project.selectedClipId ? project.clips[project.selectedClipId] : null;
  const selectedAsset = selectedClip?.assetId ? project.assets[selectedClip.assetId] : null;

  if (!selectedClip) return null;

  const isTextClip = !!selectedClip.textContent;
  const isVisualClip = selectedAsset?.type === 'image' || selectedAsset?.type === 'video';
  const isImageClip = selectedAsset?.type === 'image';

  const updateTextContent = (updates: Record<string, any>) => {
    if (!selectedClip.textContent) return;
    updateClip(selectedClip.id, {
      textContent: { ...selectedClip.textContent, ...updates },
    });
  };

  return (
    <AnimatePresence>
      <motion.div
        key="inspector"
        initial={{ width: 0, opacity: 0 }}
        animate={{ width: 280, opacity: 1 }}
        exit={{ width: 0, opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="flex-shrink-0 bg-[#111113] border-l border-white/5 overflow-y-auto overflow-x-hidden"
      >
        <div className="px-3 py-3 w-[280px]">
          {/* Header */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              {isTextClip && <Type size={14} className="text-purple-400" />}
              {isVisualClip && <Film size={14} className="text-blue-400" />}
              <span className="text-[11px] font-medium text-zinc-300">
                {isTextClip ? 'Text Properties' : isImageClip ? 'Image Properties' : 'Clip Properties'}
              </span>
            </div>
            <button onClick={() => selectClip(null)} className="p-1 hover:bg-white/5 rounded transition-colors">
              <X size={12} className="text-zinc-500" />
            </button>
          </div>

          {/* TEXT CLIP EDITOR */}
          {isTextClip && selectedClip.textContent && (
            <div className="space-y-3">
              {/* Text Input */}
              <div>
                <label className="text-[10px] text-zinc-500 block mb-1">Text</label>
                <input
                  type="text"
                  value={selectedClip.textContent.text}
                  onChange={(e) => updateTextContent({ text: e.target.value })}
                  className="w-full bg-white/[0.06] border border-white/10 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/20"
                  placeholder="Enter text..."
                  autoFocus
                />
              </div>

              {/* Font Size + Weight */}
              <div className="flex gap-2">
                <div className="flex-1">
                  <label className="text-[10px] text-zinc-500 block mb-1">Size</label>
                  <input
                    type="number"
                    value={selectedClip.textContent.fontSize}
                    onChange={(e) => {
                      if (e.target.value === '') return;
                      updateTextContent({ fontSize: Number(e.target.value) });
                    }}
                    onBlur={(e) => {
                      const n = Number(e.target.value);
                      if (!n || n < 10) updateTextContent({ fontSize: 10 });
                      else if (n > 200) updateTextContent({ fontSize: 200 });
                    }}
                    className="w-full bg-[#1a1a1e] border border-white/10 rounded-lg px-2 py-1 text-xs text-white focus:outline-none focus:border-purple-500/50"
                    min={10}
                    max={200}
                  />
                </div>
                <div className="flex-1">
                  <label className="text-[10px] text-zinc-500 block mb-1">Weight</label>
                  <select
                    value={selectedClip.textContent.fontWeight}
                    onChange={(e) => updateTextContent({ fontWeight: Number(e.target.value) })}
                    className="w-full bg-[#1a1a1e] border border-white/10 rounded-lg px-2 py-1 text-xs text-white focus:outline-none focus:border-purple-500/50 [&>option]:bg-[#1a1a1e] [&>option]:text-white"
                  >
                    <option value={300}>Light</option>
                    <option value={400}>Regular</option>
                    <option value={500}>Medium</option>
                    <option value={600}>Semi</option>
                    <option value={700}>Bold</option>
                    <option value={800}>Extra</option>
                  </select>
                </div>
                <div className="w-12">
                  <label className="text-[10px] text-zinc-500 block mb-1">Color</label>
                  <input
                    type="color"
                    value={selectedClip.textContent.color}
                    onChange={(e) => updateTextContent({ color: e.target.value })}
                    className="w-full h-7 rounded-lg cursor-pointer bg-transparent border border-white/10"
                  />
                </div>
              </div>

              {/* Font, Position, Animation */}
              <div className="flex gap-2">
                <div className="flex-1">
                  <label className="text-[10px] text-zinc-500 block mb-1">Font</label>
                  <select
                    value={selectedClip.textContent.fontFamily}
                    onChange={(e) => updateTextContent({ fontFamily: e.target.value })}
                    className="w-full bg-[#1a1a1e] border border-white/10 rounded-lg px-2 py-1 text-xs text-white focus:outline-none focus:border-purple-500/50 [&>option]:bg-[#1a1a1e] [&>option]:text-white"
                  >
                    {FONT_OPTIONS.map(f => (
                      <option key={f.id} value={f.value}>{f.name}</option>
                    ))}
                  </select>
                </div>
                <div className="flex-1">
                  <label className="text-[10px] text-zinc-500 block mb-1">Animation</label>
                  <select
                    value={selectedClip.textContent.animation}
                    onChange={(e) => updateTextContent({ animation: e.target.value as TextAnimation })}
                    className="w-full bg-[#1a1a1e] border border-white/10 rounded-lg px-2 py-1 text-xs text-white focus:outline-none focus:border-purple-500/50 [&>option]:bg-[#1a1a1e] [&>option]:text-white"
                  >
                    <option value="none">None</option>
                    <option value="fade">Fade</option>
                    <option value="slide-up">Slide Up</option>
                    <option value="slide-down">Slide Down</option>
                    <option value="scale">Scale</option>
                    <option value="typewriter">Typewriter</option>
                  </select>
                </div>
              </div>

              {/* Position */}
              <div>
                <label className="text-[10px] text-zinc-500 block mb-1">Position</label>
                <select
                  value={selectedClip.textContent.x !== undefined ? 'free' : selectedClip.textContent.position}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val === 'free') {
                      updateTextContent({ x: 50, y: 50 });
                    } else {
                      updateTextContent({ position: val as TextPosition, x: undefined, y: undefined });
                    }
                  }}
                  className="w-full bg-[#1a1a1e] border border-white/10 rounded-lg px-2 py-1 text-xs text-white focus:outline-none focus:border-purple-500/50 [&>option]:bg-[#1a1a1e] [&>option]:text-white"
                >
                  <option value="top">Top</option>
                  <option value="center">Center</option>
                  <option value="bottom">Bottom</option>
                  <option value="lower-third">Lower Third</option>
                  <option value="free">Free (drag)</option>
                </select>
              </div>

              {/* Alignment */}
              <div>
                <label className="text-[10px] text-zinc-500 block mb-1">Alignment</label>
                <div className="flex gap-1">
                  {[
                    { value: 'left', icon: <AlignLeft size={14} /> },
                    { value: 'center', icon: <AlignCenter size={14} /> },
                    { value: 'right', icon: <AlignRight size={14} /> },
                  ].map(({ value, icon }) => (
                    <button
                      key={value}
                      onClick={() => updateTextContent({ alignment: value })}
                      className={`p-1.5 rounded-lg transition-colors ${
                        selectedClip.textContent?.alignment === value
                          ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                          : 'bg-white/[0.04] text-zinc-500 border border-white/[0.06] hover:bg-white/[0.08]'
                      }`}
                    >
                      {icon}
                    </button>
                  ))}
                </div>
              </div>

              {/* Free Position sliders */}
              {selectedClip.textContent?.x !== undefined && (
                <div>
                  <div className="flex gap-2">
                    <div className="flex-1">
                      <label className="text-[9px] text-zinc-600 block mb-0.5">X: {selectedClip.textContent.x}%</label>
                      <input
                        type="range"
                        min={2}
                        max={98}
                        value={selectedClip.textContent.x ?? 50}
                        onChange={(e) => updateTextContent({ x: Number(e.target.value) })}
                        className="w-full h-1.5 accent-purple-500"
                      />
                    </div>
                    <div className="flex-1">
                      <label className="text-[9px] text-zinc-600 block mb-0.5">Y: {selectedClip.textContent.y}%</label>
                      <input
                        type="range"
                        min={2}
                        max={98}
                        value={selectedClip.textContent.y ?? 50}
                        onChange={(e) => updateTextContent({ y: Number(e.target.value) })}
                        className="w-full h-1.5 accent-purple-500"
                      />
                    </div>
                  </div>
                  <p className="text-[9px] text-zinc-600 mt-1">
                    <Move size={9} className="inline mr-0.5" />
                    Or drag text directly on preview
                  </p>
                </div>
              )}
            </div>
          )}

          {/* IMAGE CLIP PROPERTIES */}
          {isImageClip && (
            <div className="space-y-3">
              {/* Ken Burns */}
              <div>
                <label className="text-[10px] text-zinc-500 block mb-1">Ken Burns Effect</label>
                <div className="flex gap-1 flex-wrap">
                  <button
                    onClick={() => removeKenBurns(selectedClip.id)}
                    className={`px-2 py-1 text-[10px] rounded-lg transition-colors ${
                      !selectedClip.kenBurns
                        ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                        : 'bg-white/[0.04] text-zinc-500 border border-white/[0.06] hover:bg-white/[0.08]'
                    }`}
                  >
                    None
                  </button>
                  {KEN_BURNS_PRESETS.map(kb => (
                    <button
                      key={kb.id}
                      onClick={() => setKenBurns(selectedClip.id, kb.direction, kb.intensity)}
                      className={`px-2 py-1 text-[10px] rounded-lg transition-colors ${
                        selectedClip.kenBurns?.direction === kb.direction && selectedClip.kenBurns?.intensity === kb.intensity
                          ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                          : 'bg-white/[0.04] text-zinc-500 border border-white/[0.06] hover:bg-white/[0.08]'
                      }`}
                    >
                      {kb.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Fade In/Out */}
              <div className="flex gap-3">
                <div className="flex-1">
                  <label className="text-[10px] text-zinc-500 block mb-1">Fade In (frames)</label>
                  <input
                    type="number"
                    value={selectedClip.fadeIn || 0}
                    onChange={(e) => {
                      if (e.target.value === '') return;
                      updateClip(selectedClip.id, { fadeIn: Number(e.target.value) });
                    }}
                    onBlur={(e) => {
                      const n = Number(e.target.value);
                      updateClip(selectedClip.id, { fadeIn: Math.max(0, Math.min(60, n || 0)) });
                    }}
                    className="w-full bg-[#1a1a1e] border border-white/10 rounded-lg px-2 py-1 text-xs text-white focus:outline-none focus:border-purple-500/50"
                    min={0}
                    max={60}
                  />
                </div>
                <div className="flex-1">
                  <label className="text-[10px] text-zinc-500 block mb-1">Fade Out (frames)</label>
                  <input
                    type="number"
                    value={selectedClip.fadeOut || 0}
                    onChange={(e) => {
                      if (e.target.value === '') return;
                      updateClip(selectedClip.id, { fadeOut: Number(e.target.value) });
                    }}
                    onBlur={(e) => {
                      const n = Number(e.target.value);
                      updateClip(selectedClip.id, { fadeOut: Math.max(0, Math.min(60, n || 0)) });
                    }}
                    className="w-full bg-[#1a1a1e] border border-white/10 rounded-lg px-2 py-1 text-xs text-white focus:outline-none focus:border-purple-500/50"
                    min={0}
                    max={60}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Applied Effects */}
          {selectedClip.effects.length > 0 && (
            <div className="mt-3">
              <label className="text-[10px] text-zinc-500 block mb-1">Applied Effects</label>
              <div className="flex flex-wrap gap-1">
                {selectedClip.effects.map(effect => (
                  <span
                    key={effect.id}
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/[0.06] border border-white/10 text-[10px] text-zinc-300"
                  >
                    {effect.type}
                    <button
                      onClick={() => removeEffect(selectedClip.id, effect.id)}
                      className="hover:text-red-400 transition-colors"
                    >
                      <X size={10} />
                    </button>
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Clip Timing */}
          <div className="mt-3 flex gap-3">
            <div className="flex-1">
              <label className="text-[10px] text-zinc-500 block mb-1">Start (frame)</label>
              <input
                type="number"
                value={selectedClip.startFrame}
                onChange={(e) => {
                  if (e.target.value === '') return;
                  updateClip(selectedClip.id, { startFrame: Number(e.target.value) });
                }}
                onBlur={(e) => {
                  updateClip(selectedClip.id, { startFrame: Math.max(0, Number(e.target.value) || 0) });
                }}
                className="w-full bg-[#1a1a1e] border border-white/10 rounded-lg px-2 py-1 text-xs text-white focus:outline-none focus:border-purple-500/50"
                min={0}
              />
            </div>
            <div className="flex-1">
              <label className="text-[10px] text-zinc-500 block mb-1">Duration (frames)</label>
              <input
                type="number"
                value={selectedClip.durationFrames}
                onChange={(e) => {
                  if (e.target.value === '') return;
                  updateClip(selectedClip.id, { durationFrames: Number(e.target.value) });
                }}
                onBlur={(e) => {
                  updateClip(selectedClip.id, { durationFrames: Math.max(1, Number(e.target.value) || 1) });
                }}
                className="w-full bg-[#1a1a1e] border border-white/10 rounded-lg px-2 py-1 text-xs text-white focus:outline-none focus:border-purple-500/50"
                min={1}
              />
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
