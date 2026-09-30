'use client';

import Link from 'next/link';
import { useLocale } from '../../components/LocaleProvider';
import { LanguageSelector } from '../../components/LanguageSelector';

export default function OfflinePage() {
  const { t } = useLocale();

  return (
    <main className="offline-shell">
      <div className="offline-toolbar"><span className="brand-name">AI Exam Platform</span><LanguageSelector /></div>
      <section className="offline-content" aria-labelledby="offline-title">
        <p className="eyebrow">{t('Offline')}</p>
        <h1 id="offline-title">{t('You are offline')}</h1>
        <p>{t('Your account and examination data are not available without a connection.')}</p>
        <Link className="primary-btn" href="/">{t('Try again')}</Link>
      </section>
    </main>
  );
}