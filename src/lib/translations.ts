import { Language } from '../types';
import translationsData from './translations.json';

export const translations = translationsData as any;

export const getTranslation = (lang: Language, key: keyof typeof translations['ar']) => {
  return (translations[lang] as any)?.[key] || (translations['en'] as any)?.[key] || String(key);
};
