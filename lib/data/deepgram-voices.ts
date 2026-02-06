/**
 * Deepgram Aura TTS Voices - Complete Voice Library
 *
 * 7 Languages | 90+ Voices | Multiple Styles & Accents
 *
 * Source: https://developers.deepgram.com/docs/tts-models
 */

export type VoiceLanguage = 'en' | 'es' | 'nl' | 'fr' | 'de' | 'it' | 'ja';

export type VoiceGender = 'male' | 'female';

export type VoiceAccent =
  | 'American' | 'British' | 'Australian' | 'Irish' | 'Filipino' | 'Southern'
  | 'Mexican' | 'Peninsular' | 'Colombian' | 'Latin American' | 'Argentine'
  | 'Dutch' | 'French' | 'German' | 'Italian' | 'Japanese';

export type VoiceStyle =
  | 'Professional' | 'Warm' | 'Energetic' | 'Calm' | 'Friendly'
  | 'Confident' | 'Casual' | 'Caring' | 'Expressive' | 'Natural'
  | 'Cheerful' | 'Smooth' | 'Trustworthy' | 'Approachable' | 'Deep';

export interface DeepgramVoice {
  id: string;
  name: string;
  language: VoiceLanguage;
  languageName: string;
  gender: VoiceGender;
  accent: VoiceAccent;
  styles: string[];
  description: string;
  isAura2: boolean;
}

// ============================================================================
// Language Definitions
// ============================================================================

export const SUPPORTED_LANGUAGES: { code: VoiceLanguage; name: string; flag: string }[] = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'es', name: 'Spanish', flag: '🇪🇸' },
  { code: 'de', name: 'German', flag: '🇩🇪' },
  { code: 'fr', name: 'French', flag: '🇫🇷' },
  { code: 'it', name: 'Italian', flag: '🇮🇹' },
  { code: 'nl', name: 'Dutch', flag: '🇳🇱' },
  { code: 'ja', name: 'Japanese', flag: '🇯🇵' },
];

// ============================================================================
// English Voices (44 Aura-2 + 12 Aura-1)
// ============================================================================

