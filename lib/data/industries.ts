// Industry configuration types and data for reusable industry pages

import { LucideIcon, Building2, Car, Utensils, Briefcase, Camera, Video, Wand2, Paintbrush, Square, Sun, Moon, Leaf, Waves, Ban, User, Layers, Hammer, Sparkles, CircleDot, BadgeCheck, Palette, Circle, Film, Share2, AlertTriangle } from 'lucide-react';

// ============ TYPE DEFINITIONS ============

export interface IndustryTool {
    id: string;
    name: string;
    description: string;
    longDescription?: string;
    icon: LucideIcon;
    gradient: string;
    image: string;            // Tool preview/thumbnail image
    isPremium?: boolean;
    isFeatured?: boolean;
    beforeImage?: string;
    afterImage?: string;
    tags?: string[];
    route?: string;           // Custom navigation route for this tool
}

export interface IndustryWorkflow {
    id: string;
    name: string;
    description: string;
    steps: number;
    credits: number;
    icon?: LucideIcon;
}

export interface IndustryStat {
    value: string;
    label: string;
}

export interface IndustryConfig {
    id: string;
    name: string;
    slug: string;
    icon: LucideIcon;
    gradient: string;           // Hero background gradient (fallback)
    accentColor: string;        // Accent for buttons/highlights
    tagline: string;
    description: string;
    heroVideo?: string;         // Background video URL
    heroPreviewImage?: string;  // Preview image for hero card
    stats: IndustryStat[];
    featuredTools: IndustryTool[];
    tools: IndustryTool[];
    workflows: IndustryWorkflow[];
}

// ============ INDUSTRY CONFIGURATIONS ============

