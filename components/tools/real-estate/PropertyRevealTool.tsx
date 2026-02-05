import React, { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Sparkles,
  Download,
  RefreshCw,
  Loader2,
  Upload,
  AlertCircle,
  Zap,
  BookmarkPlus,
  Volume2,
  VolumeX,
  Play,
  Check,
  X,
  Home,
  Building2,
  Trees,
  Waves,
  Hammer,
  Snowflake,
  Sofa,
} from 'lucide-react';
import { uploadToR2 } from '@/lib/api/r2';
import { AssetProvider, useAssets } from '@/lib/store/contexts/AssetContext';
import { NavigationRail } from '../../dashboard/navigation/NavigationRail';
import { generatePropertyReveal, isFalConfigured } from '@/lib/api/toolGeneration';
import { useCredits } from '@/lib/store/contexts/CreditsContext';
import {
  AnimationType,
  ANIMATION_TYPE_INFO,
  STYLE_MAPS,
  calculateCost,
  getStylesForType,
} from '@/lib/types/property-reveal';

// Icon map for animation types
const ANIMATION_ICONS: Record<AnimationType, React.ReactNode> = {
  'room-staging': <Sofa className="w-5 h-5" />,
  'lot-to-house': <Building2 className="w-5 h-5" />,
  'exterior-renovation': <Home className="w-5 h-5" />,
  'landscaping': <Trees className="w-5 h-5" />,
  'pool-installation': <Waves className="w-5 h-5" />,
  'interior-renovation': <Hammer className="w-5 h-5" />,
  'seasonal-transform': <Snowflake className="w-5 h-5" />,
};

