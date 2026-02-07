import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText,
  Wand2,
  Image as ImageIcon,
  Video,
  Download,
  ArrowRight,
  ArrowLeft,
  Loader2,
  Check,
  AlertCircle,
  Sparkles,
  Play,
  RefreshCw,
  Eye,
} from 'lucide-react';
import { PropertyData, Scene } from '@/lib/types/storyboard';
import { generateScenesFromDescription } from '@/lib/api/sceneGenerator';
import { useStoryboard } from '@/lib/store/contexts/StoryboardContext';
import { useCredits } from '@/lib/store/contexts/CreditsContext';

type WizardStep = 'input' | 'scenes' | 'images' | 'videos' | 'complete';

interface GeneratedScene extends Scene {
  generatedImageUrl?: string;
  imageStatus?: 'pending' | 'generating' | 'completed' | 'failed';
  videoStatus?: 'pending' | 'generating' | 'completed' | 'failed';
}

interface TextToVideoWizardProps {
  onComplete?: (storyboardId: string) => void;
  onCancel?: () => void;
}

export const TextToVideoWizard: React.FC<TextToVideoWizardProps> = ({
  onComplete,
  onCancel,
}) => {
  const { createStoryboardWithAutoScenes, storyboard } = useStoryboard();
  const { balance, hasEnoughCredits } = useCredits();

  const [step, setStep] = useState<WizardStep>('input');
  const [description, setDescription] = useState('');
  const [propertyData, setPropertyData] = useState<Partial<PropertyData>>({
    propertyType: 'house',
    style: 'modern',
  });
  const [scenes, setScenes] = useState<GeneratedScene[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState({ current: 0, total: 0, status: '' });

  // Step 1: Generate scenes from description
  const handleGenerateScenes = useCallback(async () => {
    if (!description.trim()) return;

    setIsProcessing(true);
    setError(null);

    try {
      const result = await generateScenesFromDescription(description, propertyData);

      const generatedScenes: GeneratedScene[] = result.scenes.map(scene => ({
        ...scene,
        imageStatus: 'pending',
        videoStatus: 'pending',
      }));

      setScenes(generatedScenes);
      setStep('scenes');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate scenes');
    } finally {
      setIsProcessing(false);
    }
  }, [description, propertyData]);

  // Step 2: Generate images for all scenes (text-to-image)
  const handleGenerateImages = useCallback(async () => {
    setIsProcessing(true);
    setProgress({ current: 0, total: scenes.length, status: 'Starting image generation...' });
    setError(null);

    try {
      // In production, this would call FAL AI text-to-image for each scene
      // For now, we'll simulate the process
      for (let i = 0; i < scenes.length; i++) {
        setProgress({
          current: i + 1,
          total: scenes.length,
          status: `Generating image ${i + 1} of ${scenes.length}: ${scenes[i].room || 'Scene'}`,
        });

        // Update scene status
        setScenes(prev => prev.map((s, idx) =>
          idx === i ? { ...s, imageStatus: 'generating' as const } : s
        ));

        // Simulate API call delay (in production, call FAL text-to-image)
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Mark as completed with placeholder
        setScenes(prev => prev.map((s, idx) =>
          idx === i
            ? {
                ...s,
                imageStatus: 'completed' as const,
                generatedImageUrl: `https://placehold.co/1920x1080/1a1a1a/violet?text=${encodeURIComponent(s.room || `Scene ${idx + 1}`)}`,
              }
            : s
        ));
      }

      setStep('images');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate images');
    } finally {
      setIsProcessing(false);
    }
  }, [scenes]);

  // Step 3: Generate videos from images
  const handleGenerateVideos = useCallback(async () => {
    const scenesWithImages = scenes.filter(s => s.imageStatus === 'completed');
    if (scenesWithImages.length === 0) {
      setError('No images to convert to video');
      return;
    }

    setIsProcessing(true);
    setProgress({ current: 0, total: scenesWithImages.length, status: 'Starting video generation...' });
    setError(null);

    try {
      for (let i = 0; i < scenesWithImages.length; i++) {
        const scene = scenesWithImages[i];
        setProgress({
          current: i + 1,
          total: scenesWithImages.length,
          status: `Generating video ${i + 1} of ${scenesWithImages.length}: ${scene.room || 'Scene'}`,
        });

        // Update scene status
        setScenes(prev => prev.map(s =>
          s.id === scene.id ? { ...s, videoStatus: 'generating' as const } : s
        ));

        // Simulate API call (in production, call FAL image-to-video)
        await new Promise(resolve => setTimeout(resolve, 3000));

        // Mark as completed
        setScenes(prev => prev.map(s =>
          s.id === scene.id
            ? {
                ...s,
                videoStatus: 'completed' as const,
                videoUrl: 'https://sample-videos.com/video321/mp4/720/big_buck_bunny_720p_1mb.mp4',
              }
            : s
        ));
      }

      setStep('videos');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate videos');
    } finally {
      setIsProcessing(false);
    }
  }, [scenes]);

  // Create final storyboard
  const handleCreateStoryboard = useCallback(() => {
    const address = propertyData.address || 'Property Tour';
    createStoryboardWithAutoScenes(address, propertyData as PropertyData);
    setStep('complete');
    if (onComplete && storyboard) {
      onComplete(storyboard.id);
    }
  }, [propertyData, createStoryboardWithAutoScenes, storyboard, onComplete]);

  // Calculate estimated credits
  const estimatedCredits = {
    images: scenes.length * 1, // 1 credit per image
    videos: scenes.length * 5, // 5 credits per video
    total: scenes.length * 6,
  };

  const renderStepIndicator = () => {
    const steps: { id: WizardStep; label: string; icon: React.ReactNode }[] = [
      { id: 'input', label: 'Description', icon: <FileText size={16} /> },
      { id: 'scenes', label: 'Scenes', icon: <Wand2 size={16} /> },
      { id: 'images', label: 'Images', icon: <ImageIcon size={16} /> },
      { id: 'videos', label: 'Videos', icon: <Video size={16} /> },
      { id: 'complete', label: 'Complete', icon: <Check size={16} /> },
    ];

    const currentIndex = steps.findIndex(s => s.id === step);

    return (
      <div className="flex items-center justify-center gap-2 mb-8">
        {steps.map((s, index) => (
          <React.Fragment key={s.id}>
            <div
              className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                index <= currentIndex
                  ? 'bg-emerald-500/20 text-emerald-400'
                  : 'bg-white/5 text-zinc-500'
              }`}
            >
              {index < currentIndex ? (
                <Check size={16} className="text-green-400" />
              ) : (
                s.icon
              )}
              <span className="text-xs font-medium hidden sm:inline">{s.label}</span>
            </div>
            {index < steps.length - 1 && (
              <div className={`w-8 h-0.5 ${index < currentIndex ? 'bg-emerald-500' : 'bg-white/10'}`} />
            )}
          </React.Fragment>
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-full flex flex-col">
      {/* Header */}
      <div className="px-6 py-4 border-b border-white/5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-white">Text-to-Video Wizard</h2>
            <p className="text-xs text-zinc-400">Generate a complete property video from a description</p>
          </div>
          {onCancel && (
            <button
              onClick={onCancel}
              className="text-xs text-zinc-400 hover:text-white"
            >
              Cancel
            </button>
          )}
        </div>
      </div>

      {/* Step Indicator */}
      <div className="px-6 pt-6">
        {renderStepIndicator()}
      </div>

      {/* Content */}
      <div className="flex-1 px-6 pb-6 overflow-y-auto">
        <AnimatePresence mode="wait">
          {/* Step 1: Description Input */}
          {step === 'input' && (
            <motion.div
              key="input"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="max-w-2xl mx-auto"
            >
              <div className="text-center mb-6">
                <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 flex items-center justify-center mx-auto mb-4">
                  <FileText size={28} className="text-emerald-400" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">Enter Property Description</h3>
                <p className="text-sm text-zinc-400">
                  Paste your MLS listing or describe the property. AI will generate an optimized scene list.
                </p>
              </div>

              <div className="space-y-4">
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Example: Beautiful 4 bedroom, 3 bathroom modern farmhouse with an open concept living area, gourmet kitchen with quartz countertops, luxurious master suite, private backyard with pool, and 3-car garage. Features include hardwood floors throughout, smart home technology, and energy-efficient appliances..."
                  rows={8}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
                />

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-medium text-zinc-400 uppercase tracking-wide mb-2 block">
                      Property Type
                    </label>
                    <select
                      value={propertyData.propertyType}
                      onChange={(e) => setPropertyData(prev => ({ ...prev, propertyType: e.target.value as any }))}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    >
                      <option value="house">Single Family Home</option>
                      <option value="condo">Condominium</option>
                      <option value="apartment">Apartment</option>
                      <option value="townhouse">Townhouse</option>
                      <option value="luxury">Luxury Estate</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-zinc-400 uppercase tracking-wide mb-2 block">
                      Style
                    </label>
                    <select
                      value={propertyData.style}
                      onChange={(e) => setPropertyData(prev => ({ ...prev, style: e.target.value }))}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    >
                      <option value="modern">Modern</option>
                      <option value="traditional">Traditional</option>
                      <option value="contemporary">Contemporary</option>
                      <option value="farmhouse">Farmhouse</option>
                      <option value="coastal">Coastal</option>
                      <option value="luxury">Luxury</option>
                    </select>
                  </div>
                </div>

                {error && (
                  <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 flex items-center gap-2 text-red-400 text-sm">
                    <AlertCircle size={16} />
                    {error}
                  </div>
                )}

                <button
                  onClick={handleGenerateScenes}
                  disabled={!description.trim() || isProcessing}
                  className={`w-full py-4 rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-2 ${
                    description.trim() && !isProcessing
                      ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                      : 'bg-white/5 text-zinc-600 cursor-not-allowed'
                  }`}
                >
                  {isProcessing ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      Analyzing description...
                    </>
                  ) : (
                    <>
                      <Sparkles size={18} />
                      Generate Scene List
                      <ArrowRight size={18} />
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          )}

          {/* Step 2: Review Scenes */}
          {step === 'scenes' && (
            <motion.div
              key="scenes"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="max-w-3xl mx-auto"
            >
              <div className="text-center mb-6">
                <h3 className="text-xl font-semibold text-white mb-2">Review Generated Scenes</h3>
                <p className="text-sm text-zinc-400">
                  {scenes.length} scenes generated. Review and proceed to image generation.
                </p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
                {scenes.map((scene, index) => (
                  <div
                    key={scene.id}
                    className="p-4 rounded-xl bg-white/5 border border-white/10"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <span className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-xs font-semibold">
                        {index + 1}
                      </span>
                      <span className="text-sm font-medium text-white capitalize">
                        {scene.room?.replace(/-/g, ' ') || `Scene ${index + 1}`}
                      </span>
                    </div>
                    <div className="text-xs text-zinc-500 space-y-1">
                      <div>Type: {scene.type}</div>
                      <div>Motion: {scene.motionStyle}</div>
                      <div>Duration: {scene.duration}s</div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 mb-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-white">Estimated Credits</span>
                  <span className="text-sm text-zinc-400">Your balance: {balance}</span>
                </div>
                <div className="text-xs text-zinc-400 space-y-1">
                  <div className="flex justify-between">
                    <span>Image generation ({scenes.length} scenes)</span>
                    <span>{estimatedCredits.images} credits</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Video generation ({scenes.length} scenes)</span>
                    <span>{estimatedCredits.videos} credits</span>
                  </div>
                  <div className="flex justify-between border-t border-white/10 pt-1 mt-1 text-white font-medium">
                    <span>Total</span>
                    <span>{estimatedCredits.total} credits</span>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setStep('input')}
                  className="px-6 py-3 rounded-xl font-medium text-sm bg-white/5 hover:bg-white/10 text-white flex items-center gap-2"
                >
                  <ArrowLeft size={16} />
                  Back
                </button>
                <button
                  onClick={handleGenerateImages}
                  disabled={isProcessing || !hasEnoughCredits('virtual-staging')}
                  className="flex-1 py-3 rounded-xl font-semibold text-sm bg-emerald-600 hover:bg-emerald-500 text-white flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      Generating images...
                    </>
                  ) : (
                    <>
                      <ImageIcon size={18} />
                      Generate Images
                      <ArrowRight size={18} />
                    </>
                  )}
                </button>
              </div>

              {isProcessing && (
                <div className="mt-4 p-4 rounded-xl bg-white/5 border border-white/10">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-white">{progress.status}</span>
                    <span className="text-sm text-zinc-400">{progress.current}/{progress.total}</span>
                  </div>
                  <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-500 transition-all"
                      style={{ width: `${(progress.current / progress.total) * 100}%` }}
                    />
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {/* Step 3: Review Images */}
          {step === 'images' && (
            <motion.div
              key="images"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="max-w-4xl mx-auto"
            >
              <div className="text-center mb-6">
                <h3 className="text-xl font-semibold text-white mb-2">Generated Images</h3>
                <p className="text-sm text-zinc-400">
                  Review the AI-generated images. Proceed to convert them to videos.
                </p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 mb-6">
                {scenes.map((scene, index) => (
                  <div
                    key={scene.id}
                    className="relative aspect-video rounded-xl overflow-hidden bg-zinc-900 border border-white/10"
                  >
                    {scene.generatedImageUrl ? (
                      <img
                        src={scene.generatedImageUrl}
                        alt={scene.room || `Scene ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Loader2 size={24} className="text-zinc-600 animate-spin" />
                      </div>
                    )}
                    <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/80 to-transparent">
                      <span className="text-xs text-white capitalize">
                        {scene.room?.replace(/-/g, ' ') || `Scene ${index + 1}`}
                      </span>
                    </div>
                    {scene.imageStatus === 'completed' && (
                      <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-green-500 flex items-center justify-center">
                        <Check size={12} className="text-white" />
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setStep('scenes')}
                  className="px-6 py-3 rounded-xl font-medium text-sm bg-white/5 hover:bg-white/10 text-white flex items-center gap-2"
                >
                  <ArrowLeft size={16} />
                  Back
                </button>
                <button
                  onClick={handleGenerateVideos}
                  disabled={isProcessing}
                  className="flex-1 py-3 rounded-xl font-semibold text-sm bg-emerald-600 hover:bg-emerald-500 text-white flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      Generating videos...
                    </>
                  ) : (
                    <>
                      <Video size={18} />
                      Generate Videos
                      <ArrowRight size={18} />
                    </>
                  )}
                </button>
              </div>

              {isProcessing && (
                <div className="mt-4 p-4 rounded-xl bg-white/5 border border-white/10">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-white">{progress.status}</span>
                    <span className="text-sm text-zinc-400">{progress.current}/{progress.total}</span>
                  </div>
                  <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-500 transition-all"
                      style={{ width: `${(progress.current / progress.total) * 100}%` }}
                    />
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {/* Step 4: Review Videos */}
          {step === 'videos' && (
            <motion.div
              key="videos"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="max-w-4xl mx-auto"
            >
              <div className="text-center mb-6">
                <h3 className="text-xl font-semibold text-white mb-2">Videos Generated!</h3>
                <p className="text-sm text-zinc-400">
                  All videos have been generated. Create your storyboard to arrange and export.
                </p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 mb-6">
                {scenes.map((scene, index) => (
                  <div
                    key={scene.id}
                    className="relative aspect-video rounded-xl overflow-hidden bg-zinc-900 border border-white/10 group"
                  >
                    {scene.generatedImageUrl && (
                      <img
                        src={scene.generatedImageUrl}
                        alt={scene.room || `Scene ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    )}
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="w-10 h-10 rounded-full bg-white/20 backdrop-blur flex items-center justify-center">
                        <Play size={20} className="text-white ml-0.5" />
                      </button>
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/80 to-transparent">
                      <span className="text-xs text-white capitalize">
                        {scene.room?.replace(/-/g, ' ') || `Scene ${index + 1}`}
                      </span>
                    </div>
                    {scene.videoStatus === 'completed' && (
                      <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-green-500 flex items-center justify-center">
                        <Check size={12} className="text-white" />
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setStep('images')}
                  className="px-6 py-3 rounded-xl font-medium text-sm bg-white/5 hover:bg-white/10 text-white flex items-center gap-2"
                >
                  <ArrowLeft size={16} />
                  Back
                </button>
                <button
                  onClick={handleCreateStoryboard}
                  className="flex-1 py-3 rounded-xl font-semibold text-sm bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white flex items-center justify-center gap-2"
                >
                  <Wand2 size={18} />
                  Create Storyboard
                  <ArrowRight size={18} />
                </button>
              </div>
            </motion.div>
          )}

          {/* Step 5: Complete */}
          {step === 'complete' && (
            <motion.div
              key="complete"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="max-w-md mx-auto text-center"
            >
              <div className="w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-6">
                <Check size={40} className="text-green-400" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">Storyboard Created!</h3>
              <p className="text-zinc-400 mb-8">
                Your property video storyboard has been created with {scenes.length} scenes.
              </p>

              <div className="space-y-3">
                <button
                  onClick={() => onComplete && storyboard && onComplete(storyboard.id)}
                  className="w-full py-3 rounded-xl font-semibold text-sm bg-emerald-600 hover:bg-emerald-500 text-white flex items-center justify-center gap-2"
                >
                  <Eye size={18} />
                  View Storyboard
                </button>
                <button
                  onClick={() => {
                    setStep('input');
                    setScenes([]);
                    setDescription('');
                  }}
                  className="w-full py-3 rounded-xl font-medium text-sm bg-white/5 hover:bg-white/10 text-white flex items-center justify-center gap-2"
                >
                  <RefreshCw size={18} />
                  Create Another
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
