/**
 * TextDragOverlay
 * Sits inside the same relative container as the Player so coordinates match.
 * Shows a clickable/draggable handle at each text clip's position.
 */

import React, { useRef, useState, useCallback } from 'react';
import { Move } from 'lucide-react';
import { useVideoEditor } from '../VideoEditorContext';

const presetToXY = (position: string): { x: number; y: number } => {
  switch (position) {
    case 'top': return { x: 50, y: 8 };
    case 'bottom': return { x: 50, y: 92 };
    case 'lower-third': return { x: 15, y: 88 };
    case 'center':
    default: return { x: 50, y: 50 };
  }
};

export const TextDragOverlay: React.FC = () => {
  const overlayRef = useRef<HTMLDivElement>(null);
  const { project, updateClip, selectClip } = useVideoEditor();
  const [dragging, setDragging] = useState<string | null>(null);
  const dragOrigin = useRef<{ mouseX: number; mouseY: number; clipX: number; clipY: number } | null>(null);

  // Visible text clips at the current frame
  const visibleTextClips = Object.values(project.clips).filter(clip => {
    if (!clip.textContent) return false;
    const track = project.tracks.find(t => t.id === clip.trackId);
    if (!track || !track.visible) return false;
    return project.currentFrame >= clip.startFrame &&
           project.currentFrame < clip.startFrame + clip.durationFrames;
  });

  const getClipXY = useCallback((clip: typeof visibleTextClips[0]) => {
    const c = clip.textContent!;
    if (c.x !== undefined && c.y !== undefined) return { x: c.x, y: c.y };
    return presetToXY(c.position);
  }, []);

  const handlePointerDown = useCallback((clipId: string, e: React.PointerEvent) => {
    e.preventDefault();
    e.stopPropagation();
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    selectClip(clipId);

    const clip = project.clips[clipId];
    if (!clip?.textContent) return;

    const { x, y } = getClipXY(clip);
    if (clip.textContent.x === undefined) {
      updateClip(clipId, {
        textContent: { ...clip.textContent, x, y },
      });
    }

    dragOrigin.current = { mouseX: e.clientX, mouseY: e.clientY, clipX: x, clipY: y };
    setDragging(clipId);
  }, [project.clips, selectClip, getClipXY, updateClip]);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!dragging || !dragOrigin.current || !overlayRef.current) return;
    const rect = overlayRef.current.getBoundingClientRect();
    const dx = ((e.clientX - dragOrigin.current.mouseX) / rect.width) * 100;
    const dy = ((e.clientY - dragOrigin.current.mouseY) / rect.height) * 100;
    const newX = Math.round(Math.max(2, Math.min(98, dragOrigin.current.clipX + dx)));
    const newY = Math.round(Math.max(2, Math.min(98, dragOrigin.current.clipY + dy)));

    const clip = project.clips[dragging];
    if (clip?.textContent) {
      updateClip(dragging, {
        textContent: { ...clip.textContent, x: newX, y: newY },
      });
    }
  }, [dragging, project.clips, updateClip]);

  const handlePointerUp = useCallback(() => {
    setDragging(null);
    dragOrigin.current = null;
  }, []);

  if (visibleTextClips.length === 0) return null;

  return (
    <div
      ref={overlayRef}
      className="absolute inset-0 z-10"
      style={{ pointerEvents: 'none' }}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
    >
      {visibleTextClips.map(clip => {
        const content = clip.textContent!;
        const isSelected = project.selectedClipId === clip.id;
        const isDragging = dragging === clip.id;
        const { x, y } = getClipXY(clip);

        return (
          <div
            key={clip.id}
            onPointerDown={(e) => handlePointerDown(clip.id, e)}
            className={`absolute select-none ${isDragging ? 'cursor-grabbing z-20' : 'cursor-grab z-10'}`}
            style={{
              left: `${x}%`,
              top: `${y}%`,
              transform: 'translate(-50%, -50%)',
              pointerEvents: 'auto',
              touchAction: 'none',
            }}
          >
            <div className="relative group">
              {isSelected && (
                <div
                  className="absolute -inset-1.5 border-2 border-teal-400/70 rounded pointer-events-none"
                  style={{ borderStyle: isDragging ? 'solid' : 'dashed' }}
                />
              )}

              {/* Invisible hit area - text is rendered by the composition, not here */}
              <div
                className="px-2 py-1"
                style={{
                  fontSize: Math.max(10, content.fontSize * 0.22),
                  fontWeight: content.fontWeight,
                  fontFamily: content.fontFamily,
                  color: 'transparent', // Always transparent - composition renders the actual text
                  minWidth: 40,
                  minHeight: 20,
                  textAlign: content.alignment || 'center',
                  whiteSpace: 'nowrap',
                }}
              >
                {content.text || 'Text'}
              </div>

              {!isSelected && (
                <div className="absolute -top-5 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                  <div className="px-1.5 py-0.5 rounded bg-black/80 text-[8px] text-white/80 whitespace-nowrap">
                    {content.text.slice(0, 20) || 'Text'}
                  </div>
                </div>
              )}

              {isSelected && (
                <div className="absolute -top-5 left-1/2 -translate-x-1/2 flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-teal-600 text-[8px] text-white font-medium whitespace-nowrap shadow-lg">
                  <Move size={8} />
                  drag
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
