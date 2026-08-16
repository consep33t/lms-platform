import React from 'react'
import { useFeedback, FeedbackType } from '@/context/FeedbackContext'
import { CheckCircle2, AlertTriangle, XCircle, Info, X } from 'lucide-react'

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useFeedback()

  if (toasts.length === 0) return null

  const getToastIcon = (type: FeedbackType) => {
    switch (type) {
      case 'success':
        return <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0" />
      case 'error':
        return <XCircle className="h-5 w-5 text-destructive shrink-0" />
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0" />
      case 'info':
      default:
        return <Info className="h-5 w-5 text-primary shrink-0" />
    }
  }

  return (
    <div
      aria-live="assertive"
      className="fixed bottom-5 right-5 z-[99999] flex flex-col gap-2.5 max-w-sm w-full pointer-events-none p-2 sm:p-0"
    >
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className="pointer-events-auto flex items-start gap-3 p-4 rounded-2xl bg-card/95 backdrop-blur-md border border-border shadow-xl animate-slide-up transition-all hover:scale-[1.02]"
        >
          <div className="pt-0.5">{getToastIcon(toast.type)}</div>
          <div className="flex-1 min-w-0 pr-2">
            <h4 className="text-sm font-semibold text-foreground leading-tight">
              {toast.title}
            </h4>
            {toast.description && (
              <p className="text-xs text-muted-foreground mt-1 leading-normal line-clamp-2">
                {toast.description}
              </p>
            )}
          </div>
          <button
            onClick={() => removeToast(toast.id)}
            className="p-1 text-muted-foreground hover:text-foreground rounded-lg hover:bg-muted/80 transition-colors"
            aria-label="Tutup notifikasi"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      ))}
    </div>
  )
}

export default ToastContainer
