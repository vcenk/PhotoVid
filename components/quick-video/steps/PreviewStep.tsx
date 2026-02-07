/**
 * PreviewStep - Step 5: Live preview and export options
 */

import React, { useState, useMemo, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Player, PlayerRef } from '@remotion/player';
import {
  Play,
  Pause,
  Download,
  Check,
  Zap,
  Monitor,
  Square,
  Smartphone,
  RefreshCw,
  RotateCcw,
  Info,
} from 'lucide-react';
import { useQuickVideo } from '../QuickVideoContext';
import { PropertyVideo } from '@/remotion/compositions/PropertyVideo';
import { VIDEO_CONFIG, FORMAT_DIMENSIONS, VIDEO_EXPORT_CREDITS } from '@/lib/types/video-project';
import type { ExportFormat } from '@/lib/types/video-project';

// Format icons
const FORMAT_ICONS: Record<ExportFormat, React.ReactNode> = {
  landscape: <Monitor size={18} />,
  square: <Square size={18} />,
  vertical: <Smartphone size={18} />,
};

// Format labels
const FORMAT_LABELS: Record<ExportFormat, { name: string; ratio: string; use: string }> = {
  landscape: { name: 'Landscape', ratio: '16:9', use: 'YouTube, Website' },
  square: { name: 'Square', ratio: '1:1', use: 'Instagram Feed' },
  vertical: { name: 'Vertical', ratio: '9:16', use: 'TikTok, Reels' },
};

