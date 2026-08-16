import React, { useState, useEffect } from 'react'
import { getOfflineEvents } from '../../utils/offlineStorage'
import { useToast } from '@/context/FeedbackContext'
import { Wifi, WifiOff, RefreshCw } from 'lucide-react'

const OfflineIndicator: React.FC = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine)
  const [pendingEvents, setPendingEvents] = useState(0)
  const { success, info } = useToast()

  useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  useEffect(() => {
    const checkPendingEvents = async () => {
      try {
        const events = await getOfflineEvents()
        setPendingEvents(events.length)
      } catch (e) {
        console.error('Failed to get offline events', e)
      }
    }
    checkPendingEvents()
    const interval = setInterval(checkPendingEvents, 5000)
    return () => clearInterval(interval)
  }, [])

  const handleSync = async () => {
    if ('serviceWorker' in navigator && 'SyncManager' in window) {
      try {
        const registration = await navigator.serviceWorker.ready
        await (registration as any).sync.register('sync-offline-events')
        success('Sinkronisasi Berjalan', 'Aktivitas belajar offline sedang disinkronkan ke server pusat.')
      } catch (err) {
        console.error('Sync registration failed:', err)
      }
    } else {
      info('Sinkronisasi Otomatis', 'Data akan otomatis terunggah saat koneksi stabil kembali.')
    }
  }

  if (isOnline && pendingEvents === 0) return null

  return (
    <div className={`fixed bottom-5 right-5 z-50 flex items-center gap-3 px-4 py-2.5 rounded-2xl shadow-xl backdrop-blur-md border animate-slide-up text-sm font-medium transition-all ${isOnline ? 'bg-emerald-500/90 text-white border-emerald-400/40' : 'bg-rose-500/90 text-white border-rose-400/40'}`}>
      <div className="flex items-center gap-2">
        {isOnline ? <Wifi className="h-4 w-4" /> : <WifiOff className="h-4 w-4 animate-pulse" />}
        <span>{isOnline ? 'Online' : 'Mode Offline'}</span>
      </div>

      {pendingEvents > 0 && (
        <span className="bg-white/20 text-white text-xs px-2 py-0.5 rounded-full font-bold">
          {pendingEvents} aksi pending
        </span>
      )}

      {isOnline && pendingEvents > 0 && (
        <button 
          onClick={handleSync}
          className="flex items-center gap-1 bg-white/20 hover:bg-white/30 text-white px-2.5 py-1 rounded-xl text-xs font-semibold transition-all active-press"
        >
          <RefreshCw className="h-3 w-3" /> Sinkron
        </button>
      )}
    </div>
  )
}

export { OfflineIndicator }
export default OfflineIndicator
