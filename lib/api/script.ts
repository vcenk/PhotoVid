/**
 * Script Generation API - OpenAI integration for property video narration
 *
 * Generates natural, engaging scripts for real estate videos based on:
 * - Image labels/room types
 * - Property highlights
 * - Template style
 * - Target duration
 */

import type {
  PropertyScript,
  ScriptSegment,
  VideoTemplateV2,
  VideoDuration,
  GenerateScriptRequest,
  GenerateScriptResponse,
  VoiceLanguage,
} from '@/lib/types/quick-video-v2';
import { generateId } from '@/lib/types/quick-video-v2';
import { createClient } from '@/lib/database/client';

/**
 * Language names for prompts
 */
const LANGUAGE_NAMES: Record<VoiceLanguage, string> = {
  en: 'English',
  es: 'Spanish',
  de: 'German',
  fr: 'French',
  it: 'Italian',
  nl: 'Dutch',
  ja: 'Japanese',
};

/**
 * Get system prompt for real estate video narration in a specific language
 */
function getSystemPrompt(language: VoiceLanguage, useVision: boolean = false): string {
  const langName = LANGUAGE_NAMES[language] || 'English';

  const visionInstructions = useVision
    ? `
IMPORTANT: You are provided with actual images of the property. Analyze each image carefully and describe what you SEE:
- Look at the actual content of each image (room type, outdoor area, architectural features, etc.)
- Describe specific visible elements (furniture, decor, views, landscaping, etc.)
- Note the lighting, colors, and atmosphere
- Do NOT assume what a space is - describe what you actually see`
    : '';

  return `You are a professional real estate video narrator. Your job is to create warm, engaging narration scripts that guide viewers through property tours.

IMPORTANT: You MUST write ALL narration text in ${langName}. The entire script must be in ${langName} language.
${visionInstructions}

Guidelines:
- Write ALL text in ${langName} - do not use English unless the language is English
- Use descriptive, evocative language that paints a picture
- Highlight unique features and selling points naturally
- Maintain a consistent tone that matches the requested style
- Create smooth transitions between areas shown in the images
- Include a welcoming opening and compelling closing
- Vary sentence structure for natural flow
- Avoid clichés and overly salesy language
- Use natural, native ${langName} expressions and phrasing

Output format: Return ONLY a valid JSON array, no markdown or code blocks.`;
}

/**
 * Get style-specific instructions
 */
function getStyleInstructions(style: VideoTemplateV2): string {
  const styles: Record<VideoTemplateV2, string> = {
    'luxe-estate': 'Use elegant, sophisticated language. Speak slowly and deliberately. Emphasize luxury, craftsmanship, and exclusive features. Use words like "exquisite", "bespoke", "refined".',
    'modern-living': 'Use clean, contemporary language. Be upbeat and energetic. Emphasize modern design, smart features, and lifestyle benefits. Use words like "seamless", "innovative", "curated".',
    'cozy-home': 'Use warm, inviting language. Create a sense of comfort and belonging. Emphasize livability, family-friendly features, and charm. Use words like "welcoming", "cherished", "gathering".',
    'urban-loft': 'Use trendy, energetic language. Be dynamic and exciting. Emphasize urban lifestyle, unique character, and creative spaces. Use words like "vibrant", "dynamic", "eclectic".',
    'classic-elegance': 'Use timeless, refined language. Be graceful and measured. Emphasize heritage, quality materials, and enduring style. Use words like "timeless", "distinguished", "gracious".',
    'quick-tour': 'Be concise and punchy. Focus on key highlights only. Use short, impactful sentences. Get to the point quickly.',
  };

  return styles[style] || styles['modern-living'];
}

/**
 * Build the user prompt for script generation (text-only mode)
 */
