/**
 * useTimelineSnap
 * Provides snap-to-grid and snap-to-clip-edge logic for timeline operations.
 */

import { useCallback, useMemo } from 'react';
import type { TimelineClip, TimelineTrack } from '@/lib/types/video-editor';

interface UseTimelineSnapOptions {
  clips: Record<string, TimelineClip>;
  tracks: TimelineTrack[];
  playheadFrame: number;
  fps: number;
  pixelsPerFrame: number;
  snapThresholdPx?: number;
  excludeClipId?: string;
}

export interface SnapResult {
  frame: number;
  snapped: boolean;
  snapLineFrame: number | null;
}

export function useTimelineSnap({
  clips,
  tracks,
  playheadFrame,
  fps,
  pixelsPerFrame,
  snapThresholdPx = 6,
  excludeClipId,
}: UseTimelineSnapOptions) {
  // Collect all snap points (clip edges + playhead + second marks)
  const snapPoints = useMemo(() => {
    const points = new Set<number>();

    // Playhead
    points.add(playheadFrame);

    // Clip edges
    for (const [id, clip] of Object.entries(clips)) {
      if (id === excludeClipId) continue;
      points.add(clip.startFrame);
      points.add(clip.startFrame + clip.durationFrames);
    }

    // Every second
    const maxFrame = Math.max(
      ...Object.values(clips).map(c => c.startFrame + c.durationFrames),
      playheadFrame + fps * 5
    );
    for (let f = 0; f <= maxFrame; f += fps) {
      points.add(f);
    }

    return Array.from(points).sort((a, b) => a - b);
  }, [clips, playheadFrame, fps, excludeClipId]);

  const snapThresholdFrames = snapThresholdPx / pixelsPerFrame;

  const snapFrame = useCallback((frame: number): SnapResult => {
    let closest: number | null = null;
    let minDist = Infinity;

    for (const point of snapPoints) {
      const dist = Math.abs(frame - point);
      if (dist < minDist && dist <= snapThresholdFrames) {
        minDist = dist;
        closest = point;
      }
    }

    if (closest !== null) {
      return { frame: closest, snapped: true, snapLineFrame: closest };
    }

    return { frame, snapped: false, snapLineFrame: null };
  }, [snapPoints, snapThresholdFrames]);

  return { snapFrame, snapPoints };
}
