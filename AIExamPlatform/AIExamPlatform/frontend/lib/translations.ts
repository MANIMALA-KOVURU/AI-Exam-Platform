import en from '../locales/en/common.json';
import te from '../locales/te/common.json';
import hi from '../locales/hi/common.json';
import ta from '../locales/ta/common.json';
import ml from '../locales/ml/common.json';
import kn from '../locales/kn/common.json';

export const translations = {
  en,
  te,
  hi,
  ta,
  ml,
  kn,
} as const;

export type LocaleCode = keyof typeof translations;

export function getTranslations(language: string) {
  return translations[(language as LocaleCode) in translations ? (language as LocaleCode) : 'en'];
}
