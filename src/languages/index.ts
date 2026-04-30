import en from './en';
import es from './es';
import fr from './fr';
import de from './de';
import it from './it';
import pt from './pt';
import ar from './ar';
import ja from './ja';
import zh from './zh';
import hi from './hi';
import ru from './ru';

export { en, es, fr, de, it, pt, ar, ja, zh, hi, ru };

export const baseResources = { en, es, fr, de, it, pt, ar, ja, zh, hi, ru } as const;

export type LocaleCode = keyof typeof baseResources;

export type LanguageOption = {
  code: LocaleCode;
  name: string;
  flag: string;
  dir?: 'ltr' | 'rtl';
};

export const availableLanguages: LanguageOption[] = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
  { code: 'it', name: 'Italiano', flag: '🇮🇹' },
  { code: 'pt', name: 'Português', flag: '🇵🇹' },
  { code: 'ar', name: 'العربية', flag: '🇸🇦', dir: 'rtl' },
  { code: 'ja', name: '日本語', flag: '🇯🇵' },
  { code: 'zh', name: '中文', flag: '🇨🇳' },
  { code: 'hi', name: 'हिन्दी', flag: '🇮🇳' },
  { code: 'ru', name: 'Русский', flag: '🇷🇺' },
];
