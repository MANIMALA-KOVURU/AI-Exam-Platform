'use client';

import { useEffect, useState } from 'react';

export function ConnectionStatus() {
  const [online, setOnline] = useState(true);

  useEffect(() => {
    const updateStatus = () => setOnline(navigator.onLine);
    updateStatus();
    window.addEventListener('online', updateStatus);
    window.addEventListener('offline', updateStatus);
    return () => {
      window.removeEventListener('online', updateStatus);
      window.removeEventListener('offline', updateStatus);
    };
  }, []);

  return (
    <div className={`connection-status ${online ? 'online' : 'offline'}`} aria-live="polite">
      <span className="status-dot" />
      {online ? 'Online' : 'Offline'}
    </div>
  );
}