function buildUserPrompt(params: GenerateScriptRequest): string {
  const { imageCount, imageLabels, templateStyle, propertyHighlights, targetDuration, language } = params;
  const langName = LANGUAGE_NAMES[language] || 'English';

  const imageList = imageLabels.length > 0
    ? imageLabels.map((label, i) => `${i + 1}. ${label || 'Image ' + (i + 1)}`).join('\n')
    : Array.from({ length: imageCount }, (_, i) => `${i + 1}. Image ${i + 1}`).join('\n');

  const highlightsList = propertyHighlights && propertyHighlights.length > 0
    ? `\nKey features to mention: ${propertyHighlights.join(', ')}`
    : '';

  const avgDuration = targetDuration / imageCount;

  return `Create a ${targetDuration}-second narration script for a property tour video.

CRITICAL: Write ALL narration text in ${langName}. Every word must be in ${langName}.

Style: ${templateStyle}
${getStyleInstructions(templateStyle)}

The video has ${imageCount} images showing these areas:
${imageList}
${highlightsList}

Create a segment for each image. Each segment should:
- Be written entirely in ${langName}
- Be approximately ${avgDuration.toFixed(1)} seconds when spoken naturally
- Flow smoothly from the previous segment
- Highlight the unique features of that space

Return a JSON array with exactly ${imageCount} objects:
[
  {
    "imageIndex": 0,
    "text": "Your ${langName} narration for image 1...",
    "duration": ${avgDuration.toFixed(1)},
    "keywords": ["key", "words", "in ${langName}"]
  },
  ...
]

Remember:
- WRITE EVERYTHING IN ${langName.toUpperCase()}
- First segment should welcome viewers (in ${langName})
- Last segment should include a call to action (in ${langName})
- Total duration should be approximately ${targetDuration} seconds`;
}

/**
 * Build the user prompt for vision-based script generation
 * This prompt asks GPT-4o to analyze actual images and generate contextual narration
 */
function buildVisionPrompt(params: GenerateScriptRequest): string {
  const { imageCount, templateStyle, propertyHighlights, targetDuration, language } = params;
  const langName = LANGUAGE_NAMES[language] || 'English';

  const highlightsList = propertyHighlights && propertyHighlights.length > 0
    ? `\nAdditional features to mention if visible: ${propertyHighlights.join(', ')}`
    : '';

  const avgDuration = targetDuration / imageCount;

  return `I'm showing you ${imageCount} images of a property. Analyze each image and create a ${targetDuration}-second narration script for a property tour video.

CRITICAL: Write ALL narration text in ${langName}. Every word must be in ${langName}.

Style: ${templateStyle}
${getStyleInstructions(templateStyle)}
${highlightsList}

For EACH image (in order from 1 to ${imageCount}):
1. Look at what is ACTUALLY shown in the image
2. Identify if it's interior, exterior, garden, pool, view, etc.
3. Note specific features you can see (furniture, finishes, landscaping, architecture)
4. Write narration that describes what viewers will see

Create a segment for each image. Each segment should:
- Be written entirely in ${langName}
- Accurately describe what is VISIBLE in that specific image
- Be approximately ${avgDuration.toFixed(1)} seconds when spoken naturally
- Flow smoothly from the previous segment
- Use the ${templateStyle} style tone

Return a JSON array with exactly ${imageCount} objects (one per image, in order):
[
  {
    "imageIndex": 0,
    "text": "Your ${langName} narration describing what you see in image 1...",
    "duration": ${avgDuration.toFixed(1)},
    "keywords": ["visible", "features", "in ${langName}"]
  },
  ...
]

Remember:
- WRITE EVERYTHING IN ${langName.toUpperCase()}
- First segment should welcome viewers (in ${langName})
- Last segment should include a call to action (in ${langName})
- Describe what you ACTUALLY SEE in each image, not generic descriptions
- Total duration should be approximately ${targetDuration} seconds`;
}

/**
 * Parse OpenAI response into PropertyScript
 */
