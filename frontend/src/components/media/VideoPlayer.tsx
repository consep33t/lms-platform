import { useEffect, useRef, useCallback } from 'react'
import api from '@/lib/api'

interface VideoPlayerProps {
  src: string
  contentId: number
  sessionProgressId: number
  requiredPercent?: number
  onCompleted?: () => void
}

export function VideoPlayer({
  src,
  contentId,
  sessionProgressId,
  requiredPercent = 90,
  onCompleted,
}: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const lastReportedRef = useRef(0)
  const completedRef = useRef(false)

  const reportProgress = useCallback(
    async (percent: number) => {
      if (Math.abs(percent - lastReportedRef.current) < 5) return
      lastReportedRef.current = percent
      try {
        await api.post(`/session-contents/${contentId}/watch-progress`, {
          session_progress_id: sessionProgressId,
          watched_percent: percent,
          is_completed: percent >= requiredPercent,
        })
        if (percent >= requiredPercent && !completedRef.current) {
          completedRef.current = true
          onCompleted?.()
        }
      } catch {
        // silent fail for heartbeat
      }
    },
    [contentId, sessionProgressId, requiredPercent, onCompleted]
  )

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    const handleTimeUpdate = () => {
      if (!video.duration) return
      const percent = Math.floor((video.currentTime / video.duration) * 100)
      reportProgress(percent)
    }

    video.addEventListener('timeupdate', handleTimeUpdate)
    return () => video.removeEventListener('timeupdate', handleTimeUpdate)
  }, [reportProgress])

  return (
    <div className="relative w-full rounded-lg overflow-hidden bg-black">
      <video
        ref={videoRef}
        src={src}
        controls
        className="w-full"
        controlsList="nodownload"
        onContextMenu={(e) => e.preventDefault()}
      />
      {requiredPercent < 100 && (
        <div className="absolute bottom-12 left-0 right-0 px-4">
          <div className="text-xs text-white/70 text-center bg-black/40 py-1 rounded">
            Tonton minimal {requiredPercent}% untuk menyelesaikan sesi
          </div>
        </div>
      )}
    </div>
  )
}
