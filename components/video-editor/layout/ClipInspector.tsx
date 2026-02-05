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
  Sparkles,
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
        animate={{ width: 300, opacity: 1 }}
        exit={{ width: 0, opacity: 0 }}
        transition={{ type: 'spring', damping: 20, stiffness: 100 }}
        className="flex-shrink-0 bg-zinc-950/60 backdrop-blur-2xl border-l border-white/5 overflow-y-auto overflow-x-hidden relative z-20 custom-scrollbar shadow-[-10px_0_30px_rgba(0,0,0,0.3)]"
      >
        <div className="p-5 w-[300px] space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-white/5">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-xl bg-white/5 border border-white/5 ${isTextClip ? 'text-purple-400' : 'text-blue-400'}`}>
                {isTextClip ? <Type size={18} /> : <Film size={18} />}
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Inspector</span>
                <span className="text-xs font-bold text-white">
                  {isTextClip ? 'Text Properties' : isImageClip ? 'Image Properties' : 'Clip Properties'}
                </span>
              </div>
            </div>
            <button 
                onClick={() => selectClip(null)} 
                className="p-2 hover:bg-white/10 rounded-xl transition-all text-zinc-500 hover:text-white"
            >
              <X size={16} />
            </button>
          </div>

          {/* TEXT CLIP EDITOR */}
          {isTextClip && selectedClip.textContent && (
            <div className="space-y-5">
              {/* Text Input */}
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-1">Content</label>
                <div className="relative group">
                    <textarea
                    value={selectedClip.textContent.text}
                    onChange={(e) => updateTextContent({ text: e.target.value })}
                    className="w-full bg-white/5 border border-white/5 hover:border-white/10 focus:border-purple-500/50 rounded-2xl p-4 text-sm text-white focus:outline-none focus:ring-4 focus:ring-purple-500/10 transition-all min-h-[100px] resize-none"
                    placeholder="Enter text content..."
                    autoFocus
                    />
                </div>
              </div>

              {/* Font Size + Weight */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-1">Size</label>
                  <div className="bg-white/5 rounded-xl border border-white/5 p-1 flex items-center">
                    <input
                        type="number"
                        value={selectedClip.textContent.fontSize}
                        onChange={(e) => {
                        if (e.target.value === '') return;
                        updateTextContent({ fontSize: Number(e.target.value) });
                        }}
                        className="w-full bg-transparent px-3 py-1.5 text-xs text-white focus:outline-none font-bold"
                        min={10}
                        max={200}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-1">Weight</label>
                  <div className="bg-white/5 rounded-xl border border-white/5 p-1">
                    <select
                        value={selectedClip.textContent.fontWeight}
                        onChange={(e) => updateTextContent({ fontWeight: Number(e.target.value) })}
                        className="w-full bg-transparent px-2 py-1.5 text-xs text-white focus:outline-none font-bold [&>option]:bg-zinc-900"
                    >
                        <option value={300}>Light</option>
                        <option value={400}>Regular</option>
                        <option value={500}>Medium</option>
                        <option value={600}>Semi</option>
                        <option value={700}>Bold</option>
                        <option value={800}>Extra</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Font + Color */}
              <div className="grid grid-cols-3 gap-4">
                 <div className="col-span-2 space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-1">Font Family</label>
                    <div className="bg-white/5 rounded-xl border border-white/5 p-1">
                        <select
                            value={selectedClip.textContent.fontFamily}
                            onChange={(e) => updateTextContent({ fontFamily: e.target.value })}
                            className="w-full bg-transparent px-2 py-1.5 text-[11px] text-white focus:outline-none font-bold [&>option]:bg-zinc-900"
                        >
                            {FONT_OPTIONS.map(f => (
                            <option key={f.id} value={f.value}>{f.name}</option>
                            ))}
                        </select>
                    </div>
                 </div>
                 <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-1">Color</label>
                    <div className="relative h-10 w-full rounded-xl overflow-hidden border border-white/10 ring-2 ring-white/5">
                        <input
                        type="color"
                        value={selectedClip.textContent.color}
                        onChange={(e) => updateTextContent({ color: e.target.value })}
                        className="absolute inset-0 w-full h-full cursor-pointer scale-[2] bg-transparent"
                        />
                    </div>
                 </div>
              </div>

              {/* Animation */}
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-1">In Animation</label>
                <div className="bg-white/5 rounded-xl border border-white/5 p-1">
                    <select
                    value={selectedClip.textContent.animation}
                    onChange={(e) => updateTextContent({ animation: e.target.value as TextAnimation })}
                    className="w-full bg-transparent px-3 py-2 text-xs text-white focus:outline-none font-bold [&>option]:bg-zinc-900"
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
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-1">Placement</label>
                <div className="bg-white/5 rounded-xl border border-white/5 p-1">
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
                    className="w-full bg-transparent px-3 py-2 text-xs text-white focus:outline-none font-bold [&>option]:bg-zinc-900"
                    >
                    <option value="top">Top Header</option>
                    <option value="center">Center Stage</option>
                    <option value="bottom">Bottom Bar</option>
                    <option value="lower-third">Lower Third</option>
                    <option value="free">Free Positioning</option>
                    </select>
                </div>
              </div>

              {/* Alignment */}
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-1">Text Alignment</label>
                <div className="flex bg-black/40 p-1 rounded-xl border border-white/5 gap-1 shadow-inner">
                  {[
                    { value: 'left', icon: <AlignLeft size={16} /> },
                    { value: 'center', icon: <AlignCenter size={16} /> },
                    { value: 'right', icon: <AlignRight size={16} /> },
                  ].map(({ value, icon }) => (
                    <button
                      key={value}
                      onClick={() => updateTextContent({ alignment: value })}
                      className={`flex-1 flex justify-center py-2 rounded-lg transition-all ${
                        selectedClip.textContent?.alignment === value
                          ? 'bg-purple-600 text-white shadow-lg shadow-purple-900/40'
                          : 'text-zinc-500 hover:text-zinc-300 hover:bg-white/5'
                      }`}
                    >
                      {icon}
                    </button>
                  ))}
                </div>
              </div>

              {/* Free Position sliders */}
              {selectedClip.textContent?.x !== undefined && (
                <div className="p-4 bg-white/5 rounded-2xl border border-white/5 space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                        <label className="text-[9px] font-black uppercase tracking-widest text-zinc-500">Horizontal</label>
                        <span className="text-[9px] font-bold text-white">{selectedClip.textContent.x}%</span>
                    </div>
                    <input
                        type="range"
                        min={2}
                        max={98}
                        value={selectedClip.textContent.x ?? 50}
                        onChange={(e) => updateTextContent({ x: Number(e.target.value) })}
                        className="w-full h-1.5 bg-black rounded-lg appearance-none cursor-pointer accent-purple-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                        <label className="text-[9px] font-black uppercase tracking-widest text-zinc-500">Vertical</label>
                        <span className="text-[9px] font-bold text-white">{selectedClip.textContent.y}%</span>
                    </div>
                    <input
                        type="range"
                        min={2}
                        max={98}
                        value={selectedClip.textContent.y ?? 50}
                        onChange={(e) => updateTextContent({ y: Number(e.target.value) })}
                        className="w-full h-1.5 bg-black rounded-lg appearance-none cursor-pointer accent-purple-500"
                    />
                  </div>
                  <div className="flex items-center gap-2 text-[9px] text-zinc-500 bg-black/20 p-2 rounded-lg italic">
                    <Move size={10} />
                    <span>Tip: You can drag text directly on preview</span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* IMAGE CLIP PROPERTIES */}
          {isImageClip && (
            <div className="space-y-6">
              {/* Ken Burns */}
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-1">Motion Effect</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => removeKenBurns(selectedClip.id)}
                    className={`px-3 py-2 text-[10px] font-bold rounded-xl border transition-all ${
                      !selectedClip.kenBurns
                        ? 'bg-purple-600 border-purple-500 text-white shadow-lg shadow-purple-900/40'
                        : 'bg-white/5 border-white/5 text-zinc-500 hover:text-zinc-300 hover:bg-white/10'
                    }`}
                  >
                    Static
                  </button>
                  {KEN_BURNS_PRESETS.map(kb => (
                    <button
                      key={kb.id}
                      onClick={() => setKenBurns(selectedClip.id, kb.direction, kb.intensity)}
                      className={`px-3 py-2 text-[10px] font-bold rounded-xl border transition-all ${
                        selectedClip.kenBurns?.direction === kb.direction && selectedClip.kenBurns?.intensity === kb.intensity
                          ? 'bg-purple-600 border-purple-500 text-white shadow-lg shadow-purple-900/40'
                          : 'bg-white/5 border-white/5 text-zinc-500 hover:text-zinc-300 hover:bg-white/10'
                      }`}
                    >
                      {kb.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Transitions */}
              <div className="space-y-3">
                 <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-1">Opacity Fades</label>
                 <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                        <span className="text-[9px] font-bold text-zinc-600 uppercase ml-1">Fade In</span>
                        <div className="bg-white/5 rounded-xl border border-white/5 p-1 flex items-center">
                            <input
                                type="number"
                                value={selectedClip.fadeIn || 0}
                                onChange={(e) => updateClip(selectedClip.id, { fadeIn: Number(e.target.value) })}
                                className="w-full bg-transparent px-3 py-1 text-xs text-white focus:outline-none font-bold"
                                min={0}
                                max={60}
                            />
                        </div>
                    </div>
                    <div className="space-y-1.5">
                        <span className="text-[9px] font-bold text-zinc-600 uppercase ml-1">Fade Out</span>
                        <div className="bg-white/5 rounded-xl border border-white/5 p-1 flex items-center">
                            <input
                                type="number"
                                value={selectedClip.fadeOut || 0}
                                onChange={(e) => updateClip(selectedClip.id, { fadeOut: Number(e.target.value) })}
                                className="w-full bg-transparent px-3 py-1 text-xs text-white focus:outline-none font-bold"
                                min={0}
                                max={60}
                            />
                        </div>
                    </div>
                 </div>
              </div>
            </div>
          )}

          {/* Applied Effects */}
          {selectedClip.effects.length > 0 && (
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-1">Active Filters</label>
              <div className="flex flex-wrap gap-2">
                {selectedClip.effects.map(effect => (
                  <span
                    key={effect.id}
                    className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-purple-600/20 border border-purple-500/20 text-[10px] font-bold text-purple-300 shadow-lg shadow-purple-900/10 group"
                  >
                    <Sparkles size={10} />
                    {effect.type}
                    <button
                      onClick={() => removeEffect(selectedClip.id, effect.id)}
                      className="ml-1 text-purple-400 hover:text-red-400 transition-colors"
                    >
                      <X size={12} />
                    </button>
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Clip Timing */}
          <div className="space-y-3 pt-4 border-t border-white/5">
            <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-1">Timing & Position</label>
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                    <span className="text-[9px] font-bold text-zinc-600 uppercase ml-1">Start Frame</span>
                    <div className="bg-white/5 rounded-xl border border-white/5 p-1 flex items-center">
                        <input
                            type="number"
                            value={selectedClip.startFrame}
                            onChange={(e) => updateClip(selectedClip.id, { startFrame: Number(e.target.value) })}
                            className="w-full bg-transparent px-3 py-1.5 text-xs text-white focus:outline-none font-bold"
                            min={0}
                        />
                    </div>
                </div>
                <div className="space-y-1.5">
                    <span className="text-[9px] font-bold text-zinc-600 uppercase ml-1">Total Frames</span>
                    <div className="bg-white/5 rounded-xl border border-white/5 p-1 flex items-center">
                        <input
                            type="number"
                            value={selectedClip.durationFrames}
                            onChange={(e) => updateClip(selectedClip.id, { durationFrames: Number(e.target.value) })}
                            className="w-full bg-transparent px-3 py-1.5 text-xs text-white focus:outline-none font-bold"
                            min={1}
                        />
                    </div>
                </div>
            </div>
            <p className="text-[9px] text-zinc-600 text-center font-medium italic">
                Approx. {(selectedClip.durationFrames / project.fps).toFixed(1)}s at {project.fps}fps
            </p>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
