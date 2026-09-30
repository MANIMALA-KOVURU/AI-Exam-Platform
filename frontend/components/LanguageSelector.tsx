'use client';

import { useEffect, useState } from 'react';

const languages = [
  { code: 'en', label: 'English' },
  { code: 'te', label: 'తెలుగు' },
  { code: 'hi', label: 'हिन्दी' },
  { code: 'ta', label: 'தமிழ்' },
  { code: 'ml', label: 'മലയാളം' },
  { code: 'kn', label: 'ಕನ್ನಡ' },
];

export function LanguageSelector() {
  const [language, setLanguage] = useState('en');

  useEffect(() => {
    const saved = window.localStorage.getItem('examai-language') ?? 'en';
    setLanguage(saved);
  }, []);

  const handleChange = (nextLanguage: string) => {
    setLanguage(nextLanguage);
    window.localStorage.setItem('examai-language', nextLanguage);
  };

  return (
    <label className="language-select" aria-label="Select language">
      <span className="sr-only">Language</span>
      <select value={language} onChange={(event) => handleChange(event.target.value)}>
        {languages.map((item) => (
          <option key={item.code} value={item.code}>
            {item.label}
          </option>
        ))}
      </select>
    </label>
  );
}
