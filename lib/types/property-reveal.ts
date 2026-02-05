// Property Reveal Types and Style Presets

export type AnimationType =
  | 'room-staging'
  | 'lot-to-house'
  | 'exterior-renovation'
  | 'landscaping'
  | 'pool-installation'
  | 'interior-renovation'
  | 'seasonal-transform';

export interface AnimationStyle {
  id: string;
  label: string;
  elements: string[];
}

export interface PropertyRevealOptions {
  animationType: AnimationType;
  imageUrl: string;
  styleId: string;
  withAudio: boolean;
  duration: 8 | 10;
}

export interface PropertyRevealResult {
  videoUrl: string;
  duration: number;
  hasAudio: boolean;
  animationType: AnimationType;
}

// Animation Type Metadata
export const ANIMATION_TYPE_INFO: Record<AnimationType, { label: string; icon: string; description: string; uploadLabel: string; uploadDescription: string }> = {
  'room-staging': {
    label: 'Room Staging',
    icon: '🛋️',
    description: 'Furniture appears in empty room',
    uploadLabel: 'Upload Empty Room Photo',
    uploadDescription: 'Empty or unfurnished interior room'
  },
  'lot-to-house': {
    label: 'Lot to House',
    icon: '🏗️',
    description: 'House builds on empty lot',
    uploadLabel: 'Upload Empty Lot Photo',
    uploadDescription: 'Vacant land or empty lot'
  },
  'exterior-renovation': {
    label: 'Exterior Renovation',
    icon: '🏠',
    description: 'House exterior transforms',
    uploadLabel: 'Upload House Exterior Photo',
    uploadDescription: 'Current house exterior (any condition)'
  },
  'landscaping': {
    label: 'Landscaping Reveal',
    icon: '🌳',
    description: 'Yard becomes beautiful',
    uploadLabel: 'Upload House + Yard Photo',
    uploadDescription: 'House with bare or minimal landscaping'
  },
  'pool-installation': {
    label: 'Pool Installation',
    icon: '🏊',
    description: 'Pool appears in backyard',
    uploadLabel: 'Upload Backyard Photo',
    uploadDescription: 'Backyard without a pool'
  },
  'interior-renovation': {
    label: 'Interior Renovation',
    icon: '🔨',
    description: 'Room gets remodeled',
    uploadLabel: 'Upload Room to Renovate',
    uploadDescription: 'Dated kitchen, bathroom, or room'
  },
  'seasonal-transform': {
    label: 'Seasonal Transform',
    icon: '🎄',
    description: 'Holiday decorations appear',
    uploadLabel: 'Upload House Exterior Photo',
    uploadDescription: 'House exterior (any season)'
  }
};

// ============= STYLE PRESETS =============

export const ROOM_STAGING_STYLES: AnimationStyle[] = [
  {
    id: 'modern-living',
    label: 'Modern Living Room',
    elements: ['L-shaped sectional sofa', 'glass coffee table', 'floor lamp', 'abstract wall art', 'area rug', 'side tables', 'decorative pillows', 'potted plant']
  },
  {
    id: 'scandinavian-bedroom',
    label: 'Scandinavian Bedroom',
    elements: ['platform bed', 'nightstands', 'dresser', 'pendant lights', 'linen bedding', 'throw blanket', 'small plant', 'wall mirror']
  },
  {
    id: 'luxury-master',
    label: 'Luxury Master Suite',
    elements: ['king bed with tufted headboard', 'velvet bench', 'crystal chandelier', 'silk curtains', 'accent chairs', 'ornate mirror', 'table lamps', 'plush rug']
  },
  {
    id: 'cozy-family',
    label: 'Cozy Family Room',
    elements: ['large sectional', 'ottoman', 'bookshelf', 'TV console', 'floor cushions', 'throw blankets', 'family photos', 'indoor plants']
  },
  {
    id: 'minimalist-office',
    label: 'Minimalist Home Office',
    elements: ['desk', 'ergonomic chair', 'bookshelf', 'desk lamp', 'monitor', 'potted succulent', 'wall organizer', 'area rug']
  },
  {
    id: 'modern-kitchen',
    label: 'Modern Kitchen',
    elements: ['bar stools', 'pendant lights', 'fruit bowl', 'knife block', 'small appliances', 'plant on counter', 'decorative jars', 'cookbook stand']
  },
  {
    id: 'spa-bathroom',
    label: 'Spa Bathroom',
    elements: ['plush towels', 'bath mat', 'candles', 'plant', 'soap dispenser', 'decorative tray', 'mirror lighting', 'small stool']
  },
  {
    id: 'dining-room',
    label: 'Elegant Dining Room',
    elements: ['dining table', 'upholstered chairs', 'chandelier', 'sideboard', 'table centerpiece', 'place settings', 'area rug', 'wall art']
  }
];