function parseScriptResponse(
  response: string,
  params: GenerateScriptRequest,
  imageIds: string[]
): PropertyScript | null {
  try {
    // Clean up response (remove markdown code blocks if present)
    let cleaned = response.trim();
    if (cleaned.startsWith('```json')) {
      cleaned = cleaned.slice(7);
    } else if (cleaned.startsWith('```')) {
      cleaned = cleaned.slice(3);
    }
    if (cleaned.endsWith('```')) {
      cleaned = cleaned.slice(0, -3);
    }
    cleaned = cleaned.trim();

    const parsed = JSON.parse(cleaned);

    if (!Array.isArray(parsed)) {
      console.error('Response is not an array');
      return null;
    }

    const segments: ScriptSegment[] = parsed.map((item: any, index: number) => ({
      id: generateId(),
      imageId: imageIds[item.imageIndex ?? index] || imageIds[index] || generateId(),
      imageIndex: item.imageIndex ?? index,
      text: item.text || '',
      duration: item.duration || params.targetDuration / params.imageCount,
      keywords: item.keywords || [],
    }));

    const totalDuration = segments.reduce((sum, seg) => sum + seg.duration, 0);

    return {
      id: generateId(),
      segments,
      totalDuration,
      generatedAt: new Date(),
      templateStyle: params.templateStyle,
    };
  } catch (error) {
    console.error('Failed to parse script response:', error);
    return null;
  }
}

/**
 * Fallback scripts for different languages
 * Note: Templates must be generic enough to work for ANY image type (indoor, outdoor, gardens, exterior, etc.)
 */
