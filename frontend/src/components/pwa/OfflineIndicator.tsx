import React, { useState, useEffect } from 'react';
import { getOfflineEvents } from '../../utils/offlineStorage';

const OfflineIndicator: React.FC = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [pendingEvents, setPendingEvents] = useState(0);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    const checkPendingEvents = async () => {
      try {
        const events = await getOfflineEvents();
        setPendingEvents(events.length);
      } catch (e) {
        console.error('Failed to get offline events', e);
      }
    };
    checkPendingEvents();
    const interval = setInterval(checkPendingEvents, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleSync = async () => {
    if ('serviceWorker' in navigator && 'SyncManager' in window) {
      try {
        const registration = await navigator.serviceWorker.ready;
        await (registration as any).sync.register('sync-offline-events');
        alert('Sync registered!');
      } catch (err) {
        console.error('Sync registration failed:', err);
      }
    } else {
      alert('Background sync not supported.');
    }
  };

  if (isOnline && pendingEvents === 0) return null;

  return (
    <div style={{
      position: 'fixed', bottom: 20, right: 20, backgroundColor: isOnline ? '#10B981' : '#EF4444', 
      color: 'white', padding: '10px 20px', borderRadius: '20px', boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
      zIndex: 9999, display: 'flex', alignItems: 'center', gap: '10px'
    }}>
      <span>{isOnline ? 'Online' : 'Offline'}</span>
      {pendingEvents > 0 && (
        <span style={{ backgroundColor: 'white', color: '#10B981', borderRadius: '50%', padding: '2px 8px', fontSize: '0.8em', fontWeight: 'bold' }}>
          {pendingEvents}
        </span>
      )}
      {isOnline && pendingEvents > 0 && (
        <button onClick={handleSync} style={{ border: 'none', background: 'rgba(255,255,255,0.2)', color: 'white', cursor: 'pointer', borderRadius: '5px', padding: '5px 10px' }}>
          Sync Now
        </button>
      )}
    </div>
  );
};

export { OfflineIndicator };
export default OfflineIndicator;
