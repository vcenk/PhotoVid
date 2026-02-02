import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Save,
  Download,
  Play,
  Plus,
  Settings,
  Music,
  Video,
  ChevronDown,
  Loader2,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useStoryboard } from '@/lib/store/contexts/StoryboardContext';
import { formatDuration } from '@/lib/types/storyboard';
import { SceneCard } from './SceneCard';
import { Timeline } from './Timeline';
import { StoryboardPreview } from './StoryboardPreview';

export const StoryboardEditor: React.FC = () => {
  const navigate = useNavigate();
  const {
    storyboard,
    saving,
    saveStoryboard,
    addScene,
    isGenerating,
    generateAllVideos,
  } = useStoryboard();

  const [showSettings, setShowSettings] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  if (!storyboard) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <Video size={48} className="text-zinc-600 mx-auto mb-4" />
          <p className="text-zinc-400">No storyboard loaded</p>
        </div>
      </div>
    );
  }

  const completedScenes = storyboard.scenes.filter(s => s.status === 'completed').length;
  const totalScenes = storyboard.scenes.length;
  const hasAllVideos = completedScenes === totalScenes && totalScenes > 0;

  return (
    <div className="h-full flex flex-col bg-[#0a0a0b]">
      {/* Header */}
      <div className="h-14 flex items-center justify-between px-6 border-b border-white/5 flex-shrink-0">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/studio/real-estate')}
            className="p-2 hover:bg-white/5 rounded-lg transition-colors"
          >
            <ArrowLeft size={18} className="text-zinc-400" />
          </button>
          <div>
            <h1 className="text-sm font-semibold text-white">{storyboard.name}</h1>
            <p className="text-xs text-zinc-500">
              {totalScenes} scenes · {formatDuration(storyboard.totalDuration)}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Save Button */}
          <button
            onClick={saveStoryboard}
            disabled={saving}
            className="px-3 py-1.5 text-xs font-medium text-zinc-300 bg-white/5 hover:bg-white/10 rounded-lg transition-colors flex items-center gap-1.5"
          >
            {saving ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <Save size={14} />
            )}
            Save
          </button>

          {/* Generate All Button */}
          <button
            onClick={generateAllVideos}
            disabled={isGenerating || storyboard.scenes.every(s => !s.imageUrl)}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5 ${
              isGenerating || storyboard.scenes.every(s => !s.imageUrl)
                ? 'bg-white/5 text-zinc-600 cursor-not-allowed'
                : 'bg-violet-600 hover:bg-violet-500 text-white'
            }`}
          >
            {isGenerating ? (
              <>
                <Loader2 size={14} className="animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Video size={14} />
                Generate All
              </>
            )}
          </button>

          {/* Preview Button */}
          <button
            onClick={() => setShowPreview(true)}
            disabled={!hasAllVideos}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5 ${
              hasAllVideos
                ? 'bg-green-600 hover:bg-green-500 text-white'
                : 'bg-white/5 text-zinc-600 cursor-not-allowed'
            }`}
          >
            <Play size={14} />
            Preview
          </button>

          {/* Export Button */}
          <button
            disabled={!hasAllVideos}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5 ${
              hasAllVideos
                ? 'bg-indigo-600 hover:bg-indigo-500 text-white'
                : 'bg-white/5 text-zinc-600 cursor-not-allowed'
            }`}
          >
            <Download size={14} />
            Export
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Scene Cards */}
        <div className="flex-1 overflow-x-auto overflow-y-hidden p-6">
          <div className="flex gap-4 h-full min-w-max">
            {storyboard.scenes.map((scene, index) => (
              <SceneCard key={scene.id} scene={scene} index={index} />
            ))}

            {/* Add Scene Button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => addScene()}
              className="w-64 h-full min-h-[360px] flex-shrink-0 rounded-2xl border-2 border-dashed border-white/10 hover:border-violet-500/50 hover:bg-violet-500/5 transition-all flex flex-col items-center justify-center gap-3 group"
            >
              <div className="w-12 h-12 rounded-xl bg-white/5 group-hover:bg-violet-500/20 flex items-center justify-center transition-colors">
                <Plus size={24} className="text-zinc-500 group-hover:text-violet-400" />
              </div>
              <span className="text-sm text-zinc-500 group-hover:text-violet-400">Add Scene</span>
            </motion.button>
          </div>
        </div>

        {/* Timeline */}
        <div className="flex-shrink-0 border-t border-white/5">
          <Timeline />
        </div>

        {/* Settings Bar */}
        <div className="flex-shrink-0 h-12 flex items-center justify-between px-6 border-t border-white/5 bg-zinc-900/50">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="flex items-center gap-2 text-xs text-zinc-400 hover:text-white transition-colors"
            >
              <Settings size={14} />
              Settings
              <ChevronDown size={12} className={showSettings ? 'rotate-180' : ''} />
            </button>

            <div className="h-4 w-px bg-white/10" />

            <div className="flex items-center gap-2 text-xs text-zinc-400">
              <Music size={14} />
              <span>{storyboard.settings.musicTrack || 'No music'}</span>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs text-zinc-500">
            <span>{storyboard.settings.aspectRatio}</span>
            <span>{storyboard.settings.outputQuality}</span>
            <span>{completedScenes}/{totalScenes} videos ready</span>
          </div>
        </div>
      </div>

      {/* Preview Modal */}
      {showPreview && (
        <StoryboardPreview onClose={() => setShowPreview(false)} />
      )}
    </div>
  );
};
