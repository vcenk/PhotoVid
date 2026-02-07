// Subscription Tiers Configuration

export interface TierConfig {
  id: string;
  name: string;
  description: string;
  monthlyCredits: number;
  priceMonthly: number; // USD cents
  priceYearly: number; // USD cents (annual, usually discounted)
  features: string[];
  popular?: boolean;
  stripePriceIdMonthly?: string; // Set after Stripe products are created
  stripePriceIdYearly?: string;
}

export const TIERS: Record<string, TierConfig> = {
  free: {
    id: 'free',
    name: 'Free',
    description: 'Try before you buy',
    monthlyCredits: 5,
    priceMonthly: 0,
    priceYearly: 0,
    features: [
      '5 credits per month',
      'Basic image editing tools',
      'SD video export',
      'Community support',
    ],
  },
  starter: {
    id: 'starter',
    name: 'Starter',
    description: 'Perfect for individuals',
    monthlyCredits: 100,
    priceMonthly: 1900, // $19/month
    priceYearly: 19000, // $190/year (save ~17%)
    features: [
      '100 credits per month',
      'All image editing tools',
      'HD video export',
      'Email support',
      'Remove watermarks',
    ],
    stripePriceIdMonthly: 'price_1Sy5uGCxWYj2hyiwOhHzhjwG',
    stripePriceIdYearly: 'price_1Sy5uGCxWYj2hyiwnKaMwJqT',
  },
  pro: {
    id: 'pro',
    name: 'Pro',
    description: 'For professionals and teams',
    monthlyCredits: 250,
    priceMonthly: 4900, // $49/month
    priceYearly: 49000, // $490/year (save ~17%)
    features: [
      '250 credits per month',
      'All image & video tools',
      '4K video export',
      'Priority support',
      'API access',
      'Custom branding',
    ],
    popular: true,
    stripePriceIdMonthly: 'price_1Sy5uHCxWYj2hyiwVVvB4RQV',
    stripePriceIdYearly: 'price_1Sy5uHCxWYj2hyiwqplTvnl9',
  },
  enterprise: {
    id: 'enterprise',
    name: 'Enterprise',
    description: 'For large organizations',
    monthlyCredits: 800,
    priceMonthly: 14900, // $149/month
    priceYearly: 149000, // $1490/year (save ~17%)
    features: [
      '800 credits per month',
      'Unlimited team members',
      '4K+ video export',
      'Dedicated support',
      'Custom integrations',
      'SLA guarantee',
      'Volume discounts',
    ],
    stripePriceIdMonthly: 'price_1Sy5uICxWYj2hyiw3U9SNrnh',
    stripePriceIdYearly: 'price_1Sy5uICxWYj2hyiwe5yDy6sW',
  },
};

export const TIER_ORDER = ['free', 'starter', 'pro', 'enterprise'] as const;
export type TierId = typeof TIER_ORDER[number];

export function getTierById(tierId: string): TierConfig | undefined {
  return TIERS[tierId];
}

export function getNextTier(currentTierId: string): TierConfig | undefined {
  const currentIndex = TIER_ORDER.indexOf(currentTierId as TierId);
  if (currentIndex === -1 || currentIndex >= TIER_ORDER.length - 1) {
    return undefined;
  }
  return TIERS[TIER_ORDER[currentIndex + 1]];
}

export function formatPrice(cents: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(cents / 100);
}