export const HOUSE_BUILD_STYLES: AnimationStyle[] = [
  {
    id: 'modern-two-story',
    label: 'Modern Two-Story',
    elements: ['concrete foundation', 'wooden frame walls', 'second floor framing', 'roof trusses', 'roof shingles', 'exterior siding panels', 'large windows', 'modern front door', 'garage door', 'front porch', 'driveway', 'basic landscaping']
  },
  {
    id: 'craftsman-bungalow',
    label: 'Craftsman Bungalow',
    elements: ['stone foundation', 'wooden frame', 'tapered columns', 'covered front porch', 'low-pitched roof', 'exposed rafters', 'double-hung windows', 'craftsman door', 'stone accents', 'front pathway']
  },
  {
    id: 'colonial-traditional',
    label: 'Colonial Traditional',
    elements: ['brick foundation', 'symmetrical frame', 'columns', 'centered front door', 'shuttered windows', 'dormer windows', 'chimney', 'gabled roof', 'formal landscaping']
  },
  {
    id: 'modern-farmhouse',
    label: 'Modern Farmhouse',
    elements: ['foundation slab', 'board and batten siding', 'metal roof panels', 'large windows', 'black-framed windows', 'covered porch with posts', 'barn-style door', 'lantern lights', 'gravel driveway']
  },
  {
    id: 'mediterranean-villa',
    label: 'Mediterranean Villa',
    elements: ['stucco walls', 'terracotta roof tiles', 'arched windows', 'wrought iron details', 'balcony', 'courtyard fountain', 'palm trees', 'stone driveway']
  },
  {
    id: 'contemporary-cube',
    label: 'Contemporary Cube',
    elements: ['concrete foundation', 'flat roof', 'floor-to-ceiling windows', 'minimalist door', 'clean stucco walls', 'horizontal lines', 'rooftop deck railing', 'modern landscaping']
  }
];

export const EXTERIOR_RENOVATION_STYLES: AnimationStyle[] = [
  {
    id: 'modern-refresh',
    label: 'Modern Refresh',
    elements: ['fresh white paint spreading', 'new black-framed windows', 'modern front door', 'updated house numbers', 'new light fixtures', 'clean shutters removed', 'new garage door', 'updated landscaping']
  },
  {
    id: 'farmhouse-conversion',
    label: 'Farmhouse Conversion',
    elements: ['board and batten siding', 'black windows', 'metal roof panels', 'farmhouse front door', 'lantern sconces', 'wooden shutters', 'wraparound porch railing', 'barn-style garage door']
  },
  {
    id: 'craftsman-upgrade',
    label: 'Craftsman Upgrade',
    elements: ['stone veneer accents', 'tapered columns', 'new craftsman door', 'decorative brackets', 'exposed rafter tails', 'updated windows', 'copper gutters', 'stone pathway']
  },
  {
    id: 'contemporary-makeover',
    label: 'Contemporary Makeover',
    elements: ['smooth stucco finish', 'large modern windows', 'pivot front door', 'horizontal wood accents', 'flat roof extension', 'minimalist lighting', 'concrete walkway', 'architectural landscaping']
  },
  {
    id: 'coastal-transformation',
    label: 'Coastal Transformation',
    elements: ['light blue-gray siding', 'white trim paint', 'coastal front door', 'white shutters', 'rope railings', 'nautical light fixtures', 'white picket fence', 'beach grass landscaping']
  }
];

