/**
 * Unsplash Image Helper
 *
 * This uses Unsplash's URL API which doesn't require an API key for basic usage.
 * For production, you should sign up for a free Unsplash API key at https://unsplash.com/developers
 * and replace the source.unsplash.com URLs with api.unsplash.com calls.
 */

export interface UnsplashImageConfig {
  width?: number;
  height?: number;
  query?: string;
  blur?: number;
  grayscale?: boolean;
}

/**
 * Generate Unsplash image URL with specific parameters
 * Note: This uses the Unsplash Source API which is simpler but less customizable
 * For production, use the official Unsplash API
 */
export function getUnsplashImage(config: UnsplashImageConfig): string {
  const { width = 1200, height = 800, query = 'architecture' } = config;

  // Using Unsplash Source URL format
  return `https://source.unsplash.com/${width}x${height}/?${encodeURIComponent(query)}`;
}

/**
 * Get specific Unsplash image by ID (for consistent images across reloads)
 */
export function getUnsplashImageById(imageId: string, width: number = 1200, height: number = 800): string {
  return `https://images.unsplash.com/photo-${imageId}?w=${width}&h=${height}&fit=crop&auto=format`;
}

/**
 * Curated Unsplash image IDs for each industry
 * These are hand-picked professional photos that work well for each use case
 */
export const UNSPLASH_IMAGES = {
  // Real Estate
  realEstate: {
    modernLiving: '1600585154340-be6161a56a0c', // Modern living room
    luxuryBedroom: '1616486338812-3dadae4b4ace', // Luxury bedroom
    kitchenInterior: '1556909212-d5b604d0c90d', // Modern kitchen
    bathroomSpa: '1552321554-5fefe8c9ef14', // Spa bathroom
    exteriorTwilight: '1600596542815-ffad4c1539a9', // House at twilight
    openFloorPlan: '1600210492493-0946911123ea', // Open floor plan
  },

  // Hospitality
  hospitality: {
    fineDiningPlate: '1546069901-ba9599a7e63c', // Fine dining plated dish
    restaurantAmbiance: '1517248135467-4c7edcad34c4', // Restaurant interior
    coffeeLatte: '1495474472287-4d71bcdd2085', // Coffee latte art
    foodStyling: '1565299624946-b28f40a0ae38', // Professional food styling
    cocktailBar: '1514933651326-dbac15f8f8fe', // Cocktail bar
    breakfastSpread: '1533777857889-4be7c70b33f7', // Breakfast spread
  },

  // Retail
  retail: {
    productWhite: '1505740420928-5e560c06d30e', // Product on white
    fashionLifestyle: '1515886657613-9d3515b1e8a9', // Fashion lifestyle
    techGadget: '1550009158-9ebfd4d5624b', // Tech product
    cosmeticsFlat: '1596462502278-27bfdc403348', // Cosmetics flat lay
    watchLuxury: '1524592094714-0f0654e20314', // Luxury watch
    sneakerProduct: '1542291026-7eec264c27ff', // Sneaker product shot
  },

  // Templates & Workflows
  templates: {
    virtualStaging: '1600607687939-ce8a6c25118c', // Empty room for staging
    twilightProperty: '1600585154340-be6161a56a0c', // Property exterior
    menuDesign: '1546069901-ba9599a7e63c', // Menu food photography
    productMockup: '1505740420928-5e560c06d30e', // Product mockup
    roomTour: '1600210492493-0946911123ea', // Room interior
    foodAction: '1533777857889-4be7c70b33f7', // Food action shot
  },
};

/**
 * Get industry-specific placeholder image
 */
export function getIndustryImage(
  industry: 'real-estate' | 'hospitality' | 'retail',
  variant: string = 'default',
  width: number = 1200,
  height: number = 800
): string {
  const queries: Record<string, string> = {
    'real-estate': 'modern interior design,luxury home',
    'hospitality': 'restaurant food,fine dining',
    'retail': 'product photography,e-commerce',
  };

  return getUnsplashImage({ width, height, query: queries[industry] });
}

/**
 * Generate gradient placeholder for loading states
 */
export function getGradientPlaceholder(industry: 'real-estate' | 'hospitality' | 'retail'): string {
  const gradients: Record<string, string> = {
    'real-estate': 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    'hospitality': 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    'retail': 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
  };

  return gradients[industry];
}
