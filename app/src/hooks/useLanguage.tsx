'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import {
  LANGUAGE_UPDATED_EVENT,
  applyLanguageToDocument,
  loadLanguagePreference,
  saveLanguagePreference,
  translate,
  type Language,
  type TranslationKey,
  type TranslationParams,
} from '@/services/i18n';

interface LanguageContextValue {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: TranslationKey, params?: TranslationParams) => string;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

interface LanguageProviderProps {
  children: React.ReactNode;
}

export function LanguageProvider({ children }: LanguageProviderProps) {
  const [language, setLanguageState] = useState<Language>(() =>
    loadLanguagePreference()
  );

  const setLanguage = useCallback((nextLanguage: Language) => {
    setLanguageState((currentLanguage) => {
      if (currentLanguage === nextLanguage) {
        return currentLanguage;
      }

      saveLanguagePreference(nextLanguage);
      return nextLanguage;
    });
  }, []);

  useEffect(() => {
    applyLanguageToDocument(language);
  }, [language]);

  useEffect(() => {
    const refreshLanguage = () => {
      setLanguageState(loadLanguagePreference());
    };

    window.addEventListener('storage', refreshLanguage);
    window.addEventListener(LANGUAGE_UPDATED_EVENT, refreshLanguage);

    return () => {
      window.removeEventListener('storage', refreshLanguage);
      window.removeEventListener(LANGUAGE_UPDATED_EVENT, refreshLanguage);
    };
  }, []);

  const t = useCallback(
    (key: TranslationKey, params?: TranslationParams) => {
      return translate(key, language, params);
    },
    [language]
  );

  const value = useMemo<LanguageContextValue>(
    () => ({
      language,
      setLanguage,
      t,
    }),
    [language, setLanguage, t]
  );

  return (
    <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
  );
}

export function useLanguage(): LanguageContextValue {
  const context = useContext(LanguageContext);

  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider.');
  }

  return context;
}
