/**
 * Sound Effects Library
 * Curated royalty-free sound effects from Pixabay
 * All SFX are free for commercial use
 */

export interface SoundEffect {
  id: string;
  name: string;
  category: 'whoosh' | 'impact' | 'transition' | 'ui' | 'nature' | 'notification';
  description: string;
  duration: number; // seconds (approximate)
  url: string;
}

// Free sound effects from Pixabay (royalty-free, no attribution required)
export const SFX_LIBRARY: SoundEffect[] = [
  // Whoosh / Swipe sounds
  {
    id: 'whoosh-1',
    name: 'Whoosh',
    category: 'whoosh',
    description: 'Quick swipe transition',
    duration: 1,
    url: 'https://cdn.pixabay.com/download/audio/2022/03/15/audio_942694dc4f.mp3',
  },
  {
    id: 'whoosh-2',
    name: 'Swipe',
    category: 'whoosh',
    description: 'Fast swoosh effect',
    duration: 0.5,
    url: 'https://cdn.pixabay.com/download/audio/2022/03/24/audio_52a6e3efce.mp3',
  },
  {
    id: 'whoosh-3',
    name: 'Air Whoosh',
    category: 'whoosh',
    description: 'Airy transition sound',
    duration: 1.5,
    url: 'https://cdn.pixabay.com/download/audio/2021/08/04/audio_12b0c7443c.mp3',
  },

  // Impact / Hit sounds
  {
    id: 'impact-1',
    name: 'Deep Impact',
    category: 'impact',
    description: 'Cinematic bass hit',
    duration: 2,
    url: 'https://cdn.pixabay.com/download/audio/2022/03/10/audio_2dde668d05.mp3',
  },
  {
    id: 'impact-2',
    name: 'Punch Hit',
    category: 'impact',
    description: 'Strong impact sound',
    duration: 1,
    url: 'https://cdn.pixabay.com/download/audio/2021/08/04/audio_0625c1539c.mp3',
  },
  {
    id: 'impact-3',
    name: 'Boom',
    category: 'impact',
    description: 'Epic boom effect',
    duration: 3,
    url: 'https://cdn.pixabay.com/download/audio/2022/10/30/audio_946b0939c8.mp3',
  },

  // Transition sounds
  {
    id: 'transition-1',
    name: 'Glitch',
    category: 'transition',
    description: 'Digital glitch effect',
    duration: 0.5,
    url: 'https://cdn.pixabay.com/download/audio/2022/03/15/audio_8d4e269e93.mp3',
  },
  {
    id: 'transition-2',
    name: 'Page Turn',
    category: 'transition',
    description: 'Paper flip sound',
    duration: 0.5,
    url: 'https://cdn.pixabay.com/download/audio/2022/03/19/audio_b92de2f88e.mp3',
  },
  {
    id: 'transition-3',
    name: 'Camera Shutter',
    category: 'transition',
    description: 'Photo capture click',
    duration: 0.3,
    url: 'https://cdn.pixabay.com/download/audio/2022/03/10/audio_270f49fb4c.mp3',
  },

  // UI sounds
  {
    id: 'ui-1',
    name: 'Click',
    category: 'ui',
    description: 'Button click',
    duration: 0.2,
    url: 'https://cdn.pixabay.com/download/audio/2022/03/10/audio_942694dc4f.mp3',
  },
  {
    id: 'ui-2',
    name: 'Pop',
    category: 'ui',
    description: 'Bubble pop',
    duration: 0.3,
    url: 'https://cdn.pixabay.com/download/audio/2022/01/18/audio_ea70d5b868.mp3',
  },
  {
    id: 'ui-3',
    name: 'Ding',
    category: 'ui',
    description: 'Notification ding',
    duration: 1,
    url: 'https://cdn.pixabay.com/download/audio/2021/08/04/audio_c6ccf3232f.mp3',
  },

  // Nature sounds
  {
    id: 'nature-1',
    name: 'Birds Chirping',
    category: 'nature',
    description: 'Morning birds',
    duration: 5,
    url: 'https://cdn.pixabay.com/download/audio/2022/02/07/audio_56a5d0b55c.mp3',
  },
  {
    id: 'nature-2',
    name: 'Wind',
    category: 'nature',
    description: 'Gentle breeze',
    duration: 10,
    url: 'https://cdn.pixabay.com/download/audio/2022/03/09/audio_fb7a4af0c7.mp3',
  },

  // Notification sounds
  {
    id: 'notification-1',
    name: 'Success',
    category: 'notification',
    description: 'Success chime',
    duration: 1,
    url: 'https://cdn.pixabay.com/download/audio/2022/03/10/audio_23899b5e0a.mp3',
  },
  {
    id: 'notification-2',
    name: 'Alert',
    category: 'notification',
    description: 'Attention alert',
    duration: 0.5,
    url: 'https://cdn.pixabay.com/download/audio/2022/07/19/audio_b4fcb9b1f6.mp3',
  },
];

// Category colors for UI
export const CATEGORY_COLORS: Record<SoundEffect['category'], string> = {
  whoosh: 'from-cyan-500/20 to-blue-500/20',
  impact: 'from-red-500/20 to-orange-500/20',
  transition: 'from-purple-500/20 to-pink-500/20',
  ui: 'from-green-500/20 to-emerald-500/20',
  nature: 'from-emerald-500/20 to-teal-500/20',
  notification: 'from-yellow-500/20 to-amber-500/20',
};

// Category icons (lucide icon names)
export const CATEGORY_ICONS: Record<SoundEffect['category'], string> = {
  whoosh: 'Wind',
  impact: 'Zap',
  transition: 'ArrowRightLeft',
  ui: 'MousePointer',
  nature: 'Trees',
  notification: 'Bell',
};

// Get SFX by category
export function getSfxByCategory(category: SoundEffect['category']): SoundEffect[] {
  return SFX_LIBRARY.filter(sfx => sfx.category === category);
}

// Get all categories
export function getAllCategories(): SoundEffect['category'][] {
  return ['whoosh', 'impact', 'transition', 'ui', 'nature', 'notification'];
}
