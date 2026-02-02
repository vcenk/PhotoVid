/**
 * Listing Content Generation Types
 * Types for the Listing Creation hub — MLS descriptions, social posts, flyers, emails
 */

export type ContentTone = 'professional' | 'luxury' | 'friendly' | 'casual';
export type DescriptionLength = 'short' | 'medium' | 'long';
export type SocialPlatform = 'instagram' | 'facebook' | 'tiktok' | 'linkedin';
export type FlyerTemplate = 'classic' | 'modern-grid' | 'luxury' | 'open-house';
export type EmailType = 'just-listed' | 'open-house' | 'price-reduction' | 'just-sold';

export interface DescriptionOptions {
  tone: ContentTone;
  length: DescriptionLength;
  highlightFeatures: string[];
  customKeywords: string;
  includeNeighborhood: boolean;
}

export interface SocialPostOptions {
  platform: SocialPlatform;
  tone: ContentTone;
  includePrice: boolean;
  includeAddress: boolean;
  ctaType: 'dm' | 'call' | 'link-in-bio';
}

export interface FlyerOptions {
  template: FlyerTemplate;
  agentName: string;
  agentPhone: string;
  agentEmail: string;
  brokerage: string;
  openHouseDate?: string;
  openHouseTime?: string;
  selectedPhotos: string[];
}

export interface EmailOptions {
  emailType: EmailType;
  agentName: string;
  ctaText: string;
  includeVirtualTourLink: boolean;
}

export interface FlyerCopy {
  headline: string;
  body: string;
  tagline: string;
}

export interface EmailContent {
  subject: string;
  body: string;
}

export interface ListingContent {
  description?: string;
  socialPosts?: Partial<Record<SocialPlatform, string>>;
  flyerCopy?: FlyerCopy;
  email?: EmailContent;
}

export const DESCRIPTION_LENGTH_WORDS: Record<DescriptionLength, number> = {
  short: 100,
  medium: 250,
  long: 500,
};

export const SOCIAL_PLATFORM_LABELS: Record<SocialPlatform, string> = {
  instagram: 'Instagram',
  facebook: 'Facebook',
  tiktok: 'TikTok',
  linkedin: 'LinkedIn',
};

export const EMAIL_TYPE_LABELS: Record<EmailType, string> = {
  'just-listed': 'Just Listed',
  'open-house': 'Open House Invite',
  'price-reduction': 'Price Reduction',
  'just-sold': 'Just Sold',
};

export const FLYER_TEMPLATE_LABELS: Record<FlyerTemplate, string> = {
  'classic': 'Classic',
  'modern-grid': 'Modern Grid',
  'luxury': 'Luxury',
  'open-house': 'Open House',
};
