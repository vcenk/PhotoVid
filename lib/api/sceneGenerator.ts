// AI-powered Scene Generator for Real Estate Storyboards

import { Scene, PropertyData, createEmptyScene } from '@/lib/types/storyboard';
import {
  SCENE_TEMPLATES,
  PROPERTY_TYPE_CONFIGS,
  getRecommendedScenes,
  buildPromptFromTemplate,
  matchDescriptionToScenes,
  SceneTemplate,
  MUSIC_SUGGESTIONS,
} from '@/lib/data/promptTemplates';

export interface GeneratedSceneConfig {
  room: string;
  type: Scene['type'];
  motionStyle: Scene['motionStyle'];
  duration: number;
  prompt: string;
  textOverlay?: Scene['textOverlay'];
  suggestedOrder: number;
}

export interface SceneGenerationOptions {
  propertyData: PropertyData;
  maxScenes?: number;
  includeAerial?: boolean;
  includeNeighborhood?: boolean;
  customRooms?: string[];
}

export interface SceneGenerationResult {
  scenes: Scene[];
  suggestedMusic: string[];
  totalDuration: number;
  sceneCount: number;
}

/**
 * Generate scenes based on property data
 * Uses template matching and property characteristics to create optimal scene list
 */
export function generateScenesFromProperty(
  options: SceneGenerationOptions
): SceneGenerationResult {
  const { propertyData, maxScenes = 10, includeAerial = true, includeNeighborhood = false, customRooms = [] } = options;

  // Get base recommended scenes for property type
  const propertyConfig = PROPERTY_TYPE_CONFIGS.find(p => p.id === propertyData.propertyType);
  let recommendedTemplates = getRecommendedScenes(propertyData.propertyType || 'house');

  // Filter based on options
  if (!includeAerial) {
    recommendedTemplates = recommendedTemplates.filter(t => t.type !== 'aerial');
  }
  if (!includeNeighborhood) {
    recommendedTemplates = recommendedTemplates.filter(t => t.type !== 'neighborhood');
  }

  // Add scenes based on property features
  const featureScenes = getFeatureBasedScenes(propertyData.features || []);

  // Combine and dedupe
  const allTemplates = [...recommendedTemplates];
  for (const ft of featureScenes) {
    if (!allTemplates.find(t => t.id === ft.id)) {
      allTemplates.push(ft);
    }
  }

  // Add custom rooms if specified
  for (const customRoom of customRooms) {
    const matchedScenes = matchDescriptionToScenes(customRoom);
    if (matchedScenes.length > 0 && !allTemplates.find(t => t.id === matchedScenes[0].id)) {
      allTemplates.push(matchedScenes[0]);
    }
  }

  // Sort by priority and limit
  const sortedTemplates = allTemplates
    .sort((a, b) => a.priority - b.priority)
    .slice(0, maxScenes);

  // Generate scenes from templates
  const scenes: Scene[] = sortedTemplates.map((template, index) => {
    const prompt = buildPromptFromTemplate(template, {
      style: propertyData.style,
      bedrooms: propertyData.bedrooms,
      bathrooms: propertyData.bathrooms,
      sqft: propertyData.squareFeet,
      address: propertyData.address,
      features: propertyData.features,
    });

    return createSceneFromTemplate(template, prompt, index);
  });

  // Get music suggestions based on property style
  const musicStyle = propertyData.style || 'default';
  const suggestedMusic = MUSIC_SUGGESTIONS[musicStyle] || MUSIC_SUGGESTIONS['default'];

  // Calculate total duration
  const totalDuration = scenes.reduce((sum, s) => sum + s.duration, 0);

  return {
    scenes,
    suggestedMusic,
    totalDuration,
    sceneCount: scenes.length,
  };
}

/**
 * Get additional scenes based on property features
 */
