// Real Estate Prompt Templates for AI Scene Generation

export interface SceneTemplate {
  id: string;
  room: string;
  type: 'exterior' | 'interior' | 'aerial' | 'detail' | 'neighborhood';
  motionStyle: string;
  duration: number;
  promptTemplate: string;
  keywords: string[];
  priority: number; // Lower = higher priority for auto-ordering
}

export interface PropertyTypeConfig {
  id: string;
  label: string;
  recommendedScenes: string[];
  defaultSceneCount: number;
}

// Scene templates for different room types
export const SCENE_TEMPLATES: SceneTemplate[] = [
  // Exterior scenes
  {
    id: 'exterior-front',
    room: 'exterior-front',
    type: 'exterior',
    motionStyle: 'dolly-forward',
    duration: 5,
    promptTemplate: 'Cinematic approach to {style} home exterior, smooth dolly forward movement, golden hour lighting, professional real estate photography',
    keywords: ['front', 'exterior', 'facade', 'curb appeal', 'entrance'],
    priority: 1,
  },
  {
    id: 'exterior-aerial',
    room: 'exterior-aerial',
    type: 'aerial',
    motionStyle: 'orbit',
    duration: 8,
    promptTemplate: 'Aerial drone footage orbiting {style} property, revealing full lot and surroundings, cinematic movement, high quality',
    keywords: ['aerial', 'drone', 'overhead', 'bird eye'],
    priority: 2,
  },
  {
    id: 'exterior-backyard',
    room: 'backyard',
    type: 'exterior',
    motionStyle: 'pan-right',
    duration: 5,
    promptTemplate: 'Smooth pan across backyard of {style} home, showcasing outdoor living space, natural lighting',
    keywords: ['backyard', 'yard', 'outdoor', 'patio', 'deck'],
    priority: 15,
  },

  // Interior scenes - Main living areas
  {
    id: 'living-room',
    room: 'living-room',
    type: 'interior',
    motionStyle: 'dolly-forward',
    duration: 5,
    promptTemplate: 'Cinematic dolly into spacious living room, {style} interior design, natural light streaming through windows, professional interior photography',
    keywords: ['living', 'family room', 'great room', 'lounge'],
    priority: 3,
  },
  {
    id: 'kitchen',
    room: 'kitchen',
    type: 'interior',
    motionStyle: 'pan-left',
    duration: 5,
    promptTemplate: 'Smooth pan revealing {style} kitchen, showcasing countertops, appliances, and cabinetry, warm inviting atmosphere',
    keywords: ['kitchen', 'cooking', 'chef'],
    priority: 4,
  },
  {
    id: 'dining-room',
    room: 'dining-room',
    type: 'interior',
    motionStyle: 'zoom-in',
    duration: 4,
    promptTemplate: 'Elegant zoom into {style} dining area, highlighting table setting and ambient lighting',
    keywords: ['dining', 'eat-in', 'breakfast nook'],
    priority: 5,
  },

  // Bedrooms
  {
    id: 'master-bedroom',
    room: 'master-bedroom',
    type: 'interior',
    motionStyle: 'dolly-forward',
    duration: 5,
    promptTemplate: 'Cinematic reveal of luxurious master bedroom, {style} decor, soft natural lighting, serene atmosphere',
    keywords: ['master', 'primary', 'main bedroom', 'owner suite'],
    priority: 6,
  },
  {
    id: 'bedroom-2',
    room: 'bedroom',
    type: 'interior',
    motionStyle: 'pan-right',
    duration: 4,
    promptTemplate: 'Pan across comfortable bedroom space, {style} furnishings, bright and airy feel',
    keywords: ['bedroom', 'guest room', 'secondary bedroom'],
    priority: 8,
  },
  {
    id: 'bedroom-3',
    room: 'bedroom',
    type: 'interior',
    motionStyle: 'zoom-in',
    duration: 4,
    promptTemplate: 'Gentle zoom into cozy bedroom, {style} interior, natural daylight',
    keywords: ['bedroom', 'kids room', 'third bedroom'],
    priority: 9,
  },

  // Bathrooms
  {
    id: 'master-bathroom',
    room: 'master-bathroom',
    type: 'interior',
    motionStyle: 'pan-left',
    duration: 4,
    promptTemplate: 'Elegant pan through spa-like master bathroom, {style} fixtures, clean and luxurious atmosphere',
    keywords: ['master bath', 'ensuite', 'primary bathroom'],
    priority: 7,
  },
  {
    id: 'bathroom',
    room: 'bathroom',
    type: 'interior',
    motionStyle: 'zoom-in',
    duration: 3,
    promptTemplate: 'Clean zoom showcasing {style} bathroom, modern fixtures, bright lighting',
    keywords: ['bathroom', 'bath', 'powder room', 'half bath'],
    priority: 10,
  },

  // Special rooms
  {
    id: 'office',
    room: 'office',
    type: 'interior',
    motionStyle: 'dolly-forward',
    duration: 4,
    promptTemplate: 'Professional dolly into home office space, {style} design, productive atmosphere with natural light',
    keywords: ['office', 'study', 'den', 'workspace', 'work from home'],
    priority: 11,
  },
  {
    id: 'garage',
    room: 'garage',
    type: 'interior',
    motionStyle: 'pan-right',
    duration: 4,
    promptTemplate: 'Pan through spacious garage, clean and organized, ample storage space',
    keywords: ['garage', 'car', 'parking'],
    priority: 14,
  },
  {
    id: 'basement',
    room: 'basement',
    type: 'interior',
    motionStyle: 'dolly-forward',
    duration: 5,
    promptTemplate: 'Reveal of finished basement space, {style} entertainment area, versatile living space',
    keywords: ['basement', 'lower level', 'rec room', 'game room'],
    priority: 13,
  },
  {
    id: 'laundry',
    room: 'laundry',
    type: 'interior',
    motionStyle: 'zoom-in',
    duration: 3,
    promptTemplate: 'Zoom into functional laundry room, modern appliances, organized space',
    keywords: ['laundry', 'utility', 'mudroom'],
    priority: 12,
  },

  // Amenities
  {
    id: 'pool',
    room: 'pool',
    type: 'exterior',
    motionStyle: 'orbit',
    duration: 6,
    promptTemplate: 'Cinematic orbit around sparkling pool area, {style} outdoor living, resort-like atmosphere',
    keywords: ['pool', 'swimming', 'spa', 'hot tub'],
    priority: 16,
  },
  {
    id: 'gym',
    room: 'gym',
    type: 'interior',
    motionStyle: 'pan-left',
    duration: 4,
    promptTemplate: 'Pan through home gym, modern fitness equipment, motivating atmosphere',
    keywords: ['gym', 'fitness', 'workout', 'exercise'],
    priority: 17,
  },
  {
    id: 'theater',
    room: 'theater',
    type: 'interior',
    motionStyle: 'dolly-back',
    duration: 5,
    promptTemplate: 'Dramatic reveal of home theater room, comfortable seating, immersive entertainment space',
    keywords: ['theater', 'media room', 'cinema', 'entertainment'],
    priority: 18,
  },
  {
    id: 'wine-cellar',
    room: 'wine-cellar',
    type: 'interior',
    motionStyle: 'dolly-forward',
    duration: 4,
    promptTemplate: 'Elegant entry into wine cellar, {style} storage, sophisticated atmosphere',
    keywords: ['wine', 'cellar', 'wine room'],
    priority: 19,
  },

  // Neighborhood/Location
  {
    id: 'neighborhood',
    room: 'neighborhood',
    type: 'neighborhood',
    motionStyle: 'pan-right',
    duration: 5,
    promptTemplate: 'Scenic pan of neighborhood, tree-lined streets, welcoming community atmosphere',
    keywords: ['neighborhood', 'community', 'street', 'location'],
    priority: 20,
  },
];

