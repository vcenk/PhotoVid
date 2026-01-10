import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Upload,
  Plus,
  Clock,
  ChevronDown,
  Sparkles,
  Image as ImageIcon,
  Music,
  Wand2,
  FileVideo,
  Volume2,
  Play,
  ArrowRight,
  User,
  Mic,
  Star
} from 'lucide-react';
import { LIPSYNC_MODELS, LipsyncModelConfig, SYNC_MODE_DESCRIPTIONS } from '../../../lib/data/lipsync-models';

// Sample media URLs for placeholders
const SAMPLE_MEDIA = {
  portrait1: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop',
  portrait2: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop',
  portrait3: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop',
  sampleVideo: 'https://cdn.coverr.co/videos/coverr-woman-talking-4958/1080p.mp4',
  beforeVideo: 'https://cdn.coverr.co/videos/coverr-a-woman-talking-5106/1080p.mp4',
  afterVideo: 'https://cdn.coverr.co/videos/coverr-a-woman-talking-5106/1080p.mp4',
};

// Lipsync template presets
const LIPSYNC_TEMPLATES = [
  {
    id: 'news-anchor',
    name: 'News Anchor',
    description: 'Professional news presentation style',
    thumbnail: SAMPLE_MEDIA.portrait1,
    icon: Mic,
    category: 'Professional',
    usageCount: 2847,
  },
  {
    id: 'podcast-host',
    name: 'Podcast Host',
    description: 'Casual conversational delivery',
    thumbnail: SAMPLE_MEDIA.portrait2,
    icon: Music,
    category: 'Content',
    usageCount: 1923,
  },
  {
    id: 'corporate-presenter',
    name: 'Corporate Presenter',
    description: 'Business presentation voice-over',
    thumbnail: SAMPLE_MEDIA.portrait3,
    icon: User,
    category: 'Business',
    usageCount: 1567,
  },
  {
    id: 'social-influencer',
    name: 'Social Influencer',
    description: 'Energetic social media style',
    thumbnail: SAMPLE_MEDIA.portrait1,
    icon: Star,
    category: 'Social',
    usageCount: 3421,
  },
];

