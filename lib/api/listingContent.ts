/**
 * Listing Content Generation API
 * Uses OpenAI to generate MLS descriptions, social posts, flyer copy, and email campaigns
 */

import OpenAI from 'openai';
import type { Property } from '@/lib/store/contexts/PropertyContext';
import type {
  DescriptionOptions,
  SocialPostOptions,
  FlyerOptions,
  EmailOptions,
  FlyerCopy,
  EmailContent,
} from '@/lib/types/listing';

let openai: OpenAI | null = null;

function getClient(): OpenAI | null {
  if (openai) return openai;
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
  if (!apiKey) return null;
  openai = new OpenAI({ apiKey, dangerouslyAllowBrowser: true });
  return openai;
}

function propertySnippet(property: Property): string {
  const parts: string[] = [];
  parts.push(`Address: ${property.address}, ${property.city}, ${property.state} ${property.zipCode}`);
  if (property.price) parts.push(`Price: $${property.price.toLocaleString()}`);
  if (property.bedrooms) parts.push(`Bedrooms: ${property.bedrooms}`);
  if (property.bathrooms) parts.push(`Bathrooms: ${property.bathrooms}`);
  if (property.squareFeet) parts.push(`Square Feet: ${property.squareFeet.toLocaleString()}`);
  if (property.yearBuilt) parts.push(`Year Built: ${property.yearBuilt}`);
  if (property.lotSize) parts.push(`Lot Size: ${property.lotSize.toLocaleString()} sqft`);
  parts.push(`Type: ${property.propertyType}`);
  if (property.features?.length) parts.push(`Features: ${property.features.join(', ')}`);
  if (property.description) parts.push(`Existing Description: ${property.description}`);
  return parts.join('\n');
}

// ─── MLS Description ──────────────────────────────────────────────

export async function generateMLSDescription(
  property: Property,
  options: DescriptionOptions
): Promise<string> {
  const client = getClient();
  if (!client) return mockMLSDescription(property, options);

  const wordCount =
    options.length === 'short' ? 100 : options.length === 'medium' ? 250 : 500;

  try {
    const response = await client.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `You are a professional real estate copywriter. Write MLS property descriptions.
Tone: ${options.tone}. Target length: ~${wordCount} words.
${options.includeNeighborhood ? 'Include a paragraph about the neighborhood/location.' : ''}
Highlight these features: ${options.highlightFeatures.join(', ') || 'key property features'}.
${options.customKeywords ? `Incorporate these keywords naturally: ${options.customKeywords}` : ''}
Include a Fair Housing compliant disclaimer is NOT needed — the agent will add it separately.
Do NOT include the property address or price in the description body — those appear in separate MLS fields.`,
        },
        {
          role: 'user',
          content: `Write an MLS description for this property:\n${propertySnippet(property)}`,
        },
      ],
    });
    return response.choices[0].message.content || mockMLSDescription(property, options);
  } catch (error) {
    console.error('MLS description generation error:', error);
    return mockMLSDescription(property, options);
  }
}

