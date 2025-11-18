import { en } from './en';
import { hi } from './hi';
import { ml } from './ml';
import enDefault from './en';
import hiDefault from './hi';
import mlDefault from './ml';
import type { Language } from '@/contexts/LanguageContext';

export const translations = {
  en: en || enDefault,
  hi: hi || hiDefault,
  ml: ml || mlDefault,
};

export function getTranslation(language: Language) {
  return translations[language];
}