export const LANDSCAPING_STYLES: AnimationStyle[] = [
  {
    id: 'lush-traditional',
    label: 'Lush Traditional',
    elements: ['green lawn rolling out', 'foundation shrubs', 'flowering bushes', 'mature trees', 'mulched beds', 'stone edging', 'front pathway', 'outdoor lighting', 'decorative planters', 'welcome mat']
  },
  {
    id: 'modern-minimal',
    label: 'Modern Minimal',
    elements: ['artificial turf', 'ornamental grasses', 'concrete pavers', 'steel edging', 'single specimen tree', 'gravel sections', 'modern planters', 'uplighting', 'clean lines']
  },
  {
    id: 'desert-xeriscape',
    label: 'Desert Xeriscape',
    elements: ['decomposed granite', 'cacti and succulents', 'agave plants', 'boulder accents', 'desert wildflowers', 'gravel pathways', 'solar lights', 'terracotta pots']
  },
  {
    id: 'cottage-garden',
    label: 'Cottage Garden',
    elements: ['wildflower beds', 'climbing roses on trellis', 'picket fence', 'stone pathway', 'bird bath', 'wooden bench', 'flowering trees', 'hanging baskets', 'garden gate']
  },
  {
    id: 'tropical-paradise',
    label: 'Tropical Paradise',
    elements: ['palm trees', 'bird of paradise plants', 'hibiscus bushes', 'ferns', 'stone pathway', 'tiki torches', 'water feature', 'colorful planters']
  },
  {
    id: 'formal-estate',
    label: 'Formal Estate',
    elements: ['manicured lawn', 'boxwood hedges', 'symmetrical plantings', 'fountain centerpiece', 'brick pathway', 'iron urns', 'topiary trees', 'landscape lighting', 'rose garden']
  }
];

export const POOL_STYLES: AnimationStyle[] = [
  {
    id: 'modern-infinity',
    label: 'Modern Infinity Pool',
    elements: ['infinity edge pool forming', 'concrete deck pouring', 'glass fence panels', 'modern loungers', 'umbrella', 'built-in hot tub', 'fire pit table', 'outdoor shower', 'LED pool lights']
  },
  {
    id: 'tropical-lagoon',
    label: 'Tropical Lagoon',
    elements: ['freeform pool filling', 'rock waterfall', 'grotto entrance', 'tropical plants', 'tiki bar', 'swim-up stools', 'stone deck', 'palm trees', 'rope bridge']
  },
  {
    id: 'classic-rectangle',
    label: 'Classic Rectangle',
    elements: ['rectangular pool forming', 'travertine deck', 'diving board', 'pool house', 'chaise lounges', 'market umbrella', 'pool fence', 'outdoor dining set']
  },
  {
    id: 'resort-style',
    label: 'Resort Style',
    elements: ['large pool forming', 'baja shelf', 'cabana structure', 'daybed', 'outdoor kitchen', 'bar seating', 'fire bowls', 'string lights', 'water features']
  },
  {
    id: 'lap-pool-modern',
    label: 'Modern Lap Pool',
    elements: ['narrow lap pool', 'wood deck', 'minimalist loungers', 'zen garden border', 'bamboo screen', 'outdoor shower', 'plunge cold tub']
  }
];