function mockMLSDescription(property: Property, options: DescriptionOptions): string {
  const features = options.highlightFeatures.length
    ? options.highlightFeatures.join(', ')
    : 'modern finishes, open floor plan';
  const beds = property.bedrooms || 3;
  const baths = property.bathrooms || 2;
  const sqft = property.squareFeet ? `${property.squareFeet.toLocaleString()} sqft` : 'spacious';

  if (options.length === 'short') {
    return `Welcome to this beautiful ${property.propertyType} featuring ${beds} bedrooms and ${baths} bathrooms across ${sqft} of thoughtfully designed living space. Highlights include ${features}. This exceptional home is move-in ready and waiting for its new owners.`;
  }
  return `Welcome to this stunning ${property.propertyType} nestled in the heart of ${property.city}. This remarkable ${beds}-bedroom, ${baths}-bathroom residence offers ${sqft} of meticulously designed living space that seamlessly blends comfort with sophistication.\n\nStep inside to discover ${features}, all complemented by abundant natural light and premium materials throughout. The open-concept layout creates an ideal flow for both everyday living and entertaining.\n\nThe gourmet kitchen features modern appliances, ample counter space, and a breakfast bar perfect for casual dining. Each bedroom provides a private retreat, while the primary suite boasts generous proportions and an en-suite bathroom.\n\n${options.includeNeighborhood ? `Located in one of ${property.city}'s most desirable neighborhoods, residents enjoy proximity to top-rated schools, parks, shopping, and dining. Easy access to major commuter routes makes this location as convenient as it is charming.\n\n` : ''}Don't miss this exceptional opportunity to own a truly special home. Schedule your private showing today.`;
}

// ─── Social Media Posts ────────────────────────────────────────────

export async function generateSocialPost(
  property: Property,
  options: SocialPostOptions
): Promise<string> {
  const client = getClient();
  if (!client) return mockSocialPost(property, options);

  const platformInstructions: Record<string, string> = {
    instagram:
      'Write an Instagram caption with emojis and 25-30 relevant hashtags at the end. Keep it engaging and visual.',
    facebook:
      'Write a Facebook post with property details, a compelling narrative, and a clear CTA. Moderate length.',
    tiktok:
      'Write a short, punchy TikTok caption with trending real estate hashtags. Keep it under 150 characters plus hashtags.',
    linkedin:
      'Write a professional LinkedIn post suitable for a real estate agent\'s network. Focus on market value and investment potential.',
  };

  const ctaMap = { dm: 'DM me for details', call: 'Call/text for a showing', 'link-in-bio': 'Link in bio for full listing' };

  try {
    const response = await client.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `You are a social media content creator for real estate.
Platform: ${options.platform}. ${platformInstructions[options.platform]}
Tone: ${options.tone}.
${options.includePrice && property.price ? `Include the price: $${property.price.toLocaleString()}` : 'Do NOT include the price.'}
${options.includeAddress ? `Include the address: ${property.address}, ${property.city}, ${property.state}` : 'Do NOT include the exact address — just mention the area/city.'}
End with this CTA: "${ctaMap[options.ctaType]}"`,
        },
        {
          role: 'user',
          content: `Create a ${options.platform} post for:\n${propertySnippet(property)}`,
        },
      ],
    });
    return response.choices[0].message.content || mockSocialPost(property, options);
  } catch (error) {
    console.error('Social post generation error:', error);
    return mockSocialPost(property, options);
  }
}

function mockSocialPost(property: Property, options: SocialPostOptions): string {
  const addr = options.includeAddress ? `${property.address}, ${property.city}` : property.city;
  const price = options.includePrice && property.price ? ` | $${property.price.toLocaleString()}` : '';
  const beds = property.bedrooms || 3;
  const baths = property.bathrooms || 2;
  const cta = { dm: 'DM me for details!', call: 'Call/text for a private showing!', 'link-in-bio': 'Link in bio for the full listing!' }[options.ctaType];

  if (options.platform === 'instagram') {
    return `NEW LISTING ALERT! ${addr}${price}\n\n${beds} bed | ${baths} bath | Move-in ready\n\nThis stunning ${property.propertyType} has everything you've been looking for. Don't miss your chance!\n\n${cta}\n\n#realestate #forsale #dreamhome #${property.city.replace(/\s/g, '')} #newlisting #realtor #homesweethome #property #luxuryliving #openhouse #househunting #realtorlife #justlisted #homebuyers #investment #interiordesign #architecture #homedesign #homeforsale #realestateinvesting #firsttimehomebuyer #houseforsale #newhome #realestateagent #broker #sold`;
  }
  if (options.platform === 'tiktok') {
    return `POV: Your dream home just hit the market ${addr}${price} #realestate #newlisting #dreamhome #${property.city.replace(/\s/g, '')} #fyp #househunting`;
  }
  if (options.platform === 'linkedin') {
    return `Excited to bring this exceptional ${property.propertyType} to market in ${property.city}, ${property.state}.\n\n${beds} bedrooms | ${baths} bathrooms${price}\n\nThis property represents a strong opportunity in one of the area's most sought-after neighborhoods. Whether you're looking for a primary residence or an investment property, this home checks all the boxes.\n\n${cta}\n\n#RealEstate #NewListing #${property.city.replace(/\s/g, '')}`;
  }
  // facebook default
  return `Just Listed! ${addr}${price}\n\n${beds} Bedrooms | ${baths} Bathrooms\n\nThis beautiful ${property.propertyType} is officially on the market and it won't last long! Featuring modern finishes, an open floor plan, and an unbeatable location, this home is perfect for anyone looking for comfort and convenience.\n\nHighlights:\n- Spacious living areas\n- Updated kitchen\n- Private backyard\n- Great school district\n\n${cta}`;
}

