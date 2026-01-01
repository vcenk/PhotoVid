import { Building2, ShoppingBag, Utensils, Briefcase, Camera, Home, ArrowRight, Layers, Sparkles } from 'lucide-react';
import { Industry, Workflow } from '../types/studio';

export const INDUSTRIES: Industry[] = [
  {
    id: 'real-estate',
    name: 'Real Estate',
    icon: Building2,
    description: 'Property showcases and virtual tours',
    workflows: [
      {
        id: 'property-showcase',
        name: 'Property Showcase',
        description: 'Cinematic fly-through of a single property',
        industryId: 'real-estate',
        icon: Home,
        requiredFiles: 5,
        estimatedCredits: 10,
        steps: [
          { id: 'upload', title: 'Upload Photos', description: 'Upload 5-10 high quality photos', type: 'upload' },
          { id: 'style', title: 'Select Style', description: 'Choose motion and lighting style', type: 'configure' },
          { id: 'generate', title: 'Generate Video', description: 'AI processing', type: 'generate' },
          { id: 'review', title: 'Review & Export', description: 'Download your video', type: 'review' }
        ]
      },
      {
        id: 'room-tour',
        name: 'Room Tour',
        description: 'Smooth walkthrough of interior spaces',
        industryId: 'real-estate',
        icon: ArrowRight,
        requiredFiles: 1,
        estimatedCredits: 5,
        steps: [
           { id: 'upload', title: 'Upload Room Photo', description: 'Upload a wide angle room shot', type: 'upload' },
           { id: 'configure', title: 'Configure Path', description: 'Set camera movement', type: 'configure' },
           { id: 'generate', title: 'Generate', description: 'Create motion', type: 'generate' }
        ]
      }
    ]
  },
  {
    id: 'ecommerce',
    name: 'E-Commerce',
    icon: ShoppingBag,
    description: 'Product videos and 360 spins',
    workflows: [
      {
        id: 'product-360',
        name: 'Product 360° Spin',
        description: 'Create a perfect orbiting video of your product',
        industryId: 'ecommerce',
        icon: ShoppingBag,
        requiredFiles: 1,
        estimatedCredits: 5,
        steps: [
          { id: 'upload', title: 'Product Photo', description: 'Upload a clear shot of your product', type: 'upload' },
          { id: 'style', title: 'Select Spin', description: 'Choose rotation speed and direction', type: 'configure' },
          { id: 'generate', title: 'Generate', description: 'Create 360 motion', type: 'generate' }
        ]
      },
      {
        id: 'lifestyle-reel',
        name: 'Lifestyle Showcase',
        description: 'Turn static product shots into dynamic lifestyle ads',
        industryId: 'ecommerce',
        icon: Camera,
        requiredFiles: 3,
        estimatedCredits: 12,
        steps: [
          { id: 'upload', title: 'Upload Shots', description: 'Upload 3 product images', type: 'upload' },
          { id: 'configure', title: 'Ad Style', description: 'Select mood and energy', type: 'configure' },
          { id: 'generate', title: 'Create Ad', description: 'Merge into cinematic reel', type: 'generate' }
        ]
      }
    ]
  },
  {
    id: 'restaurant',
    name: 'Food & Dining',
    icon: Utensils,
    description: 'Menu highlights and atmosphere',
    workflows: [
      {
        id: 'menu-highlight',
        name: 'Menu Highlight',
        description: 'Cinematic zoom on your signature dishes',
        industryId: 'restaurant',
        icon: Utensils,
        requiredFiles: 1,
        estimatedCredits: 5,
        steps: [
          { id: 'upload', title: 'Food Photo', description: 'Upload a high-res dish photo', type: 'upload' },
          { id: 'generate', title: 'Create Motion', description: 'Adding steam and lighting effects', type: 'generate' }
        ]
      }
    ]
  },
  {
    id: 'agency',
    name: 'Corporate',
    icon: Briefcase,
    description: 'High-volume social content',
    workflows: [
      {
        id: 'team-intro',
        name: 'Team Introduction',
        description: 'Professional motion for team headshots',
        industryId: 'agency',
        icon: Briefcase,
        requiredFiles: 1,
        estimatedCredits: 3,
        steps: [
          { id: 'upload', title: 'Headshot', description: 'Upload a professional photo', type: 'upload' },
          { id: 'generate', title: 'Animate', description: 'Subtle parallax effect', type: 'generate' }
        ]
      }
    ]
  },
  {
    id: 'creator',
    name: 'Creator',
    icon: Camera,
    description: 'Vlogs and creative storytelling',
    workflows: []
  }
];
