'use client';

import { useEffect, useState } from 'react';
import { useLocale } from './LocaleProvider';

export function InstallPWA({ compact = false }: { compact?: boolean }) {
  const [showInstall, setShowInstall] = useState(false);
  const [installed, setInstalled] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const { t } = useLocale();

  useEffect(() => {
    setInstalled(window.matchMedia('(display-mode: standalone)').matches || (navigator as Navigator & { standalone?: boolean }).standalone === true);
    const onBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      setDeferredPrompt(event as BeforeInstallPromptEvent);
      setShowInstall(true);
    };
    const onInstalled = () => {
      setInstalled(true);
      setShowInstall(false);
    };

    window.addEventListener('beforeinstallprompt', onBeforeInstallPrompt);
    window.addEventListener('appinstalled', onInstalled);
    return () => {
      window.removeEventListener('beforeinstallprompt', onBeforeInstallPrompt);
      window.removeEventListener('appinstalled', onInstalled);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    setShowInstall(false);
    setDeferredPrompt(null);
  };

  if (installed) return <span className="pwa-installed-status" role="status">{t('App installed')}</span>;
  if (!showInstall) return null;

  if (compact) {
    return <button type="button" className="pwa-install-compact" onClick={handleInstall}>{t('Install App')}</button>;
  }

  return (
    <div className="install-banner">
      <div>
        <strong>{t('Install AI Exam Platform')}</strong>
        <p>{t('Get faster access and an app-like experience.')}</p>
      </div>
      <div className="install-actions">
        <button onClick={handleInstall}>{t('Install App')}</button>
        <button className="secondary" onClick={() => setShowInstall(false)}>{t('Not now')}</button>
      </div>
    </div>
  );
}

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
};
