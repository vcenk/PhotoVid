/**
 * PreviewPanel
 * Center panel: preview canvas (top) + transport bar + timeline (bottom)
 * Uses flex layout to guarantee everything fits on screen
 */

import React, { useRef, useEffect, useCallback, useState } from 'react';
import { Player, PlayerRef } from '@remotion/player';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  ZoomIn,
  ZoomOut,
  Trash2,
  Film,
  Scissors,
  Copy,
  Diamond,
  RefreshCw,
} from 'lucide-react';
import { useVideoEditor } from '../VideoEditorContext';
import { DynamicTimeline } from '@/remotion/compositions/DynamicTimeline';
import { FORMAT_CONFIGS, formatTimeSimple } from '@/lib/types/video-editor';
import { TextDragOverlay } from './TextDragOverlay';
import { Timeline } from './Timeline';

export const PreviewPanel: React.FC = () => {
  const playerRef = useRef<PlayerRef>(null);
  const [isMuted, setIsMuted] = useState(false);

  const {
    project,
    togglePlayPause,
    seekTo,
    seekToStart,
    seekToEnd,
    stepForward,
    stepBackward,
    zoomIn,
    zoomOut,
    removeClip,
    duplicateClip,
    splitClip,
    selectClip,
  } = useVideoEditor();

  const config = FORMAT_CONFIGS[project.format];

  // Track if we're the source of updates to prevent loops
  const isInternalSeek = useRef(false);
  const lastSyncedFrame = useRef(project.currentFrame);


  // Sync player play/pause with context state
  useEffect(() => {
    if (!playerRef.current) return;
    if (project.isPlaying) {
      playerRef.current.play();
    } else {
      playerRef.current.pause();
    }
  }, [project.isPlaying]);

  // Sync player seek with context frame changes (manual seeks, keyboard, etc.)
  useEffect(() => {
    if (!playerRef.current) return;
    // Only seek if the frame changed externally (not from our own polling)
    if (!isInternalSeek.current && lastSyncedFrame.current !== project.currentFrame) {
      playerRef.current.seekTo(project.currentFrame);
      lastSyncedFrame.current = project.currentFrame;
    }
    isInternalSeek.current = false;
  }, [project.currentFrame]);

  // Poll player frame during playback and update context
  useEffect(() => {
    const interval = setInterval(() => {
      const player = playerRef.current;
      if (!player) return;

      try {
        const frame = player.getCurrentFrame();

        // Always update the frame to keep playhead in sync
        if (frame !== lastSyncedFrame.current) {
          isInternalSeek.current = true;
          lastSyncedFrame.current = frame;
          seekTo(frame);
        }
      } catch (e) {
        // Player might not be ready yet
      }
    }, 33); // Poll every 33ms (~30fps) for smooth playhead movement

    return () => clearInterval(interval);
  }, [seekTo]);

  // Store selectedClipId in a ref to avoid stale closures
  const selectedClipIdRef = useRef(project.selectedClipId);
  useEffect(() => {
    selectedClipIdRef.current = project.selectedClipId;
  }, [project.selectedClipId]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Skip if user is typing in an input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement || e.target instanceof HTMLSelectElement || (e.target as HTMLElement).isContentEditable) return;

      switch (e.key) {
        case ' ':
          e.preventDefault();
          togglePlayPause();
          break;
        case 'ArrowLeft':
          e.preventDefault();
          stepBackward(e.shiftKey ? 10 : 1);
          break;
        case 'ArrowRight':
          e.preventDefault();
          stepForward(e.shiftKey ? 10 : 1);
          break;
        case 'Home':
          e.preventDefault();
          seekToStart();
          break;
        case 'End':
          e.preventDefault();
          seekToEnd();
          break;
        case '=':
        case '+':
          e.preventDefault();
          zoomIn();
          break;
        case '-':
          e.preventDefault();
          zoomOut();
          break;
        case 'Delete':
        case 'Backspace':
          e.preventDefault();
          const clipId = selectedClipIdRef.current;
          console.log('[PreviewPanel] Delete key pressed, selectedClipId:', clipId);
          if (clipId) {
            removeClip(clipId);
          }
          break;
        case 'Escape':
          selectClip(null);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [togglePlayPause, stepForward, stepBackward, seekToStart, seekToEnd, zoomIn, zoomOut, removeClip, selectClip]);

  const handleSeekTo = useCallback((frame: number) => {
    seekTo(frame);
    if (playerRef.current) playerRef.current.seekTo(frame);
  }, [seekTo]);

  const hasClips = Object.keys(project.clips).length > 0;

  return (
    <div className="flex-1 flex flex-col bg-zinc-100 dark:bg-[#050505] overflow-hidden min-w-0 relative z-10">
      {/* ============ PREVIEW CANVAS ============ */}
      <div className="flex-1 flex items-center justify-center p-6 min-h-0 relative">
        <div
          className="relative rounded-[2rem] overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.3)] dark:shadow-[0_0_50px_rgba(0,0,0,0.8)] ring-1 ring-zinc-300 dark:ring-white/10 bg-black flex items-center justify-center"
          style={{
            aspectRatio: `${config.width} / ${config.height}`,
            maxHeight: '100%',
            maxWidth: '100%',
            width: project.format === 'vertical' ? 'auto' : '100%',
            height: project.format === 'vertical' ? '100%' : 'auto',
          }}
        >
          {hasClips ? (
            <>
              <Player
                ref={playerRef}
                component={DynamicTimeline}
                inputProps={{ project }}
                durationInFrames={Math.max(1, project.totalDurationFrames)}
                fps={project.fps}
                compositionWidth={config.width}
                compositionHeight={config.height}
                style={{ width: '100%', height: '100%' }}
                controls={false}
                loop
                renderLoading={() => (
                  <div className="w-full h-full flex items-center justify-center bg-black">
                    <div className="flex flex-col items-center gap-3">
                        <RefreshCw size={24} className="text-teal-500 animate-spin" />
                        <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest">Warming Up</p>
                    </div>
                  </div>
                )}
              />
              <TextDragOverlay />
              
              {/* Play/Pause Large Overlay on Hover */}
              <div 
                className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                onClick={togglePlayPause}
              >
                 <div className="w-20 h-20 bg-black/40 backdrop-blur-xl rounded-full flex items-center justify-center border border-white/10 pointer-events-auto cursor-pointer group">
                    {project.isPlaying 
                        ? <Pause size={32} className="text-white fill-white group-hover:scale-110 transition-transform" /> 
                        : <Play size={32} className="text-white fill-white ml-1 group-hover:scale-110 transition-transform" />
                    }
                 </div>
              </div>
            </>
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center p-12 text-center">
              <div className="w-24 h-24 rounded-full bg-zinc-200 dark:bg-white/5 border border-zinc-300 dark:border-white/5 flex items-center justify-center mb-6">
                <Film size={40} className="text-zinc-400 dark:text-zinc-700" />
              </div>
              <h3 className="text-xl font-bold text-zinc-800 dark:text-white mb-2">Create Your Masterpiece</h3>
              <p className="text-zinc-500 text-sm max-w-xs leading-relaxed">Drag images or videos from the sidebar to the timeline to begin editing.</p>
            </div>
          )}
        </div>
      </div>

      {/* ============ TRANSPORT BAR ============ */}
      <div className="flex-shrink-0 h-14 px-4 bg-white/80 dark:bg-zinc-900/40 backdrop-blur-xl border-t border-zinc-200 dark:border-white/5 flex items-center gap-4 shadow-[0_-10px_30px_rgba(0,0,0,0.05)] dark:shadow-[0_-10px_30px_rgba(0,0,0,0.3)] relative z-30">
        {/* Edit Tools */}
        <div className="flex items-center gap-1.5 p-1.5 bg-zinc-100 dark:bg-black/40 rounded-2xl border border-zinc-200 dark:border-white/5 shadow-inner">
          <button
            onClick={() => {
              console.log('[PreviewPanel] Delete clicked, selectedClipId:', project.selectedClipId);
              if (project.selectedClipId) {
                removeClip(project.selectedClipId);
              }
            }}
            disabled={!project.selectedClipId}
            className="p-2 hover:bg-red-500/20 rounded-xl transition-all disabled:opacity-20 disabled:cursor-not-allowed group"
            title="Delete (Del)"
          >
            <Trash2 size={16} className="text-zinc-400 group-hover:text-red-400 transition-colors" />
          </button>
          <button
            onClick={() => project.selectedClipId && splitClip(project.selectedClipId, project.currentFrame)}
            disabled={!project.selectedClipId}
            className="p-2 hover:bg-zinc-200 dark:hover:bg-white/10 rounded-xl transition-all disabled:opacity-20 disabled:cursor-not-allowed group"
            title="Split clip"
          >
            <Scissors size={16} className="text-zinc-400 group-hover:text-zinc-900 dark:group-hover:text-white transition-colors" />
          </button>
          <button
            onClick={() => project.selectedClipId && duplicateClip(project.selectedClipId)}
            disabled={!project.selectedClipId}
            className="p-2 hover:bg-zinc-200 dark:hover:bg-white/10 rounded-xl transition-all disabled:opacity-20 disabled:cursor-not-allowed group"
            title="Duplicate"
          >
            <Copy size={16} className="text-zinc-400 group-hover:text-zinc-900 dark:group-hover:text-white transition-colors" />
          </button>
        </div>

        {/* Playback Controls */}
        <div className="flex items-center gap-1">
            <button onClick={seekToStart} className="p-2 hover:bg-zinc-200 dark:hover:bg-white/10 rounded-xl transition-all group" title="Start">
            <SkipBack size={18} className="text-zinc-400 group-hover:text-zinc-900 dark:group-hover:text-white transition-colors" />
            </button>
            <button
            onClick={togglePlayPause}
            className="w-10 h-10 bg-gradient-to-br from-teal-600 to-teal-600 hover:from-teal-500 hover:to-teal-500 rounded-2xl transition-all shadow-lg shadow-teal-900/40 hover:shadow-teal-600/50 flex items-center justify-center mx-1 group hover:-translate-y-0.5 active:translate-y-0"
            title="Play/Pause (Space)"
            >
            {project.isPlaying ? <Pause size={20} className="text-white fill-white" /> : <Play size={20} className="text-white fill-white ml-1" />}
            </button>
            <button onClick={seekToEnd} className="p-2 hover:bg-zinc-200 dark:hover:bg-white/10 rounded-xl transition-all group" title="End">
            <SkipForward size={18} className="text-zinc-400 group-hover:text-zinc-900 dark:group-hover:text-white transition-colors" />
            </button>
        </div>
        
        <button onClick={() => setIsMuted(!isMuted)} className="p-2 hover:bg-zinc-200 dark:hover:bg-white/10 rounded-xl transition-all group" title="Mute">
          {isMuted ? <VolumeX size={18} className="text-red-400" /> : <Volume2 size={18} className="text-zinc-400 group-hover:text-zinc-900 dark:group-hover:text-white transition-colors" />}
        </button>

        {/* Time Display */}
        <div className="flex items-center gap-2 px-3 py-1.5 bg-zinc-100 dark:bg-black/40 rounded-xl border border-zinc-200 dark:border-white/5 font-mono shadow-inner">
          <span className="text-xs font-bold text-zinc-900 dark:text-white tracking-widest">{formatTimeSimple(project.currentFrame, project.fps)}</span>
          <span className="text-[10px] text-zinc-600 font-black">/</span>
          <span className="text-xs font-bold text-zinc-500 tracking-widest">{formatTimeSimple(project.totalDurationFrames, project.fps)}</span>
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Zoom Controls */}
        <div className="flex items-center gap-1 bg-zinc-100 dark:bg-black/20 p-1 rounded-xl border border-zinc-200 dark:border-white/5">
            <button onClick={zoomOut} className="p-1.5 hover:bg-zinc-200 dark:hover:bg-white/10 rounded-lg transition-all group" title="Zoom out (-)">
            <ZoomOut size={16} className="text-zinc-500 group-hover:text-zinc-300" />
            </button>
            <span className="text-[10px] font-black text-zinc-500 w-12 text-center tracking-tighter">{Math.round(project.zoom * 50)}%</span>
            <button onClick={zoomIn} className="p-1.5 hover:bg-zinc-200 dark:hover:bg-white/10 rounded-lg transition-all group" title="Zoom in (+)">
            <ZoomIn size={16} className="text-zinc-500 group-hover:text-zinc-300" />
            </button>
        </div>
      </div>

      {/* ============ TIMELINE ============ */}
      <Timeline onSeek={handleSeekTo} />
    </div>
  );
};
