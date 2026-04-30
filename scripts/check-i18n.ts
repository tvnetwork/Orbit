import { baseResources } from '../src/languages';

type TranslationTree = Record<string, string | TranslationTree>;

function flattenTranslations(tree: TranslationTree, prefix = ''): string[] {
  return Object.entries(tree).flatMap(([key, value]) => {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    return typeof value === 'object' && value !== null && !Array.isArray(value)
      ? flattenTranslations(value as TranslationTree, fullKey)
      : [fullKey];
  });
}

const resources = baseResources as Record<
  string,
  { translation: TranslationTree }
>;

const english = resources.en?.translation;

if (!english) {
  console.error('Missing English translation source.');
  process.exit(1);
}

const englishKeys = new Set(flattenTranslations(english));
let hasMissingKeys = false;

for (const [locale, resource] of Object.entries(resources)) {
  if (locale === 'en') {
    continue;
  }

  const localeKeys = new Set(flattenTranslations(resource.translation));
  const missingKeys = [...englishKeys].filter((key) => !localeKeys.has(key));

  if (missingKeys.length === 0) {
    console.log(`${locale}: complete`);
    continue;
  }

  hasMissingKeys = true;
  console.log(`${locale}: ${missingKeys.length} missing keys`);
  for (const key of missingKeys) {
    console.log(`  - ${key}`);
  }
}

if (hasMissingKeys) {
  process.exit(1);
}

console.log('All locales are fully translated.');
