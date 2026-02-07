import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, Maximize } from 'lucide-react';
import { useStoryboard } from '@/lib/store/contexts/StoryboardContext';
import { formatDuration } from '@/lib/types/storyboard';

interface StoryboardPreviewProps {
  onClose: () => void;
}

export const StoryboardPreview: React.FC<StoryboardPreviewProps> = ({ onClose }) => {
  const { storyboard } = useStoryboard();
  const [currentSceneIndex, setCurrentSceneIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);

  const completedScenes = storyboard?.scenes.filter(s => s.status === 'completed') || [];
  const currentScene = completedScenes[currentSceneIndex];

  // Handle video end - advance to next scene
  const handleVideoEnd = () => {
    if (currentSceneIndex < completedScenes.length - 1) {
      setCurrentSceneIndex(prev => prev + 1);
    } else {
      setIsPlaying(false);
      setCurrentSceneIndex(0);
    }
  };

  // Play/pause control
  useEffect(() => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.play();
      } else {
        videoRef.current.pause();
      }
    }
  }, [isPlaying, currentSceneIndex]);

  // Mute control
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.muted = isMuted;
    }
  }, [isMuted]);

  // Update current time
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => {
      setCurrentTime(video.currentTime);
    };

    video.addEventListener('timeupdate', handleTimeUpdate);
    return () => video.removeEventListener('timeupdate', handleTimeUpdate);
  }, [currentSceneIndex]);

  if (!storyboard || completedScenes.length === 0) {
    return null;
  }

  const totalDuration = completedScenes.reduce((sum, s) => sum + s.duration, 0);
  const elapsedDuration = completedScenes
    .slice(0, currentSceneIndex)
    .reduce((sum, s) => sum + s.duration, 0) + currentTime;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black z-50 flex flex-col"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4">
        <div>
          <h2 className="text-sm font-semibold text-white">{storyboard.name}</h2>
          <p className="text-xs text-zinc-400">
            Scene {currentSceneIndex + 1} of {completedScenes.length}
          </p>
        </div>
        <button
          onClick={onClose}
          className="p-2 hover:bg-white/10 rounded-lg transition-colors"
        >
          <X size={20} className="text-white" />
        </button>
      </div>

      {/* Video Area */}
      <div className="flex-1 flex items-center justify-center px-8">
        <div className="relative w-full max-w-5xl aspect-video bg-zinc-950 rounded-2xl overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.video
              key={currentScene?.id}
              ref={videoRef}
              src={currentScene?.videoUrl || ''}
              className="w-full h-full object-contain"
              onEnded={handleVideoEnd}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            />
          </AnimatePresence>

          {/* Scene info overlay */}
          <div className="absolute bottom-4 left-4 px-3 py-1.5 bg-black/60 backdrop-blur rounded-lg">
            <span className="text-xs text-white">
              {currentScene?.room || `Scene ${currentSceneIndex + 1}`}
            </span>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="px-8 py-6">
        {/* Progress bar */}
        <div className="flex items-center gap-4 mb-4">
          <span className="text-xs text-zinc-400 font-mono w-12">
            {formatDuration(Math.floor(elapsedDuration))}
          </span>
          <div className="flex-1 h-1 bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-500 transition-all"
              style={{ width: `${(elapsedDuration / totalDuration) * 100}%` }}
            />
          </div>
          <span className="text-xs text-zinc-400 font-mono w-12 text-right">
            {formatDuration(totalDuration)}
          </span>
        </div>

        {/* Control buttons */}
        <div className="flex items-center justify-center gap-4">
          <button
            onClick={() => setCurrentSceneIndex(Math.max(0, currentSceneIndex - 1))}
            disabled={currentSceneIndex === 0}
            className="p-3 hover:bg-white/10 rounded-xl transition-colors disabled:opacity-30"
          >
            <SkipBack size={20} className="text-white" />
          </button>

          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="w-14 h-14 bg-white rounded-full flex items-center justify-center hover:scale-105 transition-transform"
          >
            {isPlaying ? (
              <Pause size={24} className="text-black" />
            ) : (
              <Play size={24} className="text-black ml-1" />
            )}
          </button>

          <button
            onClick={() =>
              setCurrentSceneIndex(Math.min(completedScenes.length - 1, currentSceneIndex + 1))
            }
            disabled={currentSceneIndex === completedScenes.length - 1}
            className="p-3 hover:bg-white/10 rounded-xl transition-colors disabled:opacity-30"
          >
            <SkipForward size={20} className="text-white" />
          </button>

          <div className="w-px h-8 bg-white/10 mx-4" />

          <button
            onClick={() => setIsMuted(!isMuted)}
            className="p-3 hover:bg-white/10 rounded-xl transition-colors"
          >
            {isMuted ? (
              <VolumeX size={20} className="text-white" />
            ) : (
              <Volume2 size={20} className="text-white" />
            )}
          </button>
        </div>

        {/* Scene thumbnails */}
        <div className="flex items-center justify-center gap-2 mt-6 overflow-x-auto pb-2">
          {completedScenes.map((scene, index) => (
            <button
              key={scene.id}
              onClick={() => setCurrentSceneIndex(index)}
              className={`relative w-20 h-12 rounded-lg overflow-hidden flex-shrink-0 transition-all ${
                index === currentSceneIndex
                  ? 'ring-2 ring-emerald-500 ring-offset-2 ring-offset-black'
                  : 'opacity-60 hover:opacity-100'
              }`}
            >
              {scene.thumbnailUrl || scene.imageUrl ? (
                <img
                  src={scene.thumbnailUrl || scene.imageUrl || ''}
                  alt={`Scene ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-zinc-800" />
              )}
              <div className="absolute bottom-0.5 right-0.5 px-1 py-0.5 bg-black/60 rounded text-[8px] text-white">
                {scene.duration}s
              </div>
            </button>
          ))}
        </div>
      </div>
    </motion.div>
  );
};
