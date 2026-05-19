'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import en, { type Translations } from '@/i18n/en';
import es from '@/i18n/es';

type Language = 'en' | 'es';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
  t: Translations;
}

const translations: Record<Language, Translations> = { en, es };

const LanguageContext = createContext<LanguageContextType>({
  language: 'en',
  setLanguage: () => {},
  toggleLanguage: () => {},
  t: en,
});

export const useLanguage = () => useContext(LanguageContext);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLang] = useState<Language>('en');

  useEffect(() => {
    const saved = localStorage.getItem('ppw-language') as Language;
    if (saved && translations[saved]) {
      setLang(saved);
    }
  }, []);

  const setLanguage = useCallback((lang: Language) => {
    setLang(lang);
    localStorage.setItem('ppw-language', lang);
  }, []);

  const toggleLanguage = useCallback(() => {
    setLanguage(language === 'en' ? 'es' : 'en');
  }, [language, setLanguage]);

  const t = translations[language];

  return (
    <LanguageContext.Provider value={{ language, setLanguage, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export default LanguageContext;