const ENGLISH_VOICES: DeepgramVoice[] = [
  // Aura-2 Female English
  { id: 'aura-2-thalia-en', name: 'Thalia', language: 'en', languageName: 'English', gender: 'female', accent: 'American', styles: ['Clear', 'Confident', 'Energetic'], description: 'Clear, Confident, Energetic', isAura2: true },
  { id: 'aura-2-andromeda-en', name: 'Andromeda', language: 'en', languageName: 'English', gender: 'female', accent: 'American', styles: ['Casual', 'Expressive', 'Comfortable'], description: 'Casual, Expressive, Comfortable', isAura2: true },
  { id: 'aura-2-helena-en', name: 'Helena', language: 'en', languageName: 'English', gender: 'female', accent: 'American', styles: ['Caring', 'Natural', 'Positive', 'Friendly'], description: 'Caring, Natural, Positive, Friendly', isAura2: true },
  { id: 'aura-2-amalthea-en', name: 'Amalthea', language: 'en', languageName: 'English', gender: 'female', accent: 'Filipino', styles: ['Engaging', 'Natural', 'Cheerful'], description: 'Engaging, Natural, Cheerful', isAura2: true },
  { id: 'aura-2-asteria-en', name: 'Asteria', language: 'en', languageName: 'English', gender: 'female', accent: 'American', styles: ['Clear', 'Confident', 'Professional'], description: 'Clear, Confident, Knowledgeable', isAura2: true },
  { id: 'aura-2-athena-en', name: 'Athena', language: 'en', languageName: 'English', gender: 'female', accent: 'American', styles: ['Calm', 'Smooth', 'Professional'], description: 'Calm, Smooth, Professional', isAura2: true },
  { id: 'aura-2-aurora-en', name: 'Aurora', language: 'en', languageName: 'English', gender: 'female', accent: 'American', styles: ['Cheerful', 'Expressive', 'Energetic'], description: 'Cheerful, Expressive, Energetic', isAura2: true },
  { id: 'aura-2-callista-en', name: 'Callista', language: 'en', languageName: 'English', gender: 'female', accent: 'American', styles: ['Clear', 'Energetic', 'Professional'], description: 'Clear, Energetic, Professional', isAura2: true },
  { id: 'aura-2-cora-en', name: 'Cora', language: 'en', languageName: 'English', gender: 'female', accent: 'American', styles: ['Smooth', 'Caring', 'Warm'], description: 'Smooth, Melodic, Caring', isAura2: true },
  { id: 'aura-2-cordelia-en', name: 'Cordelia', language: 'en', languageName: 'English', gender: 'female', accent: 'American', styles: ['Approachable', 'Warm', 'Friendly'], description: 'Approachable, Warm, Polite', isAura2: true },
  { id: 'aura-2-delia-en', name: 'Delia', language: 'en', languageName: 'English', gender: 'female', accent: 'American', styles: ['Casual', 'Friendly', 'Cheerful'], description: 'Casual, Friendly, Cheerful', isAura2: true },
  { id: 'aura-2-electra-en', name: 'Electra', language: 'en', languageName: 'English', gender: 'female', accent: 'American', styles: ['Professional', 'Engaging', 'Confident'], description: 'Professional, Engaging, Knowledgeable', isAura2: true },
  { id: 'aura-2-harmonia-en', name: 'Harmonia', language: 'en', languageName: 'English', gender: 'female', accent: 'American', styles: ['Calm', 'Clear', 'Confident'], description: 'Empathetic, Clear, Calm, Confident', isAura2: true },
  { id: 'aura-2-hera-en', name: 'Hera', language: 'en', languageName: 'English', gender: 'female', accent: 'American', styles: ['Smooth', 'Warm', 'Professional'], description: 'Smooth, Warm, Professional', isAura2: true },
  { id: 'aura-2-iris-en', name: 'Iris', language: 'en', languageName: 'English', gender: 'female', accent: 'American', styles: ['Cheerful', 'Friendly', 'Approachable'], description: 'Cheerful, Positive, Approachable', isAura2: true },
  { id: 'aura-2-janus-en', name: 'Janus', language: 'en', languageName: 'English', gender: 'female', accent: 'Southern', styles: ['Smooth', 'Trustworthy', 'Warm'], description: 'Southern, Smooth, Trustworthy', isAura2: true },
  { id: 'aura-2-juno-en', name: 'Juno', language: 'en', languageName: 'English', gender: 'female', accent: 'American', styles: ['Natural', 'Engaging', 'Warm'], description: 'Natural, Engaging, Melodic', isAura2: true },
  { id: 'aura-2-luna-en', name: 'Luna', language: 'en', languageName: 'English', gender: 'female', accent: 'American', styles: ['Friendly', 'Natural', 'Engaging'], description: 'Friendly, Natural, Engaging', isAura2: true },
  { id: 'aura-2-minerva-en', name: 'Minerva', language: 'en', languageName: 'English', gender: 'female', accent: 'American', styles: ['Friendly', 'Natural', 'Positive'], description: 'Positive, Friendly, Natural', isAura2: true },
  { id: 'aura-2-ophelia-en', name: 'Ophelia', language: 'en', languageName: 'English', gender: 'female', accent: 'American', styles: ['Expressive', 'Cheerful', 'Energetic'], description: 'Expressive, Enthusiastic, Cheerful', isAura2: true },
  { id: 'aura-2-pandora-en', name: 'Pandora', language: 'en', languageName: 'English', gender: 'female', accent: 'British', styles: ['Smooth', 'Calm', 'Warm'], description: 'Smooth, Calm, Melodic', isAura2: true },
  { id: 'aura-2-phoebe-en', name: 'Phoebe', language: 'en', languageName: 'English', gender: 'female', accent: 'American', styles: ['Energetic', 'Warm', 'Casual'], description: 'Energetic, Warm, Casual', isAura2: true },
  { id: 'aura-2-selene-en', name: 'Selene', language: 'en', languageName: 'English', gender: 'female', accent: 'American', styles: ['Expressive', 'Engaging', 'Energetic'], description: 'Expressive, Engaging, Energetic', isAura2: true },
  { id: 'aura-2-theia-en', name: 'Theia', language: 'en', languageName: 'English', gender: 'female', accent: 'Australian', styles: ['Expressive', 'Friendly', 'Warm'], description: 'Expressive, Polite, Sincere', isAura2: true },
  { id: 'aura-2-vesta-en', name: 'Vesta', language: 'en', languageName: 'English', gender: 'female', accent: 'American', styles: ['Natural', 'Expressive', 'Calm'], description: 'Natural, Expressive, Patient', isAura2: true },

  // Aura-2 Male English
  { id: 'aura-2-apollo-en', name: 'Apollo', language: 'en', languageName: 'English', gender: 'male', accent: 'American', styles: ['Confident', 'Comfortable', 'Casual'], description: 'Confident, Comfortable, Casual', isAura2: true },
  { id: 'aura-2-arcas-en', name: 'Arcas', language: 'en', languageName: 'English', gender: 'male', accent: 'American', styles: ['Natural', 'Smooth', 'Clear'], description: 'Natural, Smooth, Clear, Comfortable', isAura2: true },
  { id: 'aura-2-aries-en', name: 'Aries', language: 'en', languageName: 'English', gender: 'male', accent: 'American', styles: ['Warm', 'Energetic', 'Caring'], description: 'Warm, Energetic, Caring', isAura2: true },
  { id: 'aura-2-atlas-en', name: 'Atlas', language: 'en', languageName: 'English', gender: 'male', accent: 'American', styles: ['Confident', 'Approachable', 'Energetic'], description: 'Enthusiastic, Confident, Approachable', isAura2: true },
  { id: 'aura-2-draco-en', name: 'Draco', language: 'en', languageName: 'English', gender: 'male', accent: 'British', styles: ['Warm', 'Approachable', 'Trustworthy'], description: 'Warm, Approachable, Trustworthy', isAura2: true },
  { id: 'aura-2-hermes-en', name: 'Hermes', language: 'en', languageName: 'English', gender: 'male', accent: 'American', styles: ['Expressive', 'Engaging', 'Professional'], description: 'Expressive, Engaging, Professional', isAura2: true },
  { id: 'aura-2-hyperion-en', name: 'Hyperion', language: 'en', languageName: 'English', gender: 'male', accent: 'Australian', styles: ['Caring', 'Warm', 'Friendly'], description: 'Caring, Warm, Empathetic', isAura2: true },
  { id: 'aura-2-jupiter-en', name: 'Jupiter', language: 'en', languageName: 'English', gender: 'male', accent: 'American', styles: ['Expressive', 'Confident', 'Professional'], description: 'Expressive, Knowledgeable', isAura2: true },
  { id: 'aura-2-mars-en', name: 'Mars', language: 'en', languageName: 'English', gender: 'male', accent: 'American', styles: ['Smooth', 'Calm', 'Trustworthy'], description: 'Smooth, Patient, Trustworthy', isAura2: true },
  { id: 'aura-2-neptune-en', name: 'Neptune', language: 'en', languageName: 'English', gender: 'male', accent: 'American', styles: ['Professional', 'Calm', 'Friendly'], description: 'Professional, Patient, Polite', isAura2: true },
  { id: 'aura-2-odysseus-en', name: 'Odysseus', language: 'en', languageName: 'English', gender: 'male', accent: 'American', styles: ['Calm', 'Smooth', 'Comfortable'], description: 'Calm, Smooth, Comfortable', isAura2: true },
  { id: 'aura-2-orion-en', name: 'Orion', language: 'en', languageName: 'English', gender: 'male', accent: 'American', styles: ['Approachable', 'Comfortable', 'Calm'], description: 'Approachable, Comfortable, Calm', isAura2: true },
  { id: 'aura-2-orpheus-en', name: 'Orpheus', language: 'en', languageName: 'English', gender: 'male', accent: 'American', styles: ['Professional', 'Clear', 'Confident'], description: 'Professional, Clear, Confident', isAura2: true },
  { id: 'aura-2-pluto-en', name: 'Pluto', language: 'en', languageName: 'English', gender: 'male', accent: 'American', styles: ['Smooth', 'Calm', 'Caring'], description: 'Smooth, Calm, Empathetic', isAura2: true },
  { id: 'aura-2-saturn-en', name: 'Saturn', language: 'en', languageName: 'English', gender: 'male', accent: 'American', styles: ['Confident', 'Professional'], description: 'Knowledgeable, Confident', isAura2: true },
  { id: 'aura-2-zeus-en', name: 'Zeus', language: 'en', languageName: 'English', gender: 'male', accent: 'American', styles: ['Deep', 'Trustworthy', 'Smooth'], description: 'Deep, Trustworthy, Smooth', isAura2: true },

  // Aura-1 English (Legacy but still available)
  { id: 'aura-asteria-en', name: 'Asteria (Classic)', language: 'en', languageName: 'English', gender: 'female', accent: 'American', styles: ['Clear', 'Confident', 'Professional'], description: 'Clear, Confident, Knowledgeable', isAura2: false },
  { id: 'aura-luna-en', name: 'Luna (Classic)', language: 'en', languageName: 'English', gender: 'female', accent: 'American', styles: ['Friendly', 'Natural', 'Engaging'], description: 'Friendly, Natural, Engaging', isAura2: false },
  { id: 'aura-stella-en', name: 'Stella (Classic)', language: 'en', languageName: 'English', gender: 'female', accent: 'American', styles: ['Clear', 'Professional', 'Engaging'], description: 'Clear, Professional, Engaging', isAura2: false },
  { id: 'aura-orion-en', name: 'Orion (Classic)', language: 'en', languageName: 'English', gender: 'male', accent: 'American', styles: ['Approachable', 'Comfortable', 'Calm'], description: 'Approachable, Comfortable, Calm', isAura2: false },
  { id: 'aura-arcas-en', name: 'Arcas (Classic)', language: 'en', languageName: 'English', gender: 'male', accent: 'American', styles: ['Natural', 'Smooth', 'Clear'], description: 'Natural, Smooth, Clear', isAura2: false },
  { id: 'aura-perseus-en', name: 'Perseus', language: 'en', languageName: 'English', gender: 'male', accent: 'American', styles: ['Confident', 'Professional', 'Clear'], description: 'Confident, Professional, Clear', isAura2: false },
];

