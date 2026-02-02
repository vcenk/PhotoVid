/**
 * useUndoRedo
 * History stack for undo/redo operations.
 * Stores serializable snapshots of project state (excluding playback/UI state).
 */

import { useCallback, useRef } from 'react';
import type { VideoEditorProject } from '@/lib/types/video-editor';

const MAX_HISTORY = 50;

/** Subset of project state that gets saved in undo history */
export interface ProjectSnapshot {
  clips: VideoEditorProject['clips'];
  tracks: VideoEditorProject['tracks'];
  assets: VideoEditorProject['assets'];
  transitions: VideoEditorProject['transitions'];
  totalDurationFrames: number;
}

function takeSnapshot(project: VideoEditorProject): ProjectSnapshot {
  return {
    clips: JSON.parse(JSON.stringify(project.clips)),
    tracks: JSON.parse(JSON.stringify(project.tracks)),
    assets: JSON.parse(JSON.stringify(project.assets)),
    transitions: JSON.parse(JSON.stringify(project.transitions)),
    totalDurationFrames: project.totalDurationFrames,
  };
}

export function useUndoRedo() {
  const past = useRef<ProjectSnapshot[]>([]);
  const future = useRef<ProjectSnapshot[]>([]);
  // Track current version to let consumers know when canUndo/canRedo change
  const version = useRef(0);

  const pushState = useCallback((project: VideoEditorProject) => {
    const snapshot = takeSnapshot(project);
    past.current = [...past.current.slice(-(MAX_HISTORY - 1)), snapshot];
    future.current = [];
    version.current++;
  }, []);

  const undo = useCallback((currentProject: VideoEditorProject): ProjectSnapshot | null => {
    if (past.current.length === 0) return null;

    const currentSnapshot = takeSnapshot(currentProject);
    future.current = [...future.current, currentSnapshot];

    const previous = past.current[past.current.length - 1];
    past.current = past.current.slice(0, -1);
    version.current++;

    return previous;
  }, []);

  const redo = useCallback((currentProject: VideoEditorProject): ProjectSnapshot | null => {
    if (future.current.length === 0) return null;

    const currentSnapshot = takeSnapshot(currentProject);
    past.current = [...past.current, currentSnapshot];

    const next = future.current[future.current.length - 1];
    future.current = future.current.slice(0, -1);
    version.current++;

    return next;
  }, []);

  const canUndo = useCallback(() => past.current.length > 0, []);
  const canRedo = useCallback(() => future.current.length > 0, []);

  return { pushState, undo, redo, canUndo, canRedo };
}
