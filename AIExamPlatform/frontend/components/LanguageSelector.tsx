'use client';

import { useLocale } from './LocaleProvider';

const languages = [
  { code: 'en', label: 'English' },
  { code: 'te', label: 'తెలుగు' },
  { code: 'hi', label: 'हिन्दी' },
  { code: 'ta', label: 'தமிழ்' },
  { code: 'kn', label: 'ಕನ್ನಡ' },
  { code: 'ml', label: 'മലയാളം' },
];

export function LanguageSelector() {
  const { language, setLanguage, t } = useLocale();

  return (
    <label className="language-select" aria-label={t('Language')}>
      <span className="sr-only">{t('Language')}</span>
      <select value={language} onChange={(event) => setLanguage(event.target.value)}>
        {languages.map((item) => (
          <option key={item.code} value={item.code}>
            {item.label}
          </option>
        ))}
      </select>
    </label>
  );
}