export const LipsyncStudio: React.FC = () => {
  const [selectedModel, setSelectedModel] = useState<LipsyncModelConfig>(LIPSYNC_MODELS[0]);
  const [isModelDropdownOpen, setIsModelDropdownOpen] = useState(false);
  const [uploadedImage, setUploadedImage] = useState<File | null>(null);
  const [uploadedVideo, setUploadedVideo] = useState<File | null>(null);
  const [uploadedAudio, setUploadedAudio] = useState<File | null>(null);
  const [textInput, setTextInput] = useState('');
  const [syncMode, setSyncMode] = useState('cut_off');
  const [showBeforeAfter, setShowBeforeAfter] = useState(false);
  const [sliderPosition, setSliderPosition] = useState(50);

  const requiresVideo = selectedModel.inputType === 'video';
  const requiresImage = selectedModel.inputType === 'image';
  const requiresAudio = selectedModel.audioType === 'audio-file' || selectedModel.audioType === 'both';
  const requiresText = selectedModel.audioType === 'text-to-speech' || selectedModel.audioType === 'both';

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'image' | 'video' | 'audio') => {
    const file = e.target.files?.[0];
    if (file) {
      if (type === 'image') setUploadedImage(file);
      if (type === 'video') setUploadedVideo(file);
      if (type === 'audio') setUploadedAudio(file);
    }
  };

  const isFormValid = () => {
    if (requiresImage && !uploadedImage) return false;
    if (requiresVideo && !uploadedVideo) return false;
    if (requiresAudio && !uploadedAudio) return false;
    if (requiresText && !textInput.trim()) return false;
    return true;
  };

  return (
    <div className="flex h-full bg-white dark:bg-[#09090b]">
      {/* Left Panel - Controls */}
      <div className="w-[320px] bg-white dark:bg-zinc-950 border-r border-zinc-200 dark:border-zinc-800 flex flex-col shrink-0">
        {/* Header */}
        <div className="p-5 border-b border-zinc-100 dark:border-zinc-800">
          <h2 className="text-lg font-bold text-zinc-900 dark:text-white flex items-center gap-2">
            <Sparkles className="text-indigo-600" size={20} />
            Lipsync Studio
          </h2>
          <p className="text-xs text-zinc-500 mt-1">Generate AI-powered lipsync videos</p>
        </div>

        {/* Form Controls */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {/* Model Selector */}
          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-2">
              Select Model
            </label>
            <div className="relative">
              <button
                onClick={() => setIsModelDropdownOpen(!isModelDropdownOpen)}
                className="w-full flex items-center justify-between px-3 py-2.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl hover:border-indigo-300 dark:hover:border-indigo-600 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <selectedModel.icon size={16} className="text-indigo-600" />
                  <div className="text-left">
                    <div className="font-medium text-zinc-900 dark:text-white text-sm">{selectedModel.displayName}</div>
                    <div className="text-xs text-zinc-500">{selectedModel.price}</div>
                  </div>
                </div>
                <ChevronDown size={16} className={`text-zinc-400 transition-transform ${isModelDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Dropdown Menu */}
              <AnimatePresence>
                {isModelDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute top-full mt-2 w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl shadow-xl z-50 overflow-hidden"
                  >
                    {LIPSYNC_MODELS.map((model) => (
                      <button
                        key={model.id}
                        onClick={() => {
                          setSelectedModel(model);
                          setIsModelDropdownOpen(false);
                        }}
                        className={`w-full px-3 py-2.5 text-left hover:bg-indigo-50 dark:hover:bg-indigo-950/50 transition-colors border-b border-zinc-100 dark:border-zinc-800 last:border-b-0 ${selectedModel.id === model.id ? 'bg-indigo-50 dark:bg-indigo-950/50' : ''
                          }`}
                      >
                        <div className="flex items-center gap-2">
                          <model.icon size={16} className="text-indigo-600" />
                          <div>
                            <div className="font-medium text-zinc-900 dark:text-white text-sm">{model.displayName}</div>
                            <div className="text-xs text-zinc-500 dark:text-zinc-400">{model.description}</div>
                          </div>
                        </div>
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Duration Display */}
          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-2">
              Duration
            </label>
            <div className="flex items-center gap-2 px-3 py-2.5 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl">
              <Clock size={14} className="text-indigo-500" />
              <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">{selectedModel.duration}</span>
            </div>
          </div>

          {/* Sync Mode */}
          {selectedModel.requiredFields.sync_mode && (
            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-2">
                Sync Mode
              </label>
              <select
                value={syncMode}
                onChange={(e) => setSyncMode(e.target.value)}
                className="w-full px-3 py-2.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl hover:border-indigo-300 dark:hover:border-indigo-600 transition-colors text-sm text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              >
                {selectedModel.requiredFields.sync_mode.map((mode) => (
                  <option key={mode} value={mode}>
                    {mode.replace('_', ' ').charAt(0).toUpperCase() + mode.slice(1).replace('_', ' ')}
                  </option>
                ))}
              </select>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                {SYNC_MODE_DESCRIPTIONS[syncMode as keyof typeof SYNC_MODE_DESCRIPTIONS]}
              </p>
            </div>
          )}

          {/* Upload Video */}
          {requiresVideo && (
            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-2">
                Upload Video
              </label>
              <div className="border-2 border-dashed border-zinc-300 dark:border-zinc-700 rounded-xl p-4 hover:border-indigo-400 dark:hover:border-indigo-600 transition-colors cursor-pointer bg-zinc-50 dark:bg-zinc-900 hover:bg-indigo-50/30 dark:hover:bg-indigo-950/30">
                <input
                  type="file"
                  accept="video/*"
                  onChange={(e) => handleFileUpload(e, 'video')}
                  className="hidden"
                  id="video-upload"
                />
                <label htmlFor="video-upload" className="cursor-pointer flex flex-col items-center gap-2">
                  {uploadedVideo ? (
                    <>
                      <FileVideo size={24} className="text-indigo-600" />
                      <div className="text-center">
                        <p className="text-xs font-medium text-zinc-900 dark:text-white">{uploadedVideo.name}</p>
                        <p className="text-xs text-indigo-600 dark:text-indigo-400 mt-1">Click to change</p>
                      </div>
                    </>
                  ) : (
                    <>
                      <Plus size={24} className="text-zinc-400" />
                      <div className="text-center">
                        <p className="text-xs text-zinc-600 dark:text-zinc-400">Upload video or drag & drop</p>
                        <button className="mt-2 px-3 py-1.5 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-xs font-medium hover:border-indigo-300 dark:hover:border-indigo-600 transition-colors text-zinc-900 dark:text-white">
                          Select Video
                        </button>
                      </div>
                    </>
                  )}
                </label>
              </div>
            </div>
          )}

          {/* Upload Audio */}
          {requiresAudio && (
            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-2">
                Upload Audio
              </label>
              <div className="border-2 border-dashed border-zinc-300 dark:border-zinc-700 rounded-xl p-4 hover:border-indigo-400 dark:hover:border-indigo-600 transition-colors cursor-pointer bg-zinc-50 dark:bg-zinc-900 hover:bg-indigo-50/30 dark:hover:bg-indigo-950/30">
                <input
                  type="file"
                  accept="audio/*"
                  onChange={(e) => handleFileUpload(e, 'audio')}
                  className="hidden"
                  id="audio-upload"
                />
                <label htmlFor="audio-upload" className="cursor-pointer flex flex-col items-center gap-2">
                  {uploadedAudio ? (
                    <>
                      <Volume2 size={24} className="text-indigo-600" />
                      <div className="text-center">
                        <p className="text-xs font-medium text-zinc-900 dark:text-white">{uploadedAudio.name}</p>
                        <p className="text-xs text-indigo-600 dark:text-indigo-400 mt-1">Click to change</p>
                      </div>
                    </>
                  ) : (
                    <>
                      <Music size={24} className="text-zinc-400" />
                      <div className="text-center">
                        <p className="text-xs text-zinc-600 dark:text-zinc-400">Upload audio or drag & drop</p>
                        <button className="mt-2 px-3 py-1.5 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-xs font-medium hover:border-indigo-300 dark:hover:border-indigo-600 transition-colors text-zinc-900 dark:text-white">
                          Select Audio
                        </button>
                      </div>
                    </>
                  )}
                </label>
              </div>
            </div>
          )}

          {/* Text Input */}
          {requiresText && (
            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-2">
                Text to Speech
              </label>
              <textarea
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                placeholder="What should the character say?"
                className="w-full px-3 py-2.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:border-indigo-400 dark:focus:border-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 resize-none h-24 text-sm text-zinc-900 dark:text-white placeholder:text-zinc-500 dark:placeholder:text-zinc-500"
              />
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">{textInput.length} characters</p>
            </div>
          )}
        </div>

        {/* Footer - Generate Button */}
        <div className="p-5 border-t border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-950">
          <button
            disabled={!isFormValid()}
            className={`
              w-full py-3 rounded-xl font-bold text-white text-sm uppercase tracking-wider transition-all flex items-center justify-center gap-2
              ${isFormValid()
                ? 'bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 active:scale-95 shadow-lg shadow-indigo-200'
                : 'bg-zinc-300 cursor-not-allowed'}
            `}
          >
            <Sparkles size={16} />
            Generate Lipsync
          </button>
        </div>
      </div>

      {/* Right Panel - Main Content */}
      <div className="flex-1 overflow-y-auto bg-white dark:bg-[#09090b] p-8">
        <div className="max-w-5xl mx-auto space-y-8">

          {/* Hero Section */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 rounded-full text-sm font-semibold mb-4">
              <Sparkles size={16} />
              AI Lipsync
            </div>
            <h1 className="text-3xl font-bold text-zinc-900 dark:text-white mb-3">Create Stunning Lipsync Videos</h1>
            <p className="text-zinc-600 dark:text-zinc-400 text-base max-w-2xl mx-auto">
              Transform any portrait into a talking video with AI. Support for multiple models including
              <span className="font-semibold text-zinc-800 dark:text-zinc-200"> Sync Labs 2.0</span>,
              <span className="font-semibold text-zinc-800 dark:text-zinc-200"> Kling LipSync</span>, and more.
            </p>
          </div>

          {/* Before/After Comparison Card */}
          <div className="bg-gradient-to-br from-zinc-50 to-indigo-50/30 dark:from-zinc-900 dark:to-indigo-950/30 rounded-2xl p-6 border border-zinc-200 dark:border-zinc-800">
            <h2 className="text-lg font-bold text-zinc-900 dark:text-white mb-4 flex items-center gap-2">
              <Play size={18} className="text-indigo-600" />
              See the Magic
            </h2>
            <div className="relative rounded-xl overflow-hidden aspect-video bg-zinc-900">
              {/* Before Video */}
              <div
                className="absolute inset-0"
                style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}
              >
                <img
                  src={SAMPLE_MEDIA.portrait1}
                  alt="Before"
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-4 left-4 px-3 py-1 bg-white/90 rounded-full text-xs font-bold">
                  BEFORE
                </div>
              </div>

              {/* After Video */}
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
                  src={SAMPLE_MEDIA.sampleVideo}
                />
                <div className="absolute top-4 right-4 px-3 py-1 bg-indigo-600 text-white rounded-full text-xs font-bold">
                  AFTER
                </div>
              </div>

              {/* Slider Control */}
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

              {/* Slider Input */}
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
              Drag the slider to compare original vs AI-synced result
            </p>
          </div>

          {/* Process Steps with Real Images */}
          <div>
            <h2 className="text-lg font-bold text-zinc-900 dark:text-white mb-4">How It Works</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Step 1 */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden hover:shadow-lg hover:border-indigo-200 dark:hover:border-indigo-600 transition-all group"
              >
                <div className="aspect-square relative overflow-hidden">
                  <img
                    src={SAMPLE_MEDIA.portrait2}
                    alt="Upload portrait"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  <div className="absolute bottom-3 left-3 right-3">
                    <span className="text-white text-xs font-bold bg-indigo-600 px-2 py-1 rounded-full">Step 1</span>
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-bold text-zinc-900 dark:text-white mb-1">Upload Portrait</h3>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">Start with a clear photo or video of a person</p>
                </div>
              </motion.div>

              {/* Step 2 */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden hover:shadow-lg hover:border-indigo-200 dark:hover:border-indigo-600 transition-all group"
              >
                <div className="aspect-square relative overflow-hidden bg-gradient-to-br from-indigo-100 to-violet-100 dark:from-indigo-950 dark:to-violet-950 flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-20 h-20 mx-auto mb-4 bg-white dark:bg-zinc-800 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                      <Music size={32} className="text-indigo-600" />
                    </div>
                    <div className="flex items-center justify-center gap-1">
                      {[...Array(12)].map((_, i) => (
                        <motion.div
                          key={i}
                          className="w-1 bg-indigo-500 rounded-full"
                          animate={{ height: [8, 24, 8] }}
                          transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.1 }}
                        />
                      ))}
                    </div>
                  </div>
                  <div className="absolute bottom-3 left-3 right-3">
                    <span className="text-indigo-700 dark:text-indigo-300 text-xs font-bold bg-white dark:bg-zinc-800 px-2 py-1 rounded-full">Step 2</span>
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-bold text-zinc-900 dark:text-white mb-1">Add Audio</h3>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">Upload audio or use AI text-to-speech</p>
                </div>
              </motion.div>

              {/* Step 3 */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden hover:shadow-lg hover:border-indigo-200 dark:hover:border-indigo-600 transition-all group"
              >
                <div className="aspect-square relative overflow-hidden">
                  <video
                    autoPlay
                    muted
                    loop
                    playsInline
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    src={SAMPLE_MEDIA.sampleVideo}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  <div className="absolute top-3 right-3">
                    <div className="w-8 h-8 bg-white dark:bg-zinc-800 rounded-full flex items-center justify-center shadow-lg">
                      <Play size={14} className="text-indigo-600 ml-0.5" />
                    </div>
                  </div>
                  <div className="absolute bottom-3 left-3 right-3">
                    <span className="text-white text-xs font-bold bg-emerald-500 px-2 py-1 rounded-full">Step 3</span>
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-bold text-zinc-900 dark:text-white mb-1">Generate & Download</h3>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">AI syncs the lips to audio in seconds</p>
                </div>
              </motion.div>
            </div>
          </div>

          {/* Template Gallery */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-zinc-900 dark:text-white">Quick Start Templates</h2>
              <button className="text-sm text-indigo-600 dark:text-indigo-400 font-medium hover:text-indigo-700 dark:hover:text-indigo-300 flex items-center gap-1">
                View all <ArrowRight size={14} />
              </button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {LIPSYNC_TEMPLATES.map((template, idx) => (
                <motion.button
                  key={template.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * idx }}
                  className="text-left bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden hover:shadow-lg hover:border-indigo-300 dark:hover:border-indigo-600 transition-all group"
                >
                  <div className="aspect-square relative overflow-hidden">
                    <img
                      src={template.thumbnail}
                      alt={template.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="w-12 h-12 bg-white/90 dark:bg-zinc-800/90 rounded-full flex items-center justify-center shadow-lg">
                        <Play size={20} className="text-indigo-600 ml-0.5" />
                      </div>
                    </div>
                    <div className="absolute top-2 right-2">
                      <span className="px-2 py-0.5 bg-white/90 dark:bg-zinc-800/90 rounded-full text-[10px] font-bold text-zinc-600 dark:text-zinc-300">
                        {template.category}
                      </span>
                    </div>
                  </div>
                  <div className="p-3">
                    <h3 className="font-bold text-zinc-900 dark:text-white text-sm mb-0.5">{template.name}</h3>
                    <p className="text-[10px] text-zinc-500 dark:text-zinc-400">{template.usageCount.toLocaleString()} uses</p>
                  </div>
                </motion.button>
              ))}
            </div>
          </div>

          {/* Features */}
          <div className="bg-zinc-50 dark:bg-zinc-900 rounded-2xl p-6 border border-zinc-200 dark:border-zinc-800">
            <h3 className="font-bold text-zinc-900 dark:text-white mb-4">Model Features</h3>
            <div className="flex flex-wrap gap-2">
              {selectedModel.features.map((feature, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1.5 bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 rounded-full text-xs font-medium border border-zinc-200 dark:border-zinc-700"
                >
                  {feature}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
