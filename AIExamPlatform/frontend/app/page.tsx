'use client';

import Link from 'next/link';
import { useLocale } from '../components/LocaleProvider';
import { ConnectionStatus } from '../components/ConnectionStatus';
import { InstallPWA } from '../components/InstallPWA';
import { LanguageSelector } from '../components/LanguageSelector';
import { LocalizedContent } from '../components/LocalizedContent';

export default function Home() {
  const { t } = useLocale();

  return (
    <main className="shell">
      <LocalizedContent>
      <nav className="topbar">
        <div className="brand">
          <span className="brand-mark" />
          <span>ExamAI</span>
        </div>
        <div className="nav-actions">
          <ConnectionStatus />
          <LanguageSelector />
        </div>
      </nav>

      <section className="hero">
        <div>
          <div className="eyebrow">AI-powered assessment</div>
          <h1>{t('welcome')}</h1>
          <p className="lede">{t('subtitle')}</p>
          <p className="lede">{t('tagline')}</p>
          <div className="actions">
            <Link href="/login" className="primary">{t('getStarted')}</Link>
            <Link href="/register" className="secondary">{t('register')}</Link>
          </div>
        </div>

        <aside className="hero-card">
          <div className="status-pill"><span className="status-dot" /> Platform foundation online</div>
          <div className="metrics">
            <div className="metric">
              <strong>3</strong>
              <span>core roles</span>
            </div>
            <div className="metric">
              <strong>6</strong>
              <span>languages</span>
            </div>
            <div className="metric">
              <strong>24/7</strong>
              <span>exam readiness</span>
            </div>
            <div className="metric">
              <strong>PWA</strong>
              <span>offline capable</span>
            </div>
          </div>
          <p style={{ color: 'rgba(226, 232, 240, 0.84)', marginTop: 18, lineHeight: 1.7 }}>
            {t('platform')}
          </p>
        </aside>
      </section>

      <InstallPWA />

      <section className="section">
        <div className="eyebrow" style={{ color: '#0ea5e9' }}>Features</div>
        <div className="feature-grid">
          <article className="feature-card">
            <div className="icon-box">🧠</div>
            <h3>AI Proctoring</h3>
            <p>Monitor face presence, gaze, tab changes, and suspicious behavior during live exams.</p>
          </article>
          <article className="feature-card">
            <div className="icon-box">📊</div>
            <h3>Smart Evaluation</h3>
            <p>Automate objective scoring and support AI-assisted subjective grading with examiner review.</p>
          </article>
          <article className="feature-card">
            <div className="icon-box">🌐</div>
            <h3>Multilingual PWA</h3>
            <p>Deliver the platform in English, Telugu, Hindi, Tamil, Malayalam, and Kannada.</p>
          </article>
        </div>
      </section>
      </LocalizedContent>
    </main>
  );
}