// Property type configurations
export const PROPERTY_TYPE_CONFIGS: PropertyTypeConfig[] = [
  {
    id: 'house',
    label: 'Single Family Home',
    recommendedScenes: [
      'exterior-front',
      'living-room',
      'kitchen',
      'dining-room',
      'master-bedroom',
      'master-bathroom',
      'bedroom-2',
      'bathroom',
      'backyard',
    ],
    defaultSceneCount: 8,
  },
  {
    id: 'condo',
    label: 'Condominium',
    recommendedScenes: [
      'exterior-front',
      'living-room',
      'kitchen',
      'master-bedroom',
      'master-bathroom',
      'bedroom-2',
      'bathroom',
    ],
    defaultSceneCount: 6,
  },
  {
    id: 'apartment',
    label: 'Apartment',
    recommendedScenes: [
      'living-room',
      'kitchen',
      'master-bedroom',
      'bathroom',
      'bedroom-2',
    ],
    defaultSceneCount: 5,
  },
  {
    id: 'townhouse',
    label: 'Townhouse',
    recommendedScenes: [
      'exterior-front',
      'living-room',
      'kitchen',
      'dining-room',
      'master-bedroom',
      'master-bathroom',
      'bedroom-2',
      'backyard',
    ],
    defaultSceneCount: 7,
  },
  {
    id: 'luxury',
    label: 'Luxury Estate',
    recommendedScenes: [
      'exterior-aerial',
      'exterior-front',
      'living-room',
      'kitchen',
      'dining-room',
      'master-bedroom',
      'master-bathroom',
      'bedroom-2',
      'bedroom-3',
      'office',
      'pool',
      'backyard',
      'garage',
    ],
    defaultSceneCount: 12,
  },
  {
    id: 'commercial',
    label: 'Commercial Property',
    recommendedScenes: [
      'exterior-front',
      'exterior-aerial',
      'living-room', // Main area
      'office',
      'bathroom',
    ],
    defaultSceneCount: 5,
  },
];

