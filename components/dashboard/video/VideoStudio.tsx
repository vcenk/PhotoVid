import React, { useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  UploadCloud,
  Sparkles,
  Download,
  Save,
  Video,
  Type,
  Image as ImageIcon,
  Loader2,
  Trash2,
  AlertCircle,
  Zap,
  Play,
  RectangleHorizontal,
  RectangleVertical,
  Square,
  Info,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { isFalConfigured } from '@/lib/api/toolGeneration';
import { generateImageToVideo, generateTextToImage } from '@/lib/api/fal';
import { uploadToR2 } from '@/lib/api/r2';
import { useCredits } from '@/lib/store/contexts/CreditsContext';
import { CREDIT_COSTS } from '@/lib/types/credits';
import type { CreditCostKey } from '@/lib/types/credits';

// ==========================================
// Types & Constants
// ==========================================

type Mode = 'image-to-video' | 'text-to-video';
type Duration = '5' | '10';
type AspectRatio = '16:9' | '9:16' | '1:1';

interface AspectOption {
  value: AspectRatio;
  label: string;
  icon: React.ElementType;
  desc: string;
}

const ASPECT_OPTIONS: AspectOption[] = [
  { value: '16:9', label: 'Landscape', icon: RectangleHorizontal, desc: '16:9' },
  { value: '9:16', label: 'Portrait', icon: RectangleVertical, desc: '9:16' },
  { value: '1:1', label: 'Square', icon: Square, desc: '1:1' },
];

type PreviewState = 'empty' | 'image-uploaded' | 'generating' | 'error' | 'result';

// Helper to get duration-based credit key
function getVideoCreditKey(mode: Mode, duration: Duration): CreditCostKey {
  if (mode === 'image-to-video') {
    return duration === '5' ? 'image-to-video-5s' : 'image-to-video-10s';
  } else {
    return duration === '5' ? 'text-to-video-5s' : 'text-to-video-10s';
  }
}

// ==========================================
// Component
// ==========================================

export const VideoStudio: React.FC = () => {
  const navigate = useNavigate();
  const { balance, deductCredits, hasEnoughCredits } = useCredits();

  // Mode
  const [mode, setMode] = useState<Mode>('image-to-video');

  // Image-to-video state
  const [uploadedImage, setUploadedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [motionPrompt, setMotionPrompt] = useState('');

  // Text-to-video state
  const [videoPrompt, setVideoPrompt] = useState('');

  // Shared controls
  const [duration, setDuration] = useState<Duration>('5');
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('16:9');

  // Generation state
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [generationStep, setGenerationStep] = useState('');
  const [intermediateImage, setIntermediateImage] = useState<string | null>(null);
  const [resultVideoUrl, setResultVideoUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Derived - use duration-based credit keys (5 credits per second)
  const toolId: CreditCostKey = getVideoCreditKey(mode, duration);
  const creditCost = CREDIT_COSTS[toolId] || (mode === 'image-to-video' ? 25 : 27);
  const hasCredits = hasEnoughCredits(toolId);

  const canGenerate =
    mode === 'image-to-video'
      ? !!uploadedImage && hasCredits
      : videoPrompt.trim().length > 0 && hasCredits;

  // Determine preview state
  let previewState: PreviewState = 'empty';
  if (error) previewState = 'error';
  else if (resultVideoUrl) previewState = 'result';
  else if (isGenerating) previewState = 'generating';
  else if (imagePreview && mode === 'image-to-video') previewState = 'image-uploaded';

  // ==========================================
  // Handlers
  // ==========================================

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
    if (e.dataTransfer.files?.[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type.startsWith('image/')) {
        setUploadedImage(file);
        setImagePreview(URL.createObjectURL(file));
        setResultVideoUrl(null);
        setError(null);
      }
    }
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      const file = e.target.files[0];
      setUploadedImage(file);
      setImagePreview(URL.createObjectURL(file));
      setResultVideoUrl(null);
      setError(null);
    }
  };

  const removeImage = () => {
    setUploadedImage(null);
    if (imagePreview) URL.revokeObjectURL(imagePreview);
    setImagePreview(null);
    setResultVideoUrl(null);
  };

  // ==========================================
  // Generation
  // ==========================================

  const runMockGeneration = async () => {
    // Mock for when FAL is not configured
    const steps =
      mode === 'text-to-video'
        ? [
            { progress: 15, step: 'Generating image from prompt...' },
            { progress: 40, step: 'Image created, starting video...' },
            { progress: 60, step: 'Animating scene...' },
            { progress: 80, step: 'Rendering frames...' },
            { progress: 95, step: 'Finalizing...' },
          ]
        : [
            { progress: 20, step: 'Uploading image...' },
            { progress: 45, step: 'Analyzing motion...' },
            { progress: 70, step: 'Rendering frames...' },
            { progress: 90, step: 'Finalizing...' },
          ];

    for (const s of steps) {
      await new Promise((r) => setTimeout(r, 700));
      setGenerationProgress(s.progress);
      setGenerationStep(s.step);
      if (mode === 'text-to-video' && s.progress === 40) {
        setIntermediateImage(
          'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800&h=450&fit=crop'
        );
      }
    }

    await new Promise((r) => setTimeout(r, 500));
    setGenerationProgress(100);
    setGenerationStep('Complete!');
    // Use a sample video for mock
    setResultVideoUrl(
      'https://test-videos.co.uk/vids/bigbuckbunny/mp4/h264/360/Big_Buck_Bunny_360_10s_1MB.mp4'
    );
  };

  const runRealGeneration = async () => {
    if (mode === 'image-to-video') {
      // Step 1: Upload image to R2
      setGenerationStep('Uploading image...');
      setGenerationProgress(10);
      const imageUrl = await uploadToR2(uploadedImage!, 'video-studio');
      setGenerationProgress(25);

      // Step 2: Call image-to-video
      setGenerationStep('Generating video...');
      setGenerationProgress(30);
      const result = await generateImageToVideo({
        imageUrl,
        prompt: motionPrompt || 'Cinematic slow motion, high quality, 4k',
        duration,
        aspectRatio,
      });

      setGenerationProgress(90);
      setGenerationStep('Processing result...');

      // result.video.url contains the video
      const videoUrl = result?.video?.url || result?.data?.video?.url;
      if (!videoUrl) throw new Error('No video URL in response');

      setGenerationProgress(100);
      setResultVideoUrl(videoUrl);
    } else {
      // Text-to-Video: 2-step pipeline

      // Step 1: Generate image from text
      setGenerationStep('Generating image from prompt...');
      setGenerationProgress(10);

      const imageResult = await generateTextToImage({
        prompt: videoPrompt,
        imageSize: aspectRatio === '16:9' ? 'landscape_16_9' : aspectRatio === '9:16' ? 'portrait_16_9' : 'square_hd',
      });

      const generatedImageUrl =
        imageResult?.images?.[0]?.url ||
        imageResult?.data?.images?.[0]?.url;

      if (!generatedImageUrl) throw new Error('Image generation failed');

      setIntermediateImage(generatedImageUrl);
      setGenerationProgress(45);
      setGenerationStep('Image created! Generating video...');

      // Step 2: Image-to-video
      setGenerationProgress(50);
      const videoResult = await generateImageToVideo({
        imageUrl: generatedImageUrl,
        prompt: videoPrompt,
        duration,
        aspectRatio,
      });

      setGenerationProgress(90);
      setGenerationStep('Processing result...');

      const videoUrl = videoResult?.video?.url || videoResult?.data?.video?.url;
      if (!videoUrl) throw new Error('No video URL in response');

      setGenerationProgress(100);
      setResultVideoUrl(videoUrl);
    }
  };

  const handleGenerate = async () => {
    if (!canGenerate) return;

    setIsGenerating(true);
    setGenerationProgress(0);
    setGenerationStep('Starting...');
    setError(null);
    setResultVideoUrl(null);
    setIntermediateImage(null);

    // Deduct credits
    const deducted = await deductCredits(toolId);
    if (!deducted) {
      setError('Failed to deduct credits. Please try again.');
      setIsGenerating(false);
      return;
    }

    try {
      if (!isFalConfigured()) {
        await runMockGeneration();
      } else {
        await runRealGeneration();
      }
    } catch (err) {
      console.error('Video generation error:', err);
      setError(err instanceof Error ? err.message : 'Generation failed. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  // ==========================================
  // Download
  // ==========================================

  const handleDownload = async () => {
    if (!resultVideoUrl) return;
    try {
      const response = await fetch(resultVideoUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      const timestamp = new Date().toISOString().slice(0, 10);
      link.download = `video-${mode}-${timestamp}.mp4`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch {
      window.open(resultVideoUrl, '_blank');
    }
  };

  const handleSaveToLibrary = () => {
    // For now, open the download
    handleDownload();
  };

  // ==========================================
  // Render
  // ==========================================

  return (
    <div className="flex-1 flex h-full">
      {/* ============ LEFT SIDEBAR ============ */}
      <div className="w-[340px] flex-shrink-0 bg-[#111113] border-r border-white/5 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-white/5">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/studio')}
              className="p-2 hover:bg-white/5 rounded-lg transition-colors"
            >
              <ArrowLeft size={18} className="text-zinc-400" />
            </button>
            <div>
              <h1 className="text-base font-semibold text-white flex items-center gap-2">
                <Video size={18} className="text-teal-400" />
                AI Video Studio
              </h1>
            </div>
          </div>
        </div>

        {/* Mode Toggle */}
        <div className="px-4 pt-4">
          <div className="bg-white/5 rounded-xl p-1 flex">
            <button
              onClick={() => {
                setMode('image-to-video');
                setResultVideoUrl(null);
                setError(null);
              }}
              className={cn(
                'flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-semibold transition-all',
                mode === 'image-to-video'
                  ? 'bg-gradient-to-r from-teal-600 to-emerald-600 text-white shadow-lg shadow-teal-500/20'
                  : 'text-zinc-400 hover:text-zinc-300'
              )}
            >
              <ImageIcon size={14} />
              Image to Video
            </button>
            <button
              onClick={() => {
                setMode('text-to-video');
                setResultVideoUrl(null);
                setError(null);
              }}
              className={cn(
                'flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-semibold transition-all',
                mode === 'text-to-video'
                  ? 'bg-gradient-to-r from-teal-600 to-emerald-600 text-white shadow-lg shadow-teal-500/20'
                  : 'text-zinc-400 hover:text-zinc-300'
              )}
            >
              <Type size={14} />
              Text to Video
            </button>
          </div>
        </div>

        {/* Scrollable Controls */}
        <div className="flex-1 overflow-y-auto p-4 space-y-5">
          {mode === 'image-to-video' ? (
            <>
              {/* Source Image */}
              <div>
                <label className="text-xs font-medium text-zinc-400 uppercase tracking-wide mb-2 block">
                  Source Image
                </label>
                {!imagePreview ? (
                  <div
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={cn(
                      'relative border border-dashed rounded-xl p-6 text-center transition-all cursor-pointer',
                      isDragging
                        ? 'border-teal-500 bg-teal-500/10'
                        : 'border-white/10 hover:border-white/20 bg-white/[0.02]'
                    )}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      className="hidden"
                      onChange={handleFileChange}
                      accept="image/*"
                    />
                    <UploadCloud size={28} className="mx-auto mb-2 text-zinc-500" />
                    <p className="text-sm text-zinc-400">Drop image here</p>
                    <p className="text-xs text-zinc-600 mt-1">or click to browse</p>
                  </div>
                ) : (
                  <div className="relative rounded-xl overflow-hidden group">
                    <img
                      src={imagePreview}
                      alt="Source"
                      className="w-full h-40 object-cover"
                    />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <button
                        onClick={removeImage}
                        className="p-2 bg-red-500/80 hover:bg-red-500 rounded-lg text-white transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Motion Prompt */}
              <div>
                <label className="text-xs font-medium text-zinc-400 uppercase tracking-wide mb-2 block">
                  Motion Prompt
                </label>
                <textarea
                  value={motionPrompt}
                  onChange={(e) => setMotionPrompt(e.target.value)}
                  placeholder="Describe the motion... e.g. Smooth camera pan, cinematic zoom"
                  rows={3}
                  className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-3 py-2.5 text-sm text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-teal-500/50 focus:ring-1 focus:ring-teal-500/20 resize-none"
                />
              </div>
            </>
          ) : (
            <>
              {/* Video Prompt */}
              <div>
                <label className="text-xs font-medium text-zinc-400 uppercase tracking-wide mb-2 block">
                  Video Prompt
                </label>
                <textarea
                  value={videoPrompt}
                  onChange={(e) => setVideoPrompt(e.target.value)}
                  placeholder="Describe your video scene in detail... e.g. A golden sunset over the ocean with gentle waves, cinematic 4K"
                  rows={5}
                  className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-3 py-2.5 text-sm text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-teal-500/50 focus:ring-1 focus:ring-teal-500/20 resize-none"
                />
              </div>

              {/* Pipeline Info */}
              <div className="flex items-start gap-2.5 p-3 rounded-xl bg-teal-500/5 border border-teal-500/10">
                <Info size={16} className="text-teal-400 mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs font-medium text-teal-300">Two-step pipeline</p>
                  <p className="text-xs text-zinc-500 mt-0.5">
                    Your prompt generates an image first, then animates it into video.
                  </p>
                </div>
              </div>
            </>
          )}

          {/* Duration */}
          <div>
            <label className="text-xs font-medium text-zinc-400 uppercase tracking-wide mb-2 block">
              Duration
            </label>
            <div className="flex gap-2">
              {(['5', '10'] as Duration[]).map((d) => (
                <button
                  key={d}
                  onClick={() => setDuration(d)}
                  className={cn(
                    'flex-1 py-2 rounded-lg text-xs font-semibold transition-all',
                    duration === d
                      ? 'bg-teal-600 text-white'
                      : 'bg-white/5 text-zinc-400 hover:bg-white/10 hover:text-zinc-300'
                  )}
                >
                  {d}s
                </button>
              ))}
            </div>
          </div>

          {/* Aspect Ratio */}
          <div>
            <label className="text-xs font-medium text-zinc-400 uppercase tracking-wide mb-2 block">
              Aspect Ratio
            </label>
            <div className="grid grid-cols-3 gap-2">
              {ASPECT_OPTIONS.map((opt) => {
                const Icon = opt.icon;
                return (
                  <button
                    key={opt.value}
                    onClick={() => setAspectRatio(opt.value)}
                    className={cn(
                      'flex flex-col items-center gap-1.5 py-3 rounded-xl text-xs font-medium transition-all border',
                      aspectRatio === opt.value
                        ? 'bg-teal-600/15 border-teal-500/40 text-teal-300'
                        : 'bg-white/[0.02] border-white/5 text-zinc-500 hover:bg-white/5 hover:text-zinc-300'
                    )}
                  >
                    <Icon size={20} strokeWidth={1.5} />
                    <span>{opt.desc}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-white/5 space-y-3">
          {/* Credit Info */}
          <div className="flex items-center justify-between text-xs">
            <span className="text-zinc-500">Cost</span>
            <span
              className={cn(
                'flex items-center gap-1',
                hasCredits ? 'text-emerald-400' : 'text-red-400'
              )}
            >
              <Zap size={12} className="fill-current" />
              {creditCost} credits
            </span>
          </div>

          {!hasCredits && (
            <div className="p-2 bg-red-500/10 border border-red-500/20 rounded-lg">
              <p className="text-xs text-red-400 text-center">
                Insufficient credits ({balance} available)
              </p>
              <button
                onClick={() => navigate('/studio/credits')}
                className="w-full mt-2 py-1.5 text-xs font-medium text-white bg-red-600 hover:bg-red-500 rounded-lg transition-colors"
              >
                Get More Credits
              </button>
            </div>
          )}

          <button
            onClick={handleGenerate}
            disabled={!canGenerate || isGenerating}
            className={cn(
              'w-full py-3 rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-2',
              canGenerate && !isGenerating
                ? 'bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-white shadow-lg shadow-teal-500/20'
                : 'bg-white/5 text-zinc-600 cursor-not-allowed'
            )}
          >
            {isGenerating ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                Generating {generationProgress}%
              </>
            ) : (
              <>
                <Sparkles size={18} />
                Generate Video
              </>
            )}
          </button>
        </div>
      </div>

      {/* ============ RIGHT PREVIEW ============ */}
      <div className="flex-1 flex flex-col bg-[#0a0a0b]">
        {/* Preview Header */}
        <div className="h-14 flex items-center justify-between px-6 border-b border-white/5">
          <span className="text-sm text-zinc-500">Preview</span>
          {previewState === 'result' && (
            <div className="flex items-center gap-2">
              <button
                onClick={handleSaveToLibrary}
                className="px-3 py-1.5 text-xs font-medium text-zinc-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-lg transition-colors flex items-center gap-1.5"
              >
                <Save size={14} />
                Save to Library
              </button>
              <button
                onClick={handleDownload}
                className="px-3 py-1.5 text-xs font-medium text-white bg-teal-600 hover:bg-teal-500 rounded-lg transition-colors flex items-center gap-1.5"
              >
                <Download size={14} />
                Download
              </button>
            </div>
          )}
        </div>

        {/* Preview Content */}
        <div className="flex-1 flex items-center justify-center p-8">
          <AnimatePresence mode="wait">
            {previewState === 'error' ? (
              <motion.div
                key="error"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="text-center"
              >
                <div className="w-20 h-20 rounded-2xl bg-red-500/10 flex items-center justify-center mx-auto mb-4">
                  <AlertCircle size={32} className="text-red-500" />
                </div>
                <p className="text-red-400 text-sm font-medium mb-2">Generation Failed</p>
                <p className="text-zinc-500 text-xs max-w-xs mx-auto">{error}</p>
                <button
                  onClick={() => setError(null)}
                  className="mt-4 px-4 py-2 text-xs font-medium text-white bg-teal-600 hover:bg-teal-500 rounded-lg transition-colors"
                >
                  Try Again
                </button>
              </motion.div>
            ) : previewState === 'result' ? (
              <motion.div
                key="result"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="w-full max-w-4xl"
              >
                <video
                  src={resultVideoUrl!}
                  controls
                  autoPlay
                  loop
                  className="w-full rounded-2xl shadow-2xl shadow-black/50"
                />
              </motion.div>
            ) : previewState === 'generating' ? (
              <motion.div
                key="generating"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-center"
              >
                {/* Progress Circle */}
                <div className="relative w-24 h-24 mx-auto mb-6">
                  <svg className="w-full h-full -rotate-90">
                    <circle
                      cx="48"
                      cy="48"
                      r="44"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                      className="text-white/10"
                    />
                    <circle
                      cx="48"
                      cy="48"
                      r="44"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                      strokeDasharray={276.46}
                      strokeDashoffset={276.46 - (276.46 * generationProgress) / 100}
                      className="text-teal-500 transition-all duration-300"
                      strokeLinecap="round"
                    />
                  </svg>
                  <span className="absolute inset-0 flex items-center justify-center text-xl font-semibold text-white">
                    {generationProgress}%
                  </span>
                </div>

                <p className="text-zinc-300 font-medium">{generationStep}</p>

                {/* Two-step display for text-to-video */}
                {mode === 'text-to-video' && (
                  <div className="mt-6 flex items-center gap-4 justify-center">
                    <div
                      className={cn(
                        'flex items-center gap-2 text-xs font-medium px-3 py-1.5 rounded-full',
                        generationProgress > 0
                          ? generationProgress >= 45
                            ? 'bg-green-500/10 text-green-400'
                            : 'bg-teal-500/10 text-teal-400'
                          : 'bg-white/5 text-zinc-600'
                      )}
                    >
                      <ImageIcon size={12} />
                      Step 1: Image
                      {generationProgress >= 45 && <span>&#10003;</span>}
                    </div>
                    <div className="w-6 h-px bg-white/10" />
                    <div
                      className={cn(
                        'flex items-center gap-2 text-xs font-medium px-3 py-1.5 rounded-full',
                        generationProgress >= 50
                          ? generationProgress >= 100
                            ? 'bg-green-500/10 text-green-400'
                            : 'bg-teal-500/10 text-teal-400'
                          : 'bg-white/5 text-zinc-600'
                      )}
                    >
                      <Video size={12} />
                      Step 2: Video
                      {generationProgress >= 100 && <span>&#10003;</span>}
                    </div>
                  </div>
                )}

                {/* Intermediate image preview */}
                {intermediateImage && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-6"
                  >
                    <p className="text-zinc-600 text-xs mb-2">Generated image</p>
                    <img
                      src={intermediateImage}
                      alt="Intermediate"
                      className="w-48 h-auto rounded-xl mx-auto shadow-lg"
                    />
                  </motion.div>
                )}
              </motion.div>
            ) : previewState === 'image-uploaded' ? (
              <motion.div
                key="uploaded"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="w-full max-w-4xl"
              >
                <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                  <img
                    src={imagePreview!}
                    alt="Source"
                    className="w-full h-auto max-h-[calc(100vh-180px)] object-contain"
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                    <div className="text-center">
                      <div className="w-16 h-16 rounded-full bg-white/10 backdrop-blur flex items-center justify-center mx-auto mb-3">
                        <Play size={28} className="text-white ml-1" />
                      </div>
                      <p className="text-white font-medium">Ready to animate</p>
                      <p className="text-white/60 text-sm">Click Generate to create video</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-center"
              >
                <div className="w-20 h-20 rounded-2xl bg-white/[0.03] border border-white/5 flex items-center justify-center mx-auto mb-4">
                  <Video size={32} className="text-zinc-600" />
                </div>
                <p className="text-zinc-400 font-medium">Create AI Videos</p>
                <p className="text-zinc-600 text-sm mt-1">
                  {mode === 'image-to-video'
                    ? 'Upload an image and add a motion prompt'
                    : 'Describe a scene to generate a video from text'}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};