// ============================================================================
// Spanish Voices (17)
// ============================================================================

const SPANISH_VOICES: DeepgramVoice[] = [
  { id: 'aura-2-sirio-es', name: 'Sirio', language: 'es', languageName: 'Spanish', gender: 'male', accent: 'Mexican', styles: ['Calm', 'Professional', 'Comfortable'], description: 'Calm, Professional, Comfortable', isAura2: true },
  { id: 'aura-2-nestor-es', name: 'Néstor', language: 'es', languageName: 'Spanish', gender: 'male', accent: 'Peninsular', styles: ['Calm', 'Professional', 'Approachable'], description: 'Calm, Professional, Approachable', isAura2: true },
  { id: 'aura-2-carina-es', name: 'Carina', language: 'es', languageName: 'Spanish', gender: 'female', accent: 'Peninsular', styles: ['Professional', 'Energetic'], description: 'Professional, Raspy, Energetic', isAura2: true },
  { id: 'aura-2-celeste-es', name: 'Celeste', language: 'es', languageName: 'Spanish', gender: 'female', accent: 'Colombian', styles: ['Clear', 'Energetic', 'Friendly'], description: 'Clear, Energetic, Positive', isAura2: true },
  { id: 'aura-2-alvaro-es', name: 'Álvaro', language: 'es', languageName: 'Spanish', gender: 'male', accent: 'Peninsular', styles: ['Calm', 'Professional', 'Clear'], description: 'Calm, Professional, Clear', isAura2: true },
  { id: 'aura-2-diana-es', name: 'Diana', language: 'es', languageName: 'Spanish', gender: 'female', accent: 'Peninsular', styles: ['Professional', 'Confident', 'Expressive'], description: 'Professional, Confident, Expressive', isAura2: true },
  { id: 'aura-2-aquila-es', name: 'Aquila', language: 'es', languageName: 'Spanish', gender: 'male', accent: 'Latin American', styles: ['Expressive', 'Confident', 'Energetic'], description: 'Expressive, Enthusiastic, Confident', isAura2: true },
  { id: 'aura-2-selena-es', name: 'Selena', language: 'es', languageName: 'Spanish', gender: 'female', accent: 'Latin American', styles: ['Approachable', 'Casual', 'Friendly'], description: 'Approachable, Casual, Friendly', isAura2: true },
  { id: 'aura-2-estrella-es', name: 'Estrella', language: 'es', languageName: 'Spanish', gender: 'female', accent: 'Mexican', styles: ['Approachable', 'Natural', 'Calm'], description: 'Approachable, Natural, Calm', isAura2: true },
  { id: 'aura-2-javier-es', name: 'Javier', language: 'es', languageName: 'Spanish', gender: 'male', accent: 'Mexican', styles: ['Approachable', 'Professional', 'Friendly'], description: 'Approachable, Professional, Friendly', isAura2: true },
  { id: 'aura-2-agustina-es', name: 'Agustina', language: 'es', languageName: 'Spanish', gender: 'female', accent: 'Peninsular', styles: ['Calm', 'Clear', 'Expressive'], description: 'Calm, Clear, Expressive', isAura2: true },
  { id: 'aura-2-antonia-es', name: 'Antonia', language: 'es', languageName: 'Spanish', gender: 'female', accent: 'Argentine', styles: ['Approachable', 'Friendly', 'Energetic'], description: 'Approachable, Enthusiastic, Friendly', isAura2: true },
  { id: 'aura-2-gloria-es', name: 'Gloria', language: 'es', languageName: 'Spanish', gender: 'female', accent: 'Colombian', styles: ['Casual', 'Clear', 'Expressive'], description: 'Casual, Clear, Expressive', isAura2: true },
  { id: 'aura-2-luciano-es', name: 'Luciano', language: 'es', languageName: 'Spanish', gender: 'male', accent: 'Mexican', styles: ['Cheerful', 'Energetic', 'Friendly'], description: 'Charismatic, Cheerful, Energetic', isAura2: true },
  { id: 'aura-2-olivia-es', name: 'Olivia', language: 'es', languageName: 'Spanish', gender: 'female', accent: 'Mexican', styles: ['Calm', 'Casual', 'Warm'], description: 'Breathy, Calm, Casual', isAura2: true },
  { id: 'aura-2-silvia-es', name: 'Silvia', language: 'es', languageName: 'Spanish', gender: 'female', accent: 'Peninsular', styles: ['Clear', 'Expressive', 'Confident'], description: 'Charismatic, Clear, Expressive', isAura2: true },
  { id: 'aura-2-valerio-es', name: 'Valerio', language: 'es', languageName: 'Spanish', gender: 'male', accent: 'Mexican', styles: ['Deep', 'Natural', 'Professional'], description: 'Deep, Knowledgeable, Natural', isAura2: true },
];