// Style descriptors for different property styles
export const PROPERTY_STYLES: Record<string, string> = {
  modern: 'modern minimalist',
  traditional: 'classic traditional',
  contemporary: 'sleek contemporary',
  craftsman: 'warm craftsman',
  colonial: 'elegant colonial',
  mediterranean: 'Mediterranean-inspired',
  farmhouse: 'charming farmhouse',
  midcentury: 'mid-century modern',
  victorian: 'ornate Victorian',
  coastal: 'breezy coastal',
  industrial: 'urban industrial',
  scandinavian: 'Scandinavian-inspired',
  rustic: 'rustic cabin',
  luxury: 'high-end luxury',
};

// Text overlay templates for scenes
export const TEXT_OVERLAY_TEMPLATES: Record<string, string[]> = {
  'exterior-front': [
    'Welcome Home',
    '{bedrooms} Bed | {bathrooms} Bath | {sqft} Sq Ft',
    '{address}',
  ],
  'living-room': [
    'Open Concept Living',
    'Spacious Living Area',
    'Natural Light Throughout',
  ],
  'kitchen': [
    'Gourmet Kitchen',
    'Chef\'s Dream Kitchen',
    'Modern Kitchen Design',
  ],
  'master-bedroom': [
    'Luxurious Master Suite',
    'Private Retreat',
    'Owner\'s Suite',
  ],
  'backyard': [
    'Private Backyard Oasis',
    'Outdoor Living Space',
    'Entertainment Ready',
  ],
  'pool': [
    'Resort-Style Pool',
    'Private Pool & Spa',
    'Year-Round Entertainment',
  ],
};

// Music track suggestions based on property type
export const MUSIC_SUGGESTIONS: Record<string, string[]> = {
  luxury: ['Elegant Piano', 'Orchestral Ambient', 'Sophisticated Jazz'],
  modern: ['Electronic Ambient', 'Minimal Beats', 'Contemporary Chill'],
  traditional: ['Classical Light', 'Acoustic Warmth', 'Gentle Strings'],
  farmhouse: ['Acoustic Guitar', 'Country Warmth', 'Folk Inspired'],
  coastal: ['Ocean Vibes', 'Beach Chill', 'Island Breeze'],
  default: ['Cinematic Ambient', 'Inspiring Piano', 'Soft Background'],
};

// Helper function to get scene template by room
export function getSceneTemplateByRoom(room: string): SceneTemplate | undefined {
  return SCENE_TEMPLATES.find(t => t.room === room || t.id === room);
}

// Helper function to get recommended scenes for property type
export function getRecommendedScenes(propertyType: string): SceneTemplate[] {
  const config = PROPERTY_TYPE_CONFIGS.find(p => p.id === propertyType);
  if (!config) return SCENE_TEMPLATES.slice(0, 8);

  return config.recommendedScenes
    .map(id => SCENE_TEMPLATES.find(t => t.id === id))
    .filter((t): t is SceneTemplate => t !== undefined);
}

// Helper function to build a prompt from template
export function buildPromptFromTemplate(
  template: SceneTemplate,
  propertyData: {
    style?: string;
    bedrooms?: number;
    bathrooms?: number;
    sqft?: number;
    address?: string;
    features?: string[];
  }
): string {
  let prompt = template.promptTemplate;

  // Replace style placeholder
  const styleDesc = propertyData.style
    ? PROPERTY_STYLES[propertyData.style] || propertyData.style
    : 'elegant';
  prompt = prompt.replace('{style}', styleDesc);

  // Replace other placeholders
  if (propertyData.bedrooms) {
    prompt = prompt.replace('{bedrooms}', propertyData.bedrooms.toString());
  }
  if (propertyData.bathrooms) {
    prompt = prompt.replace('{bathrooms}', propertyData.bathrooms.toString());
  }
  if (propertyData.sqft) {
    prompt = prompt.replace('{sqft}', propertyData.sqft.toLocaleString());
  }
  if (propertyData.address) {
    prompt = prompt.replace('{address}', propertyData.address);
  }

  // Add features to prompt if relevant
  if (propertyData.features && propertyData.features.length > 0) {
    const relevantFeatures = propertyData.features.filter(f =>
      template.keywords.some(k => f.toLowerCase().includes(k.toLowerCase()))
    );
    if (relevantFeatures.length > 0) {
      prompt += `, featuring ${relevantFeatures.join(', ')}`;
    }
  }

  return prompt;
}

// Helper to match user description to scene templates
export function matchDescriptionToScenes(description: string): SceneTemplate[] {
  const lowerDesc = description.toLowerCase();
  const matches: { template: SceneTemplate; score: number }[] = [];

  for (const template of SCENE_TEMPLATES) {
    let score = 0;
    for (const keyword of template.keywords) {
      if (lowerDesc.includes(keyword.toLowerCase())) {
        score += 1;
      }
    }
    if (score > 0) {
      matches.push({ template, score });
    }
  }

  // Sort by score descending, then by priority
  return matches
    .sort((a, b) => b.score - a.score || a.template.priority - b.template.priority)
    .map(m => m.template);
}
