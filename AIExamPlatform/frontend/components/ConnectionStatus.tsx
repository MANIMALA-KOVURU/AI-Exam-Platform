'use client';

import { useEffect, useState } from 'react';
import { useLocale } from './LocaleProvider';

export function ConnectionStatus() {
  const [online, setOnline] = useState(true);
  const [restored, setRestored] = useState(false);
  const { t } = useLocale();

  useEffect(() => {
    const updateStatus = () => setOnline(navigator.onLine);
    const onOnline = () => {
      setOnline(true);
      setRestored(true);
      window.setTimeout(() => setRestored(false), 3500);
    };
    updateStatus();
    window.addEventListener('online', onOnline);
    window.addEventListener('offline', updateStatus);
    return () => {
      window.removeEventListener('online', onOnline);
      window.removeEventListener('offline', updateStatus);
    };
  }, []);

  return (
    <div className={`connection-status ${online ? 'online' : 'offline'}`} aria-live="polite">
      <span className="status-dot" />
      {online ? restored ? t('Connection restored') : t('Online') : t('Offline')}
    </div>
  );
}
