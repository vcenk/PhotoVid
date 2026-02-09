/**
 * Credits System Types
 * Pay-per-generation model for AI tool usage
 */

export interface UserCredits {
  userId: string;
  balance: number;
  lifetimeUsed: number;
  lifetimePurchased: number;
  updatedAt: Date;
}

export interface CreditTransaction {
  id: string;
  userId: string;
  amount: number; // positive = add, negative = deduct
  type: 'purchase' | 'generation' | 'refund' | 'bonus' | 'subscription';
  generationId?: string;
  description: string;
  createdAt: Date;
}

export interface CreditPackage {
  id: string;
  name: string;
  credits: number;
  price: number; // USD
  bonusCredits: number;
  popular?: boolean;
  savings?: string;
}

// Credit packages available for purchase
export const CREDIT_PACKAGES: CreditPackage[] = [
  {
    id: 'starter',
    name: 'Starter',
    credits: 50,
    price: 9.99,
    bonusCredits: 0,
  },
  {
    id: 'pro',
    name: 'Pro',
    credits: 200,
    price: 29.99,
    bonusCredits: 20,
    popular: true,
    savings: 'Most Popular',
  },
  {
    id: 'agency',
    name: 'Agency',
    credits: 500,
    price: 59.99,
    bonusCredits: 100,
    savings: 'Save 40%',
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    credits: 2000,
    price: 199.99,
    bonusCredits: 500,
    savings: 'Best Value',
  },
];

// Default starting credits for new users (trial)
export const DEFAULT_STARTING_CREDITS = 5;

// Credit costs per tool
export const CREDIT_COSTS = {
  // Real Estate - Basic (1 credit)
  'photo-enhancement': 1,
  'watermark-removal': 1,

  // Real Estate - Advanced (2 credits)
  'virtual-staging': 2,
  'sky-replacement': 2,
  'twilight': 2,
  'item-removal': 2,
  'lawn-enhancement': 2,
  'declutter': 2,
  'wall-color': 2,
  'floor-replacement': 2,
  'rain-to-shine': 2,
  'night-to-day': 2,
  'changing-seasons': 2,
  'pool-enhancement': 2,

  // Real Estate - Premium (3 credits)
  'custom-furniture-staging': 3,  // Premium dual-image feature
  'virtual-renovation': 3,
  'hdr-merge': 3,
  'headshot-retouching': 3,
  'floor-plan': 3,
  '360-staging': 3,

  // Real Estate - Video (5-10 credits)
  'room-tour': 5,
  'storyboard-scene': 5,
  'text-to-video': 10,

  // Property Reveal Videos (40-100 credits based on duration/audio)
  'property-reveal-8s': 40,
  'property-reveal-8s-audio': 80,
  'property-reveal-10s': 50,
  'property-reveal-10s-audio': 100,

  // Real Estate - Marketing (1-2 credits)
  'social-media-poster': 1,
  'social-media-poster-vector': 2,

  // Auto Dealership - Basic (1 credit)
  'auto-enhance': 1,
  'license-blur': 1,
  'number-plate-mask': 1,

  // Auto Dealership - Advanced (2 credits)
  'background-swap': 2,
  'blemish-removal': 2,
  'reflection-fix': 2,
  'interior-enhance': 2,
  'window-tint': 2,
  'spot-removal': 2,
  'shadow-enhancement': 2,
  'dealer-branding': 2,
  'paint-color': 2,
  'wheel-customizer': 2,
  'damage-detection': 2,

  // Auto Dealership - Video (5 credits)
  'vehicle-360': 5,
  'vehicle-walkthrough': 5,
  'social-clips': 5,

  // Listing Content (1 credit each)
  'listing-description': 1,
  'listing-social-post': 1,
  'listing-flyer': 1,
  'listing-email': 1,

  // General Tools
  'text-to-image': 2,
  'image-to-image': 2,
  'image-to-video': 5,
  'dubbing': 15,
  'storyboard-export': 5,
} as const;

export type CreditCostKey = keyof typeof CREDIT_COSTS;

/**
 * Get the credit cost for a specific tool
 */
export function getCreditCost(tool: CreditCostKey): number {
  return CREDIT_COSTS[tool] || 1;
}

/**
 * Calculate total credits needed for a package
 */
export function getTotalCreditsFromPackage(pkg: CreditPackage): number {
  return pkg.credits + pkg.bonusCredits;
}

/**
 * Calculate price per credit for a package
 */
export function getPricePerCredit(pkg: CreditPackage): number {
  const totalCredits = getTotalCreditsFromPackage(pkg);
  return pkg.price / totalCredits;
}

/**
 * Format credits for display
 */
export function formatCredits(credits: number): string {
  if (credits >= 1000) {
    return `${(credits / 1000).toFixed(1)}k`;
  }
  return credits.toString();
}