const FALLBACK_SCRIPTS: Record<VoiceLanguage, {
  openings: string[];
  middleTemplates: ((label: string) => string)[];
  closings: string[];
}> = {
  en: {
    openings: [
      'Welcome to this exceptional property.',
      'Discover the beauty of this remarkable property.',
      'Let me show you what makes this place truly special.',
    ],
    middleTemplates: [
      (label: string) => `Here we have ${label ? `the ${label.toLowerCase()}` : 'a beautiful view'}, showcasing thoughtful design and quality throughout.`,
      (label: string) => `Take a look at ${label ? `this ${label.toLowerCase()}` : 'this stunning area'}, where attention to detail is evident in every corner.`,
      (label: string) => `${label ? `The ${label.toLowerCase()}` : 'This space'} offers the perfect blend of style and functionality.`,
      (label: string) => `${label ? `This ${label.toLowerCase()}` : 'Here'} is designed with modern living in mind, featuring premium finishes.`,
      (label: string) => `Notice how ${label ? `the ${label.toLowerCase()}` : 'this area'} captures natural light and elegant design elements.`,
    ],
    closings: [
      'Schedule your private showing today and make this your new home.',
      'Contact us to experience this remarkable property in person.',
      'This is more than a property—it\'s the lifestyle you\'ve been waiting for.',
    ],
  },
  es: {
    openings: [
      'Bienvenido a esta propiedad excepcional.',
      'Descubre la belleza de esta propiedad única.',
      'Permítame mostrarle lo que hace especial este lugar.',
    ],
    middleTemplates: [
      (label: string) => `Aquí tenemos ${label ? `${label.toLowerCase()}` : 'una hermosa vista'}, con un diseño cuidado y calidad en cada detalle.`,
      (label: string) => `Observe ${label ? `este ${label.toLowerCase()}` : 'esta impresionante área'}, donde la atención al detalle es evidente.`,
      (label: string) => `${label ? `${label}` : 'Este espacio'} ofrece la combinación perfecta de estilo y funcionalidad.`,
      (label: string) => `${label ? `Este ${label.toLowerCase()}` : 'Aquí'} está diseñado para la vida moderna, con acabados premium.`,
      (label: string) => `Note cómo ${label ? `${label.toLowerCase()}` : 'esta área'} captura la luz natural y elementos de diseño elegante.`,
    ],
    closings: [
      'Programe su visita privada hoy y haga de esta su nuevo hogar.',
      'Contáctenos para conocer esta propiedad en persona.',
      'Esto es más que una propiedad—es el estilo de vida que estaba esperando.',
    ],
  },
  de: {
    openings: [
      'Willkommen in dieser außergewöhnlichen Immobilie.',
      'Entdecken Sie die Schönheit dieser einzigartigen Immobilie.',
      'Lassen Sie mich Ihnen zeigen, was diesen Ort so besonders macht.',
    ],
    middleTemplates: [
      (label: string) => `Hier sehen wir ${label ? `${label.toLowerCase()}` : 'einen wunderschönen Bereich'}, mit durchdachtem Design und Qualität in jedem Detail.`,
      (label: string) => `Betrachten Sie ${label ? `diesen ${label.toLowerCase()}` : 'diesen beeindruckenden Bereich'}, wo die Liebe zum Detail sichtbar ist.`,
      (label: string) => `${label ? `${label}` : 'Dieser Bereich'} bietet die perfekte Mischung aus Stil und Funktionalität.`,
      (label: string) => `${label ? `Dieser ${label.toLowerCase()}` : 'Hier'} ist für modernes Wohnen gestaltet, mit erstklassiger Ausstattung.`,
      (label: string) => `Beachten Sie, wie ${label ? `${label.toLowerCase()}` : 'dieser Bereich'} natürliches Licht und elegante Designelemente einfängt.`,
    ],
    closings: [
      'Vereinbaren Sie noch heute Ihre private Besichtigung.',
      'Kontaktieren Sie uns, um diese Immobilie persönlich zu erleben.',
      'Dies ist mehr als eine Immobilie—es ist der Lebensstil, auf den Sie gewartet haben.',
    ],
  },
  fr: {
    openings: [
      'Bienvenue dans cette propriété exceptionnelle.',
      'Découvrez la beauté de cette propriété unique.',
      'Permettez-moi de vous montrer ce qui rend cet endroit si spécial.',
    ],
    middleTemplates: [
      (label: string) => `Voici ${label ? `${label.toLowerCase()}` : 'une belle vue'}, avec un design soigné et de la qualité dans chaque détail.`,
      (label: string) => `Observez ${label ? `ce ${label.toLowerCase()}` : 'cet espace impressionnant'}, où le souci du détail est évident.`,
      (label: string) => `${label ? `${label}` : 'Cet espace'} offre le mélange parfait de style et de fonctionnalité.`,
      (label: string) => `${label ? `Ce ${label.toLowerCase()}` : 'Ici'} est conçu pour la vie moderne, avec des finitions premium.`,
      (label: string) => `Remarquez comment ${label ? `${label.toLowerCase()}` : 'cette zone'} capture la lumière naturelle et des éléments de design élégants.`,
    ],
    closings: [
      'Planifiez votre visite privée dès aujourd\'hui.',
      'Contactez-nous pour découvrir cette propriété en personne.',
      'C\'est plus qu\'une propriété—c\'est le style de vie que vous attendiez.',
    ],
  },
  it: {
    openings: [
      'Benvenuto in questa proprietà eccezionale.',
      'Scopri la bellezza di questa proprietà unica.',
      'Permettimi di mostrarti cosa rende questo posto così speciale.',
    ],
    middleTemplates: [
      (label: string) => `Ecco ${label ? `${label.toLowerCase()}` : 'una bella vista'}, con un design curato e qualità in ogni dettaglio.`,
      (label: string) => `Osserva ${label ? `questo ${label.toLowerCase()}` : 'questa area impressionante'}, dove l'attenzione ai dettagli è evidente.`,
      (label: string) => `${label ? `${label}` : 'Questo spazio'} offre il perfetto equilibrio tra stile e funzionalità.`,
      (label: string) => `${label ? `Questo ${label.toLowerCase()}` : 'Qui'} è progettato per la vita moderna, con finiture premium.`,
      (label: string) => `Nota come ${label ? `${label.toLowerCase()}` : 'quest\'area'} cattura la luce naturale e elementi di design elegante.`,
    ],
    closings: [
      'Prenota la tua visita privata oggi stesso.',
      'Contattaci per scoprire questa proprietà di persona.',
      'Questa è più di una proprietà—è lo stile di vita che stavi aspettando.',
    ],
  },
  nl: {
    openings: [
      'Welkom bij deze uitzonderlijke woning.',
      'Ontdek de schoonheid van dit unieke vastgoed.',
      'Laat me u laten zien wat deze plek zo bijzonder maakt.',
    ],
    middleTemplates: [
      (label: string) => `Hier zien we ${label ? `de ${label.toLowerCase()}` : 'een prachtig uitzicht'}, met doordacht ontwerp en kwaliteit in elk detail.`,
      (label: string) => `Bekijk ${label ? `deze ${label.toLowerCase()}` : 'dit indrukwekkende gebied'}, waar de aandacht voor detail duidelijk is.`,
      (label: string) => `${label ? `De ${label.toLowerCase()}` : 'Deze ruimte'} biedt de perfecte mix van stijl en functionaliteit.`,
      (label: string) => `${label ? `Deze ${label.toLowerCase()}` : 'Hier'} is ontworpen voor modern wonen, met premium afwerking.`,
      (label: string) => `Merk op hoe ${label ? `de ${label.toLowerCase()}` : 'dit gebied'} natuurlijk licht en elegante designelementen vangt.`,
    ],
    closings: [
      'Plan vandaag nog uw privé bezichtiging.',
      'Neem contact met ons op om dit vastgoed persoonlijk te ervaren.',
      'Dit is meer dan een woning—het is de levensstijl waar u op wachtte.',
    ],
  },
  ja: {
    openings: [
      'この素晴らしい物件へようこそ。',
      'このユニークな物件の美しさをご覧ください。',
      'この場所を特別にするものをお見せいたします。',
    ],
    middleTemplates: [
      (label: string) => `こちらは${label ? `${label}` : '美しい眺め'}です。細部まで洗練されたデザインと品質が光ります。`,
      (label: string) => `${label ? `この${label}` : 'この印象的なエリア'}をご覧ください。細部へのこだわりが感じられます。`,
      (label: string) => `${label ? `${label}` : 'このスペース'}は、スタイルと機能性の完璧なバランスを提供します。`,
      (label: string) => `${label ? `この${label}` : 'ここ'}はモダンな暮らしのために設計され、プレミアムな仕上がりです。`,
      (label: string) => `${label ? `${label}` : 'このエリア'}が自然光とエレガントなデザイン要素を取り込んでいることに注目してください。`,
    ],
    closings: [
      '本日、プライベート内覧をご予約ください。',
      'この物件を直接ご覧になりたい方は、お問い合わせください。',
      'これは単なる物件ではありません—あなたが求めていたライフスタイルです。',
    ],
  },
};

