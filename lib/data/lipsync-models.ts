import { LucideIcon, Video, Wand2, Sparkles, Zap } from 'lucide-react';

export type LipsyncInputType = 'video' | 'image';
export type LipsyncAudioType = 'audio-file' | 'text-to-speech' | 'both';

export interface LipsyncModelConfig {
  id: string;
  name: string;
  displayName: string;
  icon: LucideIcon;
  description: string;
  inputType: LipsyncInputType;
  audioType: LipsyncAudioType;
  duration: string;
  price: string;
  endpoint: string;
  requiredFields: {
    video_url?: boolean;
    image_url?: boolean;
    audio_url?: boolean;
    text?: boolean;
    model?: string;
    sync_mode?: string[];
  };
  features: string[];
}

export const LIPSYNC_MODELS: LipsyncModelConfig[] = [
  {
    id: 'sync-lipsync-2-pro',
    name: 'fal-ai/sync-lipsync/v2/pro',
    displayName: 'Sync Lipsync 2.0 Pro',
    icon: Sparkles,
    description: 'Zero-shot lipsyncing with premium quality. Preserves speaker style without training.',
    inputType: 'video',
    audioType: 'audio-file',
    duration: '5s',
    price: '$1.17/min',
    endpoint: 'fal-ai/sync-lipsync/v2/pro',
    requiredFields: {
      video_url: true,
      audio_url: true,
      model: 'lipsync-2-pro',
      sync_mode: ['cut_off', 'loop', 'bounce', 'silence', 'remap']
    },
    features: ['Zero-shot', 'Style preservation', 'Professional quality']
  },
  {
    id: 'sync-lipsync-2',
    name: 'fal-ai/sync-lipsync/v2',
    displayName: 'Sync Lipsync 2.0',
    icon: Video,
    description: 'High-quality lipsyncing for videos. Great balance of speed and quality.',
    inputType: 'video',
    audioType: 'audio-file',
    duration: '5s',
    price: '$0.70/min',
    endpoint: 'fal-ai/sync-lipsync/v2',
    requiredFields: {
      video_url: true,
      audio_url: true,
      model: 'lipsync-2',
      sync_mode: ['cut_off', 'loop', 'bounce', 'silence', 'remap']
    },
    features: ['Fast processing', 'Multiple sync modes', 'Cost-effective']
  },
  {
    id: 'kling-lipsync-audio',
    name: 'fal-ai/kling-video/lipsync/audio-to-video',
    displayName: 'Kling LipSync (Audio)',
    icon: Wand2,
    description: 'Image-to-video lipsync powered by Kling AI. Upload an image and audio.',
    inputType: 'image',
    audioType: 'audio-file',
    duration: '5s',
    price: 'Variable',
    endpoint: 'fal-ai/kling-video/lipsync/audio-to-video',
    requiredFields: {
      image_url: true,
      audio_url: true
    },
    features: ['Image-to-video', 'Kling AI powered', 'High-quality output']
  },
  {
    id: 'kling-lipsync-text',
    name: 'fal-ai/kling-video/lipsync/text-to-video',
    displayName: 'Kling LipSync (Text)',
    icon: Zap,
    description: 'Image-to-video lipsync with text-to-speech. Upload image, type your text.',
    inputType: 'image',
    audioType: 'text-to-speech',
    duration: '5s',
    price: 'Variable',
    endpoint: 'fal-ai/kling-video/lipsync/text-to-video',
    requiredFields: {
      image_url: true,
      text: true
    },
    features: ['Text-to-speech', 'Image-to-video', 'No audio needed']
  },
  {
    id: 'latentsync',
    name: 'fal-ai/latentsync',
    displayName: 'LatentSync',
    icon: Video,
    description: 'Professional-grade lipsync by ByteDance. Audio-conditioned latent diffusion.',
    inputType: 'video',
    audioType: 'audio-file',
    duration: '5s',
    price: '$0.70/min',
    endpoint: 'fal-ai/latentsync',
    requiredFields: {
      video_url: true,
      audio_url: true
    },
    features: ['ByteDance technology', 'Professional quality', 'Latent diffusion']
  }
];

export const DEFAULT_SYNC_MODE = 'cut_off';

export const SYNC_MODE_DESCRIPTIONS = {
  cut_off: 'Trim audio or video to match shorter duration',
  loop: 'Loop shorter media to match longer duration',
  bounce: 'Bounce shorter media back and forth',
  silence: 'Add silence/freeze frames to match duration',
  remap: 'Intelligently remap timing to match duration'
};
