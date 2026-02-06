/**
 * VoicePanel - Right panel for AI script editing and voice selection
 *
 * Features:
 * - Language selection (7 languages)
 * - Gender filter
 * - Style filter
 * - Voice preview
 * - Script editing
 */

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Sparkles,
  Mic2,
  Play,
  Pause,
  Volume2,
  Edit3,
  RefreshCw,
  Check,
  Loader2,
  ChevronDown,
  ChevronUp,
  Globe,
  User,
  Filter,
} from 'lucide-react';
import { useQuickVideoV2 } from '../QuickVideoV2Context';
import {
  SUPPORTED_LANGUAGES,
  ALL_VOICES,
  filterVoices,
  getVoiceById,
  getAccentsForLanguage,
  type VoiceLanguage,
  type VoiceGender,
  type DeepgramVoice,
} from '@/lib/data/deepgram-voices';
import type { ScriptSegment } from '@/lib/types/quick-video-v2';

// ============================================================================
// Voice Panel Props
// ============================================================================

interface VoicePanelProps {
  onClose: () => void;
}

// ============================================================================
// Language Selector
// ============================================================================

interface LanguageSelectorProps {
  selected: VoiceLanguage;
  onSelect: (lang: VoiceLanguage) => void;
}

function LanguageSelector({ selected, onSelect }: LanguageSelectorProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Globe size={14} className="text-zinc-400" />
        <span className="text-xs font-medium text-zinc-400 uppercase tracking-wider">
          Language
        </span>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {SUPPORTED_LANGUAGES.map((lang) => (
          <button
            key={lang.code}
            onClick={() => onSelect(lang.code)}
            className={`
              flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all
              ${selected === lang.code
                ? 'bg-violet-600 text-white'
                : 'bg-white/5 text-zinc-400 hover:bg-white/10 hover:text-white'
              }
            `}
          >
            <span>{lang.flag}</span>
            <span>{lang.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

// ============================================================================
// Filter Bar
// ============================================================================

interface FilterBarProps {
  gender: VoiceGender | null;
  onGenderChange: (gender: VoiceGender | null) => void;
  style: string | null;
  onStyleChange: (style: string | null) => void;
  availableStyles: string[];
}

function FilterBar({ gender, onGenderChange, style, onStyleChange, availableStyles }: FilterBarProps) {
  const [showStyles, setShowStyles] = useState(false);

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {/* Gender Filter */}
      <div className="flex items-center bg-white/5 rounded-lg p-0.5">
        <button
          onClick={() => onGenderChange(null)}
          className={`px-2.5 py-1 text-xs rounded-md transition-all ${
            gender === null ? 'bg-violet-600 text-white' : 'text-zinc-400 hover:text-white'
          }`}
        >
          All
        </button>
        <button
          onClick={() => onGenderChange('female')}
          className={`px-2.5 py-1 text-xs rounded-md transition-all ${
            gender === 'female' ? 'bg-violet-600 text-white' : 'text-zinc-400 hover:text-white'
          }`}
        >
          Female
        </button>
        <button
          onClick={() => onGenderChange('male')}
          className={`px-2.5 py-1 text-xs rounded-md transition-all ${
            gender === 'male' ? 'bg-violet-600 text-white' : 'text-zinc-400 hover:text-white'
          }`}
        >
          Male
        </button>
      </div>

      {/* Style Filter */}
      <div className="relative">
        <button
          onClick={() => setShowStyles(!showStyles)}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs transition-all ${
            style ? 'bg-violet-600 text-white' : 'bg-white/5 text-zinc-400 hover:text-white'
          }`}
        >
          <Filter size={12} />
          {style || 'Style'}
          <ChevronDown size={12} />
        </button>

        <AnimatePresence>
          {showStyles && (
            <motion.div
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              className="absolute top-full left-0 mt-1 w-40 max-h-48 overflow-y-auto bg-zinc-900 border border-white/10 rounded-lg shadow-xl z-10"
            >
              <button
                onClick={() => { onStyleChange(null); setShowStyles(false); }}
                className="w-full px-3 py-2 text-left text-xs text-zinc-400 hover:bg-white/5 hover:text-white"
              >
                All Styles
              </button>
              {availableStyles.map((s) => (
                <button
                  key={s}
                  onClick={() => { onStyleChange(s); setShowStyles(false); }}
                  className={`w-full px-3 py-2 text-left text-xs hover:bg-white/5 ${
                    style === s ? 'text-violet-400' : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  {s}
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

// ============================================================================
// Voice Card
// ============================================================================

interface VoiceCardProps {
  voice: DeepgramVoice;
  isSelected: boolean;
  isPlaying: boolean;
  isLoading: boolean;
  onSelect: () => void;
  onPreview: () => void;
}

function VoiceCard({ voice, isSelected, isPlaying, isLoading, onSelect, onPreview }: VoiceCardProps) {
  return (
    <div
      onClick={onSelect}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSelect();
        }
      }}
      className={`
        relative p-3 rounded-xl border text-left transition-all w-full cursor-pointer
        ${isSelected
          ? 'border-violet-500 bg-violet-500/10'
          : 'border-white/5 hover:border-white/15 bg-white/5 hover:bg-white/[0.07]'
        }
      `}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-1.5">
        <div>
          <p className="text-sm font-medium text-white">{voice.name}</p>
          <p className="text-[10px] text-zinc-500">
            {voice.gender === 'female' ? '♀' : '♂'} {voice.accent}
          </p>
        </div>
        {isSelected && (
          <div className="w-5 h-5 bg-violet-600 rounded-full flex items-center justify-center flex-shrink-0">
            <Check size={12} className="text-white" />
          </div>
        )}
      </div>

      {/* Styles */}
      <div className="flex flex-wrap gap-1 mb-2">
        {voice.styles.slice(0, 3).map((style) => (
          <span
            key={style}
            className="px-1.5 py-0.5 text-[9px] bg-white/10 text-zinc-400 rounded"
          >
            {style}
          </span>
        ))}
      </div>

      {/* Preview Button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onPreview();
        }}
        disabled={isLoading && !isPlaying}
        className={`
          w-full flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-medium transition-colors
          ${isPlaying
            ? 'bg-violet-600 text-white'
            : isLoading
            ? 'bg-white/5 text-zinc-500 cursor-wait'
            : 'bg-white/10 text-zinc-400 hover:text-white hover:bg-white/15'
          }
        `}
      >
        {isLoading && !isPlaying ? (
          <>
            <Loader2 size={10} className="animate-spin" />
            Loading...
          </>
        ) : isPlaying ? (
          <>
            <Pause size={10} />
            Playing...
          </>
        ) : (
          <>
            <Play size={10} />
            Preview
          </>
        )}
      </button>
    </div>
  );
}

// ============================================================================
// Voice Selector
// ============================================================================

function VoiceSelector() {
  const { project, selectVoice } = useQuickVideoV2();

  // Default to project's language
  const [language, setLanguage] = useState<VoiceLanguage>(project.language || 'en');
  const [gender, setGender] = useState<VoiceGender | null>(null);
  const [style, setStyle] = useState<string | null>(null);
  const [playingPreview, setPlayingPreview] = useState<string | null>(null);
  const [isLoadingPreview, setIsLoadingPreview] = useState(false);

  // Sync language with project when it changes
  React.useEffect(() => {
    if (project.language && project.language !== language) {
      setLanguage(project.language);
    }
  }, [project.language]);

  // Get filtered voices
  const filteredVoices = useMemo(() => {
    return filterVoices({
      language,
      gender: gender || undefined,
      style: style || undefined,
      aura2Only: true,
    });
  }, [language, gender, style]);

  // Get available styles for current language
  const availableStyles = useMemo(() => {
    const langVoices = filterVoices({ language, aura2Only: true });
    const styles = new Set<string>();
    langVoices.forEach(v => v.styles.forEach(s => styles.add(s)));
    return Array.from(styles).sort();
  }, [language]);

  // Audio element ref for preview playback
  const audioRef = React.useRef<HTMLAudioElement | null>(null);

  // Cleanup audio on unmount
  React.useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  const handlePreview = async (voice: DeepgramVoice) => {
    // If same voice is playing, stop it
    if (playingPreview === voice.id) {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      setPlayingPreview(null);
      setIsLoadingPreview(false);
      return;
    }

    // Stop any currently playing audio
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }

    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

    // Check if Supabase is configured
    if (!supabaseUrl || !supabaseAnonKey) {
      console.warn('Supabase not configured, cannot preview voice');
      // Show brief visual feedback anyway
      setPlayingPreview(voice.id);
      setTimeout(() => setPlayingPreview(null), 1000);
      return;
    }

    setIsLoadingPreview(true);
    setPlayingPreview(voice.id);

    try {
      // Call the synthesize-voice edge function with a preview text
      const response = await fetch(`${supabaseUrl}/functions/v1/synthesize-voice`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabaseAnonKey}`,
        },
        body: JSON.stringify({
          text: 'Welcome to this stunning property, where every detail has been carefully considered.',
          voiceId: voice.id,
          preview: true,
        }),
      });

      if (!response.ok) {
        throw new Error('Preview failed');
      }

      const data = await response.json();

      if (data.success && data.audioUrl) {
        // Play the audio
        const audio = new Audio(data.audioUrl);
        audioRef.current = audio;

        audio.onended = () => {
          setPlayingPreview(null);
          setIsLoadingPreview(false);
          audioRef.current = null;
        };

        audio.onerror = () => {
          setPlayingPreview(null);
          setIsLoadingPreview(false);
          audioRef.current = null;
        };

        setIsLoadingPreview(false);
        await audio.play();
      } else {
        setPlayingPreview(null);
        setIsLoadingPreview(false);
      }
    } catch (error) {
      console.error('Voice preview error:', error);
      setPlayingPreview(null);
      setIsLoadingPreview(false);
    }
  };

  const handleSelectVoice = (voice: DeepgramVoice) => {
    selectVoice({
      voiceId: voice.id,
      name: voice.name,
      gender: voice.gender,
      style: voice.styles[0] as any,
    });
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-2">
        <Mic2 size={16} className="text-violet-400" />
        <span className="text-sm font-medium text-white">Select Voice</span>
        <span className="text-xs text-zinc-500">({filteredVoices.length} voices)</span>
      </div>

      {/* Language Selector */}
      <LanguageSelector selected={language} onSelect={setLanguage} />

      {/* Filters */}
      <FilterBar
        gender={gender}
        onGenderChange={setGender}
        style={style}
        onStyleChange={setStyle}
        availableStyles={availableStyles}
      />

      {/* Voice Grid */}
      <div className="grid grid-cols-2 gap-2 max-h-[300px] overflow-y-auto custom-scrollbar pr-1">
        {filteredVoices.map((voice) => (
          <VoiceCard
            key={voice.id}
            voice={voice}
            isSelected={project.selectedVoice?.voiceId === voice.id}
            isPlaying={playingPreview === voice.id && !isLoadingPreview}
            isLoading={playingPreview === voice.id && isLoadingPreview}
            onSelect={() => handleSelectVoice(voice)}
            onPreview={() => handlePreview(voice)}
          />
        ))}
      </div>

      {filteredVoices.length === 0 && (
        <div className="text-center py-6 text-zinc-500 text-sm">
          No voices match your filters
        </div>
      )}
    </div>
  );
}

// ============================================================================
// Script Segment Editor
// ============================================================================

interface SegmentEditorProps {
  segment: ScriptSegment;
  index: number;
  imageLabel: string;
  onUpdate: (text: string) => void;
}

function SegmentEditor({ segment, index, imageLabel, onUpdate }: SegmentEditorProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [text, setText] = useState(segment.text);

  const handleSave = () => {
    onUpdate(text);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setText(segment.text);
    setIsEditing(false);
  };

  return (
    <div className="p-3 bg-white/5 rounded-xl border border-white/5 group">
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="w-6 h-6 rounded-lg bg-violet-500/20 text-violet-400 text-xs font-bold flex items-center justify-center">
            {index + 1}
          </span>
          <span className="text-xs font-medium text-zinc-400">
            {imageLabel || `Room ${index + 1}`}
          </span>
        </div>
        <span className="text-xs text-zinc-600">
          {segment.duration.toFixed(1)}s
        </span>
      </div>

      {/* Content */}
      {isEditing ? (
        <div className="space-y-2">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="w-full p-2 bg-white/5 border border-violet-500/30 rounded-lg text-sm text-white resize-none focus:outline-none focus:border-violet-500"
            rows={3}
            autoFocus
          />
          <div className="flex justify-end gap-2">
            <button
              onClick={handleCancel}
              className="px-2.5 py-1 text-xs text-zinc-400 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-2.5 py-1 text-xs bg-violet-600 hover:bg-violet-500 text-white rounded-lg transition-colors"
            >
              Save
            </button>
          </div>
        </div>
      ) : (
        <div className="relative">
          <p className="text-sm text-zinc-300 leading-relaxed pr-8">
            {segment.text}
          </p>
          <button
            onClick={() => setIsEditing(true)}
            className="absolute top-0 right-0 p-1.5 opacity-0 group-hover:opacity-100 hover:bg-white/10 rounded-lg transition-all"
          >
            <Edit3 size={14} className="text-zinc-400" />
          </button>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// Script Section
// ============================================================================

function ScriptSection() {
  const {
    project,
    isGeneratingScript,
    updateScriptSegment,
    regenerateScript,
  } = useQuickVideoV2();

  const [isExpanded, setIsExpanded] = useState(true);

  if (!project.script) return null;

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-2 text-sm font-medium text-white"
        >
          <Sparkles size={16} className="text-violet-400" />
          AI Script
          {isExpanded ? (
            <ChevronUp size={14} className="text-zinc-500" />
          ) : (
            <ChevronDown size={14} className="text-zinc-500" />
          )}
        </button>
        <button
          onClick={regenerateScript}
          disabled={isGeneratingScript}
          className="flex items-center gap-1.5 px-2.5 py-1 text-xs text-zinc-400 hover:text-white hover:bg-white/10 rounded-lg transition-all disabled:opacity-50"
        >
          <RefreshCw size={12} className={isGeneratingScript ? 'animate-spin' : ''} />
          Regenerate
        </button>
      </div>

      {/* Segments */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="space-y-2 overflow-hidden"
          >
            {project.script.segments.map((segment, index) => {
              const image = project.images.find((img) => img.id === segment.imageId);
              return (
                <SegmentEditor
                  key={segment.id}
                  segment={segment}
                  index={index}
                  imageLabel={image?.label || ''}
                  onUpdate={(text) => updateScriptSegment(segment.id, text)}
                />
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ============================================================================
// Synthesize Button
// ============================================================================

function SynthesizeButton() {
  const {
    project,
    isSynthesizingVoice,
    canSynthesizeVoice,
    synthesizeVoice,
  } = useQuickVideoV2();

  const hasSynthesized = !!project.synthesizedVoice;
  const selectedVoice = project.selectedVoice ? getVoiceById(project.selectedVoice.voiceId) : null;

  return (
    <div className="space-y-2">
      {selectedVoice && (
        <div className="flex items-center gap-2 p-2 bg-white/5 rounded-lg">
          <div className="w-8 h-8 rounded-lg bg-violet-500/20 flex items-center justify-center">
            <Mic2 size={14} className="text-violet-400" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-white truncate">{selectedVoice.name}</p>
            <p className="text-[10px] text-zinc-500">{selectedVoice.languageName} • {selectedVoice.accent}</p>
          </div>
        </div>
      )}

      <button
        onClick={synthesizeVoice}
        disabled={!canSynthesizeVoice()}
        className={`
          w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-semibold transition-all duration-300
          ${canSynthesizeVoice()
            ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white hover:from-emerald-500 hover:to-teal-500 shadow-lg shadow-emerald-900/25'
            : 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
          }
        `}
      >
        {isSynthesizingVoice ? (
          <>
            <Loader2 size={18} className="animate-spin" />
            <span>Generating Voice...</span>
          </>
        ) : hasSynthesized ? (
          <>
            <Check size={18} />
            <span>Regenerate Voice</span>
          </>
        ) : (
          <>
            <Mic2 size={18} />
            <span>Generate Voice</span>
          </>
        )}
      </button>
    </div>
  );
}

// ============================================================================
// Voice Status
// ============================================================================

function VoiceStatus() {
  const { project, clearVoice } = useQuickVideoV2();

  if (!project.synthesizedVoice) return null;

  const voice = project.selectedVoice ? getVoiceById(project.selectedVoice.voiceId) : null;

  return (
    <div className="flex items-center justify-between p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center">
          <Volume2 size={16} className="text-emerald-400" />
        </div>
        <div>
          <p className="text-sm font-medium text-emerald-200">Voice Ready</p>
          <p className="text-xs text-emerald-400/60">
            {project.synthesizedVoice.duration.toFixed(1)}s •{' '}
            {voice?.name || project.selectedVoice?.name}
          </p>
        </div>
      </div>
      <button
        onClick={clearVoice}
        className="p-1.5 hover:bg-emerald-500/20 rounded-lg transition-colors"
      >
        <X size={14} className="text-emerald-400" />
      </button>
    </div>
  );
}

// ============================================================================
// Main Voice Panel
// ============================================================================

export function VoicePanel({ onClose }: VoicePanelProps) {
  const { project } = useQuickVideoV2();

  return (
    <div className="h-full flex flex-col w-[340px]">
      {/* Header */}
      <div className="flex-shrink-0 flex items-center justify-between p-4 border-b border-white/5">
        <div className="flex items-center gap-2">
          <Mic2 size={18} className="text-violet-400" />
          <span className="font-semibold text-white">Voice & Script</span>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
        >
          <X size={16} className="text-zinc-400" />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-6">
        {/* Script Section */}
        <ScriptSection />

        {/* Divider */}
        {project.script && <div className="h-px bg-white/5" />}

        {/* Voice Selector */}
        {project.script && <VoiceSelector />}

        {/* Voice Status */}
        <VoiceStatus />
      </div>

      {/* Footer - Synthesize Button */}
      {project.script && (
        <div className="flex-shrink-0 p-4 border-t border-white/5 bg-zinc-900/50">
          <SynthesizeButton />
        </div>
      )}

      {/* Empty State */}
      {!project.script && (
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
          <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mb-4">
            <Sparkles size={24} className="text-zinc-600" />
          </div>
          <p className="text-sm text-zinc-400 mb-1">No script generated yet</p>
          <p className="text-xs text-zinc-600">
            Click "Generate AI Script" in the left panel to create your narration
          </p>
        </div>
      )}
    </div>
  );
}

export default VoicePanel;