/**
 * Generate fallback script when API is unavailable
 */
function generateFallbackScript(
  params: GenerateScriptRequest,
  imageIds: string[]
): PropertyScript {
  const { imageCount, imageLabels, targetDuration, templateStyle, language = 'en' } = params;
  const avgDuration = targetDuration / imageCount;

  const scripts = FALLBACK_SCRIPTS[language] || FALLBACK_SCRIPTS.en;
  const { openings, middleTemplates, closings } = scripts;

  const segments: ScriptSegment[] = imageLabels.map((label, index) => {
    let text: string;

    if (index === 0) {
      // Opening segment - use full opening text
      text = openings[Math.floor(Math.random() * openings.length)];
    } else if (index === imageCount - 1) {
      // Closing segment
      text = closings[Math.floor(Math.random() * closings.length)];
    } else {
      // Middle segments - templates handle empty labels gracefully
      const template = middleTemplates[index % middleTemplates.length];
      text = template(label || '');  // Pass empty string, templates have fallback text
    }

    return {
      id: generateId(),
      imageId: imageIds[index] || generateId(),
      imageIndex: index,
      text,
      duration: avgDuration,
      keywords: label ? [label] : [],  // Only add keyword if label exists
    };
  });

  return {
    id: generateId(),
    segments,
    totalDuration: targetDuration,
    generatedAt: new Date(),
    templateStyle,
  };
}

