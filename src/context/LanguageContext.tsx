import React, { createContext, useContext, useState, useEffect } from 'react';
import { en } from '../locales/en';
import { hi } from '../locales/hi';
import { mr } from '../locales/mr';

type LanguageCode = 'en' | 'hi' | 'mr';
type Translations = typeof en;

interface LanguageContextType {
  lang: LanguageCode;
  setLang: (lang: LanguageCode) => void;
  t: (key: keyof Translations) => string;
}

const translations = { en, hi, mr };

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [lang, setLang] = useState<LanguageCode>('en');

  useEffect(() => {
    const savedLang = localStorage.getItem('appLang') as LanguageCode;
    if (savedLang && translations[savedLang]) {
      setLang(savedLang);
    } else {
      const browserLang = navigator.language.slice(0, 2);
      if (browserLang === 'hi') setLang('hi');
      else if (browserLang === 'mr') setLang('mr'); // browser might not use 'mr', but just in case
      else setLang('en');
    }
  }, []);

  const changeLang = (newLang: LanguageCode) => {
    setLang(newLang);
    localStorage.setItem('appLang', newLang);
  };

  const t = (key: keyof Translations): string => {
    return translations[lang][key] || translations['en'][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang: changeLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) throw new Error('useLanguage must be used within LanguageProvider');
  return context;
};
