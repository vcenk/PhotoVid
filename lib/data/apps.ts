// App definitions for the Apps section - inspired by imagine.art/apps

export type AppCategory = 'image' | 'video' | 'edit' | 'style' | 'fun' | 'business';

export interface AIApp {
  id: string;
  name: string;
  description: string;
  category: AppCategory;
  thumbnail: string;
  beforeImage?: string;
  afterImage?: string;
  isNew?: boolean;
  isTrending?: boolean;
  isPremium?: boolean;
  tags: string[];
  falModel?: string; // FAL AI model ID
}

export const APP_CATEGORIES: { id: AppCategory; label: string; icon: string }[] = [
  { id: 'image', label: 'Image', icon: '🖼️' },
  { id: 'video', label: 'Video', icon: '🎬' },
  { id: 'edit', label: 'Edit', icon: '✏️' },
  { id: 'style', label: 'Style', icon: '🎨' },
  { id: 'fun', label: 'Fun', icon: '🎮' },
  { id: 'business', label: 'Business', icon: '💼' },
];

export const AI_APPS: AIApp[] = [
  // Image Generation
  {
    id: 'text-to-image',
    name: 'Text to Image',
    description: 'Generate stunning images from text descriptions using FLUX AI',
    category: 'image',
    thumbnail: 'https://images.unsplash.com/photo-1547891654-e66ed7ebb968?w=400&h=300&fit=crop',
    isNew: false,
    isTrending: true,
    tags: ['AI Art', 'Creative', 'Popular'],
    falModel: 'fal-ai/flux/dev',
  },
  {
    id: 'image-upscaler',
    name: 'AI Upscaler',
    description: 'Enhance and upscale images up to 4x with incredible detail',
    category: 'edit',
    thumbnail: 'https://images.unsplash.com/photo-1618556450994-a6a128ef0d9d?w=400&h=300&fit=crop',
    isNew: true,
    tags: ['Enhancement', 'Quality', 'Pro'],
    falModel: 'fal-ai/flux-vision-upscaler',
  },
  {
    id: 'background-remover',
    name: 'Background Remover',
    description: 'Remove backgrounds from any image instantly with AI precision',
    category: 'edit',
    thumbnail: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=300&fit=crop',
    isTrending: true,
    tags: ['Edit', 'Quick', 'Essential'],
    falModel: 'fal-ai/imageutils/rembg',
  },
  {
    id: 'style-transfer',
    name: 'Style Transfer',
    description: 'Transform your photos into different artistic styles',
    category: 'style',
    thumbnail: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=400&h=300&fit=crop',
    tags: ['Art', 'Creative', 'Transform'],
    falModel: 'fal-ai/flux/dev/image-to-image',
  },
  
  // Fun & Creative
  {
    id: 'manga-generator',
    name: 'Manga Generator',
    description: 'Transform photos into authentic Japanese manga style art',
    category: 'fun',
    thumbnail: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=400&h=300&fit=crop',
    isNew: true,
    isTrending: true,
    tags: ['Anime', 'Fun', 'Viral'],
  },
  {
    id: 'movie-poster',
    name: 'Movie Poster',
    description: 'Create epic Hollywood-style movie posters featuring you',
    category: 'fun',
    thumbnail: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=400&h=300&fit=crop',
    tags: ['Cinema', 'Creative', 'Portrait'],
  },
  {
    id: 'lego-transform',
    name: 'Lego Transform',
    description: 'Convert yourself or objects into adorable LEGO minifigure style',
    category: 'fun',
    thumbnail: 'https://images.unsplash.com/photo-1587654780291-39c9404d746b?w=400&h=300&fit=crop',
    isTrending: true,
    tags: ['Fun', 'Toys', 'Viral'],
  },
  {
    id: 'pokemon-card',
    name: 'Pokemon Card',
    description: 'Create custom Pokemon cards with any photo',
    category: 'fun',
    thumbnail: 'https://images.unsplash.com/photo-1613771404721-1f92d799e49f?w=400&h=300&fit=crop',
    isNew: true,
    tags: ['Gaming', 'Cards', 'Collectible'],
  },
  
  // Video
  {
    id: 'image-to-video',
    name: 'Image to Video',
    description: 'Bring static images to life with cinematic AI motion',
    category: 'video',
    thumbnail: 'https://images.unsplash.com/photo-1536240478700-b869070f9279?w=400&h=300&fit=crop',
    isTrending: true,
    tags: ['Animation', 'Motion', 'Popular'],
    falModel: 'fal-ai/kling-video/v1.5/pro/image-to-video',
  },
  {
    id: 'lipsync',
    name: 'AI Lipsync',
    description: 'Make any portrait speak with realistic lip sync animation',
    category: 'video',
    thumbnail: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=300&fit=crop',
    isNew: true,
    isTrending: true,
    isPremium: true,
    tags: ['Talking', 'Portrait', 'Pro'],
  },
  
  // Business & Professional
  {
    id: 'product-shot',
    name: 'Product Shot',
    description: 'Create professional product photography from simple photos',
    category: 'business',
    thumbnail: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=300&fit=crop',
    tags: ['E-commerce', 'Professional', 'Marketing'],
  },
  {
    id: 'headshot-pro',
    name: 'Headshot Pro',
    description: 'Generate professional LinkedIn-ready headshots',
    category: 'business',
    thumbnail: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&h=300&fit=crop',
    isPremium: true,
    tags: ['Professional', 'Portrait', 'Business'],
  },
  {
    id: 'real-estate',
    name: 'Real Estate Enhancer',
    description: 'Transform property photos with virtual staging and enhancement',
    category: 'business',
    thumbnail: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=400&h=300&fit=crop',
    tags: ['Property', 'Staging', 'Marketing'],
  },
  {
    id: 'blueprint',
    name: 'Blueprint Generator',
    description: 'Convert photos into architectural blueprint style drawings',
    category: 'style',
    thumbnail: 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=400&h=300&fit=crop',
    tags: ['Architecture', 'Technical', 'Design'],
  },
  
  // More Style Options
  {
    id: 'polygon-art',
    name: 'Polygon Art',
    description: 'Transform images into stunning geometric polygon art',
    category: 'style',
    thumbnail: 'https://images.unsplash.com/photo-1550684376-efcbd6e3f031?w=400&h=300&fit=crop',
    tags: ['Geometric', 'Modern', 'Abstract'],
  },
  {
    id: 'watercolor',
    name: 'Watercolor Effect',
    description: 'Apply beautiful watercolor painting effects to any photo',
    category: 'style',
    thumbnail: 'https://images.unsplash.com/photo-1579762715118-a6f1d4b934f1?w=400&h=300&fit=crop',
    tags: ['Painting', 'Artistic', 'Soft'],
  },
];

// Get apps by category
export const getAppsByCategory = (category: AppCategory): AIApp[] => {
  return AI_APPS.filter(app => app.category === category);
};

// Get featured/trending apps
export const getTrendingApps = (): AIApp[] => {
  return AI_APPS.filter(app => app.isTrending);
};

// Get new apps
export const getNewApps = (): AIApp[] => {
  return AI_APPS.filter(app => app.isNew);
};

// Search apps
export const searchApps = (query: string): AIApp[] => {
  const lowerQuery = query.toLowerCase();
  return AI_APPS.filter(app => 
    app.name.toLowerCase().includes(lowerQuery) ||
    app.description.toLowerCase().includes(lowerQuery) ||
    app.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
  );
};
