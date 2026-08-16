import React, { createContext, useContext, useState, useCallback, useRef } from 'react'

export type FeedbackType = 'info' | 'success' | 'warning' | 'error'

export interface ConfirmOptions {
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  variant?: 'default' | 'destructive' | 'warning' | 'success'
  icon?: React.ReactNode
}

export interface AlertOptions {
  title: string
  message: string
  type?: FeedbackType
  buttonText?: string
}

export interface ToastItem {
  id: string
  title: string
  description?: string
  type: FeedbackType
  duration?: number
}

interface FeedbackContextValue {
  confirm: (options: ConfirmOptions) => Promise<boolean>
  alert: (options: AlertOptions) => Promise<void>
  toast: (options: Omit<ToastItem, 'id'>) => void
  toasts: ToastItem[]
  removeToast: (id: string) => void
  confirmState: {
    isOpen: boolean
    options: ConfirmOptions
    resolve?: (value: boolean) => void
  }
  alertState: {
    isOpen: boolean
    options: AlertOptions
    resolve?: () => void
  }
  closeConfirm: (result: boolean) => void
  closeAlert: () => void
}

const FeedbackContext = createContext<FeedbackContextValue | null>(null)

export const FeedbackProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [confirmState, setConfirmState] = useState<{
    isOpen: boolean
    options: ConfirmOptions
    resolve?: (value: boolean) => void
  }>({
    isOpen: false,
    options: { title: '', message: '' },
  })

  const [alertState, setAlertState] = useState<{
    isOpen: boolean
    options: AlertOptions
    resolve?: () => void
  }>({
    isOpen: false,
    options: { title: '', message: '' },
  })

  const [toasts, setToasts] = useState<ToastItem[]>([])
  const toastIdRef = useRef(0)

  const confirm = useCallback((options: ConfirmOptions): Promise<boolean> => {
    return new Promise<boolean>((resolve) => {
      setConfirmState({
        isOpen: true,
        options: {
          confirmText: 'Konfirmasi',
          cancelText: 'Batal',
          variant: 'default',
          ...options,
        },
        resolve,
      })
    })
  }, [])

  const closeConfirm = useCallback((result: boolean) => {
    setConfirmState((prev) => {
      if (prev.resolve) {
        prev.resolve(result)
      }
      return { ...prev, isOpen: false, resolve: undefined }
    })
  }, [])

  const alert = useCallback((options: AlertOptions): Promise<void> => {
    return new Promise<void>((resolve) => {
      setAlertState({
        isOpen: true,
        options: {
          type: 'info',
          buttonText: 'Mengerti',
          ...options,
        },
        resolve,
      })
    })
  }, [])

  const closeAlert = useCallback(() => {
    setAlertState((prev) => {
      if (prev.resolve) {
        prev.resolve()
      }
      return { ...prev, isOpen: false, resolve: undefined }
    })
  }, [])

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const toast = useCallback(
    (options: Omit<ToastItem, 'id'>) => {
      const id = `toast-${Date.now()}-${++toastIdRef.current}`
      const duration = options.duration ?? 4000
      const newToast: ToastItem = { ...options, id, duration }

      setToasts((prev) => [...prev.slice(-4), newToast])

      if (duration > 0) {
        setTimeout(() => {
          removeToast(id)
        }, duration)
      }
    },
    [removeToast]
  )

  return (
    <FeedbackContext.Provider
      value={{
        confirm,
        alert,
        toast,
        toasts,
        removeToast,
        confirmState,
        alertState,
        closeConfirm,
        closeAlert,
      }}
    >
      {children}
    </FeedbackContext.Provider>
  )
}

export function useFeedback() {
  const context = useContext(FeedbackContext)
  if (!context) {
    throw new Error('useFeedback must be used within a FeedbackProvider')
  }
  return context
}

export function useConfirm() {
  const { confirm } = useFeedback()
  return confirm
}

export function useAlert() {
  const { alert } = useFeedback()
  return alert
}

export function useToast() {
  const { toast } = useFeedback()
  return {
    toast,
    success: (title: string, description?: string) => toast({ title, description, type: 'success' }),
    error: (title: string, description?: string) => toast({ title, description, type: 'error' }),
    warning: (title: string, description?: string) => toast({ title, description, type: 'warning' }),
    info: (title: string, description?: string) => toast({ title, description, type: 'info' }),
  }
}
