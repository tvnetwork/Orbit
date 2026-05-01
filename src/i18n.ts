import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import { availableLanguages, baseResources } from './languages';
import type { LocaleResource, TranslationTree } from './languages/types';

function isTranslationTree(value: string | TranslationTree): value is TranslationTree {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function mergeTranslations(base: TranslationTree, override: TranslationTree): TranslationTree {
  const merged: TranslationTree = { ...base };

  for (const [key, value] of Object.entries(override)) {
    const baseValue = merged[key];

    if (isTranslationTree(baseValue) && isTranslationTree(value)) {
      merged[key] = mergeTranslations(baseValue, value);
    } else {
      merged[key] = value;
    }
  }

  return merged;
}

const englishTranslation = baseResources.en.translation;

const resources = Object.fromEntries(
  Object.entries(baseResources).map(([locale, data]) => [
    locale,
    locale === 'en'
      ? data
      : {
          ...data,
          translation: mergeTranslations(englishTranslation, data.translation),
        },
  ])
) as Record<string, LocaleResource>;

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: 'en',
    supportedLngs: availableLanguages.map(({ code }) => code),
    nonExplicitSupportedLngs: true,
    interpolation: {
      escapeValue: false,
    },
    resources,
  });

export { baseResources };

export default i18n;
