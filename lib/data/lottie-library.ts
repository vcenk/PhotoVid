/**
 * Lottie Animations Library
 * Curated free Lottie animations from LottieFiles
 * Perfect for real estate videos, transitions, and overlays
 */

export interface LottieAnimation {
  id: string;
  name: string;
  category: 'transition' | 'overlay' | 'icon' | 'text' | 'celebration' | 'loading';
  description: string;
  url: string;
  previewUrl?: string;
  duration?: number; // frames
}

// Free Lottie animations from LottieFiles
export const LOTTIE_LIBRARY: LottieAnimation[] = [
  // Transitions
  {
    id: 'transition-swipe',
    name: 'Swipe Transition',
    category: 'transition',
    description: 'Smooth swipe wipe effect',
    url: 'https://assets3.lottiefiles.com/packages/lf20_msdmfngy.json',
  },
  {
    id: 'transition-circle',
    name: 'Circle Reveal',
    category: 'transition',
    description: 'Expanding circle transition',
    url: 'https://assets5.lottiefiles.com/packages/lf20_zyquagfl.json',
  },
  {
    id: 'transition-glitch',
    name: 'Glitch Effect',
    category: 'transition',
    description: 'Digital glitch transition',
    url: 'https://assets2.lottiefiles.com/packages/lf20_uwR49r.json',
  },

  // Overlays
  {
    id: 'overlay-sparkle',
    name: 'Sparkle Overlay',
    category: 'overlay',
    description: 'Sparkling particles effect',
    url: 'https://assets9.lottiefiles.com/packages/lf20_u4yrau.json',
  },
  {
    id: 'overlay-confetti',
    name: 'Confetti',
    category: 'overlay',
    description: 'Celebration confetti rain',
    url: 'https://assets4.lottiefiles.com/packages/lf20_rovf9gpa.json',
  },
  {
    id: 'overlay-particles',
    name: 'Floating Particles',
    category: 'overlay',
    description: 'Gentle floating particles',
    url: 'https://assets1.lottiefiles.com/packages/lf20_kxsd2ytq.json',
  },

  // Icons (Real Estate)
  {
    id: 'icon-home',
    name: 'Home Icon',
    category: 'icon',
    description: 'Animated house icon',
    url: 'https://assets7.lottiefiles.com/packages/lf20_ystsffqy.json',
  },
  {
    id: 'icon-location',
    name: 'Location Pin',
    category: 'icon',
    description: 'Bouncing map marker',
    url: 'https://assets3.lottiefiles.com/packages/lf20_UJNc2t.json',
  },
  {
    id: 'icon-heart',
    name: 'Heart',
    category: 'icon',
    description: 'Pulsing heart animation',
    url: 'https://assets4.lottiefiles.com/packages/lf20_jR229r.json',
  },
  {
    id: 'icon-check',
    name: 'Checkmark',
    category: 'icon',
    description: 'Success checkmark',
    url: 'https://assets9.lottiefiles.com/packages/lf20_jbrw3hcz.json',
  },

  // Text animations
  {
    id: 'text-typing',
    name: 'Typing Cursor',
    category: 'text',
    description: 'Blinking text cursor',
    url: 'https://assets6.lottiefiles.com/packages/lf20_j1klcaon.json',
  },
  {
    id: 'text-underline',
    name: 'Underline Draw',
    category: 'text',
    description: 'Drawing underline effect',
    url: 'https://assets2.lottiefiles.com/packages/lf20_kkflmtur.json',
  },

  // Celebration
  {
    id: 'celebration-fireworks',
    name: 'Fireworks',
    category: 'celebration',
    description: 'Colorful fireworks burst',
    url: 'https://assets1.lottiefiles.com/packages/lf20_rovf9gpa.json',
  },
  {
    id: 'celebration-stars',
    name: 'Star Burst',
    category: 'celebration',
    description: 'Exploding stars effect',
    url: 'https://assets8.lottiefiles.com/packages/lf20_obhph3sh.json',
  },

  // Loading / Progress
  {
    id: 'loading-spinner',
    name: 'Elegant Spinner',
    category: 'loading',
    description: 'Smooth loading spinner',
    url: 'https://assets5.lottiefiles.com/packages/lf20_x62chJ.json',
  },
  {
    id: 'loading-dots',
    name: 'Bouncing Dots',
    category: 'loading',
    description: 'Three bouncing dots',
    url: 'https://assets3.lottiefiles.com/packages/lf20_szlepvdh.json',
  },
];

// Category colors for UI
export const LOTTIE_CATEGORY_COLORS: Record<LottieAnimation['category'], string> = {
  transition: 'from-purple-500/20 to-indigo-500/20',
  overlay: 'from-pink-500/20 to-rose-500/20',
  icon: 'from-blue-500/20 to-cyan-500/20',
  text: 'from-emerald-500/20 to-green-500/20',
  celebration: 'from-yellow-500/20 to-orange-500/20',
  loading: 'from-gray-500/20 to-zinc-500/20',
};

// Get animations by category
export function getLottieByCategory(category: LottieAnimation['category']): LottieAnimation[] {
  return LOTTIE_LIBRARY.filter(anim => anim.category === category);
}

// Get all categories
export function getAllLottieCategories(): LottieAnimation['category'][] {
  return ['transition', 'overlay', 'icon', 'text', 'celebration', 'loading'];
}