function getFeatureBasedScenes(features: string[]): SceneTemplate[] {
  const featureScenes: SceneTemplate[] = [];
  const featureLower = features.map(f => f.toLowerCase());

  // Check for special features
  if (featureLower.some(f => f.includes('pool') || f.includes('swimming'))) {
    const poolTemplate = SCENE_TEMPLATES.find(t => t.id === 'pool');
    if (poolTemplate) featureScenes.push(poolTemplate);
  }

  if (featureLower.some(f => f.includes('gym') || f.includes('fitness'))) {
    const gymTemplate = SCENE_TEMPLATES.find(t => t.id === 'gym');
    if (gymTemplate) featureScenes.push(gymTemplate);
  }

  if (featureLower.some(f => f.includes('theater') || f.includes('media'))) {
    const theaterTemplate = SCENE_TEMPLATES.find(t => t.id === 'theater');
    if (theaterTemplate) featureScenes.push(theaterTemplate);
  }

  if (featureLower.some(f => f.includes('wine') || f.includes('cellar'))) {
    const wineTemplate = SCENE_TEMPLATES.find(t => t.id === 'wine-cellar');
    if (wineTemplate) featureScenes.push(wineTemplate);
  }

  if (featureLower.some(f => f.includes('office') || f.includes('study') || f.includes('den'))) {
    const officeTemplate = SCENE_TEMPLATES.find(t => t.id === 'office');
    if (officeTemplate) featureScenes.push(officeTemplate);
  }

  if (featureLower.some(f => f.includes('basement') || f.includes('lower level'))) {
    const basementTemplate = SCENE_TEMPLATES.find(t => t.id === 'basement');
    if (basementTemplate) featureScenes.push(basementTemplate);
  }

  return featureScenes;
}

/**
 * Create a Scene object from a template
 */
function createSceneFromTemplate(
  template: SceneTemplate,
  prompt: string,
  order: number
): Scene {
  const baseScene = createEmptyScene();

  return {
    ...baseScene,
    order,
    type: template.type,
    room: template.room,
    motionStyle: template.motionStyle as Scene['motionStyle'],
    duration: template.duration,
    prompt,
    status: 'pending',
  };
}

/**
 * Generate scenes from a text description (AI-enhanced)
 * Falls back to template matching if AI is unavailable
 */
export async function generateScenesFromDescription(
  description: string,
  propertyData: Partial<PropertyData>
): Promise<SceneGenerationResult> {
  // Try to extract property details from description
  const extractedData = extractPropertyDataFromDescription(description);

  // Merge with provided data
  const fullPropertyData: PropertyData = {
    address: propertyData.address || extractedData.address || '',
    propertyType: propertyData.propertyType || extractedData.propertyType || 'house',
    bedrooms: propertyData.bedrooms || extractedData.bedrooms || 3,
    bathrooms: propertyData.bathrooms || extractedData.bathrooms || 2,
    squareFeet: propertyData.squareFeet || extractedData.squareFeet || 2000,
    features: [...(propertyData.features || []), ...(extractedData.features || [])],
    style: propertyData.style || extractedData.style || 'modern',
    description: description,
  };

  // Match scenes from description
  const matchedScenes = matchDescriptionToScenes(description);

  // Generate with both matched and recommended scenes
  return generateScenesFromProperty({
    propertyData: fullPropertyData,
    customRooms: matchedScenes.map(s => s.room),
    maxScenes: 10,
  });
}

/**
 * Extract property data from natural language description
 */
