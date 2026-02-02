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

const TRACK_HEIGHT = 36;

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
      case 'visual': return <Film size={12} className="text-blue-400" />;
      case 'audio': return <Music size={12} className="text-green-400" />;
      case 'text': return <Type size={12} className="text-purple-400" />;
    }
  };

  return (
    <div className="flex-shrink-0 bg-[#0d0d0f] flex flex-col" style={{ height: `${24 + project.tracks.length * TRACK_HEIGHT + 28}px`, minHeight: '140px', maxHeight: '260px' }}>
      {/* + Track button */}
      <div className="flex items-center gap-2 px-2 py-1 border-b border-white/5">
        <button
          onClick={() => addTrack('visual')}
          className="flex items-center gap-1 px-2 py-0.5 text-[11px] text-zinc-400 hover:text-white hover:bg-white/5 rounded transition-colors"
        >
          <Plus size={11} /> Track
        </button>
      </div>

      {/* Timeline body */}
      <div className="flex-1 flex overflow-hidden min-h-0">
        {/* Track Labels */}
        <div className="w-[120px] flex-shrink-0 bg-[#0d0d0f] border-r border-white/5 overflow-y-auto">
          <div className="h-5 border-b border-white/5" />
          {project.tracks.map((track) => (
            <div
              key={track.id}
              onClick={() => selectTrack(track.id)}
              className={`flex items-center gap-1.5 px-2 border-b border-white/5 cursor-pointer hover:bg-white/5 transition-colors ${
                project.selectedTrackId === track.id ? 'bg-white/10' : ''
              }`}
              style={{ height: TRACK_HEIGHT }}
            >
              {trackIcon(track.type)}
              <span className="text-[11px] text-zinc-400 flex-1 truncate">{track.name}</span>
              <button
                onClick={(e) => { e.stopPropagation(); toggleTrackMute(track.id); }}
                className={`p-0.5 rounded hover:bg-white/10 ${track.muted ? 'text-red-400' : 'text-zinc-600'}`}
              >
                {track.muted ? <VolumeX size={10} /> : <Volume2 size={10} />}
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); toggleTrackVisibility(track.id); }}
                className={`p-0.5 rounded hover:bg-white/10 ${!track.visible ? 'text-red-400' : 'text-zinc-600'}`}
              >
                {track.visible ? <Eye size={10} /> : <EyeOff size={10} />}
              </button>
            </div>
          ))}
        </div>

        {/* Timeline Scrollable Area */}
        <div
          ref={timelineRef}
          className="flex-1 overflow-x-auto overflow-y-auto relative"
          onClick={handleTimelineClick}
          onMouseMove={handleMouseMove}
        >
          <div style={{ width: totalWidth, minWidth: '100%' }} className="relative">
            {/* Time Ruler */}
            <div className="h-5 border-b border-white/5 relative sticky top-0 bg-[#0d0d0f] z-20">
              {markers.map((frame) => (
                <div
                  key={frame}
                  className="absolute top-0 h-full flex flex-col justify-end"
                  style={{ left: frame * pixelsPerFrame }}
                >
                  <div className="w-px h-2 bg-zinc-700" />
                  <span className="text-[8px] text-zinc-600 ml-0.5 leading-none">
                    {formatTimeSimple(frame, project.fps)}
                  </span>
                </div>
              ))}
            </div>

            {/* Track Rows */}
            {project.tracks.map((track) => (
              <div
                key={track.id}
                className="border-b border-white/5 relative"
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

            {/* Snap line */}
            {snapLineFrame !== null && (
              <div
                className="absolute top-0 bottom-0 w-px bg-cyan-400 z-40 pointer-events-none"
                style={{ left: snapLineFrame * pixelsPerFrame }}
              />
            )}

            {/* Playhead */}
            <div
              className="absolute top-0 bottom-0 z-30 cursor-ew-resize"
              style={{ left: project.currentFrame * pixelsPerFrame - 5, width: 11 }}
              onMouseDown={() => setIsDraggingPlayhead(true)}
            >
              <div className="relative w-full h-full">
                <div className="absolute left-[5px] top-0 bottom-0 w-px bg-red-500" />
                <div className="absolute left-1/2 -translate-x-1/2 top-0 w-2.5 h-3 bg-red-500 rounded-b-sm" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="h-4 border-t border-white/5 bg-[#0a0a0b]" />
    </div>
  );
};