// ============================================================================
// Dutch Voices (9)
// ============================================================================

const DUTCH_VOICES: DeepgramVoice[] = [
  { id: 'aura-2-beatrix-nl', name: 'Beatrix', language: 'nl', languageName: 'Dutch', gender: 'female', accent: 'Dutch', styles: ['Cheerful', 'Friendly', 'Energetic'], description: 'Cheerful, Enthusiastic, Friendly', isAura2: true },
  { id: 'aura-2-daphne-nl', name: 'Daphne', language: 'nl', languageName: 'Dutch', gender: 'female', accent: 'Dutch', styles: ['Calm', 'Clear', 'Professional'], description: 'Calm, Clear, Confident, Professional', isAura2: true },
  { id: 'aura-2-cornelia-nl', name: 'Cornelia', language: 'nl', languageName: 'Dutch', gender: 'female', accent: 'Dutch', styles: ['Approachable', 'Friendly'], description: 'Approachable, Friendly, Polite', isAura2: true },
  { id: 'aura-2-sander-nl', name: 'Sander', language: 'nl', languageName: 'Dutch', gender: 'male', accent: 'Dutch', styles: ['Calm', 'Clear', 'Deep', 'Professional'], description: 'Calm, Clear, Deep, Professional', isAura2: true },
  { id: 'aura-2-hestia-nl', name: 'Hestia', language: 'nl', languageName: 'Dutch', gender: 'female', accent: 'Dutch', styles: ['Approachable', 'Caring', 'Expressive'], description: 'Approachable, Caring, Expressive', isAura2: true },
  { id: 'aura-2-lars-nl', name: 'Lars', language: 'nl', languageName: 'Dutch', gender: 'male', accent: 'Dutch', styles: ['Casual', 'Comfortable', 'Natural'], description: 'Breathy, Casual, Comfortable', isAura2: true },
  { id: 'aura-2-roman-nl', name: 'Roman', language: 'nl', languageName: 'Dutch', gender: 'male', accent: 'Dutch', styles: ['Calm', 'Casual', 'Deep', 'Natural'], description: 'Calm, Casual, Deep, Natural', isAura2: true },
  { id: 'aura-2-rhea-nl', name: 'Rhea', language: 'nl', languageName: 'Dutch', gender: 'female', accent: 'Dutch', styles: ['Caring', 'Friendly', 'Professional'], description: 'Caring, Knowledgeable, Positive', isAura2: true },
  { id: 'aura-2-leda-nl', name: 'Leda', language: 'nl', languageName: 'Dutch', gender: 'female', accent: 'Dutch', styles: ['Caring', 'Comfortable', 'Warm'], description: 'Caring, Comfortable, Empathetic', isAura2: true },
];