/**
 * Generate property video script using OpenAI
 * If imageUrls are provided, uses GPT-4o Vision to analyze actual image content
 */
export async function generatePropertyScript(
  params: GenerateScriptRequest,
  imageIds: string[]
): Promise<GenerateScriptResponse> {
  try {
    const supabase = createClient();

    if (!supabase) {
      console.warn('Supabase not available, using fallback script');
      return {
        success: true,
        script: generateFallbackScript(params, imageIds),
      };
    }

    // Determine if we should use vision mode
    const useVision = params.imageUrls && params.imageUrls.length > 0;

    console.log(`Generating script: ${useVision ? 'Vision mode with ' + params.imageUrls?.length + ' images' : 'Text-only mode'}`);

    // Call Supabase Edge Function with appropriate prompts
    const { data, error } = await supabase.functions.invoke('generate-script', {
      body: {
        systemPrompt: getSystemPrompt(params.language || 'en', useVision),
        userPrompt: useVision ? buildVisionPrompt(params) : buildUserPrompt(params),
        imageUrls: useVision ? params.imageUrls : undefined,  // Only send if vision mode
        model: useVision ? 'gpt-4o' : 'gpt-4o-mini',  // Use gpt-4o for vision
        maxTokens: 2000,  // Increased for vision descriptions
      },
    });

    if (error) {
      console.error('Edge function error:', error);
      return {
        success: true,
        script: generateFallbackScript(params, imageIds),
      };
    }

    console.log('Script response:', {
      visionEnabled: data.visionEnabled,
      model: data.model,
      usage: data.usage
    });

    const script = parseScriptResponse(data.content, params, imageIds);

    if (!script) {
      console.warn('Failed to parse response, using fallback');
      return {
        success: true,
        script: generateFallbackScript(params, imageIds),
      };
    }

    return {
      success: true,
      script,
    };
  } catch (error) {
    console.error('Script generation error:', error);
    return {
      success: true,
      script: generateFallbackScript(params, imageIds),
    };
  }
}

/**
 * Regenerate a single segment
 */
export async function regenerateSegment(
  segment: ScriptSegment,
  context: {
    templateStyle: VideoTemplateV2;
    imageLabel: string;
    prevSegmentText?: string;
    nextSegmentText?: string;
  }
): Promise<ScriptSegment | null> {
  try {
    const supabase = createClient();

    if (!supabase) {
      return null;
    }

    const prompt = `Rewrite this narration segment for a ${context.templateStyle} style real estate video.

Current segment: "${segment.text}"
Room/area: ${context.imageLabel}
${context.prevSegmentText ? `Previous segment: "${context.prevSegmentText}"` : ''}
${context.nextSegmentText ? `Next segment: "${context.nextSegmentText}"` : ''}

Create a fresh version that:
- Maintains the same approximate duration (${segment.duration}s)
- Flows naturally with surrounding segments
- Matches the ${context.templateStyle} style

Return ONLY the new text, no JSON or formatting.`;

    const { data, error } = await supabase.functions.invoke('generate-script', {
      body: {
        systemPrompt: getSystemPrompt('en'),
        userPrompt: prompt,
        model: 'gpt-4o-mini',
        maxTokens: 200,
      },
    });

    if (error || !data?.content) {
      return null;
    }

    return {
      ...segment,
      text: data.content.trim(),
    };
  } catch (error) {
    console.error('Segment regeneration error:', error);
    return null;
  }
}
