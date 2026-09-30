'use client';

import { useState } from 'react';
import { API_URL } from '../app/api';
import { useLocale } from './LocaleProvider';

function decodeVapidKey(value: string) {
  const padded = value + '='.repeat((4 - value.length % 4) % 4);
  const decoded = window.atob(padded.replace(/-/g, '+').replace(/_/g, '/'));
  return Uint8Array.from(decoded, (character) => character.charCodeAt(0));
}

export function NotificationOptIn() {
  const [explaining, setExplaining] = useState(false);
  const [enabled, setEnabled] = useState(false);
  const [error, setError] = useState('');
  const { t } = useLocale();
  const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;

  if (!publicKey || typeof window === 'undefined' || !('Notification' in window) || !('PushManager' in window)) return null;

  const subscribe = async () => {
    setError('');
    try {
      const permission = Notification.permission === 'granted' ? 'granted' : await Notification.requestPermission();
      if (permission !== 'granted') return;
      const token = localStorage.getItem('access_token') || localStorage.getItem('ai_exam_access_token');
      if (!token) throw new Error(t('Sign in to enable notifications.'));
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: decodeVapidKey(publicKey) });
      const response = await fetch(`${API_URL}/api/v1/notifications/subscriptions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(subscription.toJSON()),
      });
      if (!response.ok) throw new Error(t('Could not enable notifications. Please try again.'));
      setEnabled(true);
      setExplaining(false);
    } catch (subscribeError) {
      setError(subscribeError instanceof Error ? subscribeError.message : t('Could not enable notifications. Please try again.'));
    }
  };

  return (
    <div className="notification-opt-in">
      {enabled ? <span role="status">{t('Notifications enabled')}</span> : <button type="button" className="notification-opt-in__trigger" onClick={() => setExplaining((value) => !value)}>{t('Enable notifications')}</button>}
      {explaining && !enabled ? <div className="notification-opt-in__details"><p>{t('Receive exam reminders and result announcements on this device.')}</p><button type="button" onClick={subscribe}>{t('Allow notifications')}</button></div> : null}
      {error ? <span role="alert" className="form-error">{error}</span> : null}
    </div>
  );
}