// ============================================================================
// French Voices (2)
// ============================================================================

const FRENCH_VOICES: DeepgramVoice[] = [
  { id: 'aura-2-agathe-fr', name: 'Agathe', language: 'fr', languageName: 'French', gender: 'female', accent: 'French', styles: ['Cheerful', 'Energetic', 'Friendly'], description: 'Charismatic, Cheerful, Enthusiastic', isAura2: true },
  { id: 'aura-2-hector-fr', name: 'Hector', language: 'fr', languageName: 'French', gender: 'male', accent: 'French', styles: ['Confident', 'Expressive', 'Warm'], description: 'Confident, Empathetic, Expressive', isAura2: true },
];

// ============================================================================
// German Voices (7)
// ============================================================================

const GERMAN_VOICES: DeepgramVoice[] = [
  { id: 'aura-2-elara-de', name: 'Elara', language: 'de', languageName: 'German', gender: 'female', accent: 'German', styles: ['Calm', 'Clear', 'Natural'], description: 'Calm, Clear, Natural, Patient', isAura2: true },
  { id: 'aura-2-aurelia-de', name: 'Aurelia', language: 'de', languageName: 'German', gender: 'female', accent: 'German', styles: ['Approachable', 'Casual', 'Comfortable'], description: 'Approachable, Casual, Comfortable', isAura2: true },
  { id: 'aura-2-lara-de', name: 'Lara', language: 'de', languageName: 'German', gender: 'female', accent: 'German', styles: ['Caring', 'Cheerful', 'Warm'], description: 'Caring, Cheerful, Empathetic', isAura2: true },
  { id: 'aura-2-julius-de', name: 'Julius', language: 'de', languageName: 'German', gender: 'male', accent: 'German', styles: ['Casual', 'Cheerful', 'Engaging'], description: 'Casual, Cheerful, Engaging', isAura2: true },
  { id: 'aura-2-fabian-de', name: 'Fabian', language: 'de', languageName: 'German', gender: 'male', accent: 'German', styles: ['Confident', 'Professional', 'Natural'], description: 'Confident, Knowledgeable, Natural', isAura2: true },
  { id: 'aura-2-kara-de', name: 'Kara', language: 'de', languageName: 'German', gender: 'female', accent: 'German', styles: ['Caring', 'Expressive', 'Warm'], description: 'Caring, Empathetic, Expressive', isAura2: true },
  { id: 'aura-2-viktoria-de', name: 'Viktoria', language: 'de', languageName: 'German', gender: 'female', accent: 'German', styles: ['Cheerful', 'Energetic', 'Friendly'], description: 'Charismatic, Cheerful, Enthusiastic', isAura2: true },
];

