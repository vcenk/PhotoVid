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

// Default starting credits for new users
export const DEFAULT_STARTING_CREDITS = 100;

// Credit costs per tool (also defined in generation.ts for reference)
export const CREDIT_COSTS = {
  'virtual-staging': 2,
  'photo-enhancement': 1,
  'sky-replacement': 2,
  'twilight': 2,
  'item-removal': 2,
  'lawn-enhancement': 2,
  'room-tour': 5,
  'renovation-preview': 3,
  'floor-plan': 5,
  'declutter': 1,
  'storyboard-scene': 3, // Per scene video generation
  'storyboard-export': 5, // Final video export
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