// ─── Flyer Copy ────────────────────────────────────────────────────

export async function generateFlyerCopy(
  property: Property,
  options: FlyerOptions
): Promise<FlyerCopy> {
  const client = getClient();
  if (!client) return mockFlyerCopy(property, options);

  const templateContext: Record<string, string> = {
    classic: 'Traditional property flyer with headline, description, and agent info.',
    'modern-grid': 'Modern minimal flyer with punchy headline and key stats.',
    luxury: 'High-end luxury flyer with elegant, aspirational language.',
    'open-house': `Open house flyer for ${options.openHouseDate || 'upcoming date'} at ${options.openHouseTime || 'TBD'}.`,
  };

  try {
    const response = await client.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `You are a real estate marketing copywriter. Generate flyer copy.
Template style: ${options.template}. ${templateContext[options.template]}
Return EXACTLY this JSON format: {"headline":"...","body":"...","tagline":"..."}
headline: 5-8 words, compelling.
body: 2-3 sentences about the property.
tagline: Short call-to-action phrase.`,
        },
        {
          role: 'user',
          content: `Generate flyer copy for:\n${propertySnippet(property)}`,
        },
      ],
      response_format: { type: 'json_object' },
    });
    const parsed = JSON.parse(response.choices[0].message.content || '{}');
    if (parsed.headline && parsed.body && parsed.tagline) return parsed as FlyerCopy;
    return mockFlyerCopy(property, options);
  } catch (error) {
    console.error('Flyer copy generation error:', error);
    return mockFlyerCopy(property, options);
  }
}

function mockFlyerCopy(property: Property, options: FlyerOptions): FlyerCopy {
  if (options.template === 'open-house') {
    return {
      headline: 'You\'re Invited — Open House',
      body: `Join us at ${property.address}, ${property.city} to tour this stunning ${property.bedrooms || 3}-bedroom ${property.propertyType}. ${property.squareFeet ? `${property.squareFeet.toLocaleString()} sqft of beautifully designed living space.` : 'Spacious and move-in ready.'} Light refreshments provided.`,
      tagline: `${options.openHouseDate || 'This Weekend'} ${options.openHouseTime ? `at ${options.openHouseTime}` : ''} — See You There!`,
    };
  }
  if (options.template === 'luxury') {
    return {
      headline: 'Where Elegance Meets Modern Living',
      body: `An extraordinary ${property.propertyType} offering ${property.bedrooms || 3} bedrooms and ${property.bathrooms || 2} bathrooms${property.squareFeet ? ` across ${property.squareFeet.toLocaleString()} sqft` : ''}. Every detail has been curated to create an unparalleled living experience.`,
      tagline: 'Experience Luxury — Schedule Your Private Viewing',
    };
  }
  return {
    headline: 'Your Dream Home Awaits',
    body: `Discover this beautiful ${property.bedrooms || 3}-bedroom, ${property.bathrooms || 2}-bathroom ${property.propertyType} in ${property.city}. ${property.squareFeet ? `${property.squareFeet.toLocaleString()} sqft of` : 'Ample'} living space with modern finishes throughout.`,
    tagline: 'Schedule a Showing Today',
  };
}

// ─── Email Content ─────────────────────────────────────────────────

