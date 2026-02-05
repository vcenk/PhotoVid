/**
 * ElevenLabs Dubbing Supported Languages
 * Full list: https://elevenlabs.io/docs/api-reference/dubbing
 */

export interface DubbingLanguage {
  code: string;
  name: string;
  flag: string;
  nativeName: string;
}

// ElevenLabs supported languages for dubbing
export const DUBBING_LANGUAGES: DubbingLanguage[] = [
  { code: 'en', name: 'English', flag: '🇺🇸', nativeName: 'English' },
  { code: 'es', name: 'Spanish', flag: '🇪🇸', nativeName: 'Español' },
  { code: 'fr', name: 'French', flag: '🇫🇷', nativeName: 'Français' },
  { code: 'de', name: 'German', flag: '🇩🇪', nativeName: 'Deutsch' },
  { code: 'it', name: 'Italian', flag: '🇮🇹', nativeName: 'Italiano' },
  { code: 'pt', name: 'Portuguese', flag: '🇧🇷', nativeName: 'Português' },
  { code: 'pl', name: 'Polish', flag: '🇵🇱', nativeName: 'Polski' },
  { code: 'hi', name: 'Hindi', flag: '🇮🇳', nativeName: 'हिन्दी' },
  { code: 'ar', name: 'Arabic', flag: '🇸🇦', nativeName: 'العربية' },
  { code: 'zh', name: 'Chinese', flag: '🇨🇳', nativeName: '中文' },
  { code: 'ja', name: 'Japanese', flag: '🇯🇵', nativeName: '日本語' },
  { code: 'ko', name: 'Korean', flag: '🇰🇷', nativeName: '한국어' },
  { code: 'nl', name: 'Dutch', flag: '🇳🇱', nativeName: 'Nederlands' },
  { code: 'tr', name: 'Turkish', flag: '🇹🇷', nativeName: 'Türkçe' },
  { code: 'sv', name: 'Swedish', flag: '🇸🇪', nativeName: 'Svenska' },
  { code: 'id', name: 'Indonesian', flag: '🇮🇩', nativeName: 'Bahasa Indonesia' },
  { code: 'fil', name: 'Filipino', flag: '🇵🇭', nativeName: 'Filipino' },
  { code: 'ms', name: 'Malay', flag: '🇲🇾', nativeName: 'Bahasa Melayu' },
  { code: 'ro', name: 'Romanian', flag: '🇷🇴', nativeName: 'Română' },
  { code: 'uk', name: 'Ukrainian', flag: '🇺🇦', nativeName: 'Українська' },
  { code: 'el', name: 'Greek', flag: '🇬🇷', nativeName: 'Ελληνικά' },
  { code: 'cs', name: 'Czech', flag: '🇨🇿', nativeName: 'Čeština' },
  { code: 'da', name: 'Danish', flag: '🇩🇰', nativeName: 'Dansk' },
  { code: 'fi', name: 'Finnish', flag: '🇫🇮', nativeName: 'Suomi' },
  { code: 'bg', name: 'Bulgarian', flag: '🇧🇬', nativeName: 'Български' },
  { code: 'hr', name: 'Croatian', flag: '🇭🇷', nativeName: 'Hrvatski' },
  { code: 'sk', name: 'Slovak', flag: '🇸🇰', nativeName: 'Slovenčina' },
  { code: 'ta', name: 'Tamil', flag: '🇮🇳', nativeName: 'தமிழ்' },
  { code: 'ru', name: 'Russian', flag: '🇷🇺', nativeName: 'Русский' },
];

// Popular languages shown first in the UI
export const POPULAR_LANGUAGES = ['en', 'es', 'fr', 'de', 'zh', 'ja', 'pt', 'ar', 'hi', 'ko'];

// Get language by code
export function getLanguageByCode(code: string): DubbingLanguage | undefined {
  return DUBBING_LANGUAGES.find(lang => lang.code === code);
}

// Get sorted languages with popular ones first
export function getSortedLanguages(): DubbingLanguage[] {
  const popular = POPULAR_LANGUAGES.map(code =>
    DUBBING_LANGUAGES.find(lang => lang.code === code)
  ).filter(Boolean) as DubbingLanguage[];

  const others = DUBBING_LANGUAGES.filter(
    lang => !POPULAR_LANGUAGES.includes(lang.code)
  ).sort((a, b) => a.name.localeCompare(b.name));

  return [...popular, ...others];
}
