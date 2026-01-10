import { Home, Building2, Utensils, ShoppingBag, Image, Video, Edit3, Sparkles, Wand2 } from 'lucide-react';
import { Mode, Industry } from '../store/dashboard';
import { getUnsplashImageById } from '../services/unsplash';

export interface ModelItem {
  id: string;
  name: string;
  type: Mode;
  icon: any;
  description: string;
  industry: Industry[];
}

export interface WorkflowItem {
  id: string;
  title: string;
  outcome: string;
  bestFor: Industry[];
  category: 'virtual-staging' | 'menu-design' | 'product-photography' | 'general';
  icon: any;
}

export interface TemplateItem {
  id: string;
  title: string;
  thumbnailUrl: string;
  industry: Industry;
  prompt: string;
}

export interface TemplateSection {
  id: string;
  title: string;
  industry: Industry;
  templates: TemplateItem[];
}

// Industry Models
export const models: ModelItem[] = [
  {
    id: 'estategen-xl',
    name: 'EstateGen XL',
    type: 'image',
    icon: Building2,
    description: 'High-quality property imagery',
    industry: ['real-estate'],
  },
  {
    id: 'walkthrough-motion',
    name: 'Walkthrough Motion',
    type: 'video',
    icon: Video,
    description: 'Smooth property walkthroughs',
    industry: ['real-estate'],
  },
  {
    id: 'culinary-gan-v2',
    name: 'CulinaryGAN v2',
    type: 'image',
    icon: Utensils,
    description: 'Appetizing food photography',
    industry: ['hospitality'],
  },
  {
    id: 'product-pro-3',
    name: 'ProductPro 3.0',
    type: 'image',
    icon: ShoppingBag,
    description: 'Professional product shots',
    industry: ['retail'],
  },
  {
    id: 'room-revive-edit',
    name: 'RoomRevive Edit',
    type: 'edit',
    icon: Edit3,
    description: 'Smart room enhancement',
    industry: ['real-estate', 'hospitality'],
  },
];

// Professional Workflows
export const workflows: WorkflowItem[] = [
  {
    id: 'virtual-staging',
    title: 'Virtual Staging',
    outcome: 'Add furniture to empty rooms',
    bestFor: ['real-estate'],
    category: 'virtual-staging',
    icon: Home,
  },
  {
    id: 'twilight-correction',
    title: 'Twilight Correction',
    outcome: 'Day-to-dusk exterior conversion',
    bestFor: ['real-estate'],
    category: 'virtual-staging',
    icon: Sparkles,
  },
  {
    id: 'steam-sizzle',
    title: 'Steam & Sizzle',
    outcome: 'Enhance food visuals with steam/sizzle effects',
    bestFor: ['hospitality'],
    category: 'menu-design',
    icon: Utensils,
  },
  {
    id: 'background-replace',
    title: 'Background Replace',
    outcome: 'Studio-white backgrounds for products',
    bestFor: ['retail'],
    category: 'product-photography',
    icon: Image,
  },
  {
    id: 'remove-clutter',
    title: 'Remove Clutter',
    outcome: 'Clean up unwanted objects from scenes',
    bestFor: ['real-estate', 'retail'],
    category: 'general',
    icon: Wand2,
  },
  {
    id: 'brand-color-match',
    title: 'Brand Color Match',
    outcome: 'Apply consistent brand colors across assets',
    bestFor: ['hospitality', 'retail'],
    category: 'general',
    icon: Sparkles,
  },
];