export const INDUSTRY_CONFIGS: Record<string, IndustryConfig> = {
    'real-estate': {
        id: 'real-estate',
        name: 'Real Estate',
        slug: 'real-estate',
        icon: Building2,
        gradient: 'from-blue-600 via-indigo-600 to-violet-700',
        accentColor: 'indigo',
        tagline: 'Sell Properties Faster with AI-Enhanced Visuals',
        description: 'Transform empty rooms, enhance curb appeal, and create stunning video tours—all in minutes, not hours.',
        heroVideo: 'https://videos.pexels.com/video-files/5977249/5977249-uhd_2560_1440_30fps.mp4',
        heroPreviewImage: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&h=500&fit=crop',
        stats: [
            { value: '50K+', label: 'Listings Enhanced' },
            { value: '3x', label: 'Faster Time-to-Sell' },
            { value: '47%', label: 'More Inquiries' },
        ],
        featuredTools: [
            // 1. Virtual Staging - MOST POPULAR, leads conversions
            {
                id: 'virtual-staging',
                name: 'Virtual Staging',
                description: 'Fill empty rooms with stylish, realistic furniture in seconds',
                longDescription: 'Upload a photo of any empty room and our AI will furnish it with designer-quality furniture and decor. Choose from Modern, Scandinavian, Traditional, or Minimalist styles. Buyers can finally visualize the space.',
                icon: Building2,
                gradient: 'from-blue-500 to-indigo-600',
                image: '/showcase/real-estate/after/virtual-staging.jpg',
                beforeImage: '/showcase/real-estate/before/virtual-staging.jpg',
                afterImage: '/showcase/real-estate/after/virtual-staging.jpg',
                isFeatured: true,
                tags: ['Most Used'],
                route: '/studio/real-estate/virtual-staging',
            },
            // 2. Photo Enhancement - Essential, high volume
            {
                id: 'photo-enhancement',
                name: 'Photo Enhancement',
                description: 'Automatically fix lighting, colors, and sharpness',
                longDescription: 'One-click enhancement that brightens dark interiors, corrects color balance, and sharpens details. Your smartphone photos will look like they were shot by a professional.',
                icon: Building2,
                gradient: 'from-amber-500 to-orange-600',
                image: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=600&h=400&fit=crop',
                isFeatured: true,
                tags: ['Essential'],
                route: '/studio/real-estate/photo-enhancement',
            },
            // 3. Sky Replacement - Quick win, high visual impact
            {
                id: 'sky-replacement',
                name: 'Sky Replacement',
                description: 'Swap gray skies for perfect blue skies instantly',
                longDescription: 'Overcast day? No problem. Our AI detects the sky in your exterior shots and replaces it with a beautiful blue sky and natural clouds. Works with any angle or composition.',
                icon: Building2,
                gradient: 'from-cyan-500 to-blue-600',
                image: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=600&h=400&fit=crop',
                isFeatured: true,
                tags: ['Quick Fix'],
                route: '/studio/real-estate/sky-replacement',
            },
            // 4. Twilight Conversion - Premium, high impact
            {
                id: 'twilight',
                name: 'Day-to-Twilight',
                description: 'Convert daytime exteriors into dramatic dusk shots',
                longDescription: 'Transform ordinary daytime exterior photos into stunning twilight shots with warm interior glows and a beautiful sunset sky. The #1 way to make a listing stand out.',
                icon: Building2,
                gradient: 'from-indigo-500 to-purple-600',
                image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=600&h=400&fit=crop',
                isPremium: true,
                isFeatured: true,
                tags: ['Pro', 'High Impact'],
                route: '/studio/real-estate/twilight',
            },
            // 5. Item Removal - Utility, declutter
            {
                id: 'item-removal',
                name: 'Item Removal',
                description: 'Remove clutter, cars, or unwanted objects from photos',
                longDescription: 'Select any object in your photo and our AI will remove it cleanly—trash bins, parked cars, personal items, even power lines. Get a clean, distraction-free shot.',
                icon: Building2,
                gradient: 'from-rose-500 to-pink-600',
                image: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=600&h=400&fit=crop',
                isFeatured: true,
                tags: ['Utility'],
                route: '/studio/real-estate/item-removal',
            },
        ],
        tools: [
            // Video Tools
            {
                id: 'room-tour',
                name: 'Room Tour Video',
                description: 'Turn photos into smooth walkthrough videos',
                icon: Video,
                gradient: 'from-violet-500 to-purple-600',
                image: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=600&h=400&fit=crop',
                isPremium: true,
                route: '/studio/real-estate/room-tour',
            },
            // Renovation & Design
            {
                id: 'virtual-renovation',
                name: 'Virtual Renovation',
                description: 'Visualize kitchen and bathroom remodels',
                icon: Hammer,
                gradient: 'from-orange-500 to-red-600',
                image: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=600&h=400&fit=crop',
                isPremium: true,
                tags: ['New', 'Premium'],
                route: '/studio/real-estate/virtual-renovation',
            },
            {
                id: 'wall-color',
                name: 'Wall Color Changer',
                description: 'Preview different paint colors on walls',
                icon: Paintbrush,
                gradient: 'from-pink-500 to-rose-600',
                image: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=600&h=400&fit=crop',
                tags: ['New'],
                route: '/studio/real-estate/wall-color',
            },
            {
                id: 'exterior-paint',
                name: 'Exterior Paint Visualizer',
                description: 'Preview exterior paint colors on your home',
                icon: Paintbrush,
                gradient: 'from-emerald-500 to-teal-600',
                image: '/showcase/real-estate/after/exterior-paint-visualizer.jpg',
                beforeImage: '/showcase/real-estate/before/exterior-paint-visualizer.jpg',
                afterImage: '/showcase/real-estate/after/exterior-paint-visualizer.jpg',
                tags: ['New'],
                route: '/studio/real-estate/exterior-paint',
            },
            {
                id: 'floor-replacement',
                name: 'Floor Replacement',
                description: 'Swap hardwood, tile, or carpet styles',
                icon: Square,
                gradient: 'from-amber-500 to-orange-600',
                image: 'https://images.unsplash.com/photo-1615529182904-14819c35db37?w=600&h=400&fit=crop',
                tags: ['New'],
                route: '/studio/real-estate/floor-replacement',
            },
            // Weather & Lighting
            {
                id: 'rain-to-shine',
                name: 'Rain to Shine',
                description: 'Convert cloudy/rainy photos to sunny weather',
                icon: Sun,
                gradient: 'from-yellow-500 to-amber-600',
                image: 'https://images.unsplash.com/photo-1428908728789-d2de25dbd4e2?w=600&h=400&fit=crop',
                tags: ['New'],
                route: '/studio/real-estate/rain-to-shine',
            },
            {
                id: 'night-to-day',
                name: 'Night to Day',
                description: 'Convert nighttime exteriors to daylight',
                icon: Moon,
                gradient: 'from-orange-500 to-yellow-600',
                image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=600&h=400&fit=crop',
                tags: ['New'],
                route: '/studio/real-estate/night-to-day',
            },
            {
                id: 'changing-seasons',
                name: 'Changing Seasons',
                description: 'Add spring blooms, fall leaves, or snow',
                icon: Leaf,
                gradient: 'from-orange-500 to-red-600',
                image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&h=400&fit=crop',
                tags: ['New'],
                route: '/studio/real-estate/changing-seasons',
            },
            // Pool & Water
            {
                id: 'pool-enhancement',
                name: 'Pool Enhancement',
                description: 'Add water to empty pools, clarify murky water',
                icon: Waves,
                gradient: 'from-cyan-500 to-blue-600',
                image: '/showcase/real-estate/after/pool-enhancement.jpg',
                beforeImage: '/showcase/real-estate/before/pool-enhancement.jpg',
                afterImage: '/showcase/real-estate/after/pool-enhancement.jpg',
                tags: ['New'],
                route: '/studio/real-estate/pool-enhancement',
            },
            // Landscaping
            {
                id: 'landscape-design',
                name: 'Landscape Design',
                description: 'Enhance or redesign exterior landscaping',
                icon: Leaf,
                gradient: 'from-green-500 to-lime-600',
                image: '/showcase/real-estate/after/landscape-design.jpg',
                beforeImage: '/showcase/real-estate/before/landscape-design.jpg',
                afterImage: '/showcase/real-estate/after/landscape-design.jpg',
                tags: ['New'],
                route: '/studio/real-estate/landscape-design',
            },
            {
                id: 'auto-declutter',
                name: 'Auto Declutter',
                description: 'One-click clutter removal — no brushing needed',
                icon: Wand2,
                gradient: 'from-amber-500 to-orange-600',
                image: '/showcase/real-estate/after/auto-declutter.jpg',
                beforeImage: '/showcase/real-estate/before/auto-declutter.jpg',
                afterImage: '/showcase/real-estate/after/auto-declutter.jpg',
                tags: ['New'],
                route: '/studio/real-estate/auto-declutter',
            },
            // Utility Tools
            {
                id: 'lawn-enhancement',
                name: 'Lawn & Landscape',
                description: 'Make lawns greener and landscaping more vibrant',
                icon: Building2,
                gradient: 'from-green-500 to-emerald-600',
                image: 'https://images.unsplash.com/photo-1558036117-15d82a90b9b1?w=600&h=400&fit=crop',
                route: '/studio/real-estate/lawn-enhancement',
            },
        ],
        workflows: [
            {
                id: 'full-listing',
                name: 'Full Listing Package',
                description: 'Enhance all photos for a complete listing',
                steps: 3,
                credits: 15,
            },
            {
                id: 'curb-appeal',
                name: 'Curb Appeal Boost',
                description: 'Sky replacement + lawn enhancement + twilight',
                steps: 3,
                credits: 10,
            },
            {
                id: 'vacant-staging',
                name: 'Vacant Property Staging',
                description: 'Stage every room in an empty property',
                steps: 4,
                credits: 20,
            },
        ],
    },
    'auto': {
        id: 'auto',
        name: 'Auto Dealerships',
        slug: 'auto',
        icon: Car,
        gradient: 'from-zinc-900 via-zinc-800 to-zinc-900',
        accentColor: 'red',
        tagline: 'Make Every Vehicle Look Showroom-Ready',
        description: 'Professional-quality photos in minutes—remove backgrounds, fix imperfections, and create scroll-stopping inventory videos.',
        heroVideo: 'https://videos.pexels.com/video-files/3945113/3945113-uhd_2560_1440_24fps.mp4',
        heroPreviewImage: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=800&h=500&fit=crop',
        stats: [
            { value: '100K+', label: 'Vehicles Enhanced' },
            { value: '2.5x', label: 'More Clicks' },
            { value: '35%', label: 'Faster Turnaround' },
        ],
        featuredTools: [
            // 1. Background Replacement - MOST USED, instant professionalism
            {
                id: 'background-swap',
                name: 'Background Replacement',
                description: 'Replace messy lot backgrounds with clean studio settings',
                longDescription: 'Instantly remove parking lot clutter and place your vehicle in a professional studio, showroom floor, or scenic backdrop. Works with any angle—front, side, or 3/4 view.',
                icon: Car,
                gradient: 'from-blue-500 to-indigo-600',
                image: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=600&h=400&fit=crop',
                isFeatured: true,
                tags: ['Most Used'],
                route: '/studio/apps/auto/background-swap',
            },
            // 2. Auto Enhance - Essential, high volume
            {
                id: 'auto-enhance',
                name: 'Auto Enhance',
                description: 'One-click color correction, lighting, and polish',
                longDescription: 'Automatically adjust exposure, white balance, and contrast to make paint colors pop. Adds a subtle shine to make every vehicle look freshly detailed.',
                icon: Car,
                gradient: 'from-amber-500 to-orange-600',
                image: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=600&h=400&fit=crop',
                isFeatured: true,
                tags: ['Essential'],
                route: '/studio/apps/auto/auto-enhance',
            },
            // 3. Blemish & Scratch Removal - Problem solver
            {
                id: 'blemish-removal',
                name: 'Blemish & Scratch Removal',
                description: 'Remove scratches, dents, and minor imperfections',
                longDescription: 'AI-powered touch-up that removes scratches, small dents, water spots, and other blemishes from your vehicle photos. Get that "just-detailed" look without the detailing.',
                icon: Car,
                gradient: 'from-emerald-500 to-teal-600',
                image: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=600&h=400&fit=crop',
                isFeatured: true,
                tags: ['Quick Fix'],
                route: '/studio/apps/auto/blemish-removal',
            },
            // 4. 360° Spin Video - Premium, high engagement
            {
                id: 'vehicle-360',
                name: '360° Spin Video',
                description: 'Create rotating showcase videos from a single photo',
                longDescription: 'Turn a single exterior photo into a smooth 360-degree rotating video that shows off the vehicle from every angle. Perfect for social media and online listings.',
                icon: Car,
                gradient: 'from-red-500 to-rose-600',
                image: 'https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=600&h=400&fit=crop',
                isPremium: true,
                isFeatured: true,
                tags: ['Pro', 'High Engagement'],
                route: '/studio/apps/auto/vehicle-360',
            },
            // 5. Window Tint Preview - Utility, customer-facing
            {
                id: 'window-tint',
                name: 'Window Tint Preview',
                description: 'Show vehicles with different tint levels',
                longDescription: 'Let customers visualize how the vehicle looks with light, medium, or dark window tint applied. A great upsell tool that helps close add-on sales.',
                icon: Car,
                gradient: 'from-zinc-600 to-zinc-800',
                image: 'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=600&h=400&fit=crop',
                isFeatured: true,
                tags: ['Upsell Tool'],
                route: '/studio/apps/auto/window-tint',
            },
        ],
        tools: [
            {
                id: 'reflection-fix',
                name: 'Reflection Removal',
                description: 'Remove unwanted reflections from windows and paint',
                icon: Car,
                gradient: 'from-cyan-500 to-blue-600',
                image: 'https://images.unsplash.com/photo-1542362567-b07e54358753?w=600&h=400&fit=crop',
                tags: ['New'],
                route: '/studio/apps/auto/reflection-fix',
            },
            {
                id: 'interior-enhance',
                name: 'Interior Enhancement',
                description: 'Make interiors look clean and inviting',
                icon: Car,
                gradient: 'from-orange-500 to-red-600',
                image: 'https://images.unsplash.com/photo-1503736334956-4c8f8e92946d?w=600&h=400&fit=crop',
                tags: ['New'],
                route: '/studio/apps/auto/interior-enhance',
            },
            {
                id: 'license-blur',
                name: 'License Plate Blur',
                description: 'Automatically blur plates for privacy',
                icon: Car,
                gradient: 'from-violet-500 to-purple-600',
                image: 'https://images.unsplash.com/photo-1619767886558-efdc259cde1a?w=600&h=400&fit=crop',
                route: '/studio/apps/auto/license-blur',
            },
            // Video Tools
            {
                id: 'storyboard',
                name: 'Vehicle Storyboard',
                description: 'Build cinematic showcase videos from vehicle photos',
                longDescription: 'Create scroll-stopping inventory videos by uploading shots of each angle, choosing motion styles, and generating AI-powered video clips. Perfect for listings, social media, and dealership websites.',
                icon: Video,
                gradient: 'from-red-500 to-orange-600',
                image: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=600&h=400&fit=crop',
                isPremium: true,
                isFeatured: true,
                tags: ['New', 'Video'],
                route: '/studio/apps/auto/storyboard',
            },
            // New Auto Tools
            {
                id: 'spot-removal',
                name: 'Spot Removal',
                description: 'Remove water spots, bird droppings, and debris',
                icon: Sparkles,
                gradient: 'from-teal-500 to-emerald-600',
                image: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=600&h=400&fit=crop',
                tags: ['New'],
                route: '/studio/apps/auto/spot-removal',
            },
            {
                id: 'shadow-enhancement',
                name: 'Shadow Enhancement',
                description: 'Add professional studio-quality shadows',
                icon: CircleDot,
                gradient: 'from-zinc-600 to-zinc-800',
                image: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=600&h=400&fit=crop',
                tags: ['New'],
                route: '/studio/apps/auto/shadow-enhancement',
            },
            {
                id: 'number-plate-mask',
                name: 'Number Plate Mask',
                description: 'Auto-detect and mask plates with blur or logo',
                icon: BadgeCheck,
                gradient: 'from-indigo-500 to-blue-600',
                image: 'https://images.unsplash.com/photo-1619767886558-efdc259cde1a?w=600&h=400&fit=crop',
                tags: ['New', 'AI'],
                route: '/studio/apps/auto/number-plate-mask',
            },
            {
                id: 'dealer-branding',
                name: 'Dealer Branding',
                description: 'Add logo, watermark, and contact info',
                icon: BadgeCheck,
                gradient: 'from-emerald-500 to-green-600',
                image: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=600&h=400&fit=crop',
                tags: ['New', 'Branding'],
                route: '/studio/apps/auto/dealer-branding',
            },
            {
                id: 'paint-color',
                name: 'Paint Color Changer',
                description: 'Visualize vehicles in different paint colors',
                icon: Palette,
                gradient: 'from-pink-500 to-rose-600',
                image: 'https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=600&h=400&fit=crop',
                tags: ['New', 'Popular'],
                route: '/studio/apps/auto/paint-color',
            },
            {
                id: 'wheel-customizer',
                name: 'Wheel Customizer',
                description: 'Preview different wheel styles and finishes',
                icon: Circle,
                gradient: 'from-zinc-500 to-slate-700',
                image: 'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=600&h=400&fit=crop',
                tags: ['New', 'Upsell'],
                route: '/studio/apps/auto/wheel-customizer',
            },
            {
                id: 'vehicle-walkthrough',
                name: 'Vehicle Walkthrough',
                description: 'Create cinematic walkthrough videos',
                icon: Film,
                gradient: 'from-violet-500 to-purple-600',
                image: 'https://images.unsplash.com/photo-1503736334956-4c8f8e92946d?w=600&h=400&fit=crop',
                isPremium: true,
                tags: ['Pro', 'Video'],
                route: '/studio/apps/auto/vehicle-walkthrough',
            },
            {
                id: 'social-clips',
                name: 'Social Clips',
                description: 'Generate TikTok/Reels-ready video clips',
                icon: Share2,
                gradient: 'from-pink-500 to-orange-500',
                image: 'https://images.unsplash.com/photo-1542362567-b07e54358753?w=600&h=400&fit=crop',
                isPremium: true,
                tags: ['Pro', 'Social'],
                route: '/studio/apps/auto/social-clips',
            },
            {
                id: 'damage-detection',
                name: 'Damage Detection',
                description: 'AI-powered damage analysis and reporting',
                icon: AlertTriangle,
                gradient: 'from-red-500 to-orange-600',
                image: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=600&h=400&fit=crop',
                isPremium: true,
                tags: ['Pro', 'AI'],
                route: '/studio/apps/auto/damage-detection',
            },
        ],
        workflows: [
            {
                id: 'lot-to-listing',
                name: 'Lot-to-Listing',
                description: 'Full enhancement for marketplace-ready photos',
                steps: 3,
                credits: 10,
            },
            {
                id: 'social-ready',
                name: 'Social Media Ready',
                description: 'Optimized edits for Instagram and TikTok',
                steps: 2,
                credits: 8,
            },
            {
                id: 'full-inventory',
                name: 'Full Inventory Batch',
                description: 'Process 20+ vehicles in one go',
                steps: 3,
                credits: 25,
            },
        ],
    },
};

// ============ HELPER FUNCTIONS ============

export const getIndustryConfig = (industryId: string): IndustryConfig | undefined => {
    return INDUSTRY_CONFIGS[industryId];
};

export const getAllIndustries = (): IndustryConfig[] => {
    return Object.values(INDUSTRY_CONFIGS);
};
