import React, { createContext, useState, ReactNode, useEffect } from 'react';
import { translations } from '../translations';

type Language = 'en' | 'ar';
type SetLanguage = (language: Language) => void;

type LanguageContextType = {
  language: Language;
  setLanguage?: SetLanguage;
  translations: any;
};

export const LanguageContext = createContext<LanguageContextType>({
  language: 'ar', // Default to Arabic as per UI hints
  translations: translations.ar,
});

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguage] = useState<Language>('ar');

  useEffect(() => {
    const html = document.documentElement;
    html.lang = language;
    html.dir = language === 'ar' ? 'rtl' : 'ltr';
  }, [language]);

  const value = {
    language,
    setLanguage,
    translations: translations[language],
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};