import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Upload,
  ChevronDown,
  Sparkles,
  FileVideo,
  Play,
  Pause,
  Globe,
  Languages,
  Loader2,
  Check,
  Download,
  Volume2,
  X,
  AlertCircle,
  Link,
  Wand2,
  ArrowRight,
  RefreshCw,
  BookmarkPlus,
} from 'lucide-react';
import { DUBBING_LANGUAGES, getSortedLanguages, DubbingLanguage } from '../../../lib/data/dubbing-languages';
import {
  createDubbing,
  downloadDubbedContent,
  waitForDubbing,
} from '../../../lib/api/dubbing';
import { uploadToR2 } from '../../../lib/api/r2';

type DubbingState = 'idle' | 'uploading' | 'processing' | 'complete' | 'error';
type InputMode = 'file' | 'url';

export const DubbingStudio: React.FC = () => {
  // Input mode
  const [inputMode, setInputMode] = useState<InputMode>('file');

  // File states
  const [uploadedVideo, setUploadedVideo] = useState<File | null>(null);
  const [videoPreviewUrl, setVideoPreviewUrl] = useState<string | null>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const resultVideoRef = useRef<HTMLVideoElement>(null);

  // URL state
  const [videoUrl, setVideoUrl] = useState<string>('');

  // Language states
  const [sourceLanguage, setSourceLanguage] = useState<DubbingLanguage | null>(null);
  const [targetLanguage, setTargetLanguage] = useState<DubbingLanguage>(DUBBING_LANGUAGES[1]);
  const [isSourceDropdownOpen, setIsSourceDropdownOpen] = useState(false);
  const [isTargetDropdownOpen, setIsTargetDropdownOpen] = useState(false);

  // Processing states
  const [dubbingState, setDubbingState] = useState<DubbingState>('idle');
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [resultUrl, setResultUrl] = useState<string | null>(null);

  // Playback
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeVideo, setActiveVideo] = useState<'original' | 'dubbed'>('original');

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

  const togglePlay = () => {
    const video = activeVideo === 'original' ? videoRef.current : resultVideoRef.current;
    if (video) {
      if (isPlaying) {
        video.pause();
      } else {
        video.play();
      }
      setIsPlaying(!isPlaying);
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
        setProgress(10);
        finalVideoUrl = await uploadToR2(uploadedVideo, 'dubbing-inputs');
        setProgress(30);
      } else {
        finalVideoUrl = videoUrl;
        setProgress(30);
      }

      setDubbingState('processing');
      const result = await createDubbing(finalVideoUrl, {
        sourceLanguage: sourceLanguage?.code,
        targetLanguage: targetLanguage.code,
        preserveOriginalVoice: true,
      });

      setProgress(40);

      await waitForDubbing(
        result.dubbingId,
        (status) => {
          if (status.status === 'dubbing') {
            setProgress(prev => Math.min(prev + 5, 90));
          }
        },
        600000
      );

      setProgress(95);

      const downloadResult = await downloadDubbedContent(result.dubbingId, targetLanguage.code);

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
      setActiveVideo('dubbed');
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

  const handleReset = () => {
    setDubbingState('idle');
    setResultUrl(null);
    setError(null);
    setActiveVideo('original');
  };

  const hasVideoSource = inputMode === 'file' ? uploadedVideo : (videoUrl && isValidUrl(videoUrl));
  const isFormValid = hasVideoSource && targetLanguage;

  return (
    <div className="h-full flex bg-[#0a0a0b]">
      {/* Sidebar */}
      <div className="w-[340px] flex-shrink-0 bg-[#111113] border-r border-white/5 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-white/5">
          <h1 className="text-base font-semibold text-white flex items-center gap-2">
            <Languages size={18} className="text-violet-400" />
            AI Dubbing
          </h1>
          <p className="text-[11px] text-zinc-500 mt-1">Clone your voice in any language</p>
        </div>

        {/* Controls */}
        <div className="flex-1 overflow-y-auto p-4 space-y-5">
          {/* Video Source */}
          <div>
            <label className="text-[11px] font-medium text-zinc-500 uppercase tracking-wider mb-2 block">
              Video Source
            </label>

            {/* Input Mode Toggle */}
            <div className="flex gap-1 p-1 bg-white/5 rounded-lg mb-3">
              <button
                onClick={() => {
                  setInputMode('file');
                  setVideoUrl('');
                }}
                disabled={dubbingState !== 'idle'}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-md text-xs font-medium transition-colors ${
                  inputMode === 'file'
                    ? 'bg-white/10 text-white'
                    : 'text-zinc-500 hover:text-zinc-300'
                }`}
              >
                <Upload size={13} />
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
                className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-md text-xs font-medium transition-colors ${
                  inputMode === 'url'
                    ? 'bg-white/10 text-white'
                    : 'text-zinc-500 hover:text-zinc-300'
                }`}
              >
                <Link size={13} />
                URL
              </button>
            </div>

            {/* File Upload */}
            {inputMode === 'file' && (
              <div
                className={`relative border border-dashed rounded-xl transition-all ${
                  uploadedVideo
                    ? 'border-violet-500/50 bg-violet-500/5'
                    : 'border-white/10 hover:border-white/20 bg-white/[0.02]'
                } ${dubbingState !== 'idle' ? 'pointer-events-none opacity-50' : ''}`}
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
                  <div className="p-3">
                    <div className="flex items-center gap-3">
                      <div className="w-16 h-10 rounded-lg overflow-hidden bg-zinc-900 flex-shrink-0">
                        {videoPreviewUrl && (
                          <video src={videoPreviewUrl} className="w-full h-full object-cover" muted />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-white truncate">
                          {uploadedVideo.name}
                        </p>
                        <p className="text-[10px] text-zinc-500 mt-0.5">
                          {(uploadedVideo.size / (1024 * 1024)).toFixed(1)} MB
                        </p>
                      </div>
                      {dubbingState === 'idle' && (
                        <button
                          onClick={handleRemoveVideo}
                          className="p-1.5 rounded-lg hover:bg-white/10 transition-colors"
                        >
                          <X size={14} className="text-zinc-500" />
                        </button>
                      )}
                    </div>
                  </div>
                ) : (
                  <label htmlFor="video-upload" className="cursor-pointer block p-5">
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-10 h-10 rounded-xl bg-violet-500/10 flex items-center justify-center">
                        <FileVideo size={20} className="text-violet-400" />
                      </div>
                      <div className="text-center">
                        <p className="text-xs font-medium text-zinc-400">
                          Drop video here
                        </p>
                        <p className="text-[10px] text-zinc-600 mt-0.5">MP4, MOV, WebM</p>
                      </div>
                    </div>
                  </label>
                )}
              </div>
            )}

            {/* URL Input */}
            {inputMode === 'url' && (
              <div className={dubbingState !== 'idle' ? 'pointer-events-none opacity-50' : ''}>
                <div className="relative">
                  <input
                    type="url"
                    value={videoUrl}
                    onChange={(e) => handleUrlChange(e.target.value)}
                    placeholder="https://example.com/video.mp4"
                    disabled={dubbingState !== 'idle'}
                    className="w-full px-3 py-2.5 pl-9 bg-white/5 border border-white/10 rounded-xl text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-violet-500/50"
                  />
                  <Link size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600" />
                  {videoUrl && (
                    <button
                      onClick={() => handleUrlChange('')}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 rounded hover:bg-white/10"
                    >
                      <X size={12} className="text-zinc-500" />
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Languages */}
          <div className="space-y-3">
            {/* Source Language */}
            <div>
              <label className="text-[11px] font-medium text-zinc-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Globe size={11} className="text-violet-400" />
                From
              </label>
              <div className="relative">
                <button
                  onClick={() => setIsSourceDropdownOpen(!isSourceDropdownOpen)}
                  disabled={dubbingState !== 'idle'}
                  className="w-full flex items-center justify-between px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl hover:border-white/20 transition-colors disabled:opacity-50"
                >
                  <div className="flex items-center gap-2">
                    {sourceLanguage ? (
                      <>
                        <span className="text-base">{sourceLanguage.flag}</span>
                        <span className="text-xs font-medium text-white">{sourceLanguage.name}</span>
                      </>
                    ) : (
                      <>
                        <Wand2 size={14} className="text-violet-400" />
                        <span className="text-xs font-medium text-white">Auto-detect</span>
                      </>
                    )}
                  </div>
                  <ChevronDown size={14} className={`text-zinc-500 transition-transform ${isSourceDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                <AnimatePresence>
                  {isSourceDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      className="absolute top-full mt-1 w-full bg-[#1a1a1c] border border-white/10 rounded-xl shadow-2xl z-50 overflow-hidden max-h-48 overflow-y-auto"
                    >
                      <button
                        onClick={() => { setSourceLanguage(null); setIsSourceDropdownOpen(false); }}
                        className={`w-full px-3 py-2 text-left hover:bg-white/5 flex items-center gap-2 ${!sourceLanguage ? 'bg-violet-500/10' : ''}`}
                      >
                        <Wand2 size={14} className="text-violet-400" />
                        <span className="text-xs text-white">Auto-detect</span>
                        {!sourceLanguage && <Check size={12} className="text-violet-400 ml-auto" />}
                      </button>
                      {sortedLanguages.map((lang) => (
                        <button
                          key={lang.code}
                          onClick={() => { setSourceLanguage(lang); setIsSourceDropdownOpen(false); }}
                          className={`w-full px-3 py-2 text-left hover:bg-white/5 flex items-center gap-2 ${sourceLanguage?.code === lang.code ? 'bg-violet-500/10' : ''}`}
                        >
                          <span className="text-base">{lang.flag}</span>
                          <span className="text-xs text-white">{lang.name}</span>
                          {sourceLanguage?.code === lang.code && <Check size={12} className="text-violet-400 ml-auto" />}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Arrow */}
            <div className="flex justify-center">
              <div className="w-8 h-8 rounded-full bg-violet-500/10 flex items-center justify-center">
                <ArrowRight size={14} className="text-violet-400 rotate-90" />
              </div>
            </div>

            {/* Target Language */}
            <div>
              <label className="text-[11px] font-medium text-zinc-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Languages size={11} className="text-violet-400" />
                To
              </label>
              <div className="relative">
                <button
                  onClick={() => setIsTargetDropdownOpen(!isTargetDropdownOpen)}
                  disabled={dubbingState !== 'idle'}
                  className="w-full flex items-center justify-between px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl hover:border-white/20 transition-colors disabled:opacity-50"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-base">{targetLanguage.flag}</span>
                    <div className="text-left">
                      <div className="text-xs font-medium text-white">{targetLanguage.name}</div>
                      <div className="text-[10px] text-zinc-500">{targetLanguage.nativeName}</div>
                    </div>
                  </div>
                  <ChevronDown size={14} className={`text-zinc-500 transition-transform ${isTargetDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                <AnimatePresence>
                  {isTargetDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      className="absolute top-full mt-1 w-full bg-[#1a1a1c] border border-white/10 rounded-xl shadow-2xl z-50 overflow-hidden max-h-48 overflow-y-auto"
                    >
                      {sortedLanguages.map((lang) => (
                        <button
                          key={lang.code}
                          onClick={() => { setTargetLanguage(lang); setIsTargetDropdownOpen(false); }}
                          className={`w-full px-3 py-2.5 text-left hover:bg-white/5 flex items-center gap-2 ${targetLanguage.code === lang.code ? 'bg-violet-500/10' : ''}`}
                        >
                          <span className="text-base">{lang.flag}</span>
                          <div className="flex-1">
                            <div className="text-xs font-medium text-white">{lang.name}</div>
                            <div className="text-[10px] text-zinc-500">{lang.nativeName}</div>
                          </div>
                          {targetLanguage.code === lang.code && <Check size={12} className="text-violet-400" />}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>

          {/* Quick Language Pills */}
          <div>
            <label className="text-[11px] font-medium text-zinc-500 uppercase tracking-wider mb-2 block">
              Popular
            </label>
            <div className="flex flex-wrap gap-1.5">
              {sortedLanguages.slice(0, 8).map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => setTargetLanguage(lang)}
                  disabled={dubbingState !== 'idle'}
                  className={`px-2.5 py-1.5 rounded-lg text-[11px] font-medium transition-all flex items-center gap-1.5 ${
                    targetLanguage.code === lang.code
                      ? 'bg-violet-500/20 text-violet-300 ring-1 ring-violet-500/30'
                      : 'bg-white/5 text-zinc-400 hover:bg-white/10 hover:text-zinc-300'
                  }`}
                >
                  <span>{lang.flag}</span>
                  {lang.name}
                </button>
              ))}
            </div>
          </div>

          {/* Info */}
          <div className="p-3 rounded-xl bg-violet-500/5 border border-violet-500/10">
            <div className="flex items-start gap-2">
              <Volume2 size={14} className="text-violet-400 mt-0.5 shrink-0" />
              <p className="text-[11px] text-violet-300/80 leading-relaxed">
                Your voice is cloned and lip-synced to match the translated audio perfectly.
              </p>
            </div>
          </div>
        </div>

        {/* Generate Button */}
        <div className="p-4 border-t border-white/5">
          <button
            onClick={dubbingState === 'error' ? handleReset : handleStartDubbing}
            disabled={!isFormValid || (dubbingState !== 'idle' && dubbingState !== 'error')}
            className={`w-full py-3 rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-2 ${
              isFormValid && (dubbingState === 'idle' || dubbingState === 'error')
                ? 'bg-violet-600 hover:bg-violet-500 text-white'
                : 'bg-white/5 text-zinc-600 cursor-not-allowed'
            }`}
          >
            {dubbingState === 'idle' ? (
              <>
                <Sparkles size={16} />
                Start Dubbing
              </>
            ) : dubbingState === 'error' ? (
              <>
                <RefreshCw size={16} />
                Try Again
              </>
            ) : (
              <>
                <Loader2 size={16} className="animate-spin" />
                {dubbingState === 'uploading' ? 'Uploading...' : 'Processing...'}
              </>
            )}
          </button>
        </div>
      </div>

      {/* Preview Area */}
      <div className="flex-1 flex flex-col bg-[#0a0a0b]">
        {/* Top Bar */}
        <div className="h-12 flex items-center justify-between px-5 border-b border-white/5">
          <div className="flex items-center gap-3">
            {resultUrl && (
              <div className="flex p-0.5 bg-white/5 rounded-lg">
                <button
                  onClick={() => setActiveVideo('original')}
                  className={`px-3 py-1 text-[11px] font-medium rounded-md transition-colors ${
                    activeVideo === 'original' ? 'bg-white/10 text-white' : 'text-zinc-500 hover:text-zinc-300'
                  }`}
                >
                  Original
                </button>
                <button
                  onClick={() => setActiveVideo('dubbed')}
                  className={`px-3 py-1 text-[11px] font-medium rounded-md transition-colors ${
                    activeVideo === 'dubbed' ? 'bg-violet-500/20 text-violet-300' : 'text-zinc-500 hover:text-zinc-300'
                  }`}
                >
                  {targetLanguage.flag} Dubbed
                </button>
              </div>
            )}
          </div>

          {resultUrl && (
            <div className="flex items-center gap-2">
              <button
                onClick={handleReset}
                className="px-3 py-1.5 text-[11px] font-medium text-zinc-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-lg transition-colors flex items-center gap-1.5"
              >
                <RefreshCw size={12} />
                New Video
              </button>
              <button
                onClick={handleDownloadResult}
                className="px-3 py-1.5 text-[11px] font-medium text-white bg-violet-600 hover:bg-violet-500 rounded-lg transition-colors flex items-center gap-1.5"
              >
                <Download size={12} />
                Download
              </button>
            </div>
          )}
        </div>

        {/* Main Preview */}
        <div className="flex-1 flex items-center justify-center p-6">
          {error ? (
            <div className="text-center">
              <div className="w-16 h-16 rounded-2xl bg-red-500/10 flex items-center justify-center mx-auto mb-4">
                <AlertCircle size={28} className="text-red-500" />
              </div>
              <p className="text-red-400 text-sm font-medium mb-1">Dubbing Failed</p>
              <p className="text-zinc-500 text-xs max-w-xs">{error}</p>
            </div>
          ) : !videoPreviewUrl ? (
            <div className="text-center">
              <div className="w-20 h-20 rounded-2xl bg-white/5 flex items-center justify-center mx-auto mb-4">
                <FileVideo size={32} className="text-zinc-700" />
              </div>
              <p className="text-zinc-500 text-sm mb-1">Upload a video to get started</p>
              <p className="text-zinc-600 text-xs">Supports MP4, MOV, and WebM</p>
            </div>
          ) : dubbingState === 'uploading' || dubbingState === 'processing' ? (
            <div className="text-center">
              <div className="relative w-28 h-28 mx-auto mb-6">
                <svg className="w-full h-full -rotate-90">
                  <circle
                    cx="56"
                    cy="56"
                    r="50"
                    stroke="currentColor"
                    strokeWidth="6"
                    fill="none"
                    className="text-white/10"
                  />
                  <circle
                    cx="56"
                    cy="56"
                    r="50"
                    stroke="currentColor"
                    strokeWidth="6"
                    fill="none"
                    strokeDasharray={314}
                    strokeDashoffset={314 - (314 * progress) / 100}
                    className="text-violet-500 transition-all duration-300"
                    strokeLinecap="round"
                  />
                </svg>
                <span className="absolute inset-0 flex items-center justify-center text-2xl font-bold text-white">
                  {progress}%
                </span>
              </div>
              <p className="text-white font-medium mb-1">
                {dubbingState === 'uploading' ? 'Uploading Video...' : 'AI Processing...'}
              </p>
              <p className="text-zinc-500 text-xs">
                {dubbingState === 'processing' && 'Transcribing, translating & cloning voice'}
              </p>
            </div>
          ) : (
            <div className="w-full max-w-4xl">
              <div className="relative rounded-2xl overflow-hidden bg-black shadow-2xl">
                {/* Original Video */}
                <video
                  ref={videoRef}
                  src={videoPreviewUrl}
                  className={`w-full ${activeVideo === 'original' && !resultUrl ? '' : activeVideo === 'original' ? '' : 'hidden'}`}
                  controls={false}
                  onPlay={() => setIsPlaying(true)}
                  onPause={() => setIsPlaying(false)}
                  style={{ display: activeVideo === 'original' ? 'block' : 'none' }}
                />

                {/* Dubbed Video */}
                {resultUrl && (
                  <video
                    ref={resultVideoRef}
                    src={resultUrl}
                    className="w-full"
                    controls={false}
                    onPlay={() => setIsPlaying(true)}
                    onPause={() => setIsPlaying(false)}
                    style={{ display: activeVideo === 'dubbed' ? 'block' : 'none' }}
                  />
                )}

                {/* Play/Pause Overlay */}
                <button
                  onClick={togglePlay}
                  className="absolute inset-0 flex items-center justify-center bg-black/20 hover:bg-black/30 transition-colors group"
                >
                  <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center group-hover:scale-110 transition-transform">
                    {isPlaying ? (
                      <Pause size={28} className="text-white" />
                    ) : (
                      <Play size={28} className="text-white ml-1" />
                    )}
                  </div>
                </button>

                {/* Status Badge */}
                {resultUrl && (
                  <div className="absolute top-4 left-4">
                    <div className={`px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 ${
                      activeVideo === 'dubbed'
                        ? 'bg-violet-500 text-white'
                        : 'bg-white/90 text-zinc-900'
                    }`}>
                      {activeVideo === 'dubbed' ? (
                        <>
                          <span>{targetLanguage.flag}</span>
                          Dubbed in {targetLanguage.name}
                        </>
                      ) : (
                        'Original'
                      )}
                    </div>
                  </div>
                )}

                {/* Ready Overlay (when no result yet) */}
                {!resultUrl && dubbingState === 'idle' && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                    <div className="text-center text-white">
                      <Languages size={32} className="mx-auto mb-3 opacity-80" />
                      <p className="text-sm font-medium">Ready to dub</p>
                      <p className="text-xs text-white/60 mt-1">
                        {sourceLanguage ? sourceLanguage.flag : '🎤'} → {targetLanguage.flag}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Video Controls */}
              {resultUrl && (
                <div className="mt-4 flex items-center justify-center gap-2">
                  <span className="text-[10px] text-zinc-500">
                    Click video to {isPlaying ? 'pause' : 'play'} • Use tabs to compare original and dubbed
                  </span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Bottom Info */}
        {dubbingState === 'complete' && (
          <div className="p-4 border-t border-white/5">
            <div className="flex items-center justify-center gap-6 text-xs text-zinc-500">
              <div className="flex items-center gap-1.5">
                <Check size={14} className="text-emerald-400" />
                <span>Voice cloned</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Check size={14} className="text-emerald-400" />
                <span>Lip-synced</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Check size={14} className="text-emerald-400" />
                <span>Ready to download</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
