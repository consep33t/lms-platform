import { useEffect } from 'react'
import { RouterProvider } from 'react-router-dom'
import { router } from './router'
import { TenantProvider } from '@/context/TenantContext'
import { FeedbackProvider } from '@/context/FeedbackContext'
import { GlobalErrorBoundary } from '@/components/common/GlobalErrorBoundary'
import { ConfirmModal } from '@/components/common/ConfirmModal'
import { AlertModal } from '@/components/common/AlertModal'
import { ToastContainer } from '@/components/common/ToastContainer'
import OfflineIndicator from './components/pwa/OfflineIndicator'

export default function App() {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js').catch((error) => {
          console.error('ServiceWorker registration failed: ', error)
        })
      })
    }
  }, [])

  return (
    <GlobalErrorBoundary>
      <TenantProvider>
        <FeedbackProvider>
          <RouterProvider router={router} />
          <ConfirmModal />
          <AlertModal />
          <ToastContainer />
          <OfflineIndicator />
        </FeedbackProvider>
      </TenantProvider>
    </GlobalErrorBoundary>
  )
}