export function PreviewStep() {
  const {
    getVideoProps,
    format,
    setFormat,
    isLoading,
    setLoading,
    setError,
  } = useQuickVideo();

  const playerRef = useRef<PlayerRef>(null);
  const [selectedFormats, setSelectedFormats] = useState<ExportFormat[]>([format]);
  const [isPlaying, setIsPlaying] = useState(false);

  // Get video props for Remotion
  const videoProps = useMemo(() => getVideoProps(), [getVideoProps]);

  // Calculate dimensions for preview
  const previewDimensions = FORMAT_DIMENSIONS[format];

  // Play/Pause control
  const handlePlayPause = useCallback(() => {
    if (!playerRef.current) return;

    if (isPlaying) {
      playerRef.current.pause();
    } else {
      playerRef.current.play();
    }
    setIsPlaying(!isPlaying);
  }, [isPlaying]);

  // Restart video
  const handleRestart = useCallback(() => {
    if (!playerRef.current) return;
    playerRef.current.seekTo(0);
    playerRef.current.play();
    setIsPlaying(true);
  }, []);

  // Toggle format selection
  const toggleFormat = (fmt: ExportFormat) => {
    setSelectedFormats(prev => {
      if (prev.includes(fmt)) {
        // Must keep at least one
        if (prev.length === 1) return prev;
        return prev.filter(f => f !== fmt);
      }
      return [...prev, fmt];
    });
  };

  // Calculate credits
  const calculateCredits = () => {
    if (selectedFormats.length === 3) {
      return VIDEO_EXPORT_CREDITS.bundle;
    }
    return selectedFormats.length * VIDEO_EXPORT_CREDITS.single;
  };

  // Handle export
  const handleExport = async () => {
    setLoading(true);
    setError(null);

    try {
      // TODO: Implement actual export via Remotion Lambda
      await new Promise(resolve => setTimeout(resolve, 2000));
      alert('Export functionality coming soon! This will render your video using Remotion Lambda.');
    } catch (err: any) {
      setError(err.message || 'Export failed');
    } finally {
      setLoading(false);
    }
  };

  // Check if we have enough data for preview
  const canPreview = videoProps.images.length > 0;

  return (
    <div className="grid lg:grid-cols-12 gap-8 h-full">
      {/* Left Column: Preview (7 cols) */}
      <div className="lg:col-span-7 flex flex-col space-y-6">
        <div className="flex items-center justify-between">
           <h2 className="text-xl font-bold text-white">Preview</h2>
           
           {/* Format Tabs */}
            <div className="flex bg-black/40 rounded-lg p-1 border border-white/5">
            {(['vertical', 'square', 'landscape'] as ExportFormat[]).map((fmt) => (
                <button
                key={fmt}
                onClick={() => setFormat(fmt)}
                className={`
                    flex items-center gap-2 px-3 py-1.5 rounded-md transition-all text-xs font-medium
                    ${format === fmt
                    ? 'bg-emerald-600 text-white shadow-md'
                    : 'text-zinc-400 hover:text-white hover:bg-white/5'
                    }
                `}
                >
                {FORMAT_ICONS[fmt]}
                <span>{FORMAT_LABELS[fmt].ratio}</span>
                </button>
            ))}
            </div>
        </div>

        {/* Video Player Container */}
        <div className="flex-1 flex flex-col items-center justify-center bg-black/20 rounded-3xl border border-white/5 p-6 backdrop-blur-sm relative overflow-hidden group">
            
             {/* Background Glow */}
             <div className="absolute inset-0 bg-emerald-500/5 blur-3xl rounded-full opacity-50 pointer-events-none" />

          <div
            className="relative bg-black rounded-2xl overflow-hidden shadow-2xl ring-1 ring-white/10 z-10"
            style={{
              aspectRatio: `${previewDimensions.width} / ${previewDimensions.height}`,
              maxHeight: '55vh',
              width: format === 'landscape' ? '100%' : 'auto',
              height: format === 'landscape' ? 'auto' : '100%',
            }}
          >
            {canPreview ? (
              <>
                <Player
                  ref={playerRef}
                  component={PropertyVideo}
                  inputProps={videoProps}
                  durationInFrames={VIDEO_CONFIG.durationInFrames}
                  fps={VIDEO_CONFIG.fps}
                  compositionWidth={previewDimensions.width}
                  compositionHeight={previewDimensions.height}
                  style={{
                    width: '100%',
                    height: '100%',
                  }}
                  controls={false} // Custom controls
                  autoPlay={false}
                  loop
                  clickToPlay
                />
                
                {/* Custom Overlay Controls */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                     <div className="bg-black/50 backdrop-blur-md rounded-full p-4 pointer-events-auto cursor-pointer hover:bg-black/70 transition-colors" onClick={handlePlayPause}>
                        {isPlaying ? <Pause size={32} className="text-white fill-white" /> : <Play size={32} className="text-white fill-white ml-1" />}
                     </div>
                </div>
              </>
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-zinc-500 gap-4 p-8">
                <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center">
                  <Play size={24} className="text-zinc-600 ml-1" />
                </div>
                <div className="text-center">
                  <p className="font-medium text-zinc-400">No images uploaded</p>
                  <p className="text-sm mt-1">Go back to Step 3 to add property photos</p>
                </div>
              </div>
            )}
          </div>
          
           {/* Playback Bar (Below video) */}
           {canPreview && (
                <div className="w-full max-w-md mt-6 flex items-center justify-between gap-4 z-10 px-4 py-2 bg-black/40 rounded-full border border-white/5 backdrop-blur-md">
                     <button onClick={handlePlayPause} className="text-white hover:text-emerald-400 transition-colors">
                        {isPlaying ? <Pause size={20} className="fill-current" /> : <Play size={20} className="fill-current" />}
                     </button>
                     
                     <div className="text-xs font-mono text-zinc-400">
                        {VIDEO_CONFIG.durationInSeconds}s
                     </div>
                     
                     <button onClick={handleRestart} className="text-zinc-400 hover:text-white transition-colors">
                        <RotateCcw size={18} />
                     </button>
                </div>
           )}
        </div>
      </div>

      {/* Right Column: Export Options (5 cols) */}
      <div className="lg:col-span-5 flex flex-col justify-between space-y-6">
        <div className="space-y-6">
            <h2 className="text-xl font-bold text-white">Export Options</h2>

            {/* Format Selection List */}
            <div className="space-y-3">
            <p className="text-sm text-zinc-400 font-medium">Select formats to export:</p>

            {(['vertical', 'square', 'landscape'] as ExportFormat[]).map((fmt) => {
                const isSelected = selectedFormats.includes(fmt);
                const info = FORMAT_LABELS[fmt];

                return (
                <motion.button
                    key={fmt}
                    onClick={() => toggleFormat(fmt)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`
                    w-full flex items-center gap-4 p-4 rounded-xl border transition-all duration-200 text-left relative overflow-hidden
                    ${isSelected
                        ? 'bg-emerald-600/10 border-emerald-500/50 shadow-lg shadow-emerald-900/10'
                        : 'bg-white/5 border-white/5 hover:bg-white/10 hover:border-white/10'
                    }
                    `}
                >
                    {/* Checkbox */}
                    <div className={`
                    w-5 h-5 rounded flex items-center justify-center border transition-colors
                    ${isSelected ? 'bg-emerald-600 border-emerald-600' : 'border-zinc-600 bg-transparent'}
                    `}>
                    {isSelected && <Check size={12} className="text-white" />}
                    </div>

                    {/* Icon */}
                    <div className={`
                    p-2 rounded-lg
                    ${isSelected ? 'bg-emerald-600/20 text-emerald-300' : 'bg-white/5 text-zinc-500'}
                    `}>
                    {FORMAT_ICONS[fmt]}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                    <h4 className={`font-semibold text-sm ${isSelected ? 'text-white' : 'text-zinc-300'}`}>{info.name}</h4>
                    <p className="text-xs text-zinc-500 truncate">{info.use}</p>
                    </div>

                    {/* Credits */}
                    <div className="text-right">
                    <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded">{VIDEO_EXPORT_CREDITS.single} credits</span>
                    </div>
                </motion.button>
                );
            })}
            </div>

            {/* Bundle Discount */}
            {selectedFormats.length === 3 && (
            <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-3 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl"
            >
                <div className="p-1.5 bg-emerald-500/20 rounded-full text-emerald-400">
                    <Zap size={16} className="fill-current" />
                </div>
                <div>
                    <p className="text-sm font-bold text-emerald-400">Bundle Savings Applied!</p>
                    <p className="text-xs text-emerald-500/80">
                        You saved {VIDEO_EXPORT_CREDITS.single * 3 - VIDEO_EXPORT_CREDITS.bundle} credits by selecting all formats.
                    </p>
                </div>
            </motion.div>
            )}
        </div>

        {/* Bottom Action Area */}
        <div className="bg-white/5 rounded-2xl p-6 border border-white/5 backdrop-blur-xl space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-zinc-400 text-sm">Total Cost:</span>
            <div className="text-right">
                 <span className="text-2xl font-bold text-white block">{calculateCredits()}</span>
                 <span className="text-xs text-zinc-500 uppercase tracking-wider font-medium">Credits</span>
            </div>
          </div>

          <div className="h-px bg-white/10 w-full" />

          {/* Export Button */}
          <button
            onClick={handleExport}
            disabled={isLoading || selectedFormats.length === 0 || !canPreview}
            className={`
              w-full flex items-center justify-center gap-3 px-6 py-4 rounded-xl font-bold text-lg transition-all duration-300
              ${isLoading
                ? 'bg-zinc-800 text-zinc-500 cursor-wait'
                : 'bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-600 bg-[length:200%_auto] hover:bg-[position:right_center] text-white shadow-lg shadow-emerald-900/30 hover:shadow-emerald-600/40 hover:-translate-y-0.5'
              }
              disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none disabled:translate-y-0
            `}
          >
            {isLoading ? (
              <>
                <RefreshCw size={20} className="animate-spin" />
                Rendering...
              </>
            ) : (
              <>
                <Download size={20} />
                Export {selectedFormats.length > 1 ? `${selectedFormats.length} Videos` : 'Video'}
              </>
            )}
          </button>
          
           <p className="text-xs text-center text-zinc-500">
              Videos will be rendered in the cloud. You'll be notified when ready.
           </p>
        </div>
      </div>
    </div>
  );
}

export default PreviewStep;
