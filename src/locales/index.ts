import { en } from './en';
import { hi } from './hi';
import { ml } from './ml';
import type { Language } from '@/contexts/LanguageContext';

export const translations = {
  en,
  hi,
  ml,
};

export function getTranslation(language: Language) {
  return translations[language];
}
