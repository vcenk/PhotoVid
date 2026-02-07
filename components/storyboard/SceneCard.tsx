import React, { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  UploadCloud,
  Play,
  Trash2,
  Copy,
  MoreVertical,
  Video,
  Clock,
  Move,
  Loader2,
  Check,
  AlertCircle,
  Image as ImageIcon,
  RefreshCw,
} from 'lucide-react';
import { Scene, MOTION_STYLES, DURATION_OPTIONS, ROOM_TYPES } from '@/lib/types/storyboard';
import { useStoryboard } from '@/lib/store/contexts/StoryboardContext';

interface SceneCardProps {
  scene: Scene;
  index: number;
}

export const SceneCard: React.FC<SceneCardProps> = ({ scene, index }) => {
  const {
    updateScene,
    deleteScene,
    duplicateScene,
    generateSceneVideo,
    generatingSceneId,
  } = useStoryboard();

  const [showMenu, setShowMenu] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const isGenerating = generatingSceneId === scene.id;

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setIsDragging(true);
    } else if (e.type === 'dragleave') {
      setIsDragging(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files?.[0]?.type.startsWith('image/')) {
      const file = e.dataTransfer.files[0];
      const imageUrl = URL.createObjectURL(file);
      updateScene(scene.id, {
        imageUrl,
        thumbnailUrl: imageUrl,
        status: 'pending',
        videoUrl: null,
      });
    }
  }, [scene.id, updateScene]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      const file = e.target.files[0];
      const imageUrl = URL.createObjectURL(file);
      updateScene(scene.id, {
        imageUrl,
        thumbnailUrl: imageUrl,
        status: 'pending',
        videoUrl: null,
      });
    }
  };

  const statusColors = {
    pending: 'border-white/10',
    uploading: 'border-blue-500/50',
    generating: 'border-emerald-500/50',
    completed: 'border-green-500/50',
    failed: 'border-red-500/50',
  };

  const statusBadge = {
    pending: null,
    uploading: (
      <div className="absolute top-2 right-2 px-2 py-1 bg-blue-500/80 rounded-lg text-[10px] text-white flex items-center gap-1">
        <Loader2 size={10} className="animate-spin" />
        Uploading
      </div>
    ),
    generating: (
      <div className="absolute top-2 right-2 px-2 py-1 bg-emerald-500/80 rounded-lg text-[10px] text-white flex items-center gap-1">
        <Loader2 size={10} className="animate-spin" />
        Generating
      </div>
    ),
    completed: (
      <div className="absolute top-2 right-2 px-2 py-1 bg-green-500/80 rounded-lg text-[10px] text-white flex items-center gap-1">
        <Check size={10} />
        Ready
      </div>
    ),
    failed: (
      <div className="absolute top-2 right-2 px-2 py-1 bg-red-500/80 rounded-lg text-[10px] text-white flex items-center gap-1">
        <AlertCircle size={10} />
        Failed
      </div>
    ),
  };

  return (
    <motion.div
      layout
      className={`w-64 flex-shrink-0 rounded-2xl border ${statusColors[scene.status]} bg-zinc-900/50 overflow-hidden flex flex-col`}
    >
      {/* Image/Video Preview */}
      <div className="relative aspect-video bg-zinc-950">
        {scene.videoUrl && scene.status === 'completed' ? (
          <video
            src={scene.videoUrl}
            className="w-full h-full object-cover"
            muted
            loop
            onMouseEnter={(e) => e.currentTarget.play()}
            onMouseLeave={(e) => {
              e.currentTarget.pause();
              e.currentTarget.currentTime = 0;
            }}
          />
        ) : scene.imageUrl ? (
          <img
            src={scene.imageUrl}
            alt={`Scene ${index + 1}`}
            className="w-full h-full object-cover"
          />
        ) : (
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            className={`w-full h-full flex flex-col items-center justify-center cursor-pointer transition-colors ${
              isDragging ? 'bg-emerald-500/10' : 'bg-zinc-900'
            }`}
          >
            <input
              type="file"
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              onChange={handleFileChange}
              accept="image/*"
            />
            <UploadCloud size={24} className={isDragging ? 'text-emerald-400' : 'text-zinc-600'} />
            <span className="text-xs text-zinc-500 mt-2">Drop image</span>
          </div>
        )}

        {/* Status Badge */}
        {statusBadge[scene.status]}

        {/* Play overlay for videos */}
        {scene.videoUrl && scene.status === 'completed' && (
          <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity bg-black/30">
            <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur flex items-center justify-center">
              <Play size={20} className="text-white ml-0.5" />
            </div>
          </div>
        )}

        {/* Scene Number */}
        <div className="absolute bottom-2 left-2 w-6 h-6 rounded-full bg-black/60 flex items-center justify-center">
          <span className="text-[10px] text-white font-semibold">{index + 1}</span>
        </div>
      </div>

      {/* Controls */}
      <div className="p-3 flex-1 flex flex-col gap-3">
        {/* Room Type */}
        <select
          value={scene.room || ''}
          onChange={(e) => updateScene(scene.id, { room: e.target.value })}
          className="w-full px-2 py-1.5 text-xs bg-white/5 border border-white/10 rounded-lg text-zinc-300 focus:outline-none focus:ring-1 focus:ring-emerald-500"
        >
          <option value="">Select room...</option>
          {ROOM_TYPES.map((room) => (
            <option key={room.id} value={room.id}>
              {room.label}
            </option>
          ))}
        </select>

        {/* Motion Style */}
        <div className="flex items-center gap-2">
          <Move size={12} className="text-zinc-500" />
          <select
            value={scene.motionStyle}
            onChange={(e) => updateScene(scene.id, { motionStyle: e.target.value as Scene['motionStyle'] })}
            className="flex-1 px-2 py-1 text-[10px] bg-white/5 border border-white/10 rounded-lg text-zinc-400 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          >
            {MOTION_STYLES.map((style) => (
              <option key={style.id} value={style.id}>
                {style.label}
              </option>
            ))}
          </select>
        </div>

        {/* Duration */}
        <div className="flex items-center gap-2">
          <Clock size={12} className="text-zinc-500" />
          <div className="flex gap-1">
            {DURATION_OPTIONS.map((duration) => (
              <button
                key={duration}
                onClick={() => updateScene(scene.id, { duration })}
                className={`px-2 py-1 text-[10px] rounded transition-colors ${
                  scene.duration === duration
                    ? 'bg-emerald-600 text-white'
                    : 'bg-white/5 text-zinc-400 hover:bg-white/10'
                }`}
              >
                {duration}s
              </button>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between mt-auto pt-2 border-t border-white/5">
          {/* Generate Button */}
          <button
            onClick={() => generateSceneVideo(scene.id)}
            disabled={!scene.imageUrl || isGenerating || scene.status === 'completed'}
            className={`flex-1 py-1.5 text-[10px] font-medium rounded-lg transition-colors flex items-center justify-center gap-1 ${
              !scene.imageUrl || isGenerating
                ? 'bg-white/5 text-zinc-600 cursor-not-allowed'
                : scene.status === 'completed'
                ? 'bg-green-600/20 text-green-400 cursor-default'
                : 'bg-emerald-600 hover:bg-emerald-500 text-white'
            }`}
          >
            {isGenerating ? (
              <>
                <Loader2 size={10} className="animate-spin" />
                Generating...
              </>
            ) : scene.status === 'completed' ? (
              <>
                <Check size={10} />
                Done
              </>
            ) : (
              <>
                <Video size={10} />
                Generate
              </>
            )}
          </button>

          {/* Menu */}
          <div className="relative ml-2">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-1.5 hover:bg-white/5 rounded-lg transition-colors"
            >
              <MoreVertical size={14} className="text-zinc-400" />
            </button>

            {showMenu && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setShowMenu(false)}
                />
                <div className="absolute right-0 bottom-full mb-1 w-32 bg-zinc-800 border border-white/10 rounded-lg shadow-xl z-20 py-1">
                  <button
                    onClick={() => {
                      duplicateScene(scene.id);
                      setShowMenu(false);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-zinc-300 hover:bg-white/5"
                  >
                    <Copy size={12} />
                    Duplicate
                  </button>
                  {scene.status === 'completed' && (
                    <button
                      onClick={() => {
                        updateScene(scene.id, { videoUrl: null, status: 'pending' });
                        setShowMenu(false);
                      }}
                      className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-zinc-300 hover:bg-white/5"
                    >
                      <RefreshCw size={12} />
                      Regenerate
                    </button>
                  )}
                  <button
                    onClick={() => {
                      deleteScene(scene.id);
                      setShowMenu(false);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-red-400 hover:bg-red-500/10"
                  >
                    <Trash2 size={12} />
                    Delete
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};
