export interface TranslationTree {
  [key: string]: string | TranslationTree;
}

export type LocaleResource = {
  translation: TranslationTree;
};