const PropertyRevealToolInner: React.FC = () => {
  const navigate = useNavigate();
  const { balance } = useCredits();
  const { addAsset } = useAssets();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Animation settings
  const [animationType, setAnimationType] = useState<AnimationType>('room-staging');
  const [styleId, setStyleId] = useState<string>(STYLE_MAPS['room-staging'][0]?.id || '');
  const [duration, setDuration] = useState<8 | 10>(8);
  const [withAudio, setWithAudio] = useState(true);

  // Image upload state
  const [uploadedImage, setUploadedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  // Generation state
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [generationStatus, setGenerationStatus] = useState('');
  const [resultVideo, setResultVideo] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [savedToLibrary, setSavedToLibrary] = useState(false);

  // Get current styles and info
  const currentStyles = getStylesForType(animationType);
  const currentInfo = ANIMATION_TYPE_INFO[animationType];
  const { credits: creditCost } = calculateCost(duration, withAudio);

  // Check if we have enough credits
  const hasCredits = balance >= creditCost;

  // Handle animation type change
  const handleAnimationTypeChange = (type: AnimationType) => {
    setAnimationType(type);
    const styles = getStylesForType(type);
    setStyleId(styles[0]?.id || '');
  };

  // Image upload handlers
  const handleImageUpload = useCallback((file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('Please upload an image file');
      return;
    }
    setUploadedImage(file);
    const reader = new FileReader();
    reader.onload = (e) => setImagePreview(e.target?.result as string);
    reader.readAsDataURL(file);
    setError(null);
    setResultVideo(null);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleImageUpload(file);
  }, [handleImageUpload]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleImageUpload(file);
  }, [handleImageUpload]);

  const handleRemoveImage = useCallback(() => {
    setUploadedImage(null);
    setImagePreview(null);
    setResultVideo(null);
  }, []);

  // Generate animation
  const handleGenerate = async () => {
    if (!uploadedImage || !imagePreview) {
      setError('Please upload an image first');
      return;
    }

    setIsGenerating(true);
    setGenerationProgress(0);
    setGenerationStatus('Preparing...');
    setError(null);
    setSavedToLibrary(false);

    if (!isFalConfigured()) {
      // Mock generation for demo
      const progressInterval = setInterval(() => {
        setGenerationProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 5;
        });
      }, 500);

      setTimeout(async () => {
        clearInterval(progressInterval);
        setGenerationProgress(100);
        const mockUrl = 'https://sample-videos.com/zip/10mb.mp4';
        setResultVideo(mockUrl);
        setIsGenerating(false);
      }, 5000);
      return;
    }

    try {
      // Upload image to R2
      setGenerationStatus('Uploading image...');
      setIsUploading(true);
      const imageUrl = await uploadToR2(uploadedImage, `property-reveal/${Date.now()}-${uploadedImage.name}`);
      setIsUploading(false);
      setGenerationProgress(10);

      // Generate animation
      const result = await generatePropertyReveal(
        {
          animationType,
          imageUrl,
          styleId,
          withAudio,
          duration,
        },
        (progress, status) => {
          setGenerationProgress(10 + progress * 0.9);
          setGenerationStatus(status || 'Generating...');
        }
      );

      setResultVideo(result.videoUrl);

      // Save to library
      try {
        await addAsset(result.videoUrl, 'video', `Property Reveal - ${currentInfo.label}`);
        setSavedToLibrary(true);
      } catch (saveErr) {
        console.error('Failed to save to library:', saveErr);
      }
    } catch (err) {
      console.error('Generation error:', err);
      setError(err instanceof Error ? err.message : 'Generation failed. Please try again.');
    } finally {
      setIsGenerating(false);
      setIsUploading(false);
    }
  };

  // Download video
  const handleDownload = async () => {
    if (!resultVideo) return;
    try {
      const response = await fetch(resultVideo);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `property-reveal-${animationType}-${Date.now()}.mp4`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Download error:', err);
    }
  };

  // Reset
  const handleReset = () => {
    setResultVideo(null);
    setError(null);
    setSavedToLibrary(false);
    setGenerationProgress(0);
  };

  return (
    <div className="h-screen flex bg-[#0a0a0b]">
      {/* Navigation Rail */}
      <NavigationRail
        isMobileOpen={mobileMenuOpen}
        onMobileClose={() => setMobileMenuOpen(false)}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden ml-16">
        {/* Top Bar */}
        <div className="h-14 border-b border-white/10 flex items-center justify-between px-4 bg-zinc-900/50">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/studio/real-estate')}
              className="p-2 rounded-lg hover:bg-white/5 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-zinc-400" />
            </button>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center">
                <Play className="w-4 h-4 text-white" />
              </div>
              <div>
                <h1 className="text-sm font-medium text-white">Property Reveal</h1>
                <p className="text-xs text-zinc-500">Stunning transformation videos</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-zinc-800/50 border border-white/5">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span className="text-xs font-medium text-zinc-300">{balance} credits</span>
            </div>
          </div>
        </div>

        {/* Main Area */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left Panel - Animation Type Selection */}
          <div className="w-72 border-r border-white/10 bg-zinc-900/30 overflow-y-auto">
            <div className="p-4 space-y-4">
              <h3 className="text-xs font-medium text-zinc-400 uppercase tracking-wider">
                Animation Type
              </h3>
              <div className="space-y-2">
                {(Object.keys(ANIMATION_TYPE_INFO) as AnimationType[]).map((type) => {
                  const info = ANIMATION_TYPE_INFO[type];
                  const isSelected = animationType === type;
                  return (
                    <button
                      key={type}
                      onClick={() => handleAnimationTypeChange(type)}
                      className={`w-full p-3 rounded-xl border transition-all text-left ${
                        isSelected
                          ? 'border-amber-500 bg-amber-500/10'
                          : 'border-white/10 bg-zinc-800/50 hover:bg-zinc-800'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${isSelected ? 'bg-amber-500/20 text-amber-400' : 'bg-zinc-700/50 text-zinc-400'}`}>
                          {ANIMATION_ICONS[type]}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className={`text-sm font-medium ${isSelected ? 'text-white' : 'text-zinc-300'}`}>
                              {info.label}
                            </span>
                            {isSelected && <Check className="w-3.5 h-3.5 text-amber-400" />}
                          </div>
                          <p className="text-xs text-zinc-500 truncate">{info.description}</p>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Center - Preview Area */}
          <div className="flex-1 flex flex-col bg-zinc-950/50 overflow-hidden">
            {/* Preview Header */}
            <div className="flex items-center justify-between px-6 py-3 border-b border-white/5">
              <div className="flex items-center gap-3">
                <span className="text-xs text-zinc-500 uppercase tracking-wider">Preview</span>
                <span className="px-2 py-0.5 rounded bg-zinc-800 text-[10px] text-zinc-400">
                  16:9
                </span>
              </div>
              {imagePreview && !resultVideo && (
                <button
                  onClick={handleRemoveImage}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs text-zinc-400 hover:text-white hover:bg-white/5 transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                  Remove
                </button>
              )}
            </div>

            {/* Main Preview Container */}
            <div className="flex-1 flex items-center justify-center p-6 min-h-0 overflow-hidden">
              {resultVideo ? (
                /* Video Result */
                <div className="w-full max-w-4xl">
                  <div className="relative rounded-2xl overflow-hidden border border-white/10 bg-zinc-900 shadow-2xl">
                    <video
                      src={resultVideo}
                      controls
                      autoPlay
                      loop
                      className="w-full aspect-video"
                    />
                    <div className="absolute top-4 right-4 px-3 py-1.5 bg-amber-500/90 backdrop-blur-sm rounded-full text-white text-sm font-medium">
                      {currentInfo.label}
                    </div>
                  </div>
                </div>
              ) : isGenerating ? (
                /* Generating State */
                <div className="w-full max-w-md text-center">
                  <div className="relative mb-6">
                    <div className="w-24 h-24 rounded-full border-4 border-amber-500/20 flex items-center justify-center mx-auto">
                      <Loader2 className="w-12 h-12 text-amber-400 animate-spin" />
                    </div>
                    <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-zinc-800 border border-white/10">
                      <span className="text-sm font-medium text-white">{Math.round(generationProgress)}%</span>
                    </div>
                  </div>
                  <p className="text-lg font-medium text-white mb-2">
                    {isUploading ? 'Uploading image...' : generationStatus}
                  </p>
                  <p className="text-sm text-zinc-500 mb-6">
                    This may take a few minutes for high-quality video
                  </p>
                  <div className="w-full h-2 bg-zinc-800 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-gradient-to-r from-amber-500 to-orange-500"
                      initial={{ width: 0 }}
                      animate={{ width: `${generationProgress}%` }}
                      transition={{ duration: 0.3 }}
                    />
                  </div>
                </div>
              ) : imagePreview ? (
                /* Image Preview - Ready to Generate */
                <div className="w-full max-w-4xl">
                  <div className="relative rounded-2xl overflow-hidden border border-white/10 bg-zinc-900 shadow-2xl">
                    <img
                      src={imagePreview}
                      alt="Uploaded"
                      className="w-full aspect-video object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30" />
                    <div className="absolute top-4 left-4 flex gap-2">
                      <span className="px-3 py-1.5 rounded-lg bg-amber-500/90 text-white text-sm font-medium">
                        {currentInfo.label}
                      </span>
                      <span className="px-3 py-1.5 rounded-lg bg-zinc-800/90 text-zinc-300 text-sm">
                        {currentStyles.find(s => s.id === styleId)?.label}
                      </span>
                    </div>
                    <div className="absolute bottom-4 left-4 right-4">
                      <div className="flex items-center gap-2 text-white/90 text-sm">
                        <Play className="w-4 h-4" />
                        <span>Ready to animate</span>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                /* Upload State */
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  className={`relative w-full max-w-2xl aspect-video rounded-2xl border-2 border-dashed transition-all cursor-pointer ${
                    isDragging
                      ? 'border-amber-500 bg-amber-500/10'
                      : 'border-white/20 bg-zinc-900/50 hover:border-amber-500/50 hover:bg-zinc-900'
                  }`}
                >
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  />
                  <div className="absolute inset-0 flex flex-col items-center justify-center p-8">
                    <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-amber-500/20 to-orange-600/20 flex items-center justify-center mb-6">
                      <Upload className="w-10 h-10 text-amber-400" />
                    </div>
                    <h3 className="text-lg font-medium text-white mb-2">{currentInfo.uploadLabel}</h3>
                    <p className="text-sm text-zinc-400 mb-1">{currentInfo.uploadDescription}</p>
                    <p className="text-xs text-zinc-500">Drag & drop or click to upload</p>
                  </div>
                </div>
              )}
            </div>

            {/* Action Bar */}
            <div className="px-6 py-4 border-t border-white/5 bg-zinc-900/30">
              <div className="flex items-center justify-between">
                {/* Left side - Status/Info */}
                <div className="flex items-center gap-3">
                  {error && (
                    <div className="flex items-center gap-2 text-red-400">
                      <AlertCircle className="w-4 h-4" />
                      <span className="text-sm">{error}</span>
                    </div>
                  )}
                  {!hasCredits && !isGenerating && !error && (
                    <div className="flex items-center gap-2 text-amber-400">
                      <AlertCircle className="w-4 h-4" />
                      <span className="text-sm">Not enough credits ({creditCost} required)</span>
                    </div>
                  )}
                  {savedToLibrary && resultVideo && (
                    <div className="flex items-center gap-1.5 text-green-400 text-sm">
                      <BookmarkPlus className="w-4 h-4" />
                      Saved to Library
                    </div>
                  )}
                </div>

                {/* Right side - Action Buttons */}
                <div className="flex items-center gap-3">
                  {resultVideo ? (
                    <>
                      <button
                        onClick={handleReset}
                        className="px-4 py-2.5 rounded-xl bg-zinc-800 text-zinc-300 hover:bg-zinc-700 transition-colors flex items-center gap-2 text-sm"
                      >
                        <RefreshCw className="w-4 h-4" />
                        New Animation
                      </button>
                      <button
                        onClick={handleDownload}
                        className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 text-white hover:opacity-90 transition-opacity flex items-center gap-2 text-sm font-medium"
                      >
                        <Download className="w-4 h-4" />
                        Download
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={handleGenerate}
                      disabled={isGenerating || !hasCredits || !imagePreview}
                      className={`px-6 py-2.5 rounded-xl font-medium transition-all flex items-center gap-2 text-sm ${
                        isGenerating || !hasCredits || !imagePreview
                          ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
                          : 'bg-gradient-to-r from-amber-500 to-orange-600 text-white hover:opacity-90 shadow-lg shadow-amber-500/25'
                      }`}
                    >
                      {isGenerating ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Sparkles className="w-4 h-4" />
                      )}
                      {isGenerating
                        ? 'Generating...'
                        : `Generate Animation (${creditCost} credits)`
                      }
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Right Panel - Style & Settings */}
          <div className="w-80 border-l border-white/10 bg-zinc-900/30 overflow-y-auto">
            <div className="p-4 space-y-6">
              {/* Style Selection */}
              <div>
                <h3 className="text-xs font-medium text-zinc-400 uppercase tracking-wider mb-3">
                  Style
                </h3>
                <div className="space-y-2">
                  {currentStyles.map((style) => (
                    <button
                      key={style.id}
                      onClick={() => setStyleId(style.id)}
                      className={`w-full p-3 rounded-xl border transition-all text-left ${
                        styleId === style.id
                          ? 'border-amber-500 bg-amber-500/10'
                          : 'border-white/10 bg-zinc-800/50 hover:bg-zinc-800'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className={`text-sm font-medium ${styleId === style.id ? 'text-white' : 'text-zinc-300'}`}>
                          {style.label}
                        </span>
                        {styleId === style.id && <Check className="w-4 h-4 text-amber-400" />}
                      </div>
                      <p className="text-xs text-zinc-500 line-clamp-2">
                        {style.elements.slice(0, 4).join(', ')}...
                      </p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Duration */}
              <div>
                <h3 className="text-xs font-medium text-zinc-400 uppercase tracking-wider mb-3">
                  Duration
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  {([8, 10] as const).map((d) => (
                    <button
                      key={d}
                      onClick={() => setDuration(d)}
                      className={`p-3 rounded-xl border transition-all ${
                        duration === d
                          ? 'border-amber-500 bg-amber-500/10'
                          : 'border-white/10 bg-zinc-800/50 hover:bg-zinc-800'
                      }`}
                    >
                      <span className={`text-sm font-medium ${duration === d ? 'text-white' : 'text-zinc-300'}`}>
                        {d} seconds
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Audio Toggle */}
              <div>
                <h3 className="text-xs font-medium text-zinc-400 uppercase tracking-wider mb-3">
                  Audio
                </h3>
                <button
                  onClick={() => setWithAudio(!withAudio)}
                  className={`w-full p-4 rounded-xl border transition-all ${
                    withAudio
                      ? 'border-amber-500 bg-amber-500/10'
                      : 'border-white/10 bg-zinc-800/50 hover:bg-zinc-800'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {withAudio ? (
                        <Volume2 className="w-5 h-5 text-amber-400" />
                      ) : (
                        <VolumeX className="w-5 h-5 text-zinc-500" />
                      )}
                      <div className="text-left">
                        <span className={`text-sm font-medium ${withAudio ? 'text-white' : 'text-zinc-300'}`}>
                          {withAudio ? 'Audio Enabled' : 'No Audio'}
                        </span>
                        <p className="text-xs text-zinc-500">
                          {withAudio ? 'Construction sounds included' : 'Silent video'}
                        </p>
                      </div>
                    </div>
                    <div className={`w-10 h-6 rounded-full transition-colors ${withAudio ? 'bg-amber-500' : 'bg-zinc-700'}`}>
                      <div className={`w-4 h-4 rounded-full bg-white mt-1 transition-transform ${withAudio ? 'translate-x-5' : 'translate-x-1'}`} />
                    </div>
                  </div>
                </button>
              </div>

              {/* Cost Summary */}
              <div className="p-4 rounded-xl bg-zinc-800/30 border border-white/5">
                <h3 className="text-xs font-medium text-zinc-400 uppercase tracking-wider mb-3">
                  Cost Summary
                </h3>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-zinc-400">Duration</span>
                    <span className="text-white">{duration}s</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-zinc-400">Audio</span>
                    <span className="text-white">{withAudio ? 'Yes (+$0.20/s)' : 'No'}</span>
                  </div>
                  <div className="border-t border-white/5 pt-2 mt-2">
                    <div className="flex justify-between">
                      <span className="text-zinc-300 font-medium">Total</span>
                      <div className="text-right">
                        <span className="text-amber-400 font-bold">{creditCost} credits</span>
                        <p className="text-xs text-zinc-500">${calculateCost(duration, withAudio).dollars.toFixed(2)}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Tips */}
              <div className="p-3 rounded-xl bg-zinc-800/30 border border-white/5">
                <h4 className="text-xs font-medium text-zinc-400 mb-2">Tips for best results:</h4>
                <ul className="text-xs text-zinc-500 space-y-1">
                  <li>- Use high-quality, well-lit photos</li>
                  <li>- Ensure clear view of the space</li>
                  <li>- Camera should be level</li>
                  <li>- Avoid photos with people</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Export with AssetProvider wrapper
export const PropertyRevealTool: React.FC = () => {
  return (
    <AssetProvider>
      <PropertyRevealToolInner />
    </AssetProvider>
  );
};
