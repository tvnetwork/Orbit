import { writeFileSync } from 'node:fs';
import { join } from 'node:path';

import en from '../src/languages/en';
import type { LocaleResource, TranslationTree } from '../src/languages/types';

type LocaleCode = 'es' | 'fr' | 'de' | 'it' | 'pt' | 'ar' | 'ja' | 'zh' | 'hi' | 'ru';

type LocaleConfig = {
  code: LocaleCode;
  mode: 'missing' | 'full';
};

type LeafEntry = {
  key: string;
  value: string;
};

const localeConfigs: LocaleConfig[] = [
  { code: 'es', mode: 'missing' },
  { code: 'fr', mode: 'missing' },
  { code: 'de', mode: 'missing' },
  { code: 'it', mode: 'missing' },
  { code: 'pt', mode: 'missing' },
  { code: 'ar', mode: 'missing' },
  { code: 'ja', mode: 'full' },
  { code: 'zh', mode: 'full' },
  { code: 'hi', mode: 'full' },
  { code: 'ru', mode: 'full' },
];

const baseTranslation = en.translation;
const englishEntries = flattenTranslation(baseTranslation);

function flattenTranslation(tree: TranslationTree, prefix = ''): LeafEntry[] {
  return Object.entries(tree).flatMap(([key, value]) => {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    return typeof value === 'object' && value !== null && !Array.isArray(value)
      ? flattenTranslation(value as TranslationTree, fullKey)
      : [{ key: fullKey, value: String(value) }];
  });
}

function cloneTranslation(tree: TranslationTree): TranslationTree {
  return JSON.parse(JSON.stringify(tree)) as TranslationTree;
}

function getValueAtPath(tree: TranslationTree, path: string): string | undefined {
  const parts = path.split('.');
  let current: string | TranslationTree | undefined = tree;

  for (const part of parts) {
    if (typeof current !== 'object' || current === null || Array.isArray(current)) {
      return undefined;
    }

    current = current[part];
  }

  return typeof current === 'string' ? current : undefined;
}

function setValueAtPath(tree: TranslationTree, path: string, value: string) {
  const parts = path.split('.');
  let current: TranslationTree = tree;

  for (let index = 0; index < parts.length - 1; index += 1) {
    const part = parts[index];
    const next = current[part];

    if (typeof next !== 'object' || next === null || Array.isArray(next)) {
      current[part] = {};
    }

    current = current[part] as TranslationTree;
  }

  current[parts[parts.length - 1]] = value;
}

function protectInterpolation(text: string) {
  const placeholders: string[] = [];
  const protectedText = text.replace(/\{\{[^}]+\}\}/g, (match) => {
    const token = `__VAR_${placeholders.length}__`;
    placeholders.push(match);
    return token;
  });

  return { protectedText, placeholders };
}

function restoreInterpolation(text: string, placeholders: string[]) {
  return placeholders.reduce(
    (current, placeholder, index) => current.replaceAll(`__VAR_${index}__`, placeholder),
    text
  );
}

async function translateBatch(texts: string[], locale: LocaleCode) {
  const chunkSize = locale === 'hi' || locale === 'ru' ? 1 : 10;
  const delimiter = '[[[SPLIT_TOKEN_48291]]]';
  const output: string[] = [];

  for (let index = 0; index < texts.length; index += chunkSize) {
    const chunk = texts.slice(index, index + chunkSize);
    const protectedChunk = chunk.map(protectInterpolation);
    const payload = protectedChunk.map((entry) => entry.protectedText).join(delimiter);
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=${locale}&dt=t&q=${encodeURIComponent(payload)}`;
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Translation request failed for ${locale}: ${response.status}`);
    }

    const json = await response.json() as Array<Array<[string]>>;
    const translated = json[0].map((part) => part[0]).join('');
    const restored = translated
      .split(delimiter)
      .map((text, chunkIndex) => restoreInterpolation(text, protectedChunk[chunkIndex].placeholders));

    if (restored.length !== chunk.length) {
      throw new Error(`Delimiter split mismatch for ${locale}. Expected ${chunk.length}, got ${restored.length}.`);
    }

    output.push(...restored);
  }

  return output;
}

function formatLocaleFile(code: LocaleCode, resource: LocaleResource) {
  return `import type { LocaleResource } from './types';\n\nconst ${code}: LocaleResource = ${JSON.stringify(resource, null, 2)};\n\nexport default ${code};\n`;
}

async function loadExistingLocale(code: LocaleCode) {
  try {
    const module = await import(`../src/languages/${code}.ts`);
    return (module.default ?? null) as LocaleResource | null;
  } catch {
    return null;
  }
}

async function main() {
  for (const locale of localeConfigs) {
    const existing = await loadExistingLocale(locale.code);
    const translation = cloneTranslation(existing?.translation ?? {});

    const missingEntries = englishEntries.filter(({ key }) => {
      return getValueAtPath(translation, key) === undefined;
    });

    if (missingEntries.length === 0) {
      console.log(`${locale.code}: no missing keys`);
      continue;
    }

    console.log(`${locale.code}: translating ${missingEntries.length} keys`);
    const translatedValues = await translateBatch(
      missingEntries.map((entry) => entry.value),
      locale.code
    );

    for (const [index, entry] of missingEntries.entries()) {
      setValueAtPath(translation, entry.key, translatedValues[index]);
    }

    const resource: LocaleResource = {
      translation,
    };

    writeFileSync(
      join(process.cwd(), 'src', 'languages', `${locale.code}.ts`),
      formatLocaleFile(locale.code, resource),
      'utf8'
    );
  }
}

await main();
