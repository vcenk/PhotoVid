/**
 * Timeline
 * Track labels, time ruler, clips, playhead, resize, and snap.
 */

import React, { useRef, useEffect, useCallback, useState } from 'react';
import {
  Plus,
  Volume2,
  VolumeX,
  Eye,
  EyeOff,
  Film,
  Music,
  Type,
} from 'lucide-react';
import { useVideoEditor } from '../VideoEditorContext';
import { TimelineClipComponent } from './TimelineClip';
import { useTimelineSnap } from '../hooks/useTimelineSnap';
import { formatTimeSimple } from '@/lib/types/video-editor';
import type { TrackType } from '@/lib/types/video-editor';

interface TimelineProps {
  onSeek: (frame: number) => void;
}

const TRACK_HEIGHT = 48;

export const Timeline: React.FC<TimelineProps> = ({ onSeek }) => {
  const timelineRef = useRef<HTMLDivElement>(null);
  const [isDraggingPlayhead, setIsDraggingPlayhead] = useState(false);
  const [draggingClip, setDraggingClip] = useState<{ id: string; startX: number; origStart: number } | null>(null);
  const [snapLineFrame, setSnapLineFrame] = useState<number | null>(null);
  const {
    project,
    selectClip,
    selectTrack,
    addTrack,
    toggleTrackMute,
    toggleTrackVisibility,
    updateClip,
  } = useVideoEditor();

  const pixelsPerFrame = project.zoom;
  const totalWidth = project.totalDurationFrames * pixelsPerFrame;

  const { snapFrame } = useTimelineSnap({
    clips: project.clips,
    tracks: project.tracks,
    playheadFrame: project.currentFrame,
    fps: project.fps,
    pixelsPerFrame,
    excludeClipId: draggingClip?.id ?? undefined,
  });

  // Click to seek
  const handleTimelineClick = useCallback((e: React.MouseEvent) => {
    if (!timelineRef.current) return;
    const rect = timelineRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left + timelineRef.current.scrollLeft;
    const frame = Math.max(0, Math.min(Math.floor(x / pixelsPerFrame), project.totalDurationFrames));
    onSeek(frame);
  }, [pixelsPerFrame, project.totalDurationFrames, onSeek]);

  // Playhead drag + clip drag
  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!timelineRef.current) return;

    if (isDraggingPlayhead) {
      const rect = timelineRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left + timelineRef.current.scrollLeft;
      const frame = Math.max(0, Math.min(Math.floor(x / pixelsPerFrame), project.totalDurationFrames));
      onSeek(frame);
    }

    if (draggingClip) {
      const deltaX = e.clientX - draggingClip.startX;
      const deltaFrames = Math.round(deltaX / pixelsPerFrame);
      const rawFrame = Math.max(0, draggingClip.origStart + deltaFrames);

      // Snap the start frame
      const result = snapFrame(rawFrame);
      updateClip(draggingClip.id, { startFrame: result.frame });
      setSnapLineFrame(result.snapLineFrame);

      // Also try snapping the end frame
      const clip = project.clips[draggingClip.id];
      if (clip) {
        const endResult = snapFrame(result.frame + clip.durationFrames);
        if (endResult.snapped && !result.snapped) {
          const snappedStart = endResult.frame - clip.durationFrames;
          if (snappedStart >= 0) {
            updateClip(draggingClip.id, { startFrame: snappedStart });
            setSnapLineFrame(endResult.snapLineFrame);
          }
        }
      }
    }
  }, [isDraggingPlayhead, draggingClip, pixelsPerFrame, project.totalDurationFrames, project.clips, onSeek, updateClip, snapFrame]);

  useEffect(() => {
    const up = () => {
      setIsDraggingPlayhead(false);
      setDraggingClip(null);
      setSnapLineFrame(null);
    };
    window.addEventListener('mouseup', up);
    return () => window.removeEventListener('mouseup', up);
  }, []);

  const handleClipClick = useCallback((clipId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    console.log('[Timeline] Clip clicked:', clipId);
    selectClip(clipId);
  }, [selectClip]);

  const handleClipDragStart = useCallback((clipId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    const clip = project.clips[clipId];
    if (!clip) return;
    selectClip(clipId);
    setDraggingClip({ id: clipId, startX: e.clientX, origStart: clip.startFrame });
  }, [project.clips, selectClip]);

  // Time markers every second
  const markers: number[] = [];
  for (let f = 0; f <= project.totalDurationFrames; f += project.fps) {
    markers.push(f);
  }

  const trackIcon = (type: TrackType) => {
    switch (type) {
      case 'visual': return <Film size={14} className="text-blue-400" />;
      case 'audio': return <Music size={14} className="text-green-400" />;
      case 'text': return <Type size={14} className="text-purple-400" />;
    }
  };

  return (
    <div className="flex-shrink-0 bg-zinc-950/80 backdrop-blur-xl flex flex-col relative z-20" style={{ height: `${28 + project.tracks.length * TRACK_HEIGHT + 32}px`, minHeight: '200px', maxHeight: '360px' }}>
      {/* + Track button */}
      <div className="flex items-center gap-4 px-4 py-2 border-b border-white/5 bg-white/5 shadow-lg relative z-30">
        <button
          onClick={() => addTrack('visual')}
          className="flex items-center gap-1.5 px-3 py-1 bg-white/5 hover:bg-white/10 text-[10px] font-black uppercase tracking-widest text-zinc-400 hover:text-white rounded-lg border border-white/5 transition-all"
        >
          <Plus size={12} /> New Track
        </button>
        
        <div className="flex-1" />
        
        <div className="flex items-center gap-2">
             <div className="w-2 h-2 rounded-full bg-purple-500 animate-pulse" />
             <span className="text-[10px] font-black text-purple-400 uppercase tracking-widest">Live Timeline</span>
        </div>
      </div>

      {/* Timeline body */}
      <div className="flex-1 flex overflow-hidden min-h-0 relative">
        {/* Track Labels */}
        <div className="w-[140px] flex-shrink-0 bg-black/40 backdrop-blur-md border-r border-white/5 overflow-y-auto custom-scrollbar relative z-20">
          <div className="h-6 border-b border-white/5 bg-black/20" />
          {project.tracks.map((track) => (
            <div
              key={track.id}
              onClick={() => selectTrack(track.id)}
              className={`flex items-center gap-2 px-3 border-b border-white/5 cursor-pointer transition-all duration-300 relative group ${
                project.selectedTrackId === track.id ? 'bg-purple-600/20 shadow-inner' : 'hover:bg-white/5'
              }`}
              style={{ height: TRACK_HEIGHT }}
            >
              {project.selectedTrackId === track.id && (
                 <div className="absolute left-0 top-0 bottom-0 w-1 bg-purple-500 shadow-[0_0_10px_rgba(168,85,247,0.5)]" />
              )}
              
              <div className="p-2 bg-white/5 rounded-lg group-hover:bg-white/10 transition-colors">
                {trackIcon(track.type)}
              </div>
              
              <span className={`text-xs font-bold uppercase tracking-tight flex-1 truncate ${project.selectedTrackId === track.id ? 'text-white' : 'text-zinc-500'}`}>
                {track.name}
              </span>
              
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                    onClick={(e) => { e.stopPropagation(); toggleTrackMute(track.id); }}
                    className={`p-1.5 rounded-md hover:bg-black/40 transition-colors ${track.muted ? 'text-red-400' : 'text-zinc-600'}`}
                >
                    {track.muted ? <VolumeX size={14} /> : <Volume2 size={14} />}
                </button>
                <button
                    onClick={(e) => { e.stopPropagation(); toggleTrackVisibility(track.id); }}
                    className={`p-1.5 rounded-md hover:bg-black/40 transition-colors ${!track.visible ? 'text-red-400' : 'text-zinc-600'}`}
                >
                    {track.visible ? <Eye size={14} /> : <EyeOff size={14} />}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Timeline Scrollable Area */}
        <div
          ref={timelineRef}
          className="flex-1 overflow-x-auto overflow-y-auto relative custom-scrollbar bg-black/20"
          onClick={handleTimelineClick}
          onMouseMove={handleMouseMove}
        >
          <div style={{ width: totalWidth, minWidth: '100%' }} className="relative min-h-full">
            {/* Time Ruler */}
            <div className="h-6 border-b border-white/5 relative sticky top-0 bg-zinc-950/90 backdrop-blur-md z-40">
              {markers.map((frame) => (
                <div
                  key={frame}
                  className="absolute top-0 h-full flex flex-col justify-end"
                  style={{ left: frame * pixelsPerFrame }}
                >
                  <div className={`w-px transition-colors ${frame % (project.fps * 5) === 0 ? 'h-3 bg-zinc-400' : 'h-1.5 bg-zinc-700'}`} />
                  {frame % project.fps === 0 && (
                    <span className="text-[9px] font-bold text-zinc-500 ml-1 mb-1 tracking-tighter">
                        {formatTimeSimple(frame, project.fps)}
                    </span>
                  )}
                </div>
              ))}
            </div>

            {/* Grid Lines Background */}
            <div className="absolute inset-0 pointer-events-none opacity-[0.03]"
                 style={{ 
                    backgroundImage: `linear-gradient(to right, white 1px, transparent 1px)`,
                    backgroundSize: `${project.fps * pixelsPerFrame}px 100%`
                 }} 
            />

            {/* Track Rows */}
            <div className="relative z-10">
                {project.tracks.map((track) => (
                <div
                    key={track.id}
                    className="border-b border-white/5 relative transition-colors duration-300"
                    style={{ height: TRACK_HEIGHT }}
                >
                    {track.clips.map((clipId) => {
                    const clip = project.clips[clipId];
                    if (!clip) return null;
                    const asset = clip.assetId ? project.assets[clip.assetId] : null;

                    return (
                        <TimelineClipComponent
                        key={clipId}
                        clip={clip}
                        asset={asset}
                        trackType={track.type}
                        pixelsPerFrame={pixelsPerFrame}
                        isSelected={project.selectedClipId === clipId}
                        isDragging={draggingClip?.id === clipId}
                        onDragStart={handleClipDragStart}
                        onClick={handleClipClick}
                        onSnapLine={setSnapLineFrame}
                        />
                    );
                    })}
                </div>
                ))}
            </div>

            {/* Snap line */}
            {snapLineFrame !== null && (
              <div
                className="absolute top-0 bottom-0 w-px bg-cyan-400/50 shadow-[0_0_8px_rgba(34,211,238,0.5)] z-40 pointer-events-none"
                style={{ left: snapLineFrame * pixelsPerFrame }}
              />
            )}

            {/* Playhead */}
            <div
              className="absolute top-0 bottom-0 z-50 cursor-ew-resize group"
              style={{ left: project.currentFrame * pixelsPerFrame - 5, width: 11 }}
              onMouseDown={() => setIsDraggingPlayhead(true)}
            >
              <div className="relative w-full h-full flex flex-col items-center">
                <div className="w-0.5 h-full bg-white shadow-[0_0_10px_rgba(255,255,255,0.3)] group-hover:bg-purple-400 group-hover:w-1 transition-all" />
                <div className="absolute top-0 w-4 h-4 bg-white rounded-sm rotate-45 -translate-y-1/2 shadow-lg group-hover:bg-purple-400 transition-colors" />
                <div className="absolute top-0 px-2 py-0.5 bg-white text-black text-[9px] font-black rounded-full -translate-y-[140%] opacity-0 group-hover:opacity-100 transition-opacity shadow-xl">
                    {formatTimeSimple(project.currentFrame, project.fps)}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Status Bar */}
      <div className="h-6 flex items-center justify-between px-4 bg-zinc-950 text-[9px] font-black uppercase tracking-widest text-zinc-600 border-t border-white/5">
         <div className="flex gap-4">
            <span>FPS: {project.fps}</span>
            <span>ZOOM: {Math.round(project.zoom * 100)}%</span>
         </div>
         <div className="flex gap-4">
            <span>CLIPS: {Object.keys(project.clips).length}</span>
            <span>TRACKS: {project.tracks.length}</span>
         </div>
      </div>
    </div>
  );
};
