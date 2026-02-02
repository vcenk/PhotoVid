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

  // Sync player play/pause with context
  useEffect(() => {
    if (!playerRef.current) return;
    if (project.isPlaying) {
      playerRef.current.play();
    } else {
      playerRef.current.pause();
    }
  }, [project.isPlaying]);

  // Sync player seek with context frame changes (manual seeks, keyboard, etc.)
  const lastSyncedFrame = useRef(project.currentFrame);
  useEffect(() => {
    if (!playerRef.current || project.isPlaying) return;
    if (lastSyncedFrame.current !== project.currentFrame) {
      playerRef.current.seekTo(project.currentFrame);
      lastSyncedFrame.current = project.currentFrame;
    }
  }, [project.currentFrame, project.isPlaying]);

  // Update context frame from player during playback
  useEffect(() => {
    if (!playerRef.current) return;
    const interval = setInterval(() => {
      if (playerRef.current && project.isPlaying) {
        const frame = playerRef.current.getCurrentFrame();
        lastSyncedFrame.current = frame;
        seekTo(frame);
      }
    }, 100);
    return () => clearInterval(interval);
  }, [project.isPlaying, seekTo]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement || e.target instanceof HTMLSelectElement || (e.target as HTMLElement).isContentEditable) return;
      switch (e.key) {
        case ' ': e.preventDefault(); togglePlayPause(); break;
        case 'ArrowLeft': e.preventDefault(); stepBackward(e.shiftKey ? 10 : 1); break;
        case 'ArrowRight': e.preventDefault(); stepForward(e.shiftKey ? 10 : 1); break;
        case 'Home': e.preventDefault(); seekToStart(); break;
        case 'End': e.preventDefault(); seekToEnd(); break;
        case '=': case '+': e.preventDefault(); zoomIn(); break;
        case '-': e.preventDefault(); zoomOut(); break;
        case 'Delete': case 'Backspace':
          if (project.selectedClipId) { e.preventDefault(); removeClip(project.selectedClipId); }
          break;
        case 'Escape': selectClip(null); break;
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [togglePlayPause, stepForward, stepBackward, seekToStart, seekToEnd, zoomIn, zoomOut, removeClip, project.selectedClipId, selectClip]);

  const handleSeekTo = useCallback((frame: number) => {
    seekTo(frame);
    if (playerRef.current) playerRef.current.seekTo(frame);
  }, [seekTo]);

  const hasClips = Object.keys(project.clips).length > 0;

  return (
    <div className="flex-1 flex flex-col bg-[#0a0a0b] overflow-hidden min-w-0">
      {/* ============ PREVIEW CANVAS ============ */}
      <div className="flex-1 flex items-center justify-center p-3 min-h-0">
        <div
          className="relative rounded-lg overflow-hidden shadow-2xl shadow-black/50 ring-1 ring-white/10 bg-black"
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
                  <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#000' }}>
                    <p style={{ color: '#71717a', fontSize: 14 }}>Loading preview...</p>
                  </div>
                )}
                errorFallback={({ error }) => (
                  <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#000', padding: 24 }}>
                    <p style={{ color: '#ef4444', fontSize: 14, marginBottom: 8 }}>Preview error</p>
                    <p style={{ color: '#71717a', fontSize: 12, textAlign: 'center' }}>{error.message}</p>
                  </div>
                )}
              />
              <TextDragOverlay />
            </>
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <Film size={40} className="text-zinc-700 mb-2" />
              <p className="text-zinc-500 text-sm">Add media to start editing</p>
              <p className="text-zinc-600 text-xs mt-1">Drag images from the sidebar to the timeline</p>
            </div>
          )}
        </div>
      </div>

      {/* ============ TRANSPORT BAR ============ */}
      <div className="flex-shrink-0 h-10 px-3 bg-[#111113] border-t border-b border-white/5 flex items-center gap-2">
        {/* Edit Tools */}
        <div className="flex items-center gap-0.5 border-r border-white/10 pr-2 mr-1">
          <button
            onClick={() => project.selectedClipId && removeClip(project.selectedClipId)}
            disabled={!project.selectedClipId}
            className="p-1.5 hover:bg-white/5 rounded transition-colors disabled:opacity-30"
            title="Delete (Del)"
          >
            <Trash2 size={14} className="text-zinc-400" />
          </button>
          <button
            onClick={() => project.selectedClipId && splitClip(project.selectedClipId, project.currentFrame)}
            disabled={!project.selectedClipId}
            className="p-1.5 hover:bg-white/5 rounded transition-colors disabled:opacity-30"
            title="Split clip"
          >
            <Scissors size={14} className="text-zinc-400" />
          </button>
          <button
            onClick={() => project.selectedClipId && duplicateClip(project.selectedClipId)}
            disabled={!project.selectedClipId}
            className="p-1.5 hover:bg-white/5 rounded transition-colors disabled:opacity-30"
            title="Duplicate"
          >
            <Copy size={14} className="text-zinc-400" />
          </button>
          <button className="p-1.5 hover:bg-white/5 rounded transition-colors" title="Keyframe">
            <Diamond size={14} className="text-purple-400" />
          </button>
        </div>

        {/* Playback Controls */}
        <button onClick={seekToStart} className="p-1.5 hover:bg-white/5 rounded transition-colors" title="Start">
          <SkipBack size={14} className="text-zinc-400" />
        </button>
        <button onClick={() => stepBackward(30)} className="p-1.5 hover:bg-white/5 rounded transition-colors" title="Back 1s">
          <SkipBack size={12} className="text-zinc-500" />
        </button>
        <button
          onClick={togglePlayPause}
          className="p-2 bg-purple-600 hover:bg-purple-500 rounded-full transition-colors mx-1"
          title="Play/Pause (Space)"
        >
          {project.isPlaying ? <Pause size={14} className="text-white" /> : <Play size={14} className="text-white ml-px" />}
        </button>
        <button onClick={() => stepForward(30)} className="p-1.5 hover:bg-white/5 rounded transition-colors" title="Fwd 1s">
          <SkipForward size={12} className="text-zinc-500" />
        </button>
        <button onClick={seekToEnd} className="p-1.5 hover:bg-white/5 rounded transition-colors" title="End">
          <SkipForward size={14} className="text-zinc-400" />
        </button>
        <button onClick={() => setIsMuted(!isMuted)} className="p-1.5 hover:bg-white/5 rounded transition-colors" title="Mute">
          {isMuted ? <VolumeX size={14} className="text-zinc-400" /> : <Volume2 size={14} className="text-zinc-400" />}
        </button>

        {/* Time Display */}
        <span className="text-xs font-mono text-zinc-400 ml-2">
          <span className="text-white">{formatTimeSimple(project.currentFrame, project.fps)}</span>
          <span className="mx-1">/</span>
          <span>{formatTimeSimple(project.totalDurationFrames, project.fps)}</span>
        </span>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Zoom Controls */}
        <button onClick={zoomOut} className="p-1 hover:bg-white/5 rounded transition-colors" title="Zoom out (-)">
          <ZoomOut size={14} className="text-zinc-400" />
        </button>
        <span className="text-[10px] text-zinc-500 w-10 text-center">{Math.round(project.zoom * 50)}%</span>
        <button onClick={zoomIn} className="p-1 hover:bg-white/5 rounded transition-colors" title="Zoom in (+)">
          <ZoomIn size={14} className="text-zinc-400" />
        </button>
      </div>

      {/* ============ TIMELINE ============ */}
      <Timeline onSeek={handleSeekTo} />
    </div>
  );
};