// ============================================================================
// Italian Voices (10)
// ============================================================================

const ITALIAN_VOICES: DeepgramVoice[] = [
  { id: 'aura-2-melia-it', name: 'Melia', language: 'it', languageName: 'Italian', gender: 'female', accent: 'Italian', styles: ['Clear', 'Comfortable', 'Engaging'], description: 'Clear, Comfortable, Engaging', isAura2: true },
  { id: 'aura-2-elio-it', name: 'Elio', language: 'it', languageName: 'Italian', gender: 'male', accent: 'Italian', styles: ['Calm', 'Professional'], description: 'Breathy, Calm, Professional', isAura2: true },
  { id: 'aura-2-flavio-it', name: 'Flavio', language: 'it', languageName: 'Italian', gender: 'male', accent: 'Italian', styles: ['Confident', 'Deep', 'Warm'], description: 'Confident, Deep, Empathetic', isAura2: true },
  { id: 'aura-2-maia-it', name: 'Maia', language: 'it', languageName: 'Italian', gender: 'female', accent: 'Italian', styles: ['Caring', 'Energetic', 'Expressive'], description: 'Caring, Energetic, Expressive', isAura2: true },
  { id: 'aura-2-cinzia-it', name: 'Cinzia', language: 'it', languageName: 'Italian', gender: 'female', accent: 'Italian', styles: ['Approachable', 'Friendly', 'Smooth'], description: 'Approachable, Friendly, Smooth', isAura2: true },
  { id: 'aura-2-cesare-it', name: 'Cesare', language: 'it', languageName: 'Italian', gender: 'male', accent: 'Italian', styles: ['Clear', 'Professional', 'Warm'], description: 'Clear, Empathetic, Knowledgeable', isAura2: true },
  { id: 'aura-2-livia-it', name: 'Livia', language: 'it', languageName: 'Italian', gender: 'female', accent: 'Italian', styles: ['Approachable', 'Cheerful', 'Clear'], description: 'Approachable, Cheerful, Clear', isAura2: true },
  { id: 'aura-2-perseo-it', name: 'Perseo', language: 'it', languageName: 'Italian', gender: 'male', accent: 'Italian', styles: ['Casual', 'Clear', 'Natural'], description: 'Casual, Clear, Natural', isAura2: true },
  { id: 'aura-2-dionisio-it', name: 'Dionisio', language: 'it', languageName: 'Italian', gender: 'male', accent: 'Italian', styles: ['Confident', 'Engaging', 'Friendly'], description: 'Confident, Engaging, Friendly', isAura2: true },
  { id: 'aura-2-demetra-it', name: 'Demetra', language: 'it', languageName: 'Italian', gender: 'female', accent: 'Italian', styles: ['Calm', 'Comfortable'], description: 'Calm, Comfortable, Patient', isAura2: true },
];