// Template Sections
export const templateSections: TemplateSection[] = [
  {
    id: 'real-estate-templates',
    title: 'Real Estate Templates',
    industry: 'real-estate',
    templates: [
      {
        id: 'modern-farmhouse',
        title: 'Modern Farmhouse',
        thumbnailUrl: getUnsplashImageById('1600585154340-be6161a56a0c', 800, 600),
        industry: 'real-estate',
        prompt: 'Modern farmhouse exterior with white siding and black trim, twilight lighting',
      },
      {
        id: 'industrial-loft',
        title: 'Industrial Loft',
        thumbnailUrl: getUnsplashImageById('1600210492493-0946911123ea', 800, 600),
        industry: 'real-estate',
        prompt: 'Industrial loft interior with exposed brick and high ceilings',
      },
      {
        id: 'scandi-minimal',
        title: 'Scandi Minimal',
        thumbnailUrl: getUnsplashImageById('1616486338812-3dadae4b4ace', 800, 600),
        industry: 'real-estate',
        prompt: 'Scandinavian minimalist living room with natural light',
      },
      {
        id: 'luxury-condo-twilight',
        title: 'Luxury Condo Twilight',
        thumbnailUrl: getUnsplashImageById('1600596542815-ffad4c1539a9', 800, 600),
        industry: 'real-estate',
        prompt: 'Luxury condo balcony view at twilight with city lights',
      },
      {
        id: 'cozy-bedroom-staging',
        title: 'Cozy Bedroom Staging',
        thumbnailUrl: getUnsplashImageById('1556909212-d5b604d0c90d', 800, 600),
        industry: 'real-estate',
        prompt: 'Cozy bedroom with warm lighting and modern furniture',
      },
    ],
  },
  {
    id: 'hospitality-vibes',
    title: 'Hospitality Vibes',
    industry: 'hospitality',
    templates: [
      {
        id: 'michelin-plating',
        title: 'Michelin Plating',
        thumbnailUrl: getUnsplashImageById('1546069901-ba9599a7e63c', 800, 600),
        industry: 'hospitality',
        prompt: 'Fine dining plate with artistic presentation, soft lighting',
      },
      {
        id: 'cozy-cafe',
        title: 'Cozy Cafe',
        thumbnailUrl: getUnsplashImageById('1517248135467-4c7edcad34c4', 800, 600),
        industry: 'hospitality',
        prompt: 'Cozy cafe interior with warm lighting and comfortable seating',
      },
      {
        id: 'rooftop-bar',
        title: 'Rooftop Bar',
        thumbnailUrl: getUnsplashImageById('1514933651326-dbac15f8f8fe', 800, 600),
        industry: 'hospitality',
        prompt: 'Rooftop bar at sunset with city skyline view',
      },
      {
        id: 'brunch-flatlay',
        title: 'Brunch Flatlay',
        thumbnailUrl: getUnsplashImageById('1533777857889-4be7c70b33f7', 800, 600),
        industry: 'hospitality',
        prompt: 'Overhead brunch spread with coffee, pastries, and fresh fruit',
      },
      {
        id: 'cocktail-hero-shot',
        title: 'Cocktail Hero Shot',
        thumbnailUrl: getUnsplashImageById('1495474472287-4d71bcdd2085', 800, 600),
        industry: 'hospitality',
        prompt: 'Elegant cocktail with garnish, dramatic lighting, dark background',
      },
    ],
  },
  {
    id: 'retail-mockups',
    title: 'Retail Mockups',
    industry: 'retail',
    templates: [
      {
        id: 'cosmetic-bottle',
        title: 'Cosmetic Bottle',
        thumbnailUrl: getUnsplashImageById('1596462502278-27bfdc403348', 800, 600),
        industry: 'retail',
        prompt: 'Premium cosmetic bottle on white background, soft shadows',
      },
      {
        id: 'apparel-flatlay',
        title: 'Apparel Flatlay',
        thumbnailUrl: getUnsplashImageById('1515886657613-9d3515b1e8a9', 800, 600),
        industry: 'retail',
        prompt: 'Fashion flatlay with clothing items arranged artistically',
      },
      {
        id: 'tech-gadget',
        title: 'Tech Gadget',
        thumbnailUrl: getUnsplashImageById('1550009158-9ebfd4d5624b', 800, 600),
        industry: 'retail',
        prompt: 'Modern tech gadget with sleek design, studio lighting',
      },
      {
        id: 'skincare-set',
        title: 'Skincare Set',
        thumbnailUrl: getUnsplashImageById('1505740420928-5e560c06d30e', 800, 600),
        industry: 'retail',
        prompt: 'Luxury skincare product set with natural elements',
      },
      {
        id: 'shoe-showcase',
        title: 'Shoe Product Showcase',
        thumbnailUrl: getUnsplashImageById('1542291026-7eec264c27ff', 800, 600),
        industry: 'retail',
        prompt: 'Athletic shoe product photography with dynamic angles',
      },
    ],
  },
];

// Quick prompts for inspiration
export const quickPrompts = [
  'Twilight exterior, warm interior lights',
  'Minimalist cafe menu hero shot',
  'White background product packshot',
  'Modern living room with natural light',
  'Gourmet plating with steam effects',
  'Luxury bedroom virtual staging',
];
