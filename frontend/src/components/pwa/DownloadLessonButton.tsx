import React, { useState, useEffect } from 'react'
import { saveVideoOffline, getVideoOffline } from '../../utils/offlineStorage'
import { useToast } from '@/context/FeedbackContext'
import { Download, CheckCircle2, Loader2 } from 'lucide-react'

interface DownloadLessonButtonProps {
  lessonId: string
  videoUrl: string
}

const DownloadLessonButton: React.FC<DownloadLessonButtonProps> = ({ lessonId, videoUrl }) => {
  const [isDownloaded, setIsDownloaded] = useState(false)
  const [isDownloading, setIsDownloading] = useState(false)
  const { success, error, info } = useToast()

  useEffect(() => {
    const checkStatus = async () => {
      const video = await getVideoOffline(lessonId)
      if (video) setIsDownloaded(true)
    }
    checkStatus()
  }, [lessonId])

  const handleDownloadToggle = async () => {
    if (isDownloaded) {
      info('Materi Offline Tersimpan', 'Video sesi ini sudah tersedia secara offline di peramban Anda.')
      return
    }

    setIsDownloading(true)
    try {
      const response = await fetch(videoUrl)
      const blob = await response.blob()
      await saveVideoOffline(lessonId, blob)
      setIsDownloaded(true)
      success('Video Siap Offline!', 'Materi telah disimpan di IndexedDB lokal untuk belajar tanpa koneksi internet.')
    } catch (err) {
      console.error('Download failed', err)
      error('Gagal Mengunduh Video', 'Pastikan koneksi internet stabil saat mengunduh materi.')
    } finally {
      setIsDownloading(false)
    }
  }

  return (
    <button 
      onClick={handleDownloadToggle} 
      disabled={isDownloading}
      className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all active-press ${isDownloaded ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30' : 'bg-primary text-primary-foreground hover:bg-primary/90'} ${isDownloading ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      {isDownloading ? (
        <>
          <Loader2 className="h-3.5 w-3.5 animate-spin" /> Mengunduh...
        </>
      ) : isDownloaded ? (
        <>
          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" /> Tersedia Offline
        </>
      ) : (
        <>
          <Download className="h-3.5 w-3.5" /> Unduh untuk Offline
        </>
      )}
    </button>
  )
}

export default DownloadLessonButton