// ============================================================================
// Japanese Voices (5)
// ============================================================================

const JAPANESE_VOICES: DeepgramVoice[] = [
  { id: 'aura-2-uzume-ja', name: 'Uzume', language: 'ja', languageName: 'Japanese', gender: 'female', accent: 'Japanese', styles: ['Approachable', 'Clear', 'Friendly'], description: 'Approachable, Clear, Polite', isAura2: true },
  { id: 'aura-2-ebisu-ja', name: 'Ebisu', language: 'ja', languageName: 'Japanese', gender: 'male', accent: 'Japanese', styles: ['Calm', 'Deep', 'Natural'], description: 'Calm, Deep, Natural', isAura2: true },
  { id: 'aura-2-fujin-ja', name: 'Fujin', language: 'ja', languageName: 'Japanese', gender: 'male', accent: 'Japanese', styles: ['Calm', 'Confident', 'Professional'], description: 'Calm, Confident, Knowledgeable', isAura2: true },
  { id: 'aura-2-izanami-ja', name: 'Izanami', language: 'ja', languageName: 'Japanese', gender: 'female', accent: 'Japanese', styles: ['Approachable', 'Clear', 'Professional'], description: 'Approachable, Clear, Knowledgeable', isAura2: true },
  { id: 'aura-2-ama-ja', name: 'Ama', language: 'ja', languageName: 'Japanese', gender: 'female', accent: 'Japanese', styles: ['Casual', 'Comfortable', 'Confident'], description: 'Casual, Comfortable, Confident', isAura2: true },
];

