/**
 * TimelineClip
 * Individual clip on the timeline with drag-to-move and resize handles.
 */

import React, { useCallback, useRef, useState } from 'react';
import { GripHorizontal } from 'lucide-react';
import { useVideoEditor } from '../VideoEditorContext';
import type { TimelineClip as TimelineClipType, TrackType, EditorAsset } from '@/lib/types/video-editor';

interface TimelineClipProps {
  clip: TimelineClipType;
  asset: EditorAsset | null;
  trackType: TrackType;
  pixelsPerFrame: number;
  isSelected: boolean;
  isDragging: boolean;
  onDragStart: (clipId: string, e: React.MouseEvent) => void;
  onClick: (clipId: string, e: React.MouseEvent) => void;
  /** Called when snap line should show/hide during resize */
  onSnapLine?: (frame: number | null) => void;
}

const MIN_DURATION_FRAMES = 15; // 0.5s minimum at 30fps

const clipColor = (type: TrackType) => {
  switch (type) {
    case 'visual': return 'bg-blue-500/80 hover:bg-blue-500/90';
    case 'audio': return 'bg-green-500/80 hover:bg-green-500/90';
    case 'text': return 'bg-teal-500/80 hover:bg-teal-500/90';
  }
};

export const TimelineClipComponent: React.FC<TimelineClipProps> = ({
  clip,
  asset,
  trackType,
  pixelsPerFrame,
  isSelected,
  isDragging,
  onDragStart,
  onClick,
  onSnapLine,
}) => {
  const { updateClip } = useVideoEditor();
  const [resizing, setResizing] = useState<'left' | 'right' | null>(null);
  const resizeOrigin = useRef<{
    mouseX: number;
    origStartFrame: number;
    origDuration: number;
  } | null>(null);

  // --- Resize start ---
  const handleResizeStart = useCallback((edge: 'left' | 'right', e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    (e.target as HTMLElement).setPointerCapture((e as any).pointerId ?? 0);

    resizeOrigin.current = {
      mouseX: e.clientX,
      origStartFrame: clip.startFrame,
      origDuration: clip.durationFrames,
    };
    setResizing(edge);

    const handleMouseMove = (ev: MouseEvent) => {
      if (!resizeOrigin.current) return;
      const deltaX = ev.clientX - resizeOrigin.current.mouseX;
      const deltaFrames = Math.round(deltaX / pixelsPerFrame);

      if (edge === 'left') {
        const newStart = Math.max(0, resizeOrigin.current.origStartFrame + deltaFrames);
        const startDelta = newStart - resizeOrigin.current.origStartFrame;
        const newDuration = resizeOrigin.current.origDuration - startDelta;
        if (newDuration >= MIN_DURATION_FRAMES) {
          updateClip(clip.id, { startFrame: newStart, durationFrames: newDuration });
        }
      } else {
        const newDuration = Math.max(MIN_DURATION_FRAMES, resizeOrigin.current.origDuration + deltaFrames);
        updateClip(clip.id, { durationFrames: newDuration });
      }
    };

    const handleMouseUp = () => {
      setResizing(null);
      resizeOrigin.current = null;
      onSnapLine?.(null);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  }, [clip.id, clip.startFrame, clip.durationFrames, pixelsPerFrame, updateClip, onSnapLine]);

  return (
    <div
      onClick={(e) => onClick(clip.id, e)}
      onMouseDown={(e) => {
        // Only start drag from the body, not from resize handles
        if (resizing) return;
        onDragStart(clip.id, e);
      }}
      className={`absolute top-1 bottom-1 rounded cursor-grab active:cursor-grabbing transition-colors ${clipColor(trackType)} ${
        isSelected
          ? 'ring-2 ring-yellow-400 ring-offset-1 ring-offset-zinc-100 dark:ring-offset-[#0d0d0f]'
          : ''
      } ${isDragging ? 'opacity-80 z-10' : ''} ${resizing ? 'z-10' : ''}`}
      style={{
        left: clip.startFrame * pixelsPerFrame,
        width: Math.max(clip.durationFrames * pixelsPerFrame, 4),
      }}
    >
      {/* Clip content */}
      <div className="absolute inset-0 flex items-center px-1.5 overflow-hidden">
        <GripHorizontal size={10} className="text-white/40 mr-0.5 flex-shrink-0" />
        {asset?.thumbnailUrl && trackType === 'visual' && (
          <img src={asset.thumbnailUrl} alt="" className="h-5 w-5 object-cover rounded-sm mr-1 flex-shrink-0" />
        )}
        <span className="text-[9px] text-white/80 truncate">
          {clip.textContent?.text || asset?.name || 'Clip'}
        </span>
      </div>

      {/* Left resize handle */}
      <div
        className="absolute left-0 top-0 bottom-0 w-1.5 cursor-col-resize hover:bg-white/30 rounded-l z-20"
        onMouseDown={(e) => handleResizeStart('left', e)}
        style={{ cursor: 'col-resize' }}
      />

      {/* Right resize handle */}
      <div
        className="absolute right-0 top-0 bottom-0 w-1.5 cursor-col-resize hover:bg-white/30 rounded-r z-20"
        onMouseDown={(e) => handleResizeStart('right', e)}
        style={{ cursor: 'col-resize' }}
      />
    </div>
  );
};
