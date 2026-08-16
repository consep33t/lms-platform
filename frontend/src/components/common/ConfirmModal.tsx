import React, { useEffect, useRef } from 'react'
import { useFeedback } from '@/context/FeedbackContext'
import { Button } from '@/components/ui/button'
import { AlertTriangle, CheckCircle2, HelpCircle, X } from 'lucide-react'

export const ConfirmModal: React.FC = () => {
  const { confirmState, closeConfirm } = useFeedback()
  const { isOpen, options } = confirmState
  const confirmBtnRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => confirmBtnRef.current?.focus(), 50)
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          closeConfirm(false)
        }
      }
      window.addEventListener('keydown', handleKeyDown)
      return () => window.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, closeConfirm])

  if (!isOpen) return null

  const getVariantStyles = () => {
    switch (options.variant) {
      case 'destructive':
        return {
          icon: <AlertTriangle className="h-6 w-6 text-destructive animate-pulse" />,
          iconBg: 'bg-destructive/10 border-destructive/20',
          btnVariant: 'destructive' as const,
          borderGlow: 'border-destructive/30',
        }
      case 'success':
        return {
          icon: <CheckCircle2 className="h-6 w-6 text-emerald-500" />,
          iconBg: 'bg-emerald-500/10 border-emerald-500/20',
          btnVariant: 'default' as const,
          borderGlow: 'border-emerald-500/30',
        }
      case 'warning':
        return {
          icon: <AlertTriangle className="h-6 w-6 text-amber-500" />,
          iconBg: 'bg-amber-500/10 border-amber-500/20',
          btnVariant: 'default' as const,
          borderGlow: 'border-amber-500/30',
        }
      default:
        return {
          icon: <HelpCircle className="h-6 w-6 text-primary" />,
          iconBg: 'bg-primary/10 border-primary/20',
          btnVariant: 'default' as const,
          borderGlow: 'border-primary/30',
        }
    }
  }

  const styles = getVariantStyles()

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-background/80 backdrop-blur-md transition-opacity duration-300 animate-page-in"
        onClick={() => closeConfirm(false)}
      />

      {/* Modal Card */}
      <div className="relative w-full max-w-md bg-card border border-border shadow-2xl rounded-2xl p-6 space-y-5 animate-scale-in z-10">
        <button
          onClick={() => closeConfirm(false)}
          className="absolute top-4 right-4 p-1.5 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors"
          aria-label="Tutup"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="flex items-start gap-4">
          <div className={`p-3 rounded-xl border shrink-0 ${styles.iconBg}`}>
            {options.icon || styles.icon}
          </div>
          <div className="space-y-1.5 pt-0.5">
            <h3 className="text-lg font-bold font-display text-foreground leading-tight">
              {options.title}
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {options.message}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => closeConfirm(false)}
            className="rounded-xl px-4 text-sm font-medium hover:bg-muted/80 active-press"
          >
            {options.cancelText || 'Batal'}
          </Button>
          <Button
            ref={confirmBtnRef}
            type="button"
            variant={styles.btnVariant}
            onClick={() => closeConfirm(true)}
            className="rounded-xl px-5 text-sm font-semibold shadow-sm active-press"
          >
            {options.confirmText || 'Konfirmasi'}
          </Button>
        </div>
      </div>
    </div>
  )
}

export default ConfirmModal
