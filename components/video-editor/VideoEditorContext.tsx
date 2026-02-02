/**
 * VideoEditorContext
 * State management for the timeline-based video editor
 */

import React, { createContext, useContext, useState, useCallback, useMemo, useRef, useEffect } from 'react';
import type {
  VideoEditorProject,
  VideoEditorContextType,
  EditorAsset,
  TimelineClip,
  TimelineTrack,
  ClipTransition,
  ClipEffect,
  TrackType,
  TransitionType,
  EffectType,
  KenBurnsDirection,
  TextClipContent,
  ExportFormat,
  createDefaultProject,
} from '@/lib/types/video-editor';
import { createDefaultProject as createProject } from '@/lib/types/video-editor';
import { useUndoRedo } from './hooks/useUndoRedo';

const STORAGE_KEY = 'photovid-video-editor-project';

// Create context
const VideoEditorContext = createContext<VideoEditorContextType | undefined>(undefined);

// Provider component
export function VideoEditorProvider({ children }: { children: React.ReactNode }) {
  const [project, setProject] = useState<VideoEditorProject>(() => {
    // Try to load from localStorage
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          // Clear stale blob URLs from previous sessions — they are invalid after reload
          const cleanedAssets: Record<string, EditorAsset> = {};
          const invalidAssetIds = new Set<string>();
          for (const [id, asset] of Object.entries(parsed.assets || {})) {
            const a = asset as EditorAsset;
            if (a.url && a.url.startsWith('blob:')) {
              invalidAssetIds.add(id);
            } else {
              cleanedAssets[id] = { ...a, createdAt: new Date(a.createdAt) };
            }
          }
          // Remove clips referencing invalid assets
          const cleanedClips: Record<string, TimelineClip> = {};
          const removedClipIds = new Set<string>();
          for (const [id, clip] of Object.entries(parsed.clips || {})) {
            const c = clip as TimelineClip;
            if (c.assetId && invalidAssetIds.has(c.assetId)) {
              removedClipIds.add(id);
            } else {
              cleanedClips[id] = c;
            }
          }
          // Remove clip refs from tracks
          const cleanedTracks = (parsed.tracks || []).map((track: TimelineTrack) => ({
            ...track,
            clips: track.clips.filter((cid: string) => !removedClipIds.has(cid)),
          }));

          return {
            ...parsed,
            assets: cleanedAssets,
            clips: cleanedClips,
            tracks: cleanedTracks,
            createdAt: new Date(parsed.createdAt),
            updatedAt: new Date(parsed.updatedAt),
          };
        } catch {
          // Fall through to create default
        }
      }
    }
    return createProject('Untitled Video');
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const undoRedo = useUndoRedo();
  // Track undo/redo availability via a counter that changes when stacks change
  const [undoRedoVersion, setUndoRedoVersion] = useState(0);

  /** Push current state to undo stack before a mutation */
  const pushUndo = useCallback(() => {
    undoRedo.pushState(project);
    setUndoRedoVersion(v => v + 1);
  }, [undoRedo, project]);

  const undo = useCallback(() => {
    const snapshot = undoRedo.undo(project);
    if (snapshot) {
      setProject(prev => ({
        ...prev,
        ...snapshot,
        updatedAt: new Date(),
      }));
      setUndoRedoVersion(v => v + 1);
    }
  }, [undoRedo, project]);

  const redo = useCallback(() => {
    const snapshot = undoRedo.redo(project);
    if (snapshot) {
      setProject(prev => ({
        ...prev,
        ...snapshot,
        updatedAt: new Date(),
      }));
      setUndoRedoVersion(v => v + 1);
    }
  }, [undoRedo, project]);

  // Save to localStorage on changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(project));
    }
  }, [project]);

  // Helper to update project with timestamp
  const updateProject = useCallback((updates: Partial<VideoEditorProject> | ((prev: VideoEditorProject) => Partial<VideoEditorProject>)) => {
    setProject(prev => {
      const newUpdates = typeof updates === 'function' ? updates(prev) : updates;
      return {
        ...prev,
        ...newUpdates,
        updatedAt: new Date(),
      };
    });
  }, []);

  // ============================================
  // PROJECT MANAGEMENT
  // ============================================

  const createNewProject = useCallback((name?: string) => {
    setProject(createProject(name || 'Untitled Video'));
    setError(null);
  }, []);

  const loadProject = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      // TODO: Load from Supabase
      setLoading(false);
    } catch (err) {
      setError('Failed to load project');
      setLoading(false);
    }
  }, []);

  const saveProject = useCallback(async (): Promise<boolean> => {
    try {
      // TODO: Save to Supabase
      localStorage.setItem(STORAGE_KEY, JSON.stringify(project));
      return true;
    } catch {
      setError('Failed to save project');
      return false;
    }
  }, [project]);

  const clearProject = useCallback(() => {
    setProject(createProject('Untitled Video'));
    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  const setProjectName = useCallback((name: string) => {
    updateProject({ name });
  }, [updateProject]);

  // ============================================
  // FORMAT & DURATION
  // ============================================

  const setFormat = useCallback((format: ExportFormat) => {
    updateProject({ format });
  }, [updateProject]);

  const setDuration = useCallback((frames: number) => {
    updateProject({ totalDurationFrames: Math.max(30, frames) }); // Minimum 1 second
  }, [updateProject]);

  // ============================================
  // ASSETS
  // ============================================

  const addAsset = useCallback(async (file: File): Promise<EditorAsset> => {
    const id = crypto.randomUUID();
    const url = URL.createObjectURL(file);

    // Determine asset type
    let type: EditorAsset['type'] = 'image';
    if (file.type.startsWith('video/')) type = 'video';
    else if (file.type.startsWith('audio/')) type = 'audio';

    // Get dimensions for images/video
    let width: number | undefined;
    let height: number | undefined;
    let duration: number | undefined;

    if (type === 'image') {
      const img = new Image();
      await new Promise<void>((resolve) => {
        img.onload = () => {
          width = img.naturalWidth;
          height = img.naturalHeight;
          resolve();
        };
        img.onerror = () => resolve();
        img.src = url;
      });
    } else if (type === 'video' || type === 'audio') {
      const media = document.createElement(type === 'video' ? 'video' : 'audio');
      await new Promise<void>((resolve) => {
        media.onloadedmetadata = () => {
          duration = Math.round(media.duration * 30); // Convert to frames at 30fps
          if (type === 'video') {
            width = (media as HTMLVideoElement).videoWidth;
            height = (media as HTMLVideoElement).videoHeight;
          }
          resolve();
        };
        media.onerror = () => resolve();
        media.src = url;
      });
    }

    const asset: EditorAsset = {
      id,
      type,
      name: file.name,
      url,
      thumbnailUrl: type === 'image' ? url : undefined,
      duration,
      width,
      height,
      fileSize: file.size,
      mimeType: file.type,
      createdAt: new Date(),
    };

    updateProject(prev => ({
      assets: { ...prev.assets, [id]: asset },
    }));

    return asset;
  }, [updateProject]);

  const addAssets = useCallback(async (files: File[]): Promise<EditorAsset[]> => {
    const assets = await Promise.all(files.map(addAsset));
    return assets;
  }, [addAsset]);

  const removeAsset = useCallback((id: string) => {
    updateProject(prev => {
      const { [id]: removed, ...remainingAssets } = prev.assets;

      // Also remove any clips using this asset
      const clipsToRemove = Object.values(prev.clips)
        .filter(clip => clip.assetId === id)
        .map(clip => clip.id);

      const remainingClips = { ...prev.clips };
      clipsToRemove.forEach(clipId => delete remainingClips[clipId]);

      // Update tracks to remove clip references
      const updatedTracks = prev.tracks.map(track => ({
        ...track,
        clips: track.clips.filter(clipId => !clipsToRemove.includes(clipId)),
      }));

      // Revoke object URL
      if (removed?.url) {
        URL.revokeObjectURL(removed.url);
      }

      return {
        assets: remainingAssets,
        clips: remainingClips,
        tracks: updatedTracks,
      };
    });
  }, [updateProject]);

  // ============================================
  // TRACKS
  // ============================================

  const addTrack = useCallback((type: TrackType, name?: string): string => {
    const id = crypto.randomUUID();
    const defaultNames = {
      visual: 'Video',
      audio: 'Audio',
      text: 'Text',
    };

    const track: TimelineTrack = {
      id,
      type,
      name: name || defaultNames[type],
      muted: false,
      locked: false,
      visible: true,
      volume: type === 'audio' ? 100 : undefined,
      clips: [],
    };

    updateProject(prev => ({
      tracks: [...prev.tracks, track],
    }));

    return id;
  }, [updateProject]);

  const removeTrack = useCallback((id: string) => {
    pushUndo();
    updateProject(prev => {
      // Remove clips from this track
      const clipIds = prev.tracks.find(t => t.id === id)?.clips || [];
      const remainingClips = { ...prev.clips };
      clipIds.forEach(clipId => delete remainingClips[clipId]);

      return {
        tracks: prev.tracks.filter(t => t.id !== id),
        clips: remainingClips,
        selectedTrackId: prev.selectedTrackId === id ? null : prev.selectedTrackId,
      };
    });
  }, [updateProject]);

  const updateTrack = useCallback((id: string, updates: Partial<TimelineTrack>) => {
    updateProject(prev => ({
      tracks: prev.tracks.map(t => t.id === id ? { ...t, ...updates } : t),
    }));
  }, [updateProject]);

  const reorderTracks = useCallback((fromIndex: number, toIndex: number) => {
    updateProject(prev => {
      const tracks = [...prev.tracks];
      const [removed] = tracks.splice(fromIndex, 1);
      tracks.splice(toIndex, 0, removed);
      return { tracks };
    });
  }, [updateProject]);

  const toggleTrackMute = useCallback((id: string) => {
    updateProject(prev => ({
      tracks: prev.tracks.map(t => t.id === id ? { ...t, muted: !t.muted } : t),
    }));
  }, [updateProject]);

  const toggleTrackLock = useCallback((id: string) => {
    updateProject(prev => ({
      tracks: prev.tracks.map(t => t.id === id ? { ...t, locked: !t.locked } : t),
    }));
  }, [updateProject]);

  const toggleTrackVisibility = useCallback((id: string) => {
    updateProject(prev => ({
      tracks: prev.tracks.map(t => t.id === id ? { ...t, visible: !t.visible } : t),
    }));
  }, [updateProject]);

  // ============================================
  // CLIPS
  // ============================================

  const addClip = useCallback((
    assetId: string,
    trackId: string,
    startFrame: number,
    durationFrames?: number
  ): string => {
    const id = crypto.randomUUID();
    pushUndo();

    setProject(prev => {
      const asset = prev.assets[assetId];
      const duration = durationFrames || asset?.duration || 90; // Default 3 seconds

      const clip: TimelineClip = {
        id,
        assetId,
        trackId,
        startFrame: Math.max(0, startFrame),
        durationFrames: duration,
        effects: [],
        kenBurns: asset?.type === 'image' ? { direction: 'zoom-in', intensity: 0.1 } : undefined,
        volume: asset?.type === 'audio' ? 100 : undefined,
      };

      // Add clip to track
      const updatedTracks = prev.tracks.map(track => {
        if (track.id === trackId) {
          return { ...track, clips: [...track.clips, id] };
        }
        return track;
      });

      // Auto-extend duration if needed
      const clipEnd = clip.startFrame + clip.durationFrames;
      const newDuration = Math.max(prev.totalDurationFrames, clipEnd + 30);

      return {
        ...prev,
        clips: { ...prev.clips, [id]: clip },
        tracks: updatedTracks,
        totalDurationFrames: newDuration,
        updatedAt: new Date(),
      };
    });

    return id;
  }, []);

  const addTextClip = useCallback((
    trackId: string,
    startFrame: number,
    content: TextClipContent
  ): string => {
    const id = crypto.randomUUID();
    pushUndo();

    setProject(prev => {
      const clip: TimelineClip = {
        id,
        assetId: '', // No asset for text
        trackId,
        startFrame: Math.max(0, startFrame),
        durationFrames: 90, // Default 3 seconds
        effects: [],
        textContent: content,
      };

      const updatedTracks = prev.tracks.map(track => {
        if (track.id === trackId) {
          return { ...track, clips: [...track.clips, id] };
        }
        return track;
      });

      const clipEnd = clip.startFrame + clip.durationFrames;
      const newDuration = Math.max(prev.totalDurationFrames, clipEnd + 30);

      return {
        ...prev,
        clips: { ...prev.clips, [id]: clip },
        tracks: updatedTracks,
        totalDurationFrames: newDuration,
        updatedAt: new Date(),
      };
    });

    return id;
  }, []);

  const removeClip = useCallback((id: string) => {
    pushUndo();
    updateProject(prev => {
      const { [id]: removed, ...remainingClips } = prev.clips;

      // Remove from track
      const updatedTracks = prev.tracks.map(track => ({
        ...track,
        clips: track.clips.filter(clipId => clipId !== id),
      }));

      // Remove transitions involving this clip
      const remainingTransitions = { ...prev.transitions };
      Object.entries(prev.transitions).forEach(([transId, trans]) => {
        if (trans.fromClipId === id || trans.toClipId === id) {
          delete remainingTransitions[transId];
        }
      });

      return {
        clips: remainingClips,
        tracks: updatedTracks,
        transitions: remainingTransitions,
        selectedClipId: prev.selectedClipId === id ? null : prev.selectedClipId,
      };
    });
  }, [updateProject]);

  const updateClip = useCallback((id: string, updates: Partial<TimelineClip>) => {
    updateProject(prev => ({
      clips: {
        ...prev.clips,
        [id]: { ...prev.clips[id], ...updates },
      },
    }));
  }, [updateProject]);

  const moveClip = useCallback((id: string, newTrackId: string, newStartFrame: number) => {
    pushUndo();
    updateProject(prev => {
      const clip = prev.clips[id];
      if (!clip) return prev;

      const oldTrackId = clip.trackId;

      // Update clip
      const updatedClips = {
        ...prev.clips,
        [id]: { ...clip, trackId: newTrackId, startFrame: Math.max(0, newStartFrame) },
      };

      // Update tracks
      const updatedTracks = prev.tracks.map(track => {
        if (track.id === oldTrackId) {
          return { ...track, clips: track.clips.filter(cid => cid !== id) };
        }
        if (track.id === newTrackId) {
          return { ...track, clips: [...track.clips, id] };
        }
        return track;
      });

      return { clips: updatedClips, tracks: updatedTracks };
    });
  }, [updateProject]);

  const resizeClip = useCallback((id: string, newDuration: number, fromStart?: boolean) => {
    updateProject(prev => {
      const clip = prev.clips[id];
      if (!clip) return prev;

      let updatedClip = { ...clip, durationFrames: Math.max(1, newDuration) };

      if (fromStart) {
        const diff = clip.durationFrames - newDuration;
        updatedClip.startFrame = Math.max(0, clip.startFrame + diff);
      }

      return {
        clips: { ...prev.clips, [id]: updatedClip },
      };
    });
  }, [updateProject]);

  const splitClip = useCallback((id: string, atFrame: number) => {
    pushUndo();
    updateProject(prev => {
      const clip = prev.clips[id];
      if (!clip) return prev;

      const relativeFrame = atFrame - clip.startFrame;
      if (relativeFrame <= 0 || relativeFrame >= clip.durationFrames) return prev;

      // Create second clip
      const newClipId = crypto.randomUUID();
      const firstDuration = relativeFrame;
      const secondDuration = clip.durationFrames - relativeFrame;

      const firstClip: TimelineClip = {
        ...clip,
        durationFrames: firstDuration,
      };

      const secondClip: TimelineClip = {
        ...clip,
        id: newClipId,
        startFrame: atFrame,
        durationFrames: secondDuration,
        effects: clip.effects.map(e => ({ ...e, id: crypto.randomUUID() })),
      };

      // Add new clip to track after original
      const updatedTracks = prev.tracks.map(track => {
        if (track.id === clip.trackId) {
          const index = track.clips.indexOf(id);
          const newClips = [...track.clips];
          newClips.splice(index + 1, 0, newClipId);
          return { ...track, clips: newClips };
        }
        return track;
      });

      return {
        clips: {
          ...prev.clips,
          [id]: firstClip,
          [newClipId]: secondClip,
        },
        tracks: updatedTracks,
      };
    });
  }, [updateProject]);

  const duplicateClip = useCallback((id: string): string => {
    const newId = crypto.randomUUID();
    pushUndo();

    setProject(prev => {
      const clip = prev.clips[id];
      if (!clip) return prev;

      const newClip: TimelineClip = {
        ...clip,
        id: newId,
        startFrame: clip.startFrame + clip.durationFrames + 15, // Place after with gap
        effects: clip.effects.map(e => ({ ...e, id: crypto.randomUUID() })),
      };

      const updatedTracks = prev.tracks.map(track => {
        if (track.id === clip.trackId) {
          return { ...track, clips: [...track.clips, newId] };
        }
        return track;
      });

      return {
        ...prev,
        clips: { ...prev.clips, [newId]: newClip },
        tracks: updatedTracks,
        updatedAt: new Date(),
      };
    });

    return newId;
  }, []);

  // ============================================
  // TRANSITIONS
  // ============================================

  const addTransition = useCallback((
    fromClipId: string,
    toClipId: string,
    type: TransitionType,
    durationFrames: number = 15
  ): string => {
    const id = crypto.randomUUID();

    const transition: ClipTransition = {
      id,
      type,
      fromClipId,
      toClipId,
      durationFrames,
    };

    updateProject(prev => ({
      transitions: { ...prev.transitions, [id]: transition },
    }));

    return id;
  }, [updateProject]);

  const removeTransition = useCallback((id: string) => {
    updateProject(prev => {
      const { [id]: removed, ...remaining } = prev.transitions;
      return { transitions: remaining };
    });
  }, [updateProject]);

  const updateTransition = useCallback((id: string, updates: Partial<ClipTransition>) => {
    updateProject(prev => ({
      transitions: {
        ...prev.transitions,
        [id]: { ...prev.transitions[id], ...updates },
      },
    }));
  }, [updateProject]);

  // ============================================
  // EFFECTS
  // ============================================

  const addEffect = useCallback((clipId: string, type: EffectType, intensity: number = 50): string => {
    const effectId = crypto.randomUUID();

    const effect: ClipEffect = {
      id: effectId,
      type,
      intensity,
    };

    updateProject(prev => ({
      clips: {
        ...prev.clips,
        [clipId]: {
          ...prev.clips[clipId],
          effects: [...prev.clips[clipId].effects, effect],
        },
      },
    }));

    return effectId;
  }, [updateProject]);

  const removeEffect = useCallback((clipId: string, effectId: string) => {
    updateProject(prev => ({
      clips: {
        ...prev.clips,
        [clipId]: {
          ...prev.clips[clipId],
          effects: prev.clips[clipId].effects.filter(e => e.id !== effectId),
        },
      },
    }));
  }, [updateProject]);

  const updateEffect = useCallback((clipId: string, effectId: string, updates: Partial<ClipEffect>) => {
    updateProject(prev => ({
      clips: {
        ...prev.clips,
        [clipId]: {
          ...prev.clips[clipId],
          effects: prev.clips[clipId].effects.map(e =>
            e.id === effectId ? { ...e, ...updates } : e
          ),
        },
      },
    }));
  }, [updateProject]);

  // ============================================
  // KEN BURNS
  // ============================================

  const setKenBurns = useCallback((clipId: string, direction: KenBurnsDirection, intensity: number = 0.1) => {
    updateProject(prev => ({
      clips: {
        ...prev.clips,
        [clipId]: {
          ...prev.clips[clipId],
          kenBurns: { direction, intensity },
        },
      },
    }));
  }, [updateProject]);

  const removeKenBurns = useCallback((clipId: string) => {
    updateProject(prev => ({
      clips: {
        ...prev.clips,
        [clipId]: {
          ...prev.clips[clipId],
          kenBurns: undefined,
        },
      },
    }));
  }, [updateProject]);

  // ============================================
  // PLAYBACK
  // ============================================

  const play = useCallback(() => {
    updateProject({ isPlaying: true });
  }, [updateProject]);

  const pause = useCallback(() => {
    updateProject({ isPlaying: false });
  }, [updateProject]);

  const togglePlayPause = useCallback(() => {
    updateProject(prev => ({ isPlaying: !prev.isPlaying }));
  }, [updateProject]);

  const seekTo = useCallback((frame: number) => {
    updateProject(prev => ({
      currentFrame: Math.max(0, Math.min(frame, prev.totalDurationFrames)),
    }));
  }, [updateProject]);

  const seekToStart = useCallback(() => {
    updateProject({ currentFrame: 0 });
  }, [updateProject]);

  const seekToEnd = useCallback(() => {
    updateProject(prev => ({ currentFrame: prev.totalDurationFrames }));
  }, [updateProject]);

  const stepForward = useCallback((frames: number = 1) => {
    updateProject(prev => ({
      currentFrame: Math.min(prev.currentFrame + frames, prev.totalDurationFrames),
    }));
  }, [updateProject]);

  const stepBackward = useCallback((frames: number = 1) => {
    updateProject(prev => ({
      currentFrame: Math.max(prev.currentFrame - frames, 0),
    }));
  }, [updateProject]);

  // ============================================
  // UI / ZOOM
  // ============================================

  const setZoom = useCallback((zoom: number) => {
    updateProject({ zoom: Math.max(0.5, Math.min(zoom, 10)) });
  }, [updateProject]);

  const zoomIn = useCallback(() => {
    updateProject(prev => ({ zoom: Math.min(prev.zoom * 1.25, 10) }));
  }, [updateProject]);

  const zoomOut = useCallback(() => {
    updateProject(prev => ({ zoom: Math.max(prev.zoom / 1.25, 0.5) }));
  }, [updateProject]);

  const fitToView = useCallback(() => {
    // This would need container width - for now set a reasonable default
    updateProject({ zoom: 2 });
  }, [updateProject]);

  // ============================================
  // SELECTION
  // ============================================

  const selectClip = useCallback((id: string | null) => {
    updateProject({ selectedClipId: id });
  }, [updateProject]);

  const selectTrack = useCallback((id: string | null) => {
    updateProject({ selectedTrackId: id });
  }, [updateProject]);

  // ============================================
  // COMPUTED HELPERS
  // ============================================

  const getClipAtFrame = useCallback((trackId: string, frame: number): TimelineClip | null => {
    const track = project.tracks.find(t => t.id === trackId);
    if (!track) return null;

    for (const clipId of track.clips) {
      const clip = project.clips[clipId];
      if (clip && frame >= clip.startFrame && frame < clip.startFrame + clip.durationFrames) {
        return clip;
      }
    }
    return null;
  }, [project]);

  const getTrackDuration = useCallback((trackId: string): number => {
    const track = project.tracks.find(t => t.id === trackId);
    if (!track) return 0;

    let maxEnd = 0;
    for (const clipId of track.clips) {
      const clip = project.clips[clipId];
      if (clip) {
        maxEnd = Math.max(maxEnd, clip.startFrame + clip.durationFrames);
      }
    }
    return maxEnd;
  }, [project]);

  const recalculateDuration = useCallback(() => {
    let maxEnd = 0;
    for (const clip of Object.values(project.clips)) {
      maxEnd = Math.max(maxEnd, clip.startFrame + clip.durationFrames);
    }
    updateProject({ totalDurationFrames: Math.max(maxEnd + 30, 900) }); // Minimum 30 seconds
  }, [project.clips, updateProject]);

  // ============================================
  // COMPUTED VALUES
  // ============================================

  const currentTime = useMemo(() => project.currentFrame / project.fps, [project.currentFrame, project.fps]);
  const totalDuration = useMemo(() => project.totalDurationFrames / project.fps, [project.totalDurationFrames, project.fps]);

  // ============================================
  // CONTEXT VALUE
  // ============================================

  const value: VideoEditorContextType = useMemo(() => ({
    project,
    loading,
    error,

    // Computed
    currentTime,
    totalDuration,
    canUndo: undoRedo.canUndo(),
    canRedo: undoRedo.canRedo(),

    // Project
    createProject: createNewProject,
    loadProject,
    saveProject,
    clearProject,
    setProjectName,

    // Format
    setFormat,
    setDuration,

    // Assets
    addAsset,
    addAssets,
    removeAsset,

    // Tracks
    addTrack,
    removeTrack,
    updateTrack,
    reorderTracks,
    toggleTrackMute,
    toggleTrackLock,
    toggleTrackVisibility,

    // Clips
    addClip,
    addTextClip,
    removeClip,
    updateClip,
    moveClip,
    resizeClip,
    splitClip,
    duplicateClip,

    // Transitions
    addTransition,
    removeTransition,
    updateTransition,

    // Effects
    addEffect,
    removeEffect,
    updateEffect,

    // Ken Burns
    setKenBurns,
    removeKenBurns,

    // Undo/Redo
    undo,
    redo,

    // Playback
    play,
    pause,
    togglePlayPause,
    seekTo,
    seekToStart,
    seekToEnd,
    stepForward,
    stepBackward,

    // UI
    setZoom,
    zoomIn,
    zoomOut,
    fitToView,

    // Selection
    selectClip,
    selectTrack,

    // Helpers
    getClipAtFrame,
    getTrackDuration,
    recalculateDuration,
  }), [
    project, loading, error, currentTime, totalDuration, undoRedoVersion,
    createNewProject, loadProject, saveProject, clearProject, setProjectName,
    setFormat, setDuration,
    addAsset, addAssets, removeAsset,
    addTrack, removeTrack, updateTrack, reorderTracks, toggleTrackMute, toggleTrackLock, toggleTrackVisibility,
    addClip, addTextClip, removeClip, updateClip, moveClip, resizeClip, splitClip, duplicateClip,
    addTransition, removeTransition, updateTransition,
    addEffect, removeEffect, updateEffect,
    setKenBurns, removeKenBurns,
    undo, redo,
    play, pause, togglePlayPause, seekTo, seekToStart, seekToEnd, stepForward, stepBackward,
    setZoom, zoomIn, zoomOut, fitToView,
    selectClip, selectTrack,
    getClipAtFrame, getTrackDuration, recalculateDuration,
  ]);

  return (
    <VideoEditorContext.Provider value={value}>
      {children}
    </VideoEditorContext.Provider>
  );
}

// Custom hook to use the context
export function useVideoEditor(): VideoEditorContextType {
  const context = useContext(VideoEditorContext);
  if (context === undefined) {
    throw new Error('useVideoEditor must be used within a VideoEditorProvider');
  }
  return context;
}
