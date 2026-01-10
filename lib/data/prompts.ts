import { PromptSuggestion } from '../types/studio';

export const PROMPT_SUGGESTIONS: PromptSuggestion[] = [
  // ============================================
  // REAL ESTATE PROMPTS
  // ============================================
  {
    id: 'prompt-re-golden-hour',
    industryId: 'real-estate',
    category: 'Lighting',
    title: 'Golden Hour Magic',
    prompt: 'Cinematic golden hour lighting, warm sun rays, lens flare, luxury real estate, 4K quality',
    icon: '🌅',
    description: 'Warm sunset lighting for exterior shots'
  },
  {
    id: 'prompt-re-twilight',
    industryId: 'real-estate',
    category: 'Lighting',
    title: 'Twilight Blue Hour',
    prompt: 'Twilight blue hour, warm interior lights glowing, dramatic sky gradient, professional real estate',
    icon: '🌆',
    description: 'Dusk atmosphere with interior warmth'
  },
  {
    id: 'prompt-re-virtual-tour',
    industryId: 'real-estate',
    category: 'Motion',
    title: 'Virtual Tour',
    prompt: 'Smooth dolly forward motion, natural daylight, walkthrough experience, inviting atmosphere',
    icon: '🚶',
    description: 'Walking-style tour motion'
  },
  {
    id: 'prompt-re-aerial',
    industryId: 'real-estate',
    category: 'Motion',
    title: 'Aerial Reveal',
    prompt: 'Drone descending shot, aerial view transitioning to ground level, cinematic reveal',
    icon: '🚁',
    description: 'Drone-style sweeping reveal'
  },
  {
    id: 'prompt-re-luxury',
    industryId: 'real-estate',
    category: 'Style',
    title: 'Luxury Estate',
    prompt: 'High-end luxury property, marble and wood textures, pristine condition, magazine-quality',
    icon: '💎',
    description: 'Premium luxury aesthetics'
  },
  {
    id: 'prompt-re-modern',
    industryId: 'real-estate',
    category: 'Style',
    title: 'Modern Minimalist',
    prompt: 'Clean modern interior, minimalist design, natural light, open floor plan',
    icon: '🏢',
    description: 'Contemporary clean aesthetics'
  },

  // ============================================
  // E-COMMERCE PROMPTS
  // ============================================
  {
    id: 'prompt-ec-product-hero',
    industryId: 'ecommerce',
    category: 'Product',
    title: 'Hero Product Shot',
    prompt: 'Product hero shot, studio lighting, white background, commercial quality, sharp focus',
    icon: '📦',
    description: 'Clean commercial product shot'
  },
  {
    id: 'prompt-ec-360-spin',
    industryId: 'ecommerce',
    category: 'Motion',
    title: '360° Rotation',
    prompt: 'Smooth 360 degree rotation, consistent lighting, all angles visible, product showcase',
    icon: '🔄',
    description: 'Full rotation product view'
  },
  {
    id: 'prompt-ec-lifestyle',
    industryId: 'ecommerce',
    category: 'Style',
    title: 'Lifestyle Context',
    prompt: 'Product in lifestyle setting, natural environment, aspirational context, warm tones',
    icon: '🏡',
    description: 'Product in real-world context'
  },
  {
    id: 'prompt-ec-luxury-product',
    industryId: 'ecommerce',
    category: 'Style',
    title: 'Luxury Presentation',
    prompt: 'Premium product presentation, velvet backdrop, dramatic lighting, jewelry-style showcase',
    icon: '✨',
    description: 'High-end luxury product feel'
  },
  {
    id: 'prompt-ec-unboxing',
    industryId: 'ecommerce',
    category: 'Motion',
    title: 'Unboxing Reveal',
    prompt: 'Product reveal from packaging, anticipation building, gift-like presentation',
    icon: '🎁',
    description: 'Unboxing experience motion'
  },

  // ============================================
  // FOOD & RESTAURANT PROMPTS
  // ============================================
  {
    id: 'prompt-food-steam',
    industryId: 'restaurant',
    category: 'Effects',
    title: 'Steam Rising',
    prompt: 'Hot food with rising steam, appetizing presentation, fresh from kitchen, aromatic',
    icon: '♨️',
    description: 'Add steam to hot dishes'
  },
  {
    id: 'prompt-food-sizzle',
    industryId: 'restaurant',
    category: 'Effects',
    title: 'Sizzling Action',
    prompt: 'Sizzling food, oil bubbling, dynamic cooking action, restaurant quality',
    icon: '🔥',
    description: 'Cooking action effects'
  },
  {
    id: 'prompt-food-pour',
    industryId: 'restaurant',
    category: 'Motion',
    title: 'Liquid Pour',
    prompt: 'Liquid pouring, sauce drizzle, honey drip, slow motion capture, appetizing',
    icon: '🍯',
    description: 'Pouring and drizzling motion'
  },
  {
    id: 'prompt-food-gourmet',
    industryId: 'restaurant',
    category: 'Style',
    title: 'Fine Dining',
    prompt: 'Michelin star presentation, artistic plating, fine dining atmosphere, elegant',
    icon: '🍽️',
    description: 'Upscale dining aesthetics'
  },
  {
    id: 'prompt-food-cozy',
    industryId: 'restaurant',
    category: 'Atmosphere',
    title: 'Cozy Cafe',
    prompt: 'Warm cafe atmosphere, morning light, comfort food, inviting and homey',
    icon: '☕',
    description: 'Warm casual dining mood'
  },

  // ============================================
  // ARCHITECTURE PROMPTS
  // ============================================
  {
    id: 'prompt-arch-reveal',
    industryId: 'architecture',
    category: 'Motion',
    title: 'Dramatic Reveal',
    prompt: 'Architecture reveal shot, dramatic lighting, impressive scale, award-winning design',
    icon: '🏛️',
    description: 'Building reveal with impact'
  },
  {
    id: 'prompt-arch-detail',
    industryId: 'architecture',
    category: 'Motion',
    title: 'Detail Focus',
    prompt: 'Architectural detail close-up, texture focus, material quality, design precision',
    icon: '🔍',
    description: 'Zoom into design details'
  },
  {
    id: 'prompt-arch-modern',
    industryId: 'architecture',
    category: 'Style',
    title: 'Contemporary Design',
    prompt: 'Modern architecture, glass and steel, clean geometric lines, innovative design',
    icon: '🏗️',
    description: 'Modern architectural style'
  },

  // ============================================
  // CORPORATE PROMPTS
  // ============================================
  {
    id: 'prompt-corp-professional',
    industryId: 'agency',
    category: 'Style',
    title: 'Professional Look',
    prompt: 'Corporate professional environment, business attire, confident atmosphere, trustworthy',
    icon: '👔',
    description: 'Business professional aesthetic'
  },
  {
    id: 'prompt-corp-team',
    industryId: 'agency',
    category: 'Subject',
    title: 'Team Dynamics',
    prompt: 'Team collaboration, diverse professionals, positive energy, workplace culture',
    icon: '👥',
    description: 'Team and culture focus'
  },
  {
    id: 'prompt-corp-modern-office',
    industryId: 'agency',
    category: 'Environment',
    title: 'Modern Workspace',
    prompt: 'Contemporary office space, open plan, natural light, tech-forward environment',
    icon: '🏢',
    description: 'Modern office setting'
  },
];

// Helper functions
export const getPromptsByIndustry = (industryId: string): PromptSuggestion[] => {
  return PROMPT_SUGGESTIONS.filter(p => p.industryId === industryId);
};

export const getPromptsByCategory = (category: string): PromptSuggestion[] => {
  return PROMPT_SUGGESTIONS.filter(p => p.category === category);
};

export const getPromptCategories = (industryId: string): string[] => {
  const prompts = getPromptsByIndustry(industryId);
  return [...new Set(prompts.map(p => p.category))];
};
