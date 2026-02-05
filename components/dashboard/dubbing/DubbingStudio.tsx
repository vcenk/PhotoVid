import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Upload,
  Plus,
  ChevronDown,
  Sparkles,
  FileVideo,
  Play,
  Globe,
  Languages,
  Loader2,
  Check,
  Download,
  Clock,
  Users,
  Wand2,
  Home,
  Building2,
  Star,
  ArrowRight,
  Volume2,
  RefreshCw,
  X,
  AlertCircle,
  Link,
} from 'lucide-react';
import { DUBBING_LANGUAGES, getSortedLanguages, DubbingLanguage } from '../../../lib/data/dubbing-languages';
import {
  createDubbing,
  checkDubbingStatus,
  downloadDubbedContent,
  uploadVideoForDubbing,
  waitForDubbing,
  DubbingStatus,
} from '../../../lib/api/dubbing';
import { uploadToR2 } from '../../../lib/api/r2';

// Sample video for demo
const SAMPLE_VIDEO = 'https://cdn.coverr.co/videos/coverr-woman-talking-4958/1080p.mp4';

type DubbingState = 'idle' | 'uploading' | 'processing' | 'complete' | 'error';
type InputMode = 'file' | 'url';

export const DubbingStudio: React.FC = () => {
  // Input mode
  const [inputMode, setInputMode] = useState<InputMode>('file');

  // File states
  const [uploadedVideo, setUploadedVideo] = useState<File | null>(null);
  const [videoPreviewUrl, setVideoPreviewUrl] = useState<string | null>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  // URL state
  const [videoUrl, setVideoUrl] = useState<string>('');

  // Language states
  const [sourceLanguage, setSourceLanguage] = useState<DubbingLanguage | null>(null); // null = auto-detect
  const [targetLanguage, setTargetLanguage] = useState<DubbingLanguage>(DUBBING_LANGUAGES[1]); // Default to Spanish
  const [isSourceDropdownOpen, setIsSourceDropdownOpen] = useState(false);
  const [isTargetDropdownOpen, setIsTargetDropdownOpen] = useState(false);

  // Processing states
  const [dubbingState, setDubbingState] = useState<DubbingState>('idle');
  const [dubbingId, setDubbingId] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [resultUrl, setResultUrl] = useState<string | null>(null);

  // Slider for comparison
  const [sliderPosition, setSliderPosition] = useState(50);

  const sortedLanguages = getSortedLanguages();

  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedVideo(file);
      setVideoPreviewUrl(URL.createObjectURL(file));
      setDubbingState('idle');
      setError(null);
      setResultUrl(null);
    }
  };

  const handleRemoveVideo = () => {
    if (videoPreviewUrl && !videoPreviewUrl.startsWith('http')) {
      URL.revokeObjectURL(videoPreviewUrl);
    }
    setUploadedVideo(null);
    setVideoPreviewUrl(null);
    setVideoUrl('');
    setDubbingState('idle');
    setError(null);
    setResultUrl(null);
    if (videoInputRef.current) {
      videoInputRef.current.value = '';
    }
  };

  const handleUrlChange = (url: string) => {
    setVideoUrl(url);
    if (url && isValidUrl(url)) {
      setVideoPreviewUrl(url);
    } else {
      setVideoPreviewUrl(null);
    }
    setDubbingState('idle');
    setError(null);
    setResultUrl(null);
  };

  const isValidUrl = (url: string): boolean => {
    try {
      new URL(url);
      return url.startsWith('http://') || url.startsWith('https://');
    } catch {
      return false;
    }
  };

  const handleStartDubbing = async () => {
    const hasVideo = inputMode === 'file' ? uploadedVideo : (videoUrl && isValidUrl(videoUrl));
    if (!hasVideo) return;

    setDubbingState('uploading');
    setProgress(0);
    setError(null);

    try {
      let finalVideoUrl: string;

      if (inputMode === 'file' && uploadedVideo) {
        // Upload video to R2
        setProgress(10);
        finalVideoUrl = await uploadToR2(uploadedVideo, 'dubbing-inputs');
        setProgress(30);
      } else {
        // Use URL directly
        finalVideoUrl = videoUrl;
        setProgress(30);
      }

      // 2. Create dubbing project
      setDubbingState('processing');
      const result = await createDubbing(finalVideoUrl, {
        sourceLanguage: sourceLanguage?.code,
        targetLanguage: targetLanguage.code,
        preserveOriginalVoice: true,
      });

      setDubbingId(result.dubbingId);
      setProgress(40);

      // 3. Poll for completion
      await waitForDubbing(
        result.dubbingId,
        (status) => {
          // Update progress based on status
          if (status.status === 'dubbing') {
            setProgress(prev => Math.min(prev + 5, 90));
          }
        },
        600000 // 10 minutes max
      );

      setProgress(95);

      // 4. Download result
      const downloadResult = await downloadDubbedContent(result.dubbingId, targetLanguage.code);

      // Convert base64 to blob URL
      const binaryString = atob(downloadResult.data);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      const blob = new Blob([bytes], { type: downloadResult.contentType });
      const url = URL.createObjectURL(blob);

      setResultUrl(url);
      setProgress(100);
      setDubbingState('complete');
    } catch (err: any) {
      console.error('Dubbing error:', err);
      setError(err.message || 'Dubbing failed. Please try again.');
      setDubbingState('error');
    }
  };

  const handleDownloadResult = () => {
    if (!resultUrl) return;

    const a = document.createElement('a');
    a.href = resultUrl;
    a.download = `dubbed-${targetLanguage.code}-${Date.now()}.mp4`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const hasVideoSource = inputMode === 'file' ? uploadedVideo : (videoUrl && isValidUrl(videoUrl));
  const isFormValid = hasVideoSource && targetLanguage;

  return (
    <div className="flex h-full bg-white dark:bg-[#09090b]">
      {/* Left Panel - Controls */}
      <div className="w-[360px] bg-white dark:bg-zinc-950 border-r border-zinc-200 dark:border-zinc-800 flex flex-col shrink-0">
        {/* Header */}
        <div className="p-5 border-b border-zinc-100 dark:border-zinc-800">
          <h2 className="text-lg font-bold text-zinc-900 dark:text-white flex items-center gap-2">
            <Languages className="text-violet-600" size={20} />
            AI Dubbing Studio
          </h2>
          <p className="text-xs text-zinc-500 mt-1">Translate videos to any language with voice cloning</p>
        </div>

        {/* Form Controls */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {/* Video Source */}
          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-2">
              Video Source
            </label>

            {/* Input Mode Toggle */}
            <div className="flex gap-1 p-1 bg-zinc-100 dark:bg-zinc-800 rounded-lg mb-3">
              <button
                onClick={() => {
                  setInputMode('file');
                  setVideoUrl('');
                }}
                disabled={dubbingState !== 'idle'}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-md text-xs font-medium transition-colors ${
                  inputMode === 'file'
                    ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white shadow-sm'
                    : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
                }`}
              >
                <Upload size={14} />
                Upload
              </button>
              <button
                onClick={() => {
                  setInputMode('url');
                  setUploadedVideo(null);
                  if (videoPreviewUrl && !videoPreviewUrl.startsWith('http')) {
                    URL.revokeObjectURL(videoPreviewUrl);
                  }
                  setVideoPreviewUrl(null);
                }}
                disabled={dubbingState !== 'idle'}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-md text-xs font-medium transition-colors ${
                  inputMode === 'url'
                    ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white shadow-sm'
                    : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
                }`}
              >
                <Link size={14} />
                URL
              </button>
            </div>

            {/* File Upload Mode */}
            {inputMode === 'file' && (
              <div
                className={`relative border-2 border-dashed rounded-xl transition-colors ${
                  uploadedVideo
                    ? 'border-violet-400 dark:border-violet-600 bg-violet-50/50 dark:bg-violet-950/30'
                    : 'border-zinc-300 dark:border-zinc-700 hover:border-violet-400 dark:hover:border-violet-600'
                } ${dubbingState !== 'idle' ? 'pointer-events-none opacity-60' : ''}`}
              >
                <input
                  ref={videoInputRef}
                  type="file"
                  accept="video/*"
                  onChange={handleVideoUpload}
                  className="hidden"
                  id="video-upload"
                  disabled={dubbingState !== 'idle'}
                />

                {uploadedVideo ? (
                  <div className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="w-20 h-14 rounded-lg overflow-hidden bg-zinc-900 flex-shrink-0">
                        {videoPreviewUrl && (
                          <video src={videoPreviewUrl} className="w-full h-full object-cover" muted />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-zinc-900 dark:text-white truncate">
                          {uploadedVideo.name}
                        </p>
                        <p className="text-xs text-zinc-500 mt-0.5">
                          {(uploadedVideo.size / (1024 * 1024)).toFixed(1)} MB
                        </p>
                      </div>
                      {dubbingState === 'idle' && (
                        <button
                          onClick={handleRemoveVideo}
                          className="p-1.5 rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors"
                        >
                          <X size={16} className="text-zinc-500" />
                        </button>
                      )}
                    </div>
                  </div>
                ) : (
                  <label htmlFor="video-upload" className="cursor-pointer block p-6">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-violet-100 dark:bg-violet-900/50 flex items-center justify-center">
                        <FileVideo size={24} className="text-violet-600" />
                      </div>
                      <div className="text-center">
                        <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                          Upload your video
                        </p>
                        <p className="text-xs text-zinc-500 mt-1">MP4, MOV, WebM up to 500MB</p>
                      </div>
                    </div>
                  </label>
                )}
              </div>
            )}

            {/* URL Input Mode */}
            {inputMode === 'url' && (
              <div className={dubbingState !== 'idle' ? 'pointer-events-none opacity-60' : ''}>
                <div className="relative">
                  <input
                    type="url"
                    value={videoUrl}
                    onChange={(e) => handleUrlChange(e.target.value)}
                    placeholder="https://example.com/video.mp4"
                    disabled={dubbingState !== 'idle'}
                    className="w-full px-3 py-3 pl-10 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm text-zinc-900 dark:text-white placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400 dark:focus:border-violet-600"
                  />
                  <Link size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                  {videoUrl && (
                    <button
                      onClick={() => handleUrlChange('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded hover:bg-zinc-100 dark:hover:bg-zinc-800"
                    >
                      <X size={14} className="text-zinc-400" />
                    </button>
                  )}
                </div>

                {/* URL Preview */}
                {videoUrl && isValidUrl(videoUrl) && (
                  <div className="mt-3 rounded-xl overflow-hidden border border-zinc-200 dark:border-zinc-700 bg-zinc-900">
                    <video
                      src={videoUrl}
                      className="w-full h-32 object-cover"
                      muted
                      onError={() => setError('Could not load video from URL')}
                    />
                  </div>
                )}

                {videoUrl && !isValidUrl(videoUrl) && (
                  <p className="text-xs text-red-500 mt-2">Please enter a valid video URL</p>
                )}

                <p className="text-xs text-zinc-500 mt-2">
                  Supports direct video URLs (MP4, WebM, MOV)
                </p>
              </div>
            )}
          </div>

          {/* Source Language */}
          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-2 flex items-center gap-1.5">
              <Globe size={12} className="text-violet-500" />
              Source Language
            </label>
            <div className="relative">
              <button
                onClick={() => setIsSourceDropdownOpen(!isSourceDropdownOpen)}
                disabled={dubbingState !== 'idle'}
                className="w-full flex items-center justify-between px-3 py-2.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl hover:border-violet-300 dark:hover:border-violet-600 transition-colors disabled:opacity-60"
              >
                <div className="flex items-center gap-2">
                  {sourceLanguage ? (
                    <>
                      <span className="text-lg">{sourceLanguage.flag}</span>
                      <span className="font-medium text-zinc-900 dark:text-white text-sm">
                        {sourceLanguage.name}
                      </span>
                    </>
                  ) : (
                    <>
                      <Wand2 size={16} className="text-violet-500" />
                      <span className="font-medium text-zinc-900 dark:text-white text-sm">
                        Auto-detect
                      </span>
                    </>
                  )}
                </div>
                <ChevronDown
                  size={16}
                  className={`text-zinc-400 transition-transform ${isSourceDropdownOpen ? 'rotate-180' : ''}`}
                />
              </button>

              <AnimatePresence>
                {isSourceDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute top-full mt-2 w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl shadow-xl z-50 overflow-hidden max-h-64 overflow-y-auto"
                  >
                    <button
                      onClick={() => {
                        setSourceLanguage(null);
                        setIsSourceDropdownOpen(false);
                      }}
                      className={`w-full px-3 py-2.5 text-left hover:bg-violet-50 dark:hover:bg-violet-950/50 transition-colors flex items-center gap-2 border-b border-zinc-100 dark:border-zinc-800 ${
                        !sourceLanguage ? 'bg-violet-50 dark:bg-violet-950/50' : ''
                      }`}
                    >
                      <Wand2 size={16} className="text-violet-500" />
                      <span className="text-sm text-zinc-900 dark:text-white">Auto-detect</span>
                      {!sourceLanguage && <Check size={14} className="text-violet-600 ml-auto" />}
                    </button>
                    {sortedLanguages.map((lang) => (
                      <button
                        key={lang.code}
                        onClick={() => {
                          setSourceLanguage(lang);
                          setIsSourceDropdownOpen(false);
                        }}
                        className={`w-full px-3 py-2 text-left hover:bg-violet-50 dark:hover:bg-violet-950/50 transition-colors flex items-center gap-2 ${
                          sourceLanguage?.code === lang.code ? 'bg-violet-50 dark:bg-violet-950/50' : ''
                        }`}
                      >
                        <span className="text-lg">{lang.flag}</span>
                        <span className="text-sm text-zinc-900 dark:text-white">{lang.name}</span>
                        {sourceLanguage?.code === lang.code && (
                          <Check size={14} className="text-violet-600 ml-auto" />
                        )}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Target Language */}
          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-2 flex items-center gap-1.5">
              <Languages size={12} className="text-violet-500" />
              Translate To
            </label>
            <div className="relative">
              <button
                onClick={() => setIsTargetDropdownOpen(!isTargetDropdownOpen)}
                disabled={dubbingState !== 'idle'}
                className="w-full flex items-center justify-between px-3 py-2.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl hover:border-violet-300 dark:hover:border-violet-600 transition-colors disabled:opacity-60"
              >
                <div className="flex items-center gap-2">
                  <span className="text-lg">{targetLanguage.flag}</span>
                  <div className="text-left">
                    <div className="font-medium text-zinc-900 dark:text-white text-sm">
                      {targetLanguage.name}
                    </div>
                    <div className="text-xs text-zinc-500">{targetLanguage.nativeName}</div>
                  </div>
                </div>
                <ChevronDown
                  size={16}
                  className={`text-zinc-400 transition-transform ${isTargetDropdownOpen ? 'rotate-180' : ''}`}
                />
              </button>

              <AnimatePresence>
                {isTargetDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute top-full mt-2 w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl shadow-xl z-50 overflow-hidden max-h-64 overflow-y-auto"
                  >
                    {sortedLanguages.map((lang) => (
                      <button
                        key={lang.code}
                        onClick={() => {
                          setTargetLanguage(lang);
                          setIsTargetDropdownOpen(false);
                        }}
                        className={`w-full px-3 py-2.5 text-left hover:bg-violet-50 dark:hover:bg-violet-950/50 transition-colors flex items-center gap-2 ${
                          targetLanguage.code === lang.code ? 'bg-violet-50 dark:bg-violet-950/50' : ''
                        }`}
                      >
                        <span className="text-lg">{lang.flag}</span>
                        <div className="flex-1">
                          <div className="text-sm font-medium text-zinc-900 dark:text-white">
                            {lang.name}
                          </div>
                          <div className="text-xs text-zinc-500">{lang.nativeName}</div>
                        </div>
                        {targetLanguage.code === lang.code && (
                          <Check size={14} className="text-violet-600" />
                        )}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800/50">
              <div className="flex items-start gap-2">
                <AlertCircle size={16} className="text-red-600 dark:text-red-400 mt-0.5 shrink-0" />
                <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
              </div>
            </div>
          )}

          {/* Progress Indicator */}
          {(dubbingState === 'uploading' || dubbingState === 'processing') && (
            <div className="p-4 rounded-xl bg-violet-50 dark:bg-violet-950/30 border border-violet-200 dark:border-violet-800/50">
              <div className="flex items-center gap-3 mb-3">
                <Loader2 size={18} className="text-violet-600 animate-spin" />
                <span className="text-sm font-medium text-violet-700 dark:text-violet-300">
                  {dubbingState === 'uploading' ? 'Uploading video...' : 'Translating audio...'}
                </span>
              </div>
              <div className="w-full bg-violet-200 dark:bg-violet-800/50 rounded-full h-2">
                <motion.div
                  className="bg-violet-600 h-2 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
              <p className="text-xs text-violet-600 dark:text-violet-400 mt-2 text-center">
                {progress}% complete
              </p>
            </div>
          )}

          {/* Result */}
          {dubbingState === 'complete' && resultUrl && (
            <div className="p-4 rounded-xl bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800/50">
              <div className="flex items-center gap-2 mb-3">
                <Check size={18} className="text-green-600 dark:text-green-400" />
                <span className="text-sm font-medium text-green-700 dark:text-green-300">
                  Dubbing Complete!
                </span>
              </div>
              <video
                src={resultUrl}
                controls
                className="w-full rounded-lg mb-3"
                style={{ maxHeight: '200px' }}
              />
              <button
                onClick={handleDownloadResult}
                className="w-full py-2.5 rounded-xl bg-green-600 hover:bg-green-700 text-white font-medium text-sm flex items-center justify-center gap-2 transition-colors"
              >
                <Download size={16} />
                Download Dubbed Video
              </button>
            </div>
          )}
        </div>

        {/* Footer - Generate Button */}
        <div className="p-5 border-t border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-950">
          <button
            onClick={handleStartDubbing}
            disabled={!isFormValid || dubbingState !== 'idle'}
            className={`
              w-full py-3.5 rounded-xl font-bold text-white text-sm uppercase tracking-wider transition-all flex items-center justify-center gap-2
              ${
                isFormValid && dubbingState === 'idle'
                  ? 'bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 active:scale-[0.98] shadow-lg shadow-violet-500/25'
                  : 'bg-zinc-300 dark:bg-zinc-700 cursor-not-allowed'
              }
            `}
          >
            {dubbingState === 'idle' ? (
              <>
                <Sparkles size={16} />
                Start Dubbing
              </>
            ) : dubbingState === 'uploading' ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Uploading...
              </>
            ) : dubbingState === 'processing' ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Processing...
              </>
            ) : dubbingState === 'complete' ? (
              <>
                <Check size={16} />
                Complete
              </>
            ) : (
              <>
                <RefreshCw size={16} />
                Try Again
              </>
            )}
          </button>
          <p className="text-center text-[10px] text-zinc-500 mt-2">
            Voice cloning preserves speaker identity
          </p>
        </div>
      </div>

      {/* Right Panel - Main Content */}
      <div className="flex-1 overflow-y-auto bg-white dark:bg-[#09090b] p-8">
        <div className="max-w-5xl mx-auto space-y-8">
          {/* Hero Section */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-violet-50 dark:bg-violet-950/50 text-violet-700 dark:text-violet-300 rounded-full text-sm font-semibold mb-4">
              <Languages size={16} />
              AI Video Dubbing
            </div>
            <h1 className="text-3xl font-bold text-zinc-900 dark:text-white mb-3">
              Translate Videos to Any Language
            </h1>
            <p className="text-zinc-600 dark:text-zinc-400 text-base max-w-2xl mx-auto">
              Upload your video and let AI translate it while
              <span className="font-semibold text-zinc-800 dark:text-zinc-200"> preserving your voice</span>.
              Perfect for reaching
              <span className="font-semibold text-zinc-800 dark:text-zinc-200">
                {' '}
                international clients
              </span>
              .
            </p>
          </div>

          {/* How It Works */}
          <div className="bg-gradient-to-br from-violet-50 to-purple-50 dark:from-violet-950/30 dark:to-purple-950/30 rounded-2xl p-6 border border-violet-200 dark:border-violet-800/50">
            <h2 className="text-lg font-bold text-zinc-900 dark:text-white mb-4 flex items-center gap-2">
              <Wand2 size={18} className="text-violet-600" />
              How AI Dubbing Works
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {[
                { step: '1', title: 'Upload', desc: 'Upload your video file', icon: Upload },
                { step: '2', title: 'Transcribe', desc: 'AI transcribes the audio', icon: Volume2 },
                { step: '3', title: 'Translate', desc: 'Text translated to target language', icon: Languages },
                { step: '4', title: 'Clone & Sync', desc: 'Your voice cloned in new language', icon: Sparkles },
              ].map((item, i) => (
                <div key={item.step} className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-violet-600 text-white font-bold flex items-center justify-center shrink-0">
                    {item.step}
                  </div>
                  <div>
                    <h3 className="font-semibold text-zinc-900 dark:text-white text-sm">{item.title}</h3>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Demo Video Comparison */}
          <div className="bg-gradient-to-br from-zinc-50 to-violet-50/30 dark:from-zinc-900 dark:to-violet-950/30 rounded-2xl p-6 border border-zinc-200 dark:border-zinc-800">
            <h2 className="text-lg font-bold text-zinc-900 dark:text-white mb-4 flex items-center gap-2">
              <Play size={18} className="text-violet-600" />
              See the Magic
            </h2>
            <div className="relative rounded-xl overflow-hidden aspect-video bg-zinc-900">
              {/* Before */}
              <div
                className="absolute inset-0"
                style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}
              >
                <video
                  autoPlay
                  muted
                  loop
                  playsInline
                  className="w-full h-full object-cover"
                  src={SAMPLE_VIDEO}
                />
                <div className="absolute top-4 left-4 px-3 py-1 bg-white/90 rounded-full text-xs font-bold">
                  ORIGINAL
                </div>
              </div>

              {/* After */}
              <div
                className="absolute inset-0"
                style={{ clipPath: `inset(0 0 0 ${sliderPosition}%)` }}
              >
                <video
                  autoPlay
                  muted
                  loop
                  playsInline
                  className="w-full h-full object-cover"
                  src={SAMPLE_VIDEO}
                />
                <div className="absolute top-4 right-4 px-3 py-1 bg-violet-600 text-white rounded-full text-xs font-bold">
                  DUBBED
                </div>
              </div>

              {/* Slider */}
              <div
                className="absolute inset-y-0 w-1 bg-white cursor-ew-resize shadow-lg"
                style={{ left: `${sliderPosition}%` }}
              >
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-white rounded-full shadow-lg flex items-center justify-center">
                  <div className="flex gap-0.5">
                    <div className="w-0.5 h-3 bg-zinc-400 rounded-full" />
                    <div className="w-0.5 h-3 bg-zinc-400 rounded-full" />
                  </div>
                </div>
              </div>

              <input
                type="range"
                min="0"
                max="100"
                value={sliderPosition}
                onChange={(e) => setSliderPosition(Number(e.target.value))}
                className="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize"
              />
            </div>
            <p className="text-center text-xs text-zinc-500 mt-3">
              Drag slider to compare original vs dubbed
            </p>
          </div>

          {/* Language Grid */}
          <div>
            <h2 className="text-lg font-bold text-zinc-900 dark:text-white mb-4 flex items-center gap-2">
              <Globe size={18} className="text-violet-600" />
              29+ Languages Supported
            </h2>
            <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
              {DUBBING_LANGUAGES.slice(0, 16).map((lang) => (
                <motion.button
                  key={lang.code}
                  whileHover={{ scale: 1.05 }}
                  onClick={() => {
                    setTargetLanguage(lang);
                  }}
                  className={`bg-white dark:bg-zinc-900 rounded-xl p-3 border text-center transition-colors cursor-pointer ${
                    targetLanguage.code === lang.code
                      ? 'border-violet-400 dark:border-violet-600 ring-2 ring-violet-200 dark:ring-violet-800'
                      : 'border-zinc-200 dark:border-zinc-800 hover:border-violet-300 dark:hover:border-violet-600'
                  }`}
                >
                  <span className="text-2xl mb-1 block">{lang.flag}</span>
                  <span className="text-xs font-medium text-zinc-700 dark:text-zinc-300">{lang.name}</span>
                </motion.button>
              ))}
            </div>
          </div>

          {/* Use Cases */}
          <div className="bg-zinc-50 dark:bg-zinc-900 rounded-2xl p-6 border border-zinc-200 dark:border-zinc-800">
            <h3 className="font-bold text-zinc-900 dark:text-white mb-4">Perfect For Real Estate</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-violet-100 dark:bg-violet-900/50 flex items-center justify-center shrink-0">
                  <Home size={18} className="text-violet-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-zinc-900 dark:text-white text-sm">Property Tours</h4>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                    Create multilingual property walkthrough videos
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-violet-100 dark:bg-violet-900/50 flex items-center justify-center shrink-0">
                  <Users size={18} className="text-violet-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-zinc-900 dark:text-white text-sm">
                    International Buyers
                  </h4>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                    Reach clients in their native language
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-violet-100 dark:bg-violet-900/50 flex items-center justify-center shrink-0">
                  <Star size={18} className="text-violet-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-zinc-900 dark:text-white text-sm">
                    Personal Touch
                  </h4>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                    Your voice, cloned perfectly in any language
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