// ============================================================================
// Combined Voice Library
// ============================================================================

export const ALL_VOICES: DeepgramVoice[] = [
  ...ENGLISH_VOICES,
  ...SPANISH_VOICES,
  ...DUTCH_VOICES,
  ...FRENCH_VOICES,
  ...GERMAN_VOICES,
  ...ITALIAN_VOICES,
  ...JAPANESE_VOICES,
];

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Get voices by language
 */
export function getVoicesByLanguage(language: VoiceLanguage): DeepgramVoice[] {
  return ALL_VOICES.filter(v => v.language === language);
}

/**
 * Get voices by gender
 */
export function getVoicesByGender(gender: VoiceGender): DeepgramVoice[] {
  return ALL_VOICES.filter(v => v.gender === gender);
}

/**
 * Filter voices by multiple criteria
 */
export function filterVoices(options: {
  language?: VoiceLanguage;
  gender?: VoiceGender;
  accent?: VoiceAccent;
  style?: string;
  aura2Only?: boolean;
}): DeepgramVoice[] {
  return ALL_VOICES.filter(voice => {
    if (options.language && voice.language !== options.language) return false;
    if (options.gender && voice.gender !== options.gender) return false;
    if (options.accent && voice.accent !== options.accent) return false;
    if (options.style && !voice.styles.includes(options.style)) return false;
    if (options.aura2Only && !voice.isAura2) return false;
    return true;
  });
}

/**
 * Get voice by ID
 */
export function getVoiceById(voiceId: string): DeepgramVoice | null {
  return ALL_VOICES.find(v => v.id === voiceId) || null;
}

/**
 * Get recommended voices for real estate
 */
export function getRecommendedVoices(language: VoiceLanguage = 'en'): DeepgramVoice[] {
  const recommended = filterVoices({
    language,
    aura2Only: true
  }).filter(v =>
    v.styles.includes('Professional') ||
    v.styles.includes('Warm') ||
    v.styles.includes('Trustworthy')
  );

  return recommended.slice(0, 6);
}

/**
 * Get all unique accents for a language
 */
export function getAccentsForLanguage(language: VoiceLanguage): VoiceAccent[] {
  const voices = getVoicesByLanguage(language);
  const accents = [...new Set(voices.map(v => v.accent))];
  return accents as VoiceAccent[];
}

/**
 * Get all unique styles
 */
export function getAllStyles(): string[] {
  const styles = new Set<string>();
  ALL_VOICES.forEach(v => v.styles.forEach(s => styles.add(s)));
  return Array.from(styles).sort();
}
