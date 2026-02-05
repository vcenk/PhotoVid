/**
 * Music Library
 * Curated royalty-free music tracks from Pixabay
 * All tracks are free for commercial use
 */

export interface MusicTrack {
  id: string;
  name: string;
  artist: string;
  genre: 'upbeat' | 'elegant' | 'cinematic' | 'corporate' | 'ambient' | 'inspiring';
  mood: string;
  duration: number; // seconds
  bpm?: number;
  url: string;
  waveformColor?: string;
}

// Free music from Pixabay (royalty-free, no attribution required)
export const MUSIC_LIBRARY: MusicTrack[] = [
  // Upbeat / Energetic
  {
    id: 'upbeat-1',
    name: 'Uplifting Day',
    artist: 'Pixabay',
    genre: 'upbeat',
    mood: 'Happy & Energetic',
    duration: 132,
    bpm: 120,
    url: 'https://cdn.pixabay.com/download/audio/2022/10/25/audio_946b0939c8.mp3',
    waveformColor: '#f59e0b',
  },
  {
    id: 'upbeat-2',
    name: 'Happy Day',
    artist: 'Pixabay',
    genre: 'upbeat',
    mood: 'Cheerful & Bright',
    duration: 105,
    bpm: 110,
    url: 'https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3',
    waveformColor: '#f59e0b',
  },

  // Elegant / Sophisticated
  {
    id: 'elegant-1',
    name: 'Elegant Piano',
    artist: 'Pixabay',
    genre: 'elegant',
    mood: 'Sophisticated & Calm',
    duration: 180,
    url: 'https://cdn.pixabay.com/download/audio/2022/01/18/audio_d0a13f69d2.mp3',
    waveformColor: '#8b5cf6',
  },
  {
    id: 'elegant-2',
    name: 'Luxury Lounge',
    artist: 'Pixabay',
    genre: 'elegant',
    mood: 'Premium & Refined',
    duration: 156,
    url: 'https://cdn.pixabay.com/download/audio/2022/08/02/audio_884fe92c21.mp3',
    waveformColor: '#8b5cf6',
  },

  // Cinematic / Epic
  {
    id: 'cinematic-1',
    name: 'Cinematic Trailer',
    artist: 'Pixabay',
    genre: 'cinematic',
    mood: 'Epic & Dramatic',
    duration: 60,
    url: 'https://cdn.pixabay.com/download/audio/2022/02/22/audio_d1718ab41b.mp3',
    waveformColor: '#ef4444',
  },
  {
    id: 'cinematic-2',
    name: 'Documentary',
    artist: 'Pixabay',
    genre: 'cinematic',
    mood: 'Emotional & Moving',
    duration: 147,
    url: 'https://cdn.pixabay.com/download/audio/2022/05/16/audio_1333dfb1b4.mp3',
    waveformColor: '#ef4444',
  },

  // Corporate / Business
  {
    id: 'corporate-1',
    name: 'Corporate Innovation',
    artist: 'Pixabay',
    genre: 'corporate',
    mood: 'Professional & Modern',
    duration: 135,
    bpm: 100,
    url: 'https://cdn.pixabay.com/download/audio/2022/03/10/audio_c8c8a73467.mp3',
    waveformColor: '#3b82f6',
  },
  {
    id: 'corporate-2',
    name: 'Business Presentation',
    artist: 'Pixabay',
    genre: 'corporate',
    mood: 'Clean & Confident',
    duration: 120,
    bpm: 95,
    url: 'https://cdn.pixabay.com/download/audio/2022/08/25/audio_4f3b0a8a3e.mp3',
    waveformColor: '#3b82f6',
  },

  // Ambient / Relaxing
  {
    id: 'ambient-1',
    name: 'Peaceful Morning',
    artist: 'Pixabay',
    genre: 'ambient',
    mood: 'Calm & Serene',
    duration: 195,
    url: 'https://cdn.pixabay.com/download/audio/2022/01/20/audio_d16737dc28.mp3',
    waveformColor: '#10b981',
  },
  {
    id: 'ambient-2',
    name: 'Nature Sounds',
    artist: 'Pixabay',
    genre: 'ambient',
    mood: 'Tranquil & Natural',
    duration: 180,
    url: 'https://cdn.pixabay.com/download/audio/2022/03/15/audio_8cb749d484.mp3',
    waveformColor: '#10b981',
  },

  // Inspiring / Motivational
  {
    id: 'inspiring-1',
    name: 'Inspiring Cinematic',
    artist: 'Pixabay',
    genre: 'inspiring',
    mood: 'Uplifting & Hopeful',
    duration: 162,
    url: 'https://cdn.pixabay.com/download/audio/2022/04/27/audio_67bcb18a67.mp3',
    waveformColor: '#ec4899',
  },
  {
    id: 'inspiring-2',
    name: 'Motivational Story',
    artist: 'Pixabay',
    genre: 'inspiring',
    mood: 'Emotional & Powerful',
    duration: 144,
    url: 'https://cdn.pixabay.com/download/audio/2022/10/30/audio_fdc55c3799.mp3',
    waveformColor: '#ec4899',
  },
];

// Genre colors for UI
export const GENRE_COLORS: Record<MusicTrack['genre'], string> = {
  upbeat: 'from-amber-500/20 to-orange-500/20',
  elegant: 'from-violet-500/20 to-purple-500/20',
  cinematic: 'from-red-500/20 to-rose-500/20',
  corporate: 'from-blue-500/20 to-cyan-500/20',
  ambient: 'from-emerald-500/20 to-green-500/20',
  inspiring: 'from-pink-500/20 to-rose-500/20',
};

// Get tracks by genre
export function getTracksByGenre(genre: MusicTrack['genre']): MusicTrack[] {
  return MUSIC_LIBRARY.filter(track => track.genre === genre);
}

// Format duration as MM:SS
export function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}
