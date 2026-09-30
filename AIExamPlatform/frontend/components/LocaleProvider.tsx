'use client';

import { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { getTranslations } from '../lib/translations';
import { translatePhrase } from '../lib/uiTranslations';

type LocaleContextValue = {
  language: string;
  setLanguage: (language: string) => void;
  t: (key: string) => string;
};

const LocaleContext = createContext<LocaleContextValue>({
  language: 'en',
  setLanguage: () => undefined,
  t: (key) => key,
});

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState('en');

  useEffect(() => {
    const saved = window.localStorage.getItem('examai-language');
    if (saved) {
      setLanguageState(saved);
      return;
    }

    const token = window.localStorage.getItem('access_token') || window.localStorage.getItem('ai_exam_access_token');
    if (!token) return;
    const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000';
    fetch(`${apiUrl}/api/v1/users/me`, { headers: { Authorization: `Bearer ${token}` }, cache: 'no-store' })
      .then((response) => response.ok ? response.json() : null)
      .then((user: { preferred_language?: string } | null) => {
        if (user?.preferred_language) {
          setLanguageState(user.preferred_language);
          window.localStorage.setItem('examai-language', user.preferred_language);
        }
      })
      .catch(() => undefined);
  }, []);

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  const setLanguage = (nextLanguage: string) => {
    setLanguageState(nextLanguage);
    window.localStorage.setItem('examai-language', nextLanguage);
    const token = window.localStorage.getItem('access_token') || window.localStorage.getItem('ai_exam_access_token');
    if (token) {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000';
      void fetch(`${apiUrl}/api/v1/users/me/preferences`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ preferred_language: nextLanguage }),
      }).catch(() => undefined);
    }
  };

  const dictionary = getTranslations(language);
  const t = (key: string) => {
    const phrase = translatePhrase(language, key);
    return phrase === key ? dictionary[key as keyof typeof dictionary] ?? key : phrase;
  };

  return <LocaleContext.Provider value={{ language, setLanguage, t }}>{children}</LocaleContext.Provider>;
}

export function useLocale() {
  return useContext(LocaleContext);
}