export async function generateEmailContent(
  property: Property,
  options: EmailOptions
): Promise<EmailContent> {
  const client = getClient();
  if (!client) return mockEmailContent(property, options);

  const emailTypeInstructions: Record<string, string> = {
    'just-listed': 'Announce a new listing. Build excitement and highlight key features.',
    'open-house': 'Invite recipients to an open house. Include a warm, welcoming tone.',
    'price-reduction': 'Announce a price reduction. Emphasize the new value and urgency.',
    'just-sold': 'Celebrate a successful sale. Use it as social proof for the agent.',
  };

  try {
    const response = await client.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `You are a real estate email marketing expert.
Email type: ${options.emailType}. ${emailTypeInstructions[options.emailType]}
Agent: ${options.agentName}.
CTA button text: "${options.ctaText}".
${options.includeVirtualTourLink ? 'Mention that a virtual tour link is available.' : ''}
Return EXACTLY this JSON: {"subject":"...","body":"..."}
body: Write in HTML with inline styles. Keep it professional, mobile-friendly.
Use simple HTML: h2, p, a tags with inline styles. Include a styled CTA button.`,
        },
        {
          role: 'user',
          content: `Generate email content for:\n${propertySnippet(property)}`,
        },
      ],
      response_format: { type: 'json_object' },
    });
    const parsed = JSON.parse(response.choices[0].message.content || '{}');
    if (parsed.subject && parsed.body) return parsed as EmailContent;
    return mockEmailContent(property, options);
  } catch (error) {
    console.error('Email content generation error:', error);
    return mockEmailContent(property, options);
  }
}

function mockEmailContent(property: Property, options: EmailOptions): EmailContent {
  const price = property.price ? `$${property.price.toLocaleString()}` : 'Contact for price';
  const beds = property.bedrooms || 3;
  const baths = property.bathrooms || 2;
  const addr = `${property.address}, ${property.city}, ${property.state} ${property.zipCode}`;

  const subjects: Record<string, string> = {
    'just-listed': `Just Listed: ${beds}BR Home in ${property.city} — ${price}`,
    'open-house': `You're Invited: Open House at ${property.address}`,
    'price-reduction': `Price Reduced! ${property.address} Now ${price}`,
    'just-sold': `Just Sold: ${property.address} — Another Happy Homeowner!`,
  };

  const body = `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
  <h2 style="color: #1a1a1a; margin-bottom: 8px;">${subjects[options.emailType]}</h2>
  <p style="color: #666; font-size: 14px; line-height: 1.6;">
    ${addr}<br/>
    ${beds} Bed | ${baths} Bath${property.squareFeet ? ` | ${property.squareFeet.toLocaleString()} sqft` : ''}
  </p>
  <p style="font-size: 15px; line-height: 1.6;">
    ${options.emailType === 'just-listed' ? `I'm excited to share this new listing with you! This beautiful ${property.propertyType} features everything you've been looking for — modern finishes, spacious rooms, and an unbeatable location.` : ''}
    ${options.emailType === 'open-house' ? `You're invited to tour this beautiful ${property.propertyType} in person. Come see for yourself why this home is generating so much interest!` : ''}
    ${options.emailType === 'price-reduction' ? `Great news — the price on this stunning ${property.propertyType} has just been reduced! This is an incredible opportunity to own a home in one of ${property.city}'s most desirable neighborhoods.` : ''}
    ${options.emailType === 'just-sold' ? `Another beautiful home has found its new owners! This ${property.propertyType} in ${property.city} is now officially sold. If you're looking to buy or sell, I'd love to help you next.` : ''}
  </p>
  ${options.includeVirtualTourLink ? '<p style="font-size: 14px; color: #666;">A virtual tour is also available — ask me for the link!</p>' : ''}
  <a href="#" style="display: inline-block; padding: 12px 28px; background: #7c3aed; color: white; text-decoration: none; border-radius: 8px; font-weight: 600; margin-top: 16px;">${options.ctaText}</a>
  <p style="margin-top: 24px; font-size: 13px; color: #999;">
    ${options.agentName}<br/>
    Licensed Real Estate Agent
  </p>
</div>`;

  return { subject: subjects[options.emailType], body };
}