function extractPropertyDataFromDescription(description: string): Partial<PropertyData> {
  const data: Partial<PropertyData> = {};
  const desc = description.toLowerCase();

  // Extract bedrooms
  const bedroomMatch = desc.match(/(\d+)\s*(?:bed|bedroom|br)/);
  if (bedroomMatch) {
    data.bedrooms = parseInt(bedroomMatch[1]);
  }

  // Extract bathrooms
  const bathroomMatch = desc.match(/(\d+(?:\.\d+)?)\s*(?:bath|bathroom|ba)/);
  if (bathroomMatch) {
    data.bathrooms = parseFloat(bathroomMatch[1]);
  }

  // Extract square feet
  const sqftMatch = desc.match(/(\d{1,3}(?:,\d{3})*|\d+)\s*(?:sq\.?\s*ft\.?|square\s*feet|sqft)/i);
  if (sqftMatch) {
    data.squareFeet = parseInt(sqftMatch[1].replace(/,/g, ''));
  }

  // Detect property type
  if (desc.includes('condo')) data.propertyType = 'condo';
  else if (desc.includes('apartment')) data.propertyType = 'apartment';
  else if (desc.includes('townhouse') || desc.includes('town house')) data.propertyType = 'townhouse';
  else if (desc.includes('luxury') || desc.includes('estate') || desc.includes('mansion')) data.propertyType = 'luxury';
  else if (desc.includes('commercial') || desc.includes('office building')) data.propertyType = 'commercial';
  else data.propertyType = 'house';

  // Detect style
  const styles = ['modern', 'traditional', 'contemporary', 'craftsman', 'colonial',
                  'mediterranean', 'farmhouse', 'midcentury', 'victorian', 'coastal',
                  'industrial', 'scandinavian', 'rustic', 'luxury'];
  for (const style of styles) {
    if (desc.includes(style)) {
      data.style = style;
      break;
    }
  }

  // Detect features
  const features: string[] = [];
  const featureKeywords = [
    'pool', 'spa', 'hot tub', 'gym', 'fitness', 'theater', 'media room',
    'wine cellar', 'office', 'study', 'den', 'basement', 'garage',
    'fireplace', 'hardwood', 'granite', 'stainless', 'updated', 'renovated',
    'open concept', 'vaulted ceiling', 'skylight', 'balcony', 'deck', 'patio',
    'view', 'waterfront', 'golf', 'gated', 'smart home'
  ];
  for (const keyword of featureKeywords) {
    if (desc.includes(keyword)) {
      features.push(keyword);
    }
  }
  if (features.length > 0) {
    data.features = features;
  }

  return data;
}

/**
 * Reorder scenes for optimal flow
 * Places exterior first, interior in logical order, neighborhood last
 */
export function optimizeSceneOrder(scenes: Scene[]): Scene[] {
  const typeOrder: Record<Scene['type'], number> = {
    aerial: 1,
    exterior: 2,
    interior: 3,
    detail: 4,
    neighborhood: 5,
  };

  const roomPriority: Record<string, number> = {
    'exterior-aerial': 1,
    'exterior-front': 2,
    'living-room': 3,
    'kitchen': 4,
    'dining-room': 5,
    'master-bedroom': 6,
    'master-bathroom': 7,
    'bedroom': 8,
    'bathroom': 9,
    'office': 10,
    'basement': 11,
    'garage': 12,
    'backyard': 13,
    'pool': 14,
    'neighborhood': 15,
  };

  return [...scenes].sort((a, b) => {
    // First sort by type
    const typeOrderA = typeOrder[a.type] || 3;
    const typeOrderB = typeOrder[b.type] || 3;
    if (typeOrderA !== typeOrderB) return typeOrderA - typeOrderB;

    // Then by room priority
    const priorityA = roomPriority[a.room || ''] || 100;
    const priorityB = roomPriority[b.room || ''] || 100;
    return priorityA - priorityB;
  }).map((scene, index) => ({ ...scene, order: index }));
}

/**
 * Suggest additional scenes based on what's missing
 */
export function suggestAdditionalScenes(
  currentScenes: Scene[],
  propertyData: PropertyData
): SceneTemplate[] {
  const currentRooms = new Set(currentScenes.map(s => s.room));
  const recommended = getRecommendedScenes(propertyData.propertyType || 'house');

  return recommended.filter(t => !currentRooms.has(t.room));
}

/**
 * Calculate estimated generation cost in credits
 */
export function calculateSceneGenerationCost(scenes: Scene[]): number {
  // 5 credits per video scene (based on plan)
  return scenes.length * 5;
}

/**
 * Validate scenes before generation
 */
export function validateScenesForGeneration(scenes: Scene[]): {
  valid: boolean;
  errors: string[];
  warnings: string[];
} {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (scenes.length === 0) {
    errors.push('At least one scene is required');
  }

  const scenesWithImages = scenes.filter(s => s.imageUrl);
  if (scenesWithImages.length === 0) {
    errors.push('At least one scene must have an image uploaded');
  }

  if (scenes.length > 20) {
    warnings.push('Large storyboards (20+ scenes) may take significant time to generate');
  }

  const missingImages = scenes.filter(s => !s.imageUrl);
  if (missingImages.length > 0 && missingImages.length < scenes.length) {
    warnings.push(`${missingImages.length} scene(s) are missing images and will be skipped`);
  }

  const totalDuration = scenes.reduce((sum, s) => sum + s.duration, 0);
  if (totalDuration > 120) {
    warnings.push('Total video duration exceeds 2 minutes - consider reducing scenes');
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}
