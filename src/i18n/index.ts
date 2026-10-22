import en from './en';
import hi from './hi';

export type Lang = 'en' | 'hi';
export type Strings = typeof en;

const strings: Record<Lang, Strings> = { en, hi };

export function getStrings(lang: Lang): Strings {
  return strings[lang] ?? strings.en;
}