export const INTERIOR_RENOVATION_STYLES: AnimationStyle[] = [
  {
    id: 'modern-kitchen',
    label: 'Modern Kitchen Remodel',
    elements: ['white shaker cabinets', 'quartz countertops', 'stainless appliances', 'subway tile backsplash', 'pendant lights', 'brushed nickel hardware', 'farmhouse sink', 'new flooring']
  },
  {
    id: 'spa-bathroom',
    label: 'Spa Bathroom Remodel',
    elements: ['freestanding tub', 'glass shower enclosure', 'double vanity', 'large mirror', 'modern tiles', 'rainfall showerhead', 'heated floors', 'sconce lighting']
  },
  {
    id: 'open-concept',
    label: 'Open Concept Transformation',
    elements: ['walls dissolving', 'support beam installing', 'new flooring flowing', 'modern lighting', 'fresh paint spreading', 'new windows', 'updated trim']
  },
  {
    id: 'basement-finish',
    label: 'Basement Finishing',
    elements: ['drywall installing', 'flooring laying', 'drop ceiling', 'recessed lights', 'egress window', 'built-in entertainment center', 'wet bar', 'cozy seating']
  },
  {
    id: 'luxury-primary',
    label: 'Luxury Primary Suite',
    elements: ['tray ceiling forming', 'accent wall', 'crown molding', 'luxury carpet', 'custom closet system', 'chandelier', 'window treatments', 'sitting area furniture']
  }
];

export const SEASONAL_STYLES: AnimationStyle[] = [
  {
    id: 'christmas-wonderland',
    label: 'Christmas Wonderland',
    elements: ['string lights wrapping house', 'wreaths on windows', 'front door wreath', 'light-up reindeer', 'Christmas tree visible through window', 'garland on railings', 'luminaries along path', 'inflatable snowman', 'fake snow']
  },
  {
    id: 'halloween-spooky',
    label: 'Halloween Spooky',
    elements: ['jack-o-lanterns', 'spider webs', 'skeleton decorations', 'fog rolling in', 'orange string lights', 'tombstones on lawn', 'witch silhouettes', 'spooky lighting']
  },
  {
    id: 'fall-harvest',
    label: 'Fall Harvest',
    elements: ['pumpkin arrangement', 'hay bales', 'corn stalks', 'mums in planters', 'fall wreath', 'scarecrow', 'warm lighting', 'fall leaf garland']
  },
  {
    id: 'spring-bloom',
    label: 'Spring Bloom',
    elements: ['tulips blooming', 'cherry blossoms', 'hanging flower baskets', 'butterfly decorations', 'pastel bunting', 'bird houses', 'fresh mulch', 'green lawn']
  },
  {
    id: 'summer-celebration',
    label: 'Summer Celebration',
    elements: ['American flags', 'red white blue bunting', 'string lights', 'outdoor furniture', 'potted flowers', 'welcome banner', 'lawn games setup']
  }
];

// Style map for easy access
export const STYLE_MAPS: Record<AnimationType, AnimationStyle[]> = {
  'room-staging': ROOM_STAGING_STYLES,
  'lot-to-house': HOUSE_BUILD_STYLES,
  'exterior-renovation': EXTERIOR_RENOVATION_STYLES,
  'landscaping': LANDSCAPING_STYLES,
  'pool-installation': POOL_STYLES,
  'interior-renovation': INTERIOR_RENOVATION_STYLES,
  'seasonal-transform': SEASONAL_STYLES
};

// Get styles for a specific animation type
export function getStylesForType(type: AnimationType): AnimationStyle[] {
  return STYLE_MAPS[type] || [];
}

// Get a specific style
export function getStyle(type: AnimationType, styleId: string): AnimationStyle | undefined {
  return STYLE_MAPS[type]?.find(s => s.id === styleId);
}

// Calculate cost
export function calculateCost(duration: 8 | 10, withAudio: boolean): { dollars: number; credits: number } {
  const perSecond = withAudio ? 0.40 : 0.20;
  const dollars = duration * perSecond;
  const credits = duration * (withAudio ? 10 : 5);
  return { dollars, credits };
